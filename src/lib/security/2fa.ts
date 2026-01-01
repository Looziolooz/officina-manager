// src/lib/security/2fa.ts
import * as speakeasy from "speakeasy";
import QRCode from "qrcode";
import crypto from "crypto";

const ENCRYPTION_KEY = process.env.TWO_FACTOR_ENCRYPTION_KEY || "12345678901234567890123456789012"; 
const IV_LENGTH = 16;

function encrypt(text: string) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text: string) {
  const textParts = text.split(':');
  const iv = Buffer.from(textParts.shift()!, 'hex');
  const encryptedText = Buffer.from(textParts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

export async function generate2FASecret(email: string) {
  const secret = speakeasy.generateSecret({
    name: `GTService (${email})`,
    issuer: "GT Service"
  });

  const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!);

  return {
    secret: secret.base32,
    encryptedSecret: encrypt(secret.base32),
    qrCodeUrl
  };
}

export function verifyTOTP(token: string, encryptedSecret: string) {
  try {
    const secret = decrypt(encryptedSecret);
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 1 
    });
  } catch {
    return false;
  }
}
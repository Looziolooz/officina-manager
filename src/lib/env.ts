import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  AUTH_SECRET: z.string().min(32),
  TWO_FACTOR_ENCRYPTION_KEY: z.string().length(64),
  NEXTAUTH_URL: z.string().url().optional(),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  // SMS Provider selection
  SMS_PROVIDER: z.string().optional(),
  // Twilio (optional for SMS)
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_FROM_NUMBER: z.string().optional(),
  // Vonage (optional for SMS)
  VONAGE_API_KEY: z.string().optional(),
  VONAGE_API_SECRET: z.string().optional(),
  VONAGE_FROM_NUMBER: z.string().optional(),
});

export const env = envSchema.parse(process.env);

export function validateEnv() {
  try {
    envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missing = error.issues.map(i => `${i.path.join(".")}: ${i.message}`).join("\n  ");
      throw new Error(`Environment validation failed:\n  ${missing}`);
    }
    throw error;
  }
}

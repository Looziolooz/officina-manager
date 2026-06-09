// scripts/create-admin.ts
// Secure CLI script to create/update admin user
// Usage: npx ts-node --compiler-options {"module":"CommonJS"} scripts/create-admin.ts

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import readline from 'readline';

const prisma = new PrismaClient();

function question(rl: readline.Interface, prompt: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => resolve(answer.trim()));
  });
}

async function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  try {
    console.log('=== GT Service - Creazione Admin ===\n');

    const email = await question(rl, 'Email: ');
    if (!email) throw new Error('Email richiesta');

    const name = await question(rl, 'Nome completo: ');
    if (!name) throw new Error('Nome richiesto');

    const password = await question(rl, 'Password: ');
    if (password.length < 8) throw new Error('Password deve essere almeno 8 caratteri');

    const confirmPassword = await question(rl, 'Conferma password: ');
    if (password !== confirmPassword) throw new Error('Le password non coincidono');

    const roleInput = await question(rl, 'Ruolo (SUPER_ADMIN/ADMIN/MECHANIC, default: ADMIN): ');
    const role = (['SUPER_ADMIN', 'ADMIN', 'MECHANIC'].includes(roleInput) ? roleInput : 'ADMIN') as any;

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.upsert({
      where: { email },
      update: {
        name,
        password: hashedPassword,
        role,
      },
      create: {
        email,
        name,
        password: hashedPassword,
        role,
      },
    });

    console.log(`\n✅ Utente creato/aggiornato con successo!`);
    console.log(`   ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Nome: ${user.name}`);
    console.log(`   Ruolo: ${user.role}`);
  } catch (error) {
    console.error('\n❌ Errore:', error instanceof Error ? error.message : error);
    process.exit(1);
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

main();

// fix-user.mjs
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  const password = await bcrypt.hash('GTService2025!', 12)
  await prisma.user.upsert({
    where: { email: 'giovanni@gtservice.it' },
    update: { password: password },
    create: {
      email: 'giovanni@gtservice.it',
      name: 'Giovanni Tambuscio',
      password: password,
      role: 'SUPER_ADMIN',
    },
  })
  console.log('Utente Giovanni creato/aggiornato correttamente!')
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect())
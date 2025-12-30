import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs' // usa bcryptjs se bcrypt dà problemi su Windows

const prisma = new PrismaClient()

async function main() {
  const hashedName = await bcrypt.hash('GTService2025!', 12)
  await prisma.user.upsert({
    where: { email: 'giovanni@gtservice.it' },
    update: {},
    create: {
      email: 'giovanni@gtservice.it',
      name: 'Giovanni',
      password: hashedName,
      role: 'SUPER_ADMIN'
    }
  })
  console.log("Admin creato con successo!")
}
main()
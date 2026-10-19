
import { PrismaClient, Role } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const email = 'admin@internlink.demo'
  const passwordHash = await bcrypt.hash('admin123', 10)

  const existingUser = await prisma.user.findUnique({
    where: { email },
  })

  if (existingUser) {
    if (existingUser.role !== Role.ADMIN) {
      throw new Error('This email already exists with a different role.')
    }

    await prisma.user.update({
      where: { email },
      data: { passwordHash },
    })

    console.log('Existing admin password updated.')
    return
  }

  await prisma.user.create({
    data: {
      name: 'InternLink Admin',
      email,
      passwordHash,
      role: Role.ADMIN,
    },
  })

  console.log('Admin account created successfully.')
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

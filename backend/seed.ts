import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const users = [
    {
      firstName: 'Administrador',
      lastName: 'Convista',
      email: 'admin@convista.com',
      password: 'admin',
      role: 'admin',
      active: true,
      position: 'Admin'
    },
    {
      firstName: 'Recursos',
      lastName: 'Humanos',
      email: 'rh@convista.com',
      password: 'rh',
      role: 'rh',
      active: true,
      position: 'RH'
    },
    {
      firstName: 'Tech',
      lastName: 'Lead',
      email: 'entrevistador@convista.com',
      password: 'tech',
      role: 'interviewer',
      active: true,
      position: 'Tech Lead'
    }
  ];

  for (const user of users) {
    const existing = await prisma.user.findUnique({ where: { email: user.email } });
    if (!existing) {
      await prisma.user.create({ data: user });
      console.log(`User ${user.email} created.`);
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
  });

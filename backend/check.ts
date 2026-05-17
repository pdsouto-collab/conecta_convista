import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const candidates = await prisma.candidate.findMany({ select: { id: true, name: true, cvFileName: true, cvFile: true } });
  for (const c of candidates) {
    console.log(`Candidate ${c.name} - cvFile length: ${c.cvFile ? c.cvFile.length : 0}`);
  }
}

main().finally(() => prisma.$disconnect());

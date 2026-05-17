import type { VercelRequest, VercelResponse } from '@vercel/node';
import prisma from './_prisma';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    try {
      const items = await prisma.technology.findMany();
      res.status(200).json(items);
    } catch (e) {
      res.status(500).json({ error: 'Erro ao buscar' });
    }
  } else if (req.method === 'POST') {
    try {
      const { id, name } = req.body;
      const item = await prisma.technology.upsert({
        where: { name },
        update: { name },
        create: { id, name }
      });
      res.status(201).json(item);
    } catch (e) {
      res.status(500).json({ error: 'Erro ao salvar' });
    }
  } else if (req.method === 'DELETE') {
    try {
      const { id } = req.query;
      await prisma.technology.delete({ where: { id: id as string } });
      res.status(204).end();
    } catch (e) {
      res.status(500).json({ error: 'Erro ao deletar' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

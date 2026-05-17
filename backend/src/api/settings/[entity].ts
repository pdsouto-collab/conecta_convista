import type { VercelRequest, VercelResponse } from '@vercel/node';
import prisma from '../_prisma';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { entity, id } = req.query;
  
  const modelNameMap: Record<string, keyof typeof prisma> = {
    technologies: 'technology',
    seniorities: 'seniority',
    roles: 'roleOption',
    statuses: 'candidateStatusOption',
    criteria: 'libraryCriteria',
    users: 'user',
    logs: 'systemLog'
  };

  const modelKey = modelNameMap[entity as string];
  
  if (!modelKey || !prisma[modelKey]) {
    return res.status(400).json({ error: 'Invalid entity' });
  }

  const model = prisma[modelKey] as any;

  if (req.method === 'GET') {
    try {
      const items = await model.findMany();
      res.status(200).json(items);
    } catch (e) {
      res.status(500).json({ error: 'Fetch failed' });
    }
  } else if (req.method === 'POST') {
    try {
      const item = await model.create({ data: req.body });
      res.status(201).json(item);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Create failed' });
    }
  } else if (req.method === 'PUT') {
    try {
      const { id: _, ...rest } = req.body;
      const item = await model.update({ where: { id: id || req.body.id }, data: rest });
      res.status(200).json(item);
    } catch (e) {
      res.status(500).json({ error: 'Update failed' });
    }
  } else if (req.method === 'DELETE') {
    try {
      await model.delete({ where: { id: id as string } });
      res.status(204).end();
    } catch (e) {
      res.status(500).json({ error: 'Delete failed' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

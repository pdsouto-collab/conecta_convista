import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

const prisma = new PrismaClient();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.get('/', (req, res) => {
  res.json({ status: 'API is running' });
});

// --- LOGGING ---
app.get('/api/settings/logs', async (req, res) => {
  try {
    const logs = await prisma.systemLog.findMany({ orderBy: { timestamp: 'desc' } });
    res.json(logs);
  } catch (e) {
    res.status(500).json({ error: 'Erro ao buscar' });
  }
});

app.post('/api/settings/logs', async (req, res) => {
  try {
    const log = await prisma.systemLog.create({ data: req.body });
    res.status(201).json(log);
  } catch (e) {
    res.status(500).json({ error: 'Erro ao salvar' });
  }
});

// --- SETTINGS (GENERIC) ---
app.all('/api/settings/:entity', async (req, res) => {
  const { entity } = req.params;
  const { id } = req.query;
  
  const modelNameMap: Record<string, keyof typeof prisma> = {
    technologies: 'technology',
    seniorities: 'seniority',
    roles: 'roleOption',
    statuses: 'candidateStatusOption',
    criteria: 'libraryCriteria',
    users: 'user',
    logs: 'systemLog'
  };

  const modelKey = modelNameMap[entity];
  if (!modelKey || !(prisma as any)[modelKey]) {
    return res.status(400).json({ error: 'Invalid entity' });
  }

  const model = (prisma as any)[modelKey];

  if (req.method === 'GET') {
    try {
      const orderBy = ['technology', 'seniority', 'roleOption', 'candidateStatusOption'].includes(modelKey) 
        ? { order: 'asc' } 
        : undefined;
      const items = await model.findMany({ orderBy });
      res.status(200).json(items);
    } catch (e) {
      res.status(500).json({ error: 'Fetch failed' });
    }
  } else if (req.method === 'POST') {
    try {
      const item = await model.create({ data: req.body });
      res.status(201).json(item);
    } catch (e) {
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
      res.status(204).send();
    } catch (e) {
      res.status(500).json({ error: 'Delete failed' });
    }
  } else {
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
});

// --- BULK REORDER SETTINGS ---
app.post('/api/settings/:entity/reorder', async (req, res) => {
  const { entity } = req.params;
  const items = req.body as { id: string, order: number }[];
  
  const modelNameMap: Record<string, keyof typeof prisma> = {
    technologies: 'technology',
    seniorities: 'seniority',
    roles: 'roleOption',
    statuses: 'candidateStatusOption'
  };

  const modelKey = modelNameMap[entity];
  if (!modelKey || !(prisma as any)[modelKey]) {
    return res.status(400).json({ error: 'Invalid entity for reorder' });
  }

  const model = (prisma as any)[modelKey];

  try {
    // Run updates in a transaction
    await prisma.$transaction(
      items.map(item => 
        model.update({
          where: { id: item.id },
          data: { order: item.order }
        })
      )
    );
    res.status(200).json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Reorder failed' });
  }
});

// --- CANDIDATES ---
app.get('/api/candidates', async (req, res) => {
  try {
    const candidates = await prisma.candidate.findMany({
      orderBy: { createdAt: 'desc' },
      include: { evaluations: true }
    });
    
    const formatted = candidates.map((c: any) => {
      const behavioralEvaluation = c.evaluations.filter((e: any) => e.type === 'BEHAVIORAL');
      const technicalEvaluation = c.evaluations.filter((e: any) => e.type === 'TECHNICAL');
      return { ...c, behavioralEvaluation, technicalEvaluation };
    });
    
    res.status(200).json(formatted);
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch' });
  }
});

app.get('/api/candidates/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const candidate = await prisma.candidate.findUnique({
      where: { id },
      include: { evaluations: true }
    });
    if (!candidate) return res.status(404).json({ error: 'Not found' });
    
    const behavioralEvaluation = candidate.evaluations.filter((e: any) => e.type === 'BEHAVIORAL');
    const technicalEvaluation = candidate.evaluations.filter((e: any) => e.type === 'TECHNICAL');
    
    res.status(200).json({ ...candidate, behavioralEvaluation, technicalEvaluation });
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch' });
  }
});

app.post('/api/candidates', async (req, res) => {
  try {
    const data = req.body;
    const { behavioralEvaluation, technicalEvaluation, evaluations, id, ...rest } = data;
    
    const newEvals: any[] = [];
    if (behavioralEvaluation && Array.isArray(behavioralEvaluation)) {
      behavioralEvaluation.forEach(e => newEvals.push({ ...e, type: 'BEHAVIORAL', id: undefined }));
    }
    if (technicalEvaluation && Array.isArray(technicalEvaluation)) {
      technicalEvaluation.forEach(e => newEvals.push({ ...e, type: 'TECHNICAL', id: undefined }));
    }

    const candidate = await prisma.candidate.create({
      data: {
        ...rest,
        evaluations: {
          create: newEvals
        }
      },
      include: { evaluations: true }
    });
    res.status(201).json(candidate);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to create' });
  }
});

app.put('/api/candidates/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const { behavioralEvaluation, technicalEvaluation, evaluations, id: _, createdAt, ...rest } = data;
    
    const candidate = await prisma.candidate.update({
      where: { id },
      data: rest
    });
    
    await prisma.evaluationMatrix.deleteMany({ where: { candidateId: id } });
    
    const newEvals: any[] = [];
    if (behavioralEvaluation && Array.isArray(behavioralEvaluation)) {
      behavioralEvaluation.forEach(e => newEvals.push({ ...e, type: 'BEHAVIORAL', candidateId: id, id: undefined }));
    }
    if (technicalEvaluation && Array.isArray(technicalEvaluation)) {
      technicalEvaluation.forEach(e => newEvals.push({ ...e, type: 'TECHNICAL', candidateId: id, id: undefined }));
    }
    
    if (newEvals.length > 0) {
      await prisma.evaluationMatrix.createMany({ data: newEvals });
    }

    res.status(200).json(candidate);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to update' });
  }
});

app.delete('/api/candidates/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.candidate.delete({ where: { id } });
    res.status(204).send();
  } catch (e) {
    res.status(500).json({ error: 'Failed to delete' });
  }
});

if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`🚀 Backend rodando na porta ${PORT}`);
  });
}

export default app;

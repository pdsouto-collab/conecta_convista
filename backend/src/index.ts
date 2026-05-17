import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { put } from '@vercel/blob';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

const prisma = new PrismaClient();

import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const JWT_SECRET = process.env.JWT_SECRET || 'convista-secret-key-super-secure';

const authMiddleware = (req: any, res: any, next: any) => {
  if (req.method === 'OPTIONS') return next();
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido ou expirado' });
  }
};


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


// --- AUTH ---
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.active) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    let isValid = false;
    if (password === user.password) {
      isValid = true;
    } else {
      isValid = await bcrypt.compare(password, user.password);
    }

    if (!isValid) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role, name: `${user.firstName} ${user.lastName}` }, JWT_SECRET, { expiresIn: '8h' });
    res.json({ token, user: { id: user.id, email: user.email, role: user.role, firstName: user.firstName, lastName: user.lastName } });
  } catch (e) {
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

// Protect all routes below
app.use('/api/settings', authMiddleware);
app.use('/api/candidates', authMiddleware);
app.use('/api/extract-cv', authMiddleware);

// --- SETTINGS (GENERIC) ---
app.all('/api/settings/:entity', async (req, res) => {
  const { entity } = req.params;
  const { id } = req.query;
  
  const modelNameMap: Record<string, keyof typeof prisma> = {
    technologies: 'technology',
    seniorities: 'seniority',
    roles: 'roleOption',
    statuses: 'candidateStatusOption',
    languages: 'languageOption',
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
    const orderBy = ['technology', 'seniority', 'roleOption', 'candidateStatusOption', 'languageOption'].includes(modelKey as string) 
      ? { order: 'asc' } 
      : undefined;
      const items = await model.findMany({ orderBy });
      res.status(200).json(items);
    } catch (e) {
      res.status(500).json({ error: 'Fetch failed' });
    }
  } else if (req.method === 'POST') {
    try {
      
      let data = { ...req.body };
      if (modelKey === 'user' && data.password) {
        data.password = await bcrypt.hash(data.password, 10);
      }
      const item = await model.create({ data });

      res.status(201).json(item);
    } catch (e) {
      res.status(500).json({ error: 'Create failed' });
    }
  } else if (req.method === 'PUT') {
    try {
      const { id: _, ...rest } = req.body;
      
      let dataToUpdate = { ...rest };
      if (modelKey === 'user' && dataToUpdate.password) {
        dataToUpdate.password = await bcrypt.hash(dataToUpdate.password, 10);
      }
      const item = await model.update({ where: { id: id || req.body.id }, data: dataToUpdate });

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
    statuses: 'candidateStatusOption',
    languages: 'languageOption'
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

// --- EXTRACT CV ---
app.post('/api/extract-cv', async (req, res) => {
  try {
    const { cvFile, cvFileName } = req.body;
    if (!cvFile || !cvFileName) return res.status(400).json({ error: 'Missing file data' });

    const base64Data = cvFile.includes(',') ? cvFile.split(',')[1] : cvFile;
    const buffer = Buffer.from(base64Data, 'base64');
    let extractedText = '';

    if (cvFileName.toLowerCase().endsWith('.pdf')) {
      const pdfParse = require('pdf-parse');
      const pdfData = await pdfParse(buffer);
      extractedText = pdfData.text;
    } else if (cvFileName.toLowerCase().endsWith('.doc') || cvFileName.toLowerCase().endsWith('.docx')) {
      const mammoth = require('mammoth');
      const result = await mammoth.extractRawText({ buffer });
      extractedText = result.value;
    } else {
      return res.status(400).json({ error: 'Unsupported file format' });
    }

    res.status(200).json({ text: extractedText.trim() });
  } catch (e) {
    console.error("Extraction error:", e);
    res.status(500).json({ error: 'Failed to extract text' });
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

    // Process CV Upload to Vercel Blob if it's a Base64 string
    if (rest.cvFile && rest.cvFile.startsWith('data:')) {
      if (process.env.BLOB_READ_WRITE_TOKEN) {
        try {
          const match = rest.cvFile.match(/^data:(.+);base64,(.+)$/);
          if (match) {
            const buffer = Buffer.from(match[2], 'base64');
            const blob = await put(`cvs/${Date.now()}_${rest.cvFileName || 'document'}`, buffer, {
              access: 'public',
              contentType: match[1]
            });
            rest.cvFile = blob.url; // Save the Vercel Blob URL instead of base64
          }
        } catch (err) {
          console.error("Vercel Blob upload failed, falling back to base64:", err);
        }
      } else {
        console.warn("BLOB_READ_WRITE_TOKEN not set. Saving CV as Base64 in DB (Not recommended for production).");
      }
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
    
    // Process CV Upload to Vercel Blob if it's a Base64 string
    if (rest.cvFile && rest.cvFile.startsWith('data:')) {
      if (process.env.BLOB_READ_WRITE_TOKEN) {
        try {
          const match = rest.cvFile.match(/^data:(.+);base64,(.+)$/);
          if (match) {
            const buffer = Buffer.from(match[2], 'base64');
            const blob = await put(`cvs/${Date.now()}_${rest.cvFileName || 'document'}`, buffer, {
              access: 'public',
              contentType: match[1]
            });
            rest.cvFile = blob.url;
          }
        } catch (err) {
          console.error("Vercel Blob upload failed on update, falling back to base64:", err);
        }
      } else {
        console.warn("BLOB_READ_WRITE_TOKEN not set. Saving CV as Base64 in DB (Not recommended for production).");
      }
    }

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

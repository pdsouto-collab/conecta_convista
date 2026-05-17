import type { VercelRequest, VercelResponse } from '@vercel/node';
import prisma from './_prisma';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    try {
      const candidates = await prisma.candidate.findMany({
        orderBy: { createdAt: 'desc' },
        include: { evaluations: true }
      });
      
      // Mapear de volta para o formato esperado pelo frontend
      const formatted = candidates.map(c => {
        const behavioralEvaluation = c.evaluations.filter(e => e.type === 'BEHAVIORAL');
        const technicalEvaluation = c.evaluations.filter(e => e.type === 'TECHNICAL');
        return { ...c, behavioralEvaluation, technicalEvaluation };
      });
      
      res.status(200).json(formatted);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to fetch candidates' });
    }
  } else if (req.method === 'POST') {
    try {
      const data = req.body;
      const { behavioralEvaluation, technicalEvaluation, evaluations, id, ...rest } = data;
      
      const newEvals = [];
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
      res.status(500).json({ error: 'Failed to create candidate' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

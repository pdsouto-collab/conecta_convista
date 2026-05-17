import type { VercelRequest, VercelResponse } from '@vercel/node';
import prisma from '../_prisma';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query;
  
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid candidate ID' });
  }

  if (req.method === 'GET') {
    try {
      const candidate = await prisma.candidate.findUnique({
        where: { id },
        include: { evaluations: true }
      });
      if (!candidate) return res.status(404).json({ error: 'Candidate not found' });
      
      const behavioralEvaluation = candidate.evaluations.filter(e => e.type === 'BEHAVIORAL');
      const technicalEvaluation = candidate.evaluations.filter(e => e.type === 'TECHNICAL');
      
      res.status(200).json({ ...candidate, behavioralEvaluation, technicalEvaluation });
    } catch (e) {
      res.status(500).json({ error: 'Failed to fetch candidate' });
    }
  } else if (req.method === 'PUT') {
    try {
      const data = req.body;
      const { behavioralEvaluation, technicalEvaluation, evaluations, id: _, createdAt, ...rest } = data;
      
      // Update candidate details
      const candidate = await prisma.candidate.update({
        where: { id },
        data: rest
      });
      
      // Update evaluations (simplest way is to delete and recreate them for MVP)
      await prisma.evaluationMatrix.deleteMany({ where: { candidateId: id } });
      
      const newEvals = [];
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
      res.status(500).json({ error: 'Failed to update candidate' });
    }
  } else if (req.method === 'DELETE') {
    try {
      await prisma.candidate.delete({ where: { id } });
      res.status(204).end();
    } catch (e) {
      res.status(500).json({ error: 'Failed to delete candidate' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

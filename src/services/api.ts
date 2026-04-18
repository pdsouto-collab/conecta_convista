import type { Candidate } from '../types';

const STORAGE_KEY = '@conecta_convista_candidates';

export const api = {
  getCandidates: (): Candidate[] => {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    try {
      return JSON.parse(data) as Candidate[];
    } catch {
      return [];
    }
  },

  getCandidateById: (id: string): Candidate | undefined => {
    const candidates = api.getCandidates();
    return candidates.find((c) => c.id === id);
  },

  saveCandidate: (candidate: Candidate): void => {
    const candidates = api.getCandidates();
    const existingIndex = candidates.findIndex((c) => c.id === candidate.id);
    
    if (existingIndex >= 0) {
      candidates[existingIndex] = candidate;
    } else {
      candidates.push(candidate);
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(candidates));
  },

  deleteCandidate: (id: string): void => {
    const candidates = api.getCandidates();
    const filtered = candidates.filter((c) => c.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  },
  
  seedMockData: () => {
    const existing = api.getCandidates();
    if (existing.length > 0) return;
    
    const mock: Candidate = {
      id: '1',
      name: 'João Silva',
      email: 'joao.silva@example.com',
      phone: '(11) 98765-4321',
      linkedin: 'linkedin.com/in/joaosilva',
      sapModules: ['FI', 'CO'],
      availability: 'Híbrido',
      seniority: 'Pleno',
      createdAt: new Date().toISOString(),
      status: 'Novo',
      generalNotes: 'Candidato com boa comunicação e experiência prévia sólida.',
      behavioralEvaluation: [
        { id: 'b1', criteria: 'Comunicação', score: 4, observation: 'Claro e objetivo' },
        { id: 'b2', criteria: 'Liderança', score: 3, observation: 'Em desenvolvimento' }
      ],
      technicalEvaluation: [
        { id: 't1', criteria: 'SAP FI', score: 5, observation: 'Domina muito bem' },
        { id: 't2', criteria: 'Configuração S/4HANA', score: 4, observation: 'Boa base' }
      ]
    };
    
    api.saveCandidate(mock);
  }
};

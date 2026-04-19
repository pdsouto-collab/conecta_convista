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
  },

  // --- TECHNOLOGIES ---
  getTechnologies: (): import('../types').Technology[] => {
    const data = localStorage.getItem('@conecta_convista_techs');
    if (!data) return [];
    try { return JSON.parse(data); } catch { return []; }
  },
  saveTechnology: (tech: import('../types').Technology): void => {
    const techs = api.getTechnologies();
    const existingIndex = techs.findIndex((c) => c.id === tech.id);
    if (existingIndex >= 0) { techs[existingIndex] = tech; }
    else { techs.push(tech); }
    localStorage.setItem('@conecta_convista_techs', JSON.stringify(techs));
  },
  deleteTechnology: (id: string): void => {
    const techs = api.getTechnologies();
    const filtered = techs.filter((c) => c.id !== id);
    localStorage.setItem('@conecta_convista_techs', JSON.stringify(filtered));
  },

  // --- CRITERIA LIBRARY ---
  getLibraryCriteria: (): import('../types').LibraryCriteria[] => {
    const data = localStorage.getItem('@conecta_convista_criteria');
    if (!data) return [];
    try { return JSON.parse(data); } catch { return []; }
  },
  saveLibraryCriteria: (criteria: import('../types').LibraryCriteria): void => {
    const arr = api.getLibraryCriteria();
    const existingIndex = arr.findIndex((c) => c.id === criteria.id);
    if (existingIndex >= 0) { arr[existingIndex] = criteria; }
    else { arr.push(criteria); }
    localStorage.setItem('@conecta_convista_criteria', JSON.stringify(arr));
  },
  deleteLibraryCriteria: (id: string): void => {
    const arr = api.getLibraryCriteria();
    const filtered = arr.filter((c) => c.id !== id);
    localStorage.setItem('@conecta_convista_criteria', JSON.stringify(filtered));
  }
};


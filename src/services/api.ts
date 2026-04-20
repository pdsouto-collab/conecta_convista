import type { Candidate } from '../types';

const STORAGE_KEY = '@conecta_convista_candidates';

export const api = {
  // --- LOGGING ---
  getSystemLogs: (): import('../types').SystemLog[] => {
    const data = localStorage.getItem('@conecta_convista_logs');
    if (!data) return [];
    try { return JSON.parse(data); } catch { return []; }
  },
  addLog: (action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'OTHER', entity: string, details: string): void => {
    const logs = api.getSystemLogs();
    const loggedUserStr = localStorage.getItem('@conecta_convista_loggedUser');
    let userId = 'system';
    let userName = 'Sistema';
    if (loggedUserStr) {
      try {
        const u = JSON.parse(loggedUserStr);
        userId = u.id;
        userName = u.firstName + (u.lastName ? ' ' + u.lastName : '');
      } catch (e) {}
    }
    logs.unshift({
      id: Math.random().toString(36).substring(2, 9),
      userId,
      userName,
      action,
      entity,
      details,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem('@conecta_convista_logs', JSON.stringify(logs));
  },

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
      api.addLog('UPDATE', 'Candidato', `Candidato atualizado: ${candidate.name}`);
    } else {
      candidates.push(candidate);
      api.addLog('CREATE', 'Candidato', `Novo candidato cadastrado: ${candidate.name}`);
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(candidates));
  },

  deleteCandidate: (id: string): void => {
    const candidates = api.getCandidates();
    const candidate = candidates.find(c => c.id === id);
    const filtered = candidates.filter((c) => c.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    if (candidate) {
      api.addLog('DELETE', 'Candidato', `Candidato excluído: ${candidate.name}`);
    }
  },
  
  seedMockData: () => {
    const existingTechs = api.getTechnologies();
    if (existingTechs.length === 0) {
      const defaultTechs = ['FI', 'CO', 'MM', 'SD', 'ABAP', 'Basis', 'PI/PO', 'BW/BI', 'BPC'];
      defaultTechs.forEach(t => api.saveTechnology({ id: t.toLowerCase(), name: t }));
    }

    const existingSeniorities = api.getSeniorities();
    if (existingSeniorities.length === 0) {
      const defaultSeniorities = ['Júnior', 'Pleno', 'Sênior', 'Especialista'];
      defaultSeniorities.forEach(s => api.saveSeniority({ id: s.toLowerCase(), name: s }));
    }

    const existingStatuses = api.getStatuses();
    if (existingStatuses.length === 0) {
      const defaultStatuses = ['Novo', 'Em Andamento', 'Aprovado', 'Reprovado', 'Vaga Congelada'];
      defaultStatuses.forEach(s => api.saveStatus({ id: s.toLowerCase().replace(/\s+/g, '-'), name: s }));
    }

    const existingUsers = api.getUsers();
    if (existingUsers.length === 0) {
      api.saveUser({ id: 'u1', firstName: 'Admin', lastName: 'Sistema', email: 'admin@convista.com', position: 'Administrador', role: 'admin', password: 'admin', active: true });
      api.saveUser({ id: 'u2', firstName: 'RH', lastName: 'Convista', email: 'rh@convista.com', position: 'Recrutador(a)', role: 'hr', password: 'rh', active: true });
      api.saveUser({ id: 'u3', firstName: 'Tech', lastName: 'Lead', email: 'entrevistador@convista.com', position: 'Líder Técnico', role: 'interviewer', password: 'tech', active: true });
    }

    const existingRoles = api.getRoles();
    if (existingRoles.length === 0) {
      const defaultRoles = ['Consultor FI', 'Consultor ABAP', 'Arquiteto S/4HANA', 'Gerente de Projetos'];
      defaultRoles.forEach(r => api.saveRole({ id: r.toLowerCase().replace(/\s+/g, '-'), name: r }));
    }

    const existing = api.getCandidates();
    if (existing.length > 0) return;
    
    const mock: Candidate = {
      id: '1',
      name: 'João Silva',
      email: 'joao.silva@example.com',
      phone: '(11) 98765-4321',
      linkedin: 'linkedin.com/in/joaosilva',
      technologies: ['FI', 'CO'],
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
  updateTechnologies: (techs: import('../types').Technology[]): void => {
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
  },

  // --- ROLES ---
  getRoles: (): import('../types').RoleOption[] => {
    const data = localStorage.getItem('@conecta_convista_roles');
    if (!data) return [];
    try { return JSON.parse(data); } catch { return []; }
  },
  saveRole: (role: import('../types').RoleOption): void => {
    const roles = api.getRoles();
    const existingIndex = roles.findIndex((r) => r.id === role.id);
    if (existingIndex >= 0) {
      roles[existingIndex] = role;
      api.addLog('UPDATE', 'Configuração', `Cargo atualizado: ${role.name}`);
    } else {
      roles.push(role);
      api.addLog('CREATE', 'Configuração', `Novo cargo cadastrado: ${role.name}`);
    }
    localStorage.setItem('@conecta_convista_roles', JSON.stringify(roles));
  },
  updateRoles: (roles: import('../types').RoleOption[]): void => {
    localStorage.setItem('@conecta_convista_roles', JSON.stringify(roles));
  },
  deleteRole: (id: string): void => {
    const roles = api.getRoles();
    const item = roles.find(r => r.id === id);
    const filtered = roles.filter((r) => r.id !== id);
    localStorage.setItem('@conecta_convista_roles', JSON.stringify(filtered));
    if (item) api.addLog('DELETE', 'Configuração', `Cargo excluído: ${item.name}`);
  },

  // --- SENIORITIES ---
  getSeniorities: (): import('../types').Seniority[] => {
    const data = localStorage.getItem('@conecta_convista_seniorities');
    if (!data) return [];
    try { return JSON.parse(data); } catch { return []; }
  },
  saveSeniority: (seniority: import('../types').Seniority): void => {
    const arr = api.getSeniorities();
    const existingIndex = arr.findIndex((s) => s.id === seniority.id);
    if (existingIndex >= 0) { arr[existingIndex] = seniority; }
    else { arr.push(seniority); }
    localStorage.setItem('@conecta_convista_seniorities', JSON.stringify(arr));
  },
  updateSeniorities: (seniorities: import('../types').Seniority[]): void => {
    localStorage.setItem('@conecta_convista_seniorities', JSON.stringify(seniorities));
  },
  deleteSeniority: (id: string): void => {
    const arr = api.getSeniorities();
    const filtered = arr.filter((s) => s.id !== id);
    localStorage.setItem('@conecta_convista_seniorities', JSON.stringify(filtered));
  },

  // --- STATUSES ---
  getStatuses: (): import('../types').CandidateStatusOption[] => {
    const data = localStorage.getItem('@conecta_convista_statuses');
    if (!data) return [];
    try { return JSON.parse(data); } catch { return []; }
  },
  saveStatus: (status: import('../types').CandidateStatusOption): void => {
    const arr = api.getStatuses();
    const existingIndex = arr.findIndex((s) => s.id === status.id);
    if (existingIndex >= 0) { arr[existingIndex] = status; }
    else { arr.push(status); }
    localStorage.setItem('@conecta_convista_statuses', JSON.stringify(arr));
  },
  updateStatuses: (statuses: import('../types').CandidateStatusOption[]): void => {
    localStorage.setItem('@conecta_convista_statuses', JSON.stringify(statuses));
  },
  deleteStatus: (id: string): void => {
    const arr = api.getStatuses();
    const filtered = arr.filter((s) => s.id !== id);
    localStorage.setItem('@conecta_convista_statuses', JSON.stringify(filtered));
  },

  // --- USERS & AUTH ---
  getUsers: (): import('../types').User[] => {
    const data = localStorage.getItem('@conecta_convista_users');
    if (!data) return [];
    try { return JSON.parse(data); } catch { return []; }
  },
  saveUser: (user: import('../types').User): void => {
    const users = api.getUsers();
    const existingIndex = users.findIndex(u => u.id === user.id);
    if (existingIndex >= 0) { 
      users[existingIndex] = user; 
      api.addLog('UPDATE', 'Usuário', `Usuário atualizado: ${user.firstName} ${user.lastName}`);
    } else { 
      users.push(user);
      api.addLog('CREATE', 'Usuário', `Novo usuário cadastrado: ${user.firstName} ${user.lastName}`);
    }
    localStorage.setItem('@conecta_convista_users', JSON.stringify(users));
  },
  deleteUser: (id: string): void => {
    const users = api.getUsers();
    const user = users.find(u => u.id === id);
    const filtered = users.filter((u) => u.id !== id);
    localStorage.setItem('@conecta_convista_users', JSON.stringify(filtered));
    if (user) {
      api.addLog('DELETE', 'Usuário', `Usuário excluído: ${user.firstName} ${user.lastName}`);
    }
  }
};


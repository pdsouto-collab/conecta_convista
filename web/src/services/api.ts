import type { Candidate, Technology, LibraryCriteria, RoleOption, Seniority, CandidateStatusOption, User, SystemLog } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

// Cache em memória para leitura síncrona
export const cache = {
  logs: [] as SystemLog[],
  candidates: [] as Candidate[],
  techs: [] as Technology[],
  criteria: [] as LibraryCriteria[],
  roles: [] as RoleOption[],
  seniorities: [] as Seniority[],
  statuses: [] as CandidateStatusOption[],
  languages: [] as import('../types').LanguageOption[],
  users: [] as User[]
};

export const api = {
  // Inicialização assíncrona chamada no main.tsx
  syncFromServer: async () => {
    try {
      const [candidates, techs, criteria, roles, seniorities, statuses, users, logs] = await Promise.all([
        fetch(`${API_BASE}/candidates`).then(r => r.json()),
        fetch(`${API_BASE}/settings/technologies`).then(r => r.json()),
        fetch(`${API_BASE}/settings/criteria`).then(r => r.json()),
        fetch(`${API_BASE}/settings/roles`).then(r => r.json()),
        fetch(`${API_BASE}/settings/seniorities`).then(r => r.json()),
        fetch(`${API_BASE}/settings/statuses`).then(r => r.json()),
        fetch(`${API_BASE}/settings/languages`).then(r => r.json()),
        fetch(`${API_BASE}/settings/users`).then(r => r.json()),
        fetch(`${API_BASE}/settings/logs`).then(r => r.json())
      ]);
      cache.candidates = Array.isArray(candidates) ? candidates : [];
      cache.techs = Array.isArray(techs) ? techs : [];
      cache.criteria = Array.isArray(criteria) ? criteria : [];
      cache.roles = Array.isArray(roles) ? roles : [];
      cache.seniorities = Array.isArray(seniorities) ? seniorities : [];
      cache.statuses = Array.isArray(statuses) ? statuses : [];
      cache.languages = Array.isArray(languages) ? languages : [];
      cache.users = Array.isArray(users) ? users : [];
      cache.logs = Array.isArray(logs) ? logs : [];
    } catch (e) {
      console.error("Falha ao sincronizar com o servidor:", e);
    }
  },

  // --- LOGGING ---
  getSystemLogs: (): SystemLog[] => cache.logs,
  addLog: (action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'OTHER', entity: string, details: string): void => {
    // Para simplificar no in-memory, o usuário logado ainda poderia ser pego de um cookie ou cache,
    // mas não estamos usando localstorage mais. Então usaremos fixo ou simulado.
    const userId = 'system';
    const userName = 'Sistema';

    const newLog: SystemLog = {
      id: Math.random().toString(36).substring(2, 9),
      userId,
      userName,
      action,
      entity,
      details,
      timestamp: new Date().toISOString()
    };
    cache.logs.unshift(newLog);

    // Fire and forget
    fetch(`${API_BASE}/settings/logs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newLog)
    }).catch(() => {});
  },

  // --- CANDIDATES ---
  getCandidates: (): Candidate[] => cache.candidates,

  getCandidateById: (id: string): Candidate | undefined => {
    return cache.candidates.find((c) => c.id === id);
  },

  saveCandidate: (candidate: Candidate): void => {
    const existingIndex = cache.candidates.findIndex((c) => c.id === candidate.id);
    let method = 'POST';
    let url = `${API_BASE}/candidates`;

    if (existingIndex >= 0) {
      cache.candidates[existingIndex] = candidate;
      api.addLog('UPDATE', 'Candidato', `Candidato atualizado: ${candidate.name}`);
      method = 'PUT';
      url = `${API_BASE}/candidates/${candidate.id}`;
    } else {
      cache.candidates.push(candidate);
      api.addLog('CREATE', 'Candidato', `Novo candidato cadastrado: ${candidate.name}`);
    }
    
    // Fire and forget sync with error alert
    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(candidate)
    })
    .then(async (res) => {
      if (!res.ok) {
        const err = await res.text();
        console.error("Erro na API:", err);
        alert("Ocorreu um erro ao salvar no servidor. Possivelmente o arquivo é grande demais (limite Vercel de 4.5MB). Detalhes: " + res.status);
      }
    })
    .catch((e) => {
      console.error("Falha de rede ao salvar:", e);
      alert("Falha de rede ao salvar o candidato no servidor.");
    });
  },

  deleteCandidate: (id: string): void => {
    const candidate = cache.candidates.find(c => c.id === id);
    cache.candidates = cache.candidates.filter((c) => c.id !== id);
    if (candidate) {
      api.addLog('DELETE', 'Candidato', `Candidato excluído: ${candidate.name}`);
    }

    fetch(`${API_BASE}/candidates/${id}`, { method: 'DELETE' }).catch(() => {});
  },
  
  seedMockData: () => {
    // Não semeamos mais dados fake. O seed agora ocorre no banco de dados.
  },

  // --- TECHNOLOGIES ---
  getTechnologies: (): Technology[] => cache.techs,
  saveTechnology: (tech: Technology): void => {
    const existingIndex = cache.techs.findIndex((c) => c.id === tech.id);
    if (existingIndex >= 0) { cache.techs[existingIndex] = tech; }
    else { cache.techs.push(tech); }

    fetch(`${API_BASE}/settings/technologies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tech)
    }).catch(() => {});
  },
  updateTechnologies: (techs: Technology[]): void => {
    cache.techs = techs;
    const reorderData = techs.map((t, index) => ({ id: t.id, order: index }));
    fetch(`${API_BASE}/settings/technologies/reorder`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(reorderData)
    }).catch(() => {});
  },
  deleteTechnology: (id: string): void => {
    cache.techs = cache.techs.filter((c) => c.id !== id);
    fetch(`${API_BASE}/settings/technologies?id=${id}`, { method: 'DELETE' }).catch(() => {});
  },

  // --- CRITERIA LIBRARY ---
  getLibraryCriteria: (): LibraryCriteria[] => cache.criteria,
  saveLibraryCriteria: (criteria: LibraryCriteria): void => {
    const existingIndex = cache.criteria.findIndex((c) => c.id === criteria.id);
    if (existingIndex >= 0) { cache.criteria[existingIndex] = criteria; }
    else { cache.criteria.push(criteria); }

    fetch(`${API_BASE}/settings/criteria`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(criteria)
    }).catch(() => {});
  },
  deleteLibraryCriteria: (id: string): void => {
    cache.criteria = cache.criteria.filter((c) => c.id !== id);
    fetch(`${API_BASE}/settings/criteria?id=${id}`, { method: 'DELETE' }).catch(() => {});
  },

  // --- ROLES ---
  getRoles: (): RoleOption[] => cache.roles,
  saveRole: (role: RoleOption): void => {
    const existingIndex = cache.roles.findIndex((r) => r.id === role.id);
    if (existingIndex >= 0) {
      cache.roles[existingIndex] = role;
      api.addLog('UPDATE', 'Configuração', `Cargo atualizado: ${role.name}`);
    } else {
      cache.roles.push(role);
      api.addLog('CREATE', 'Configuração', `Novo cargo cadastrado: ${role.name}`);
    }

    fetch(`${API_BASE}/settings/roles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(role)
    }).catch(() => {});
  },
  updateRoles: (roles: RoleOption[]): void => {
    cache.roles = roles;
    const reorderData = roles.map((r, index) => ({ id: r.id, order: index }));
    fetch(`${API_BASE}/settings/roles/reorder`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(reorderData)
    }).catch(() => {});
  },
  deleteRole: (id: string): void => {
    const item = cache.roles.find(r => r.id === id);
    cache.roles = cache.roles.filter((r) => r.id !== id);
    if (item) api.addLog('DELETE', 'Configuração', `Cargo excluído: ${item.name}`);

    fetch(`${API_BASE}/settings/roles?id=${id}`, { method: 'DELETE' }).catch(() => {});
  },

  // --- SENIORITIES ---
  getSeniorities: (): Seniority[] => cache.seniorities,
  saveSeniority: (seniority: Seniority): void => {
    const existingIndex = cache.seniorities.findIndex((s) => s.id === seniority.id);
    if (existingIndex >= 0) { cache.seniorities[existingIndex] = seniority; }
    else { cache.seniorities.push(seniority); }

    fetch(`${API_BASE}/settings/seniorities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(seniority)
    }).catch(() => {});
  },
  updateSeniorities: (seniorities: Seniority[]): void => {
    cache.seniorities = seniorities;
    const reorderData = seniorities.map((s, index) => ({ id: s.id, order: index }));
    fetch(`${API_BASE}/settings/seniorities/reorder`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(reorderData)
    }).catch(() => {});
  },
  deleteSeniority: (id: string): void => {
    cache.seniorities = cache.seniorities.filter((s) => s.id !== id);
    fetch(`${API_BASE}/settings/seniorities?id=${id}`, { method: 'DELETE' }).catch(() => {});
  },

  // --- STATUSES ---
  getStatuses: (): CandidateStatusOption[] => cache.statuses,
  saveStatus: (status: CandidateStatusOption): void => {
    const existingIndex = cache.statuses.findIndex((s) => s.id === status.id);
    if (existingIndex >= 0) { cache.statuses[existingIndex] = status; }
    else { cache.statuses.push(status); }

    fetch(`${API_BASE}/settings/statuses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(status)
    }).catch(() => {});
  },
  updateStatuses: (statuses: CandidateStatusOption[]): void => {
    cache.statuses = statuses;
    const reorderData = statuses.map((s, index) => ({ id: s.id, order: index }));
    fetch(`${API_BASE}/settings/statuses/reorder`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(reorderData)
    }).catch(() => {});
  },
  deleteStatus: (id: string): void => {
    cache.statuses = cache.statuses.filter((s) => s.id !== id);
    fetch(`${API_BASE}/settings/statuses?id=${id}`, { method: 'DELETE' }).catch(() => {});
  },

  // --- LANGUAGES ---
  getLanguages: (): import('../types').LanguageOption[] => cache.languages,
  saveLanguage: (lang: import('../types').LanguageOption): void => {
    const existingIndex = cache.languages.findIndex((l) => l.id === lang.id);
    if (existingIndex >= 0) { cache.languages[existingIndex] = lang; }
    else { cache.languages.push(lang); }

    fetch(`${API_BASE}/settings/languages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(lang)
    }).catch(() => {});
  },
  updateLanguages: (langs: import('../types').LanguageOption[]): void => {
    cache.languages = langs;
    const reorderData = langs.map((l, index) => ({ id: l.id, order: index }));
    fetch(`${API_BASE}/settings/languages/reorder`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(reorderData)
    }).catch(() => {});
  },
  deleteLanguage: (id: string): void => {
    cache.languages = cache.languages.filter((l) => l.id !== id);
    fetch(`${API_BASE}/settings/languages?id=${id}`, { method: 'DELETE' }).catch(() => {});
  },

  // --- USERS & AUTH ---
  getUsers: (): User[] => cache.users,
  saveUser: (user: User): void => {
    const existingIndex = cache.users.findIndex(u => u.id === user.id);
    if (existingIndex >= 0) { 
      cache.users[existingIndex] = user; 
      api.addLog('UPDATE', 'Usuário', `Usuário atualizado: ${user.firstName} ${user.lastName}`);
    } else { 
      cache.users.push(user);
      api.addLog('CREATE', 'Usuário', `Novo usuário cadastrado: ${user.firstName} ${user.lastName}`);
    }

    fetch(`${API_BASE}/settings/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user)
    }).catch(() => {});
  },
  deleteUser: (id: string): void => {
    const user = cache.users.find(u => u.id === id);
    cache.users = cache.users.filter((u) => u.id !== id);
    if (user) {
      api.addLog('DELETE', 'Usuário', `Usuário excluído: ${user.firstName} ${user.lastName}`);
    }

    fetch(`${API_BASE}/settings/users?id=${id}`, { method: 'DELETE' }).catch(() => {});
  }
};



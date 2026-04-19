import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '../services/api';
import type { Candidate, Technology } from '../types';
import { Search, Filter, Plus, FileText, Edit, Trash2, X, ClipboardList } from 'lucide-react';

const CandidateList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [moduleFilter, setModuleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState(location.state?.statusFilter || '');
  const [technologies, setTechnologies] = useState<Technology[]>([]);

  useEffect(() => {
    setCandidates(api.getCandidates());
    setTechnologies(api.getTechnologies());
  }, []);

  useEffect(() => {
    if (location.state && typeof location.state.statusFilter !== 'undefined') {
      setStatusFilter(location.state.statusFilter);
    }
  }, [location.state]);

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Tem certeza que deseja excluir o candidato ${name}?`)) {
      api.deleteCandidate(id);
      setCandidates(api.getCandidates());
    }
  };

  const filteredCandidates = candidates.filter((c) => {
    const matchSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        c.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchModule = moduleFilter ? c.technologies.some(m => m.toLowerCase().includes(moduleFilter.toLowerCase())) : true;
    const matchStatus = statusFilter ? c.status === statusFilter : true;
    return matchSearch && matchModule && matchStatus;
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', marginBottom: '0.5rem' }}>Candidatos</h1>
          <p style={{ color: 'var(--text-muted)' }}>Gerencie e filtre o banco de currículos.</p>
        </div>
        <button className="btn btn-accent" onClick={() => navigate('/candidates/new')}>
          <Plus size={18} />
          <span>Novo Candidato</span>
        </button>
      </div>

      <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 300px', position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', top: '0.75rem', left: '0.875rem', color: 'var(--text-light)' }} />
            <input 
              type="text" 
              className="form-control" 
              placeholder="Buscar por nome ou e-mail..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>
          <div style={{ flex: '1 1 200px', position: 'relative' }}>
            <Filter size={18} style={{ position: 'absolute', top: '0.75rem', left: '0.875rem', color: 'var(--text-light)' }} />
            <select 
              className="form-control" 
              value={moduleFilter}
              onChange={(e) => setModuleFilter(e.target.value)}
              style={{ paddingLeft: '2.5rem', appearance: 'none' }}
            >
              <option value="">Todas as Tecnologias e Metodologias</option>
              {technologies.map(t => (
                <option key={t.id} value={t.name}>{t.name}</option>
              ))}
            </select>
          </div>
          <div style={{ flex: '1 1 200px', position: 'relative' }}>
            <Filter size={18} style={{ position: 'absolute', top: '0.75rem', left: '0.875rem', color: 'var(--text-light)' }} />
            <select 
              className="form-control" 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ paddingLeft: '2.5rem', appearance: 'none' }}
            >
              <option value="">Todos os Status</option>
              <option value="Novo">Novo</option>
              <option value="Em Andamento">Em Andamento</option>
              <option value="Aprovado">Aprovado</option>
              <option value="Reprovado">Reprovado</option>
              <option value="Vaga Congelada">Vaga Congelada</option>
            </select>
          </div>
          {(searchTerm || moduleFilter || statusFilter) && (
            <button 
              className="btn btn-outline"
              style={{ color: 'var(--danger)', borderColor: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              onClick={() => navigate('/dashboard')}
              title="Limpar filtros e voltar para o Dashboard"
            >
              <X size={18} /> Fechar Filtros
            </button>
          )}
        </div>
      </div>

      <div className="card">
        {filteredCandidates.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg-main)' }}>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--text-main)' }}>Candidato</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--text-main)' }}>Senioridade</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--text-main)' }}>Tecnologias e Metodologias</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--text-main)' }}>Status</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--text-main)', textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredCandidates.map((candidate) => (
                <tr key={candidate.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background-color 0.2s' }}>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <div style={{ fontWeight: 600, color: 'var(--primary)' }}>{candidate.name}</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{candidate.email}</div>
                  </td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <span style={{ border: '1px solid var(--border)', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem' }}>
                      {candidate.seniority}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {candidate.technologies.map(m => (
                        <span key={m} style={{ backgroundColor: 'var(--bg-main)', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', color: 'var(--text-main)' }}>
                          {m}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <span style={{ fontWeight: 500, fontSize: '0.875rem' }}>{candidate.status}</span>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <button 
                        className="btn btn-outline" 
                        style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem' }}
                        onClick={() => navigate(`/candidates/${candidate.id}/edit`)}
                        title="Editar Informações"
                      >
                        <Edit size={14} /> Informações Gerais
                      </button>
                      <button 
                        className="btn btn-outline" 
                        style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem' }}
                        onClick={() => navigate(`/candidates/${candidate.id}`)}
                        title="Avaliação da Entrevista"
                      >
                        <ClipboardList size={14} /> Informações de Entrevista
                      </button>
                      <button 
                        className="btn btn-outline" 
                        style={{ padding: '0.4rem 0.5rem', fontSize: '0.75rem', color: 'var(--danger)', borderColor: 'transparent' }}
                        onClick={() => handleDelete(candidate.id, candidate.name)}
                        title="Excluir"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ padding: '3rem', textAlign: 'center' }}>
            <FileText size={48} style={{ color: 'var(--border)', margin: '0 auto 1rem auto' }} />
            <h3 style={{ marginBottom: '0.5rem' }}>Nenhum candidato encontrado</h3>
            <p style={{ color: 'var(--text-muted)' }}>Tente ajustar seus filtros para encontrar o que procura.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CandidateList;

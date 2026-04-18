import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import type { Candidate } from '../types';
import { Search, Filter, Plus, FileText, ExternalLink } from 'lucide-react';

const CandidateList = () => {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [moduleFilter, setModuleFilter] = useState('');

  useEffect(() => {
    setCandidates(api.getCandidates());
  }, []);

  const filteredCandidates = candidates.filter((c) => {
    const matchSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        c.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchModule = moduleFilter ? c.sapModules.some(m => m.toLowerCase().includes(moduleFilter.toLowerCase())) : true;
    return matchSearch && matchModule;
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
              <option value="">Todos os Módulos SAP</option>
              <option value="FI">FI (Finance)</option>
              <option value="CO">CO (Controlling)</option>
              <option value="MM">MM (Materials Management)</option>
              <option value="SD">SD (Sales & Distribution)</option>
              <option value="HCM">HCM (Human Capital Management)</option>
              <option value="ABAP">ABAP</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card">
        {filteredCandidates.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg-main)' }}>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--text-main)' }}>Candidato</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--text-main)' }}>Senioridade</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--text-main)' }}>Módulos SAP</th>
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
                      {candidate.sapModules.map(m => (
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
                    <button 
                      className="btn btn-outline" 
                      style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem' }}
                      onClick={() => navigate(`/candidates/${candidate.id}`)}
                    >
                      <ExternalLink size={14} /> View
                    </button>
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

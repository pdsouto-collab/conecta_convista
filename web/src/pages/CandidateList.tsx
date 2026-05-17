import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '../services/api';
import type { Candidate } from '../types';
import { Search, Filter, Plus, FileText, Edit, Trash2, X, ClipboardList, Upload, Download, ChevronLeft, ChevronRight } from 'lucide-react';

const CandidateList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 50;
  
  const [loading, setLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState(location.state?.statusFilter || '');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Advanced filters
  const [advancedFiltersOpen, setAdvancedFiltersOpen] = useState(false);
  const [roleFilter, setRoleFilter] = useState('');
  const [cvKeywordFilter, setCvKeywordFilter] = useState('');
  const [exConvistaFilter, setExConvistaFilter] = useState('');

    const [availableStatuses, setAvailableStatuses] = useState<import('../types').CandidateStatusOption[]>([]);
  const [availableRoles, setAvailableRoles] = useState<import('../types').RoleOption[]>([]);

  useEffect(() => {
    setAvailableStatuses(api.getStatuses());
    setAvailableRoles(api.getRoles());
  }, []);

  const fetchCandidates = async () => {
    setLoading(true);
    try {
      const res = await (api as any).fetchCandidatesPaginated({
        page: currentPage,
        limit,
        search: searchTerm,
        status: statusFilter,
        role: roleFilter,
        cvKeyword: cvKeywordFilter,
        isExConvista: exConvistaFilter === 'sim' ? true : exConvistaFilter === 'nao' ? false : undefined
      });
      setCandidates(res.data);
      setTotalPages(res.totalPages);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Reset to page 1 whenever a filter changes
    setCurrentPage(1);
  }, [searchTerm, statusFilter, roleFilter, cvKeywordFilter, exConvistaFilter]);

  useEffect(() => {
    fetchCandidates();
  }, [currentPage, searchTerm, statusFilter, roleFilter, cvKeywordFilter, exConvistaFilter]);

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Tem certeza que deseja excluir o candidato ${name}?`)) {
      api.deleteCandidate(id);
      setTimeout(fetchCandidates, 500); // refresh after delete
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      alert(`Arquivo ${file.name} selecionado! A integração com o layout CSV será implementada em breve.`);
      e.target.value = '';
    }
  };

  const exportToCSV = async () => {
    try {
      const res = await (api as any).fetchCandidatesPaginated({
        limit: 10000,
        search: searchTerm,
        status: statusFilter,
        role: roleFilter,
        cvKeyword: cvKeywordFilter,
        isExConvista: exConvistaFilter === 'sim' ? true : exConvistaFilter === 'nao' ? false : undefined
      });
      const fullList = res.data as Candidate[];

      if (fullList.length === 0) {
        alert('Nenhum candidato para exportar.');
        return;
      }

      const headers = [
        'Nome', 'Email', 'Telefone', 'LinkedIn', 'Cargo', 'Senioridade', 'Status',
        'Disponibilidade', 'Experiência em TI (Anos)', 'Experiência na Vaga (Anos)', 
        'Ex-Convista', 'Último Contato', 'Principais Projetos',
        'Possui Restrição', 'Qual Restrição',
        'Pretensão PJ', 'Pretensão CLT', 'Disponível Em', 'Data Entrevista', 
        'Entrevistador 1', 'Entrevistador 2', 'Entrevistador 3',
        'Tecnologias e Metodologias', 'Notas Gerais da Entrevista', 
        'Avaliação Comportamental', 'Avaliação Técnica'
      ];

      const escapeCSV = (value: any) => {
        if (value === null || value === undefined) return '""';
        const stringValue = String(value);
        return `"${stringValue.replace(/"/g, '""').replace(/\n/g, ' ')}"`;
      };

      const rows = fullList.map(c => {
        const techs = c.technologies ? c.technologies.join(', ') : '';
        const behavioral = c.behavioralEvaluation?.map(e => `${e.criteria}: ${e.score} (${e.observation || 'Sem obs'})`).join(' | ') || '';
        const technical = c.technicalEvaluation?.map(e => `${e.criteria}: ${e.score} (${e.observation || 'Sem obs'})`).join(' | ') || '';

        return [
          c.name, c.email, c.phone, c.linkedin, c.role || '', c.seniority, c.status,
          c.availability, c.experienceIT, c.experienceRole, 
          c.isExConvista ? 'Sim' : 'Não', c.lastContactDate, c.mainProjects,
          c.hasRestriction ? 'Sim' : 'Não', c.restrictionDetails || '',
          c.salaryExpectationPJ, c.salaryExpectationCLT,
          c.availableFrom, c.interviewDate, c.interviewer1, c.interviewer2, c.interviewer3,
          techs, c.generalNotes, behavioral, technical
        ].map(escapeCSV).join(';');
      });

      const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.map(escapeCSV).join(';'), ...rows].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `candidatos_convista_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      alert("Erro ao exportar dados.");
    }
  };

  const hasActiveFilters = roleFilter || statusFilter || cvKeywordFilter || exConvistaFilter;

  const clearFilters = () => {
    setRoleFilter('');
    setStatusFilter('');
    setCvKeywordFilter('');
    setExConvistaFilter('');
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', marginBottom: '0.5rem' }}>Candidatos</h1>
          <p style={{ color: 'var(--text-muted)' }}>Gerencie e filtre o banco de currículos.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={exportToCSV}>
            <Download size={18} />
            <span>Exportar CSV</span>
          </button>
          
          <input 
            type="file" 
            accept=".csv" 
            style={{ display: 'none' }} 
            ref={fileInputRef}
            onChange={handleFileUpload}
          />
          <button className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={() => fileInputRef.current?.click()}>
            <Upload size={18} />
            <span>Importar CSV</span>
          </button>
          <button className="btn btn-accent" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={() => navigate('/candidates/new')}>
            <Plus size={18} />
            <span>Novo Candidato</span>
          </button>
        </div>
      </div>

      <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
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
          
          <button 
            className="btn btn-outline"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderColor: advancedFiltersOpen ? 'var(--primary)' : 'var(--border)' }}
            onClick={() => setAdvancedFiltersOpen(!advancedFiltersOpen)}
          >
            <Filter size={18} /> Filtros Avançados
          </button>

          {hasActiveFilters && (
            <button 
              className="btn btn-outline"
              style={{ color: 'var(--danger)', borderColor: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              onClick={clearFilters}
              title="Limpar todos os filtros"
            >
              <X size={18} /> Limpar
            </button>
          )}
        </div>

        {advancedFiltersOpen && (
          <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }} className="animate-fade-in">
            <h4 style={{ marginBottom: '1rem', color: 'var(--text-main)' }}>Opções de Filtragem (Servidor)</h4>
            <div className="grid-2" style={{ gap: '1rem' }}>
              
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Palavra-chave no Currículo</label>
                <div style={{ position: 'relative' }}>
                  <FileText size={16} style={{ position: 'absolute', top: '0.7rem', left: '0.75rem', color: 'var(--text-light)' }} />
                  <input 
                    type="text" className="form-control" 
                    placeholder="Ex: ERP, Integração..." 
                    value={cvKeywordFilter} onChange={(e) => setCvKeywordFilter(e.target.value)} 
                    style={{ paddingLeft: '2.2rem' }}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Cargo</label>
                <select className="form-control" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                  <option value="">Todos os Cargos</option>
                  {availableRoles.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Status do Processo</label>
                <select className="form-control" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option value="">Todos os Status</option>
                  {availableStatuses.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Ex-Convista</label>
                <select className="form-control" value={exConvistaFilter} onChange={(e) => setExConvistaFilter(e.target.value)}>
                  <option value="">Todos</option>
                  <option value="sim">Sim</option>
                  <option value="nao">Não</option>
                </select>
              </div>

            </div>
          </div>
        )}
      </div>

      <div className="card">
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Carregando candidatos...
          </div>
        ) : candidates.length > 0 ? (
          <>
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
                {candidates.map((candidate) => (
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
                        {candidate.technologies?.map(m => (
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
                          <Edit size={14} /> 
                        </button>
                        <button 
                          className="btn btn-outline" 
                          style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem' }}
                          onClick={() => navigate(`/candidates/${candidate.id}`)}
                          title="Avaliação da Entrevista"
                        >
                          <ClipboardList size={14} /> 
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
            
            <div style={{ padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                Mostrando página {currentPage} de {totalPages || 1}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  className="btn btn-outline" 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.5rem 0.75rem' }}
                >
                  <ChevronLeft size={16} /> Anterior
                </button>
                <button 
                  className="btn btn-outline" 
                  disabled={currentPage === totalPages || totalPages === 0}
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.5rem 0.75rem' }}
                >
                  Próxima <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </>
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

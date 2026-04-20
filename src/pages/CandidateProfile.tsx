import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../services/api';
import type { Candidate, EvaluationMatrix } from '../types';
import { ArrowLeft, User, Phone, Mail, Briefcase, FileText, CheckCircle, Plus } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

const EvaluationSection = ({ 
  title, 
  evaluations, 
  availableCriteria,
  onAdd, 
  onChange 
}: { 
  title: string, 
  evaluations: EvaluationMatrix[], 
  availableCriteria: import('../types').LibraryCriteria[],
  onAdd: () => void,
  onChange: (id: string, field: string, value: any) => void 
}) => {
  return (
    <div style={{ marginBottom: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h4 style={{ fontSize: '1.125rem' }}>{title}</h4>
        <button onClick={onAdd} type="button" className="btn btn-outline" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}>
          <Plus size={14} /> Adicionar Quesito
        </button>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {evaluations.map(ev => (
          <div key={ev.id} style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '1rem', backgroundColor: 'var(--bg-main)' }}>
            <div className="grid-2">
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Quesito Avaliado</label>
                <select 
                  className="form-control" 
                  value={ev.criteria} 
                  onChange={(e) => onChange(ev.id, 'criteria', e.target.value)} 
                >
                  <option value="">Selecione um quesito...</option>
                  {ev.criteria && !availableCriteria.find(c => c.name === ev.criteria) && (
                    <option value={ev.criteria}>{ev.criteria}</option>
                  )}
                  {availableCriteria.map(opt => (
                    <option key={opt.id} value={opt.name}>{opt.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Nota (1 a 5)</label>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  {[1, 2, 3, 4, 5].map(score => (
                    <button
                      key={score}
                      type="button"
                      onClick={() => onChange(ev.id, 'score', score)}
                      style={{
                        width: '32px', height: '32px',
                        borderRadius: '50%',
                        border: '1px solid var(--border)',
                        backgroundColor: ev.score === score ? 'var(--primary)' : 'white',
                        color: ev.score === score ? 'white' : 'var(--text-main)',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}
                    >
                      {score}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="form-group" style={{ marginTop: '1rem', marginBottom: 0 }}>
              <label className="form-label">Observação</label>
              <textarea 
                className="form-control" 
                rows={2} 
                value={ev.observation} 
                onChange={(e) => onChange(ev.id, 'observation', e.target.value)}
                placeholder="Inclua observações sobre a avaliação deste quesito..."
              ></textarea>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const CandidateProfile = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [libraryCriteria, setLibraryCriteria] = useState<import('../types').LibraryCriteria[]>([]);
  const [availableStatuses, setAvailableStatuses] = useState<import('../types').CandidateStatusOption[]>([]);
  const [technologies, setTechnologies] = useState<import('../types').Technology[]>([]);

  useEffect(() => {
    setLibraryCriteria(api.getLibraryCriteria());
    setAvailableStatuses(api.getStatuses());
    setTechnologies(api.getTechnologies());
    if (id) {
      const data = api.getCandidateById(id);
      if (data) setCandidate(data);
    }
  }, [id]);

  const handleEvaluationChange = (type: 'behavioralEvaluation' | 'technicalEvaluation', evId: string, field: string, value: any) => {
    if (!candidate) return;
    
    setCandidate(prev => {
      if (!prev) return prev;
      const targetEvaluations = [...prev[type]];
      const index = targetEvaluations.findIndex(e => e.id === evId);
      if (index >= 0) {
        targetEvaluations[index] = { ...targetEvaluations[index], [field]: value };
      }
      return { ...prev, [type]: targetEvaluations };
    });
  };

  const handleAddEvaluation = (type: 'behavioralEvaluation' | 'technicalEvaluation') => {
    if (!candidate) return;
    setCandidate(prev => {
      if (!prev) return prev;
      return { 
        ...prev, 
        [type]: [...prev[type], { id: uuidv4(), criteria: 'Novo Quesito', score: 0, observation: '' }] 
      };
    });
  };

  const saveCandidate = () => {
    if (candidate) {
      api.saveCandidate(candidate);
      alert('Avaliação salva com sucesso!');
    }
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (candidate) {
      setCandidate({ ...candidate, status: e.target.value as any });
    }
  };

  const openCV = () => {
    if (candidate?.cvFile) {
      // Create an iframe to preview or download
      const w = window.open('about:blank');
      if (w) {
         w.document.write(`<iframe src="${candidate.cvFile}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
      }
    } else {
      alert("Nenhum CV anexado.");
    }
  };

  if (!candidate) return <div>Carregando...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button className="btn btn-outline" style={{ padding: '0.5rem' }} onClick={() => navigate('/candidates')}>
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 style={{ fontSize: '1.875rem', marginBottom: '0.25rem' }}>Perfil do Candidato</h1>
            <p style={{ color: 'var(--text-muted)' }}>Visualização e Avaliação de Entrevista.</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <select className="form-control" value={candidate.status} onChange={handleStatusChange} style={{ width: 'auto' }}>
            {availableStatuses.map(s => (
              <option key={s.id} value={s.name}>{s.name}</option>
            ))}
          </select>
          <button className="btn btn-primary" onClick={saveCandidate}>
            <CheckCircle size={18} /> Salvar Avaliação
          </button>
        </div>
      </div>

      <div className="grid-2" style={{ alignItems: 'start' }}>
        <div className="card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'var(--primary-light)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 600 }}>
              {candidate.name.charAt(0)}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <h2 style={{ fontSize: '2rem', marginBottom: '0.25rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {candidate.name}
                <span className={`status-badge status-${candidate.status.toLowerCase().replace(/\s+/g, '-')}`}>
                  {candidate.status}
                </span>
              </h2>
              <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                <span>{candidate.role ? `${candidate.role} • ` : ''}{candidate.seniority}</span>
                <span>•</span>
                <span>{candidate.availability}</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Mail size={18} style={{ color: 'var(--text-light)' }} />
              <span>{candidate.email}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Phone size={18} style={{ color: 'var(--text-light)' }} />
              <span>{candidate.phone || 'Não informado'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Briefcase size={18} style={{ color: 'var(--text-light)' }} />
              <span>{candidate.availability}</span>
            </div>
            {candidate.linkedin && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <User size={18} style={{ color: 'var(--text-light)' }} />
                <a href={candidate.linkedin.startsWith('http') ? candidate.linkedin : `https://${candidate.linkedin}`} target="_blank" rel="noreferrer">LinkedIn Profil</a>
              </div>
            )}
          </div>

          <h4 style={{ marginBottom: '1rem' }}>Tecnologias e Metodologias</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '2rem' }}>
            {candidate.technologies.map(m => (
              <span key={m} style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: 500 }}>
                {m}
              </span>
            ))}
            {candidate.technologies.length === 0 && <span style={{ color: 'var(--text-muted)' }}>Nenhum item informado</span>}
          </div>

          <h4 style={{ marginBottom: '1rem' }}>Detalhes da Entrevista</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '2rem', fontSize: '0.875rem' }}>
            {candidate.isExConvista !== undefined && <div><strong>Ex-Convista:</strong> {candidate.isExConvista ? 'Sim' : 'Não'}</div>}
            {candidate.hasRestriction !== undefined && <div><strong>Possui Restrição?</strong> {candidate.hasRestriction ? `Sim (${candidate.restrictionDetails || 'Não especificada'})` : 'Não'}</div>}
            {candidate.salaryExpectationPJ && <div><strong>Pretensão PJ:</strong> {candidate.salaryExpectationPJ}</div>}
            {candidate.salaryExpectationCLT && <div><strong>Pretensão CLT:</strong> {candidate.salaryExpectationCLT}</div>}
            {candidate.availableFrom && <div><strong>Disponível a partir de:</strong> {candidate.availableFrom.split('-').reverse().join('/')}</div>}
            {candidate.lastContactDate && <div><strong>Último Contato:</strong> {candidate.lastContactDate.split('-').reverse().join('/')}</div>}
            {candidate.interviewDate && <div><strong>Data Entrevista:</strong> {candidate.interviewDate.split('-').reverse().join('/')}</div>}
            {candidate.mainProjects && <div><strong>Principais Projetos:</strong> {candidate.mainProjects}</div>}
            {candidate.interviewer1 && <div><strong>Entrevistador 1:</strong> {candidate.interviewer1}</div>}
            {candidate.interviewer2 && <div><strong>Entrevistador 2:</strong> {candidate.interviewer2}</div>}
            {candidate.interviewer3 && <div><strong>Entrevistador 3:</strong> {candidate.interviewer3}</div>}
            {(!candidate.salaryExpectationPJ && !candidate.salaryExpectationCLT && !candidate.availableFrom && !candidate.interviewDate && !candidate.interviewer1 && (candidate.isExConvista === undefined) && (candidate.hasRestriction === undefined) && !candidate.lastContactDate && !candidate.mainProjects) && (
              <span style={{ color: 'var(--text-muted)' }}>Nenhuma informação preenchida.</span>
            )}
          </div>

          <h4 style={{ marginBottom: '1rem' }}>Currículo</h4>
          <button className="btn btn-outline" style={{ width: '100%' }} onClick={openCV}>
            <FileText size={18} /> {candidate.cvFileName || "Visualizar CV"}
          </button>
        </div>

        <div className="card" style={{ padding: '2rem' }}>
          <h3 style={{ marginBottom: '2rem', color: 'var(--primary)', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>Matriz de Avaliação</h3>
          
          <EvaluationSection 
            title="1. Parte Comportamental" 
            evaluations={candidate.behavioralEvaluation} 
            availableCriteria={libraryCriteria.filter(c => c.type === 'Comportamental')}
            onAdd={() => handleAddEvaluation('behavioralEvaluation')}
            onChange={(id, field, value) => handleEvaluationChange('behavioralEvaluation', id, field, value)}
          />

          {(() => {
            const candidateTechIds = technologies
              .filter(t => candidate.technologies.includes(t.name))
              .map(t => t.id);

            const techCriteria = libraryCriteria.filter(c => 
              c.type === 'Técnico' && (!c.technologyId || candidateTechIds.includes(c.technologyId))
            );

            return (
              <EvaluationSection 
                title="2. Parte Técnica" 
                evaluations={candidate.technicalEvaluation} 
                availableCriteria={techCriteria}
                onAdd={() => handleAddEvaluation('technicalEvaluation')}
                onChange={(id, field, value) => handleEvaluationChange('technicalEvaluation', id, field, value)}
              />
            );
          })()}

          <div style={{ marginTop: '2rem' }}>
            <h4 style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>Observações Gerais do Entrevistador Responsável</h4>
            <textarea 
              className="form-control" 
              rows={4} 
              value={candidate.generalNotes} 
              onChange={(e) => setCandidate({ ...candidate, generalNotes: e.target.value })}
              placeholder="Considerações finais sobre a entrevista..."
            ></textarea>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CandidateProfile;

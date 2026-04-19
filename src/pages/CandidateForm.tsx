import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { api } from '../services/api';
import type { Candidate, Technology, Seniority } from '../types';
import { Save, ArrowLeft, Upload } from 'lucide-react';


const CandidateForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const [formData, setFormData] = useState<Partial<Candidate>>({
    name: '',
    email: '',
    phone: '',
    linkedin: '',
    technologies: [],
    availability: 'Híbrido',
    seniority: 'Pleno',
    status: 'Novo',
    generalNotes: '',
    salaryExpectationPJ: '',
    salaryExpectationCLT: '',
    availableFrom: '',
    interviewDate: '',
    interviewer1: '',
    interviewer2: '',
    interviewer3: '',
    behavioralEvaluation: [
      { id: uuidv4(), criteria: 'Comunicação', score: 0, observation: '' },
      { id: uuidv4(), criteria: 'Trabalho em Equipe', score: 0, observation: '' },
      { id: uuidv4(), criteria: 'Resolução de Problemas', score: 0, observation: '' },
    ],
    technicalEvaluation: [
      { id: uuidv4(), criteria: 'Conhecimento no Módulo Principal', score: 0, observation: '' },
      { id: uuidv4(), criteria: 'Experiência em Projetos de Implantação', score: 0, observation: '' },
    ]
  });

  const [fileName, setFileName] = useState('');
  const [availableTechs, setAvailableTechs] = useState<Technology[]>([]);
  const [availableSeniorities, setAvailableSeniorities] = useState<Seniority[]>([]);

  useEffect(() => {
    setAvailableTechs(api.getTechnologies());
    setAvailableSeniorities(api.getSeniorities());
    if (isEditing && id) {
      const candidate = api.getCandidateById(id);
      if (candidate) {
        setFormData(candidate);
        if (candidate.cvFileName) {
          setFileName(candidate.cvFileName);
        }
      }
    }
  }, [id, isEditing]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let numericValue = value.replace(/\D/g, "");
    
    if (numericValue === "") {
      setFormData(prev => ({ ...prev, [name]: "" }));
      return;
    }
    
    const numberValue = parseInt(numericValue, 10) / 100;
    
    const formattedValue = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(numberValue);
    
    const customFormat = formattedValue.replace(/^R\$\s?/, 'BRL ');
    
    setFormData(prev => ({ ...prev, [name]: customFormat }));
  };

  const handleModuleToggle = (module: string) => {
    setFormData(prev => {
      const modules = prev.technologies || [];
      if (modules.includes(module)) {
        return { ...prev, technologies: modules.filter(m => m !== module) };
      } else {
        return { ...prev, technologies: [...modules, module] };
      }
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      // Simulate file text extraction (OCR / pdf parser) for mock
      const mockExtraction = `Documento: ${file.name}\nConteúdo extraído simulado para fins de busca do sistema...`;
      
      setFormData(prev => ({ 
        ...prev, 
        cvFileName: file.name,
        cvText: prev.cvText ? prev.cvText : mockExtraction
      }));
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, cvFile: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const candidateToSave: Candidate = {
      ...(formData as Candidate),
      id: isEditing ? formData.id! : uuidv4(),
      createdAt: formData.createdAt || new Date().toISOString(),
    };

    api.saveCandidate(candidateToSave);
    navigate('/candidates');
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <button className="btn btn-outline" style={{ padding: '0.5rem' }} onClick={() => navigate('/candidates')}>
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 style={{ fontSize: '1.875rem', marginBottom: '0.25rem' }}>
            {isEditing ? 'Editar Candidato' : 'Novo Candidato'}
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>Preencha os dados básicos do currículo.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
          <h3 style={{ marginBottom: '1.5rem', color: 'var(--primary)' }}>Dados Pessoais</h3>
          
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Nome Completo *</label>
              <input required type="text" className="form-control" name="name" value={formData.name} onChange={handleChange} />
            </div>
            
            <div className="form-group">
              <label className="form-label">E-mail *</label>
              <input required type="email" className="form-control" name="email" value={formData.email} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label className="form-label">Telefone</label>
              <input type="text" className="form-control" name="phone" value={formData.phone} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label className="form-label">LinkedIn</label>
              <input type="text" className="form-control" name="linkedin" value={formData.linkedin} onChange={handleChange} placeholder="https://linkedin.com/in/..." />
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
          <h3 style={{ marginBottom: '1.5rem', color: 'var(--primary)' }}>Perfil Profissional</h3>
          
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Senioridade *</label>
              <select required className="form-control" name="seniority" value={formData.seniority} onChange={handleChange}>
                <option value="">Selecione...</option>
                {availableSeniorities.map(s => (
                  <option key={s.id} value={s.name}>{s.name}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label className="form-label">Disponibilidade de Trabalho *</label>
              <select required className="form-control" name="availability" value={formData.availability} onChange={handleChange}>
                <option value="Presencial">Presencial</option>
                <option value="Híbrido">Híbrido</option>
                <option value="Remoto">Remoto</option>
              </select>
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Anos de Experiência em TI</label>
              <input type="number" className="form-control" name="experienceIT" value={formData.experienceIT || ''} onChange={handleChange} min="0" step="0.5" placeholder="Ex: 5" />
            </div>
            
            <div className="form-group">
              <label className="form-label">Anos de Experiência na Vaga</label>
              <input type="number" className="form-control" name="experienceRole" value={formData.experienceRole || ''} onChange={handleChange} min="0" step="0.5" placeholder="Ex: 3" />
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '1rem' }}>
            <label className="form-label">Tecnologias e Metodologias *</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
              {availableTechs.length === 0 && <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Nenhuma cadastrada. Adicione nas configurações.</span>}
              {availableTechs.map(tech => (
                <button
                  key={tech.id}
                  type="button"
                  onClick={() => handleModuleToggle(tech.name)}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '2rem',
                    border: '1px solid',
                    borderColor: formData.technologies?.includes(tech.name) ? 'var(--primary)' : 'var(--border)',
                    backgroundColor: formData.technologies?.includes(tech.name) ? 'var(--primary)' : 'transparent',
                    color: formData.technologies?.includes(tech.name) ? 'white' : 'var(--text-main)',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {tech.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
          <h3 style={{ marginBottom: '1.5rem', color: 'var(--primary)' }}>Informações de Contratação e Entrevista</h3>
          
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Pretensão Salarial PJ (BRL)</label>
              <input type="text" className="form-control" name="salaryExpectationPJ" value={formData.salaryExpectationPJ || ''} onChange={handleCurrencyChange} placeholder="BRL 0,00" />
            </div>
            
            <div className="form-group">
              <label className="form-label">Pretensão Salarial CLT (BRL)</label>
              <input type="text" className="form-control" name="salaryExpectationCLT" value={formData.salaryExpectationCLT || ''} onChange={handleCurrencyChange} placeholder="BRL 0,00" />
            </div>

            <div className="form-group">
              <label className="form-label">Disponibilidade a partir de</label>
              <input type="date" className="form-control" name="availableFrom" value={formData.availableFrom || ''} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label className="form-label">Data da Entrevista</label>
              <input type="date" className="form-control" name="interviewDate" value={formData.interviewDate || ''} onChange={handleChange} />
            </div>
          </div>

          <div className="grid-2" style={{ marginTop: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Entrevistador 1</label>
              <input type="text" className="form-control" name="interviewer1" value={formData.interviewer1 || ''} onChange={handleChange} placeholder="Nome do Entrevistador" />
            </div>
            <div className="form-group">
              <label className="form-label">Entrevistador 2</label>
              <input type="text" className="form-control" name="interviewer2" value={formData.interviewer2 || ''} onChange={handleChange} placeholder="Nome do Entrevistador" />
            </div>
            <div className="form-group">
              <label className="form-label">Entrevistador 3</label>
              <input type="text" className="form-control" name="interviewer3" value={formData.interviewer3 || ''} onChange={handleChange} placeholder="Nome do Entrevistador" />
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: '2rem', marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1.5rem', color: 'var(--primary)' }}>Anexo do Currículo</h3>
          
          <div style={{
            border: '2px dashed var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: '3rem',
            textAlign: 'center',
            backgroundColor: 'var(--bg-main)'
          }}>
            <Upload size={32} style={{ color: 'var(--text-light)', margin: '0 auto 1rem auto' }} />
            <p style={{ fontWeight: 500, marginBottom: '0.5rem' }}>Arraste e solte o arquivo ou clique para selecionar</p>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>PDF, DOC ou DOCX (Max 5MB)</p>
            
            <input 
              type="file" 
              id="cv-upload" 
              accept=".pdf,.doc,.docx"
              style={{ display: 'none' }} 
              onChange={handleFileUpload}
            />
            <label htmlFor="cv-upload" className="btn btn-outline" style={{ cursor: 'pointer' }}>
              Procurar Arquivo
            </label>
            
            {fileName && (
              <div style={{ marginTop: '1rem', padding: '0.5rem', backgroundColor: 'white', borderRadius: '4px', display: 'inline-block' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>Arquivo selecionado: {fileName}</span>
              </div>
            )}
            
            <div className="form-group" style={{ marginTop: '2rem', textAlign: 'left' }}>
              <label className="form-label">Texto do Currículo (para Busca por Palavras-Chave)</label>
              <textarea 
                className="form-control" 
                name="cvText" 
                value={formData.cvText || ''} 
                onChange={handleChange} 
                rows={4} 
                placeholder="Insira palavras chaves ou texto extraído do CV..." 
              />
              <small style={{ color: 'var(--text-muted)' }}>Ao subir um arquivo o sistema fará a extração desse texto automaticamente.</small>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <button type="button" className="btn btn-outline" onClick={() => navigate('/candidates')}>Cancelar</button>
          <button type="submit" className="btn btn-primary">
            <Save size={18} />
            Salvar Candidato
          </button>
        </div>
      </form>
    </div>
  );
};

export default CandidateForm;

import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { api } from '../services/api';
import type { Technology, LibraryCriteria, Seniority } from '../types';
import { Settings as SettingsIcon, Trash2, Plus, Edit, Save, X } from 'lucide-react';

const Settings = () => {
  const [activeTab, setActiveTab] = useState<'behavioral' | 'technical' | 'techs' | 'seniorities'>('behavioral');
  
  const [technologies, setTechnologies] = useState<Technology[]>([]);
  const [seniorities, setSeniorities] = useState<Seniority[]>([]);
  const [criteria, setCriteria] = useState<LibraryCriteria[]>([]);

  const [editingTech, setEditingTech] = useState<Technology | null>(null);
  const [editingSeniority, setEditingSeniority] = useState<Seniority | null>(null);
  const [editingCriteria, setEditingCriteria] = useState<LibraryCriteria | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setTechnologies(api.getTechnologies());
    setSeniorities(api.getSeniorities());
    setCriteria(api.getLibraryCriteria());
  };

  // Technologies Handlers
  const saveTech = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTech && editingTech.name.trim()) {
      api.saveTechnology(editingTech);
      setEditingTech(null);
      loadData();
    }
  };

  const deleteTech = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta tecnologia ou metodologia?')) {
      api.deleteTechnology(id);
      loadData();
    }
  };

  // Seniority Handlers
  const saveSeniority = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSeniority && editingSeniority.name.trim()) {
      api.saveSeniority(editingSeniority);
      setEditingSeniority(null);
      loadData();
    }
  };

  const deleteSeniority = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta senioridade?')) {
      api.deleteSeniority(id);
      loadData();
    }
  };

  // Criteria Handlers
  const saveCriteria = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCriteria && editingCriteria.name.trim()) {
      api.saveLibraryCriteria(editingCriteria);
      setEditingCriteria(null);
      loadData();
    }
  };

  const deleteCriteria = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este quesito?')) {
      api.deleteLibraryCriteria(id);
      loadData();
    }
  };

  // Renderers
  const renderTechTab = () => (
    <div className="card" style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
        <h3 style={{ color: 'var(--primary)', margin: 0 }}>Cadastro de Tecnologias e Metodologias</h3>
        <button 
          className="btn btn-primary" 
          onClick={() => setEditingTech({ id: uuidv4(), name: '' })}
          style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem' }}
        >
          <Plus size={16} /> Nova Tecnologia/Metodologia
        </button>
      </div>

      {editingTech && (
        <form onSubmit={saveTech} style={{ marginBottom: '1.5rem', padding: '1rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-main)' }}>
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label className="form-label">Nome da Tecnologia ou Metodologia</label>
            <input 
              autoFocus
              className="form-control" 
              value={editingTech.name} 
              onChange={(e) => setEditingTech({ ...editingTech, name: e.target.value })} 
              required
            />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-outline" onClick={() => setEditingTech(null)}><X size={16} /> Cancelar</button>
            <button type="submit" className="btn btn-primary"><Save size={16} /> Salvar</button>
          </div>
        </form>
      )}

      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border)' }}>
            <th style={{ padding: '0.75rem 0' }}>Nome</th>
            <th style={{ padding: '0.75rem 0', width: '100px', textAlign: 'right' }}>Ações</th>
          </tr>
        </thead>
        <tbody>
          {technologies.length === 0 ? (
            <tr><td colSpan={2} style={{ padding: '1rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>Nenhuma tecnologia ou metodologia cadastrada.</td></tr>
          ) : (
            technologies.map(t => (
              <tr key={t.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '0.75rem 0', fontWeight: 500 }}>{t.name}</td>
                <td style={{ padding: '0.75rem 0', textAlign: 'right' }}>
                  <button className="btn btn-outline" style={{ padding: '0.25rem', marginRight: '0.25rem', border: 'none' }} onClick={() => setEditingTech(t)}>
                    <Edit size={16} />
                  </button>
                  <button className="btn btn-outline" style={{ padding: '0.25rem', border: 'none', color: 'var(--danger)' }} onClick={() => deleteTech(t.id)}>
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  const renderSeniorityTab = () => (
    <div className="card" style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
        <h3 style={{ color: 'var(--primary)', margin: 0 }}>Cadastro de Senioridade</h3>
        <button 
          className="btn btn-primary" 
          onClick={() => setEditingSeniority({ id: uuidv4(), name: '' })}
          style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem' }}
        >
          <Plus size={16} /> Nova Senioridade
        </button>
      </div>

      {editingSeniority && (
        <form onSubmit={saveSeniority} style={{ marginBottom: '1.5rem', padding: '1rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-main)' }}>
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label className="form-label">Nome da Senioridade</label>
            <input 
              autoFocus
              className="form-control" 
              value={editingSeniority.name} 
              onChange={(e) => setEditingSeniority({ ...editingSeniority, name: e.target.value })} 
              required
            />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-outline" onClick={() => setEditingSeniority(null)}><X size={16} /> Cancelar</button>
            <button type="submit" className="btn btn-primary"><Save size={16} /> Salvar</button>
          </div>
        </form>
      )}

      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border)' }}>
            <th style={{ padding: '0.75rem 0' }}>Nome</th>
            <th style={{ padding: '0.75rem 0', width: '100px', textAlign: 'right' }}>Ações</th>
          </tr>
        </thead>
        <tbody>
          {seniorities.length === 0 ? (
            <tr><td colSpan={2} style={{ padding: '1rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>Nenhuma senioridade cadastrada.</td></tr>
          ) : (
            seniorities.map(s => (
              <tr key={s.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '0.75rem 0', fontWeight: 500 }}>{s.name}</td>
                <td style={{ padding: '0.75rem 0', textAlign: 'right' }}>
                  <button className="btn btn-outline" style={{ padding: '0.25rem', marginRight: '0.25rem', border: 'none' }} onClick={() => setEditingSeniority(s)}>
                    <Edit size={16} />
                  </button>
                  <button className="btn btn-outline" style={{ padding: '0.25rem', border: 'none', color: 'var(--danger)' }} onClick={() => deleteSeniority(s.id)}>
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  const renderCriteriaTab = (type: 'Comportamental' | 'Técnico') => {
    const list = criteria.filter(c => c.type === type);

    return (
      <div className="card" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
          <h3 style={{ color: 'var(--primary)', margin: 0 }}>Quesitos {type}s</h3>
          <button 
            className="btn btn-primary" 
            onClick={() => setEditingCriteria({ id: uuidv4(), name: '', type: type })}
            style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem' }}
          >
            <Plus size={16} /> Novo Quesito
          </button>
        </div>

        {editingCriteria && editingCriteria.type === type && (
          <form onSubmit={saveCriteria} style={{ marginBottom: '1.5rem', padding: '1rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-main)' }}>
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label">Nome do Quesito</label>
              <input 
                autoFocus
                className="form-control" 
                value={editingCriteria.name} 
                onChange={(e) => setEditingCriteria({ ...editingCriteria, name: e.target.value })} 
                required
              />
            </div>
            
            {type === 'Técnico' && (
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">Relacionar com Tecnologia/Metodologia (Opcional)</label>
                <select 
                  className="form-control"
                  value={editingCriteria.technologyId || ''}
                  onChange={(e) => setEditingCriteria({ ...editingCriteria, technologyId: e.target.value })}
                >
                  <option value="">Nenhuma Tecnologia/Metodologia</option>
                  {technologies.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-outline" onClick={() => setEditingCriteria(null)}><X size={16} /> Cancelar</button>
              <button type="submit" className="btn btn-primary"><Save size={16} /> Salvar</button>
            </div>
          </form>
        )}

        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '0.75rem 0' }}>Nome</th>
              {type === 'Técnico' && <th style={{ padding: '0.75rem 0' }}>Tecnologia/Metodologia Vinculada</th>}
              <th style={{ padding: '0.75rem 0', width: '100px', textAlign: 'right' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {list.length === 0 ? (
              <tr><td colSpan={type === 'Técnico' ? 3 : 2} style={{ padding: '1rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>Nenhum quesito cadastrado.</td></tr>
            ) : (
              list.map(c => {
                const linkedTech = technologies.find(t => t.id === c.technologyId);
                return (
                  <tr key={c.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '0.75rem 0', fontWeight: 500 }}>{c.name}</td>
                    {type === 'Técnico' && (
                      <td style={{ padding: '0.75rem 0', color: 'var(--text-muted)' }}>
                        {linkedTech ? (
                          <span style={{ backgroundColor: 'var(--primary-light)', color: 'white', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem' }}>
                            {linkedTech.name}
                          </span>
                        ) : '-'}
                      </td>
                    )}
                    <td style={{ padding: '0.75rem 0', textAlign: 'right' }}>
                      <button className="btn btn-outline" style={{ padding: '0.25rem', marginRight: '0.25rem', border: 'none' }} onClick={() => setEditingCriteria(c)}>
                        <Edit size={16} />
                      </button>
                      <button className="btn btn-outline" style={{ padding: '0.25rem', border: 'none', color: 'var(--danger)' }} onClick={() => deleteCriteria(c.id)}>
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
        <SettingsIcon size={32} style={{ color: 'var(--primary)' }} />
        <div>
          <h1 style={{ fontSize: '1.875rem', margin: 0 }}>Configurações</h1>
          <p style={{ color: 'var(--text-muted)' }}>Gerencie a Biblioteca de Quesitos, Tecnologias e Metodologias.</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)' }}>
        <button 
          style={{ 
            background: 'none', border: 'none', padding: '1rem 0', cursor: 'pointer',
            borderBottom: activeTab === 'behavioral' ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeTab === 'behavioral' ? 'var(--primary)' : 'var(--text-muted)',
            fontWeight: activeTab === 'behavioral' ? 600 : 500
          }}
          onClick={() => setActiveTab('behavioral')}
        >
          Quesitos Comportamentais
        </button>
        <button 
          style={{ 
            background: 'none', border: 'none', padding: '1rem 0', cursor: 'pointer',
            borderBottom: activeTab === 'technical' ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeTab === 'technical' ? 'var(--primary)' : 'var(--text-muted)',
            fontWeight: activeTab === 'technical' ? 600 : 500
          }}
          onClick={() => setActiveTab('technical')}
        >
          Quesitos Técnicos
        </button>
        <button 
          style={{ 
            background: 'none', border: 'none', padding: '1rem 0', cursor: 'pointer',
            borderBottom: activeTab === 'techs' ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeTab === 'techs' ? 'var(--primary)' : 'var(--text-muted)',
            fontWeight: activeTab === 'techs' ? 600 : 500
          }}
          onClick={() => setActiveTab('techs')}
        >
          Cadastro de Tecnologias e Metodologias
        </button>
        <button 
          style={{ 
            background: 'none', border: 'none', padding: '1rem 0', cursor: 'pointer',
            borderBottom: activeTab === 'seniorities' ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeTab === 'seniorities' ? 'var(--primary)' : 'var(--text-muted)',
            fontWeight: activeTab === 'seniorities' ? 600 : 500
          }}
          onClick={() => setActiveTab('seniorities')}
        >
          Cadastro de Senioridade
        </button>
      </div>

      <div className="animate-fade-in">
        {activeTab === 'techs' && renderTechTab()}
        {activeTab === 'behavioral' && renderCriteriaTab('Comportamental')}
        {activeTab === 'technical' && renderCriteriaTab('Técnico')}
        {activeTab === 'seniorities' && renderSeniorityTab()}
      </div>
    </div>
  );
};

export default Settings;

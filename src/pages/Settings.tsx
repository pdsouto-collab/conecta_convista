import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { api } from '../services/api';
import type { Technology, LibraryCriteria, Seniority, CandidateStatusOption } from '../types';
import { Settings as SettingsIcon, Trash2, Plus, Edit, Save, X, GripVertical } from 'lucide-react';

const Settings = () => {
  const [activeTab, setActiveTab] = useState<'behavioral' | 'technical' | 'techs' | 'seniorities' | 'roles' | 'statuses'>('behavioral');
  
  const [technologies, setTechnologies] = useState<Technology[]>([]);
  const [seniorities, setSeniorities] = useState<Seniority[]>([]);
  const [roles, setRoles] = useState<import('../types').RoleOption[]>([]);
  const [statuses, setStatuses] = useState<CandidateStatusOption[]>([]);
  const [criteria, setCriteria] = useState<LibraryCriteria[]>([]);

  const [editingTech, setEditingTech] = useState<Technology | null>(null);
  const [editingSeniority, setEditingSeniority] = useState<Seniority | null>(null);
  const [editingRole, setEditingRole] = useState<import('../types').RoleOption | null>(null);
  const [editingStatus, setEditingStatus] = useState<CandidateStatusOption | null>(null);
  const [editingCriteria, setEditingCriteria] = useState<LibraryCriteria | null>(null);

  const [draggedSeniorityId, setDraggedSeniorityId] = useState<string | null>(null);
  const [draggedRoleId, setDraggedRoleId] = useState<string | null>(null);
  const [draggedStatusId, setDraggedStatusId] = useState<string | null>(null);
  const [draggedTechId, setDraggedTechId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setTechnologies(api.getTechnologies());
    setSeniorities(api.getSeniorities());
    setRoles(api.getRoles());
    setStatuses(api.getStatuses());
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

  const handleTechDragStart = (id: string) => setDraggedTechId(id);
  
  const handleTechDrop = (targetId: string) => {
    if (!draggedTechId || draggedTechId === targetId) return;
    
    const sourceIndex = technologies.findIndex(t => t.id === draggedTechId);
    const targetIndex = technologies.findIndex(t => t.id === targetId);
    
    const newTechs = [...technologies];
    const [removed] = newTechs.splice(sourceIndex, 1);
    newTechs.splice(targetIndex, 0, removed);
    
    setTechnologies(newTechs);
    api.updateTechnologies(newTechs);
    setDraggedTechId(null);
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

  const handleDragStart = (id: string) => setDraggedSeniorityId(id);
  
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  
  const handleDrop = (targetId: string) => {
    if (!draggedSeniorityId || draggedSeniorityId === targetId) return;
    
    const sourceIndex = seniorities.findIndex(s => s.id === draggedSeniorityId);
    const targetIndex = seniorities.findIndex(s => s.id === targetId);
    
    const newSeniorities = [...seniorities];
    const [removed] = newSeniorities.splice(sourceIndex, 1);
    newSeniorities.splice(targetIndex, 0, removed);
    
    setSeniorities(newSeniorities);
    api.updateSeniorities(newSeniorities);
    setDraggedSeniorityId(null);
  };

  // Role Handlers
  const saveRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingRole && editingRole.name.trim()) {
      api.saveRole(editingRole);
      setEditingRole(null);
      loadData();
    }
  };

  const deleteRole = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este cargo?')) {
      api.deleteRole(id);
      loadData();
    }
  };

  const handleRoleDragStart = (id: string) => setDraggedRoleId(id);
  
  const handleRoleDrop = (targetId: string) => {
    if (!draggedRoleId || draggedRoleId === targetId) return;
    
    const sourceIndex = roles.findIndex(r => r.id === draggedRoleId);
    const targetIndex = roles.findIndex(r => r.id === targetId);
    
    const newRoles = [...roles];
    const [removed] = newRoles.splice(sourceIndex, 1);
    newRoles.splice(targetIndex, 0, removed);
    
    setRoles(newRoles);
    api.updateRoles(newRoles);
    setDraggedRoleId(null);
  };

  // Status Handlers
  const saveStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingStatus && editingStatus.name.trim()) {
      api.saveStatus(editingStatus);
      setEditingStatus(null);
      loadData();
    }
  };

  const deleteStatus = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este status?')) {
      api.deleteStatus(id);
      loadData();
    }
  };

  const handleStatusDragStart = (id: string) => setDraggedStatusId(id);
  
  const handleStatusDrop = (targetId: string) => {
    if (!draggedStatusId || draggedStatusId === targetId) return;
    
    const sourceIndex = statuses.findIndex(s => s.id === draggedStatusId);
    const targetIndex = statuses.findIndex(s => s.id === targetId);
    
    const newStatuses = [...statuses];
    const [removed] = newStatuses.splice(sourceIndex, 1);
    newStatuses.splice(targetIndex, 0, removed);
    
    setStatuses(newStatuses);
    api.updateStatuses(newStatuses);
    setDraggedStatusId(null);
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
              <tr 
                key={t.id} 
                style={{ 
                  borderBottom: '1px solid var(--border)',
                  backgroundColor: draggedTechId === t.id ? 'var(--bg-main)' : 'transparent',
                  opacity: draggedTechId === t.id ? 0.5 : 1
                }}
                draggable
                onDragStart={() => handleTechDragStart(t.id)}
                onDragOver={handleDragOver}
                onDrop={() => handleTechDrop(t.id)}
                onDragEnd={() => setDraggedTechId(null)}
              >
                <td style={{ padding: '0.75rem 0', fontWeight: 500 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ cursor: 'grab', display: 'flex', alignItems: 'center' }}>
                      <GripVertical size={16} style={{ color: 'var(--text-muted)' }} />
                    </div>
                    {t.name}
                  </div>
                </td>
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
              <tr 
                key={s.id} 
                style={{ 
                  borderBottom: '1px solid var(--border)',
                  backgroundColor: draggedSeniorityId === s.id ? 'var(--bg-main)' : 'transparent',
                  opacity: draggedSeniorityId === s.id ? 0.5 : 1
                }}
                draggable
                onDragStart={() => handleDragStart(s.id)}
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(s.id)}
                onDragEnd={() => setDraggedSeniorityId(null)}
              >
                <td style={{ padding: '0.75rem 0', fontWeight: 500 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ cursor: 'grab', display: 'flex', alignItems: 'center' }}>
                      <GripVertical size={16} style={{ color: 'var(--text-muted)' }} />
                    </div>
                    {s.name}
                  </div>
                </td>
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

  const renderStatusTab = () => (
    <div className="card" style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
        <h3 style={{ color: 'var(--primary)', margin: 0 }}>Cadastro de Status</h3>
        <button 
          className="btn btn-primary" 
          onClick={() => setEditingStatus({ id: uuidv4(), name: '' })}
          style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem' }}
        >
          <Plus size={16} /> Novo Status
        </button>
      </div>

      {editingStatus && (
        <form onSubmit={saveStatus} style={{ marginBottom: '1.5rem', padding: '1rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-main)' }}>
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label className="form-label">Nome do Status</label>
            <input 
              autoFocus
              className="form-control" 
              value={editingStatus.name} 
              onChange={(e) => setEditingStatus({ ...editingStatus, name: e.target.value })} 
              required
            />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-outline" onClick={() => setEditingStatus(null)}><X size={16} /> Cancelar</button>
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
          {statuses.length === 0 ? (
            <tr><td colSpan={2} style={{ padding: '1rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>Nenhum status cadastrado.</td></tr>
          ) : (
            statuses.map(s => (
              <tr 
                key={s.id} 
                style={{ 
                  borderBottom: '1px solid var(--border)',
                  backgroundColor: draggedStatusId === s.id ? 'var(--bg-main)' : 'transparent',
                  opacity: draggedStatusId === s.id ? 0.5 : 1
                }}
                draggable
                onDragStart={() => handleStatusDragStart(s.id)}
                onDragOver={handleDragOver}
                onDrop={() => handleStatusDrop(s.id)}
                onDragEnd={() => setDraggedStatusId(null)}
              >
                <td style={{ padding: '0.75rem 0', fontWeight: 500 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ cursor: 'grab', display: 'flex', alignItems: 'center' }}>
                      <GripVertical size={16} style={{ color: 'var(--text-muted)' }} />
                    </div>
                    {s.name}
                  </div>
                </td>
                <td style={{ padding: '0.75rem 0', textAlign: 'right' }}>
                  <button className="btn btn-outline" style={{ padding: '0.25rem', marginRight: '0.25rem', border: 'none' }} onClick={() => setEditingStatus(s)}>
                    <Edit size={16} />
                  </button>
                  <button className="btn btn-outline" style={{ padding: '0.25rem', border: 'none', color: 'var(--danger)' }} onClick={() => deleteStatus(s.id)}>
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

  const renderRoleTab = () => (
    <div className="card" style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
        <h3 style={{ color: 'var(--primary)', margin: 0 }}>Cadastro de Cargo</h3>
        <button 
          className="btn btn-primary" 
          onClick={() => setEditingRole({ id: uuidv4(), name: '' })}
          style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem' }}
        >
          <Plus size={16} /> Novo Cargo
        </button>
      </div>

      {editingRole && (
        <form onSubmit={saveRole} style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'flex-end', padding: '1rem', backgroundColor: 'var(--bg-main)', borderRadius: 'var(--radius-md)' }}>
          <div className="form-group" style={{ marginBottom: 0, flex: 1 }}>
            <label className="form-label">Nome do Cargo</label>
            <input 
              autoFocus
              className="form-control" 
              value={editingRole.name} 
              onChange={(e) => setEditingRole({ ...editingRole, name: e.target.value })} 
              required
            />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-primary" type="submit" style={{ padding: '0.5rem' }}><Save size={18} /></button>
            <button className="btn btn-outline" type="button" style={{ padding: '0.5rem' }} onClick={() => setEditingRole(null)}><X size={18} /></button>
          </div>
        </form>
      )}

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid var(--border)', textAlign: 'left' }}>
            <th style={{ padding: '0.75rem 0', fontWeight: 600, color: 'var(--text-main)' }}>Nome</th>
            <th style={{ padding: '0.75rem 0', width: '100px', textAlign: 'right' }}>Ações</th>
          </tr>
        </thead>
        <tbody>
          {roles.length === 0 ? (
            <tr><td colSpan={2} style={{ padding: '1rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>Nenhum cargo cadastrado.</td></tr>
          ) : (
            roles.map(r => (
              <tr 
                key={r.id} 
                style={{ 
                  borderBottom: '1px solid var(--border)',
                  backgroundColor: draggedRoleId === r.id ? 'var(--bg-main)' : 'transparent',
                  opacity: draggedRoleId === r.id ? 0.5 : 1
                }}
                draggable
                onDragStart={() => handleRoleDragStart(r.id)}
                onDragOver={handleDragOver}
                onDrop={() => handleRoleDrop(r.id)}
                onDragEnd={() => setDraggedRoleId(null)}
              >
                <td style={{ padding: '0.75rem 0', fontWeight: 500 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ cursor: 'grab', display: 'flex', alignItems: 'center' }}>
                      <GripVertical size={16} style={{ color: 'var(--text-muted)' }} />
                    </div>
                    {r.name}
                  </div>
                </td>
                <td style={{ padding: '0.75rem 0', textAlign: 'right' }}>
                  <button className="btn btn-outline" style={{ padding: '0.25rem', marginRight: '0.25rem', border: 'none' }} onClick={() => setEditingRole(r)}>
                    <Edit size={16} />
                  </button>
                  <button className="btn btn-outline" style={{ padding: '0.25rem', border: 'none', color: 'var(--danger)' }} onClick={() => deleteRole(r.id)}>
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
                  <option value="">TODAS (Aplicável a todas as tecnologias/metodologias)</option>
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

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', flexWrap: 'wrap' }}>
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
          Senioridade
        </button>
        <button 
          style={{ 
            background: 'none', border: 'none', padding: '1rem 0', cursor: 'pointer',
            borderBottom: activeTab === 'roles' ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeTab === 'roles' ? 'var(--primary)' : 'var(--text-muted)',
            fontWeight: activeTab === 'roles' ? 600 : 500
          }}
          onClick={() => setActiveTab('roles')}
        >
          Cargos
        </button>
        <button 
          style={{ 
            background: 'none', border: 'none', padding: '1rem 0', cursor: 'pointer',
            borderBottom: activeTab === 'statuses' ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeTab === 'statuses' ? 'var(--primary)' : 'var(--text-muted)',
            fontWeight: activeTab === 'statuses' ? 600 : 500
          }}
          onClick={() => setActiveTab('statuses')}
        >
          Status
        </button>
      </div>
      
      <div style={{ paddingTop: '1.5rem' }} className="animate-fade-in">
        {activeTab === 'behavioral' && renderCriteriaTab('Comportamental')}
        {activeTab === 'technical' && renderCriteriaTab('Técnico')}
        {activeTab === 'techs' && renderTechTab()}
        {activeTab === 'seniorities' && renderSeniorityTab()}
        {activeTab === 'roles' && renderRoleTab()}
        {activeTab === 'statuses' && renderStatusTab()}
      </div>
    </div>
  );
};

export default Settings;

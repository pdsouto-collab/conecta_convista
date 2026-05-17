import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { api } from '../services/api';
import type { User, UserRole } from '../types';
import { ShieldCheck, Plus, Edit, Trash2, Save, X, RefreshCw } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Users = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser?.role !== 'admin') {
      navigate('/dashboard');
      return;
    }
    loadUsers();
  }, [currentUser, navigate]);

  const loadUsers = () => {
    setUsers(api.getUsers());
  };

  const saveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      if (!editingUser.password && !users.find(u => u.id === editingUser.id)) {
        alert("A senha é obrigatória para novos usuários.");
        return;
      }
      api.saveUser(editingUser);
      setEditingUser(null);
      loadUsers();
    }
  };

  const deleteUser = (id: string, name: string) => {
    if (id === currentUser?.id) {
      alert("Você não pode excluir seu próprio usuário.");
      return;
    }
    if (confirm(`Tem certeza que deseja excluir o usuário ${name}?`)) {
      api.deleteUser(id);
      loadUsers();
    }
  };

  const resetPassword = (user: User) => {
    const newPassword = prompt("Digite a nova senha para o usuário:");
    if (newPassword && newPassword.trim()) {
      api.saveUser({ ...user, password: newPassword });
      alert("Senha alterada com sucesso.");
      loadUsers();
    }
  };

  const getRoleName = (role: UserRole) => {
    switch (role) {
      case 'admin': return 'Administrador';
      case 'hr': return 'Recursos Humanos';
      case 'interviewer': return 'Entrevistador';
      default: return role;
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <ShieldCheck size={32} style={{ color: 'var(--primary)' }} />
          <div>
            <h1 style={{ fontSize: '1.875rem', margin: 0 }}>Gestão de Usuários</h1>
            <p style={{ color: 'var(--text-muted)' }}>Adicione ou remova permissões de sistema.</p>
          </div>
        </div>
        <button 
          className="btn btn-primary" 
          onClick={() => setEditingUser({ id: uuidv4(), firstName: '', lastName: '', email: '', position: '', role: 'hr', active: true })}
        >
          <Plus size={18} /> Novo Usuário
        </button>
      </div>

      {editingUser && (
        <div className="card" style={{ padding: '2rem', marginBottom: '1.5rem', border: '1px solid var(--primary)' }}>
          <h3 style={{ marginBottom: '1.5rem', color: 'var(--primary)' }}>{users.find(u => u.id === editingUser.id) ? 'Editar Usuário' : 'Novo Usuário'}</h3>
          <form onSubmit={saveUser}>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Nome *</label>
                <input required type="text" className="form-control" value={editingUser.firstName} onChange={(e) => setEditingUser({ ...editingUser, firstName: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Sobrenome *</label>
                <input required type="text" className="form-control" value={editingUser.lastName} onChange={(e) => setEditingUser({ ...editingUser, lastName: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">E-mail *</label>
                <input required type="email" className="form-control" value={editingUser.email} onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Cargo *</label>
                <input required type="text" className="form-control" value={editingUser.position} onChange={(e) => setEditingUser({ ...editingUser, position: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Perfil de Acesso *</label>
                <select required className="form-control" value={editingUser.role} onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as UserRole })}>
                  <option value="hr">Recursos Humanos</option>
                  <option value="interviewer">Entrevistador / Avaliador</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
              {!users.find(u => u.id === editingUser.id) && (
                <div className="form-group">
                  <label className="form-label">Senha Inicial *</label>
                  <input required type="password" className="form-control" value={editingUser.password || ''} onChange={(e) => setEditingUser({ ...editingUser, password: e.target.value })} />
                </div>
              )}
              <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '2rem' }}>
                <input type="checkbox" id="active" checked={editingUser.active} onChange={(e) => setEditingUser({ ...editingUser, active: e.target.checked })} />
                <label htmlFor="active" style={{ cursor: 'pointer', margin: 0 }}>Usuário Ativo</label>
              </div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
              <button type="button" className="btn btn-outline" onClick={() => setEditingUser(null)}>
                <X size={18} /> Cancelar
              </button>
              <button type="submit" className="btn btn-primary">
                <Save size={18} /> Salvar Usuário
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg-main)' }}>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--text-main)' }}>Nome</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--text-main)' }}>E-mail</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--text-main)' }}>Perfil de Acesso</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--text-main)', textAlign: 'right' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '1rem 1.5rem' }}>
                  <div style={{ fontWeight: 600, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: u.active ? 'var(--success)' : 'var(--danger)' }} title={u.active ? 'Ativo' : 'Inativo'}></div>
                    {u.firstName} {u.lastName}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{u.position}</div>
                </td>
                <td style={{ padding: '1rem 1.5rem' }}>{u.email}</td>
                <td style={{ padding: '1rem 1.5rem' }}>
                  <span style={{ 
                    padding: '0.25rem 0.5rem', 
                    borderRadius: '4px', 
                    fontSize: '0.75rem', 
                    color: u.role === 'hr' || u.role === 'admin' ? 'var(--danger)' : 'var(--accent)',
                    fontWeight: 600
                  }}>
                    {getRoleName(u.role)}
                  </span>
                </td>
                <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                    <button className="btn btn-outline" style={{ padding: '0.3rem 0.5rem' }} onClick={() => resetPassword(u)} title="Resetar Senha">
                      <RefreshCw size={14} />
                    </button>
                    <button className="btn btn-outline" style={{ padding: '0.3rem 0.5rem' }} onClick={() => setEditingUser(u)} title="Editar">
                      <Edit size={14} />
                    </button>
                    <button className="btn btn-outline" style={{ padding: '0.3rem 0.5rem', color: 'var(--danger)', borderColor: 'transparent' }} onClick={() => deleteUser(u.id, u.firstName)} title="Excluir" disabled={u.id === currentUser?.id}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Users;

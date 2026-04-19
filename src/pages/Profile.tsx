import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { Save, LogOut, Shield, User as UserIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName);
      setLastName(user.lastName);
      setEmail(user.email);
    }
  }, [user]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const updatedUser = {
      ...user,
      firstName,
      lastName,
      email,
      ...(password ? { password } : {})
    };

    api.saveUser(updatedUser);
    login(updatedUser); // Update context and localStorage
    setPassword('');
    alert('Perfil atualizado com sucesso!');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <UserIcon size={32} style={{ color: 'var(--primary)' }} />
          <div>
            <h1 style={{ fontSize: '1.875rem', margin: 0 }}>Meu Perfil</h1>
            <p style={{ color: 'var(--text-muted)' }}>Gerencie suas informações e credenciais de acesso.</p>
          </div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card" style={{ padding: '2rem' }}>
          <h3 style={{ marginBottom: '1.5rem', color: 'var(--primary)', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>Dados Pessoais</h3>
          
          <form onSubmit={handleSave}>
            <div className="form-group">
              <label className="form-label">Nome</label>
              <input required type="text" className="form-control" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            </div>
            
            <div className="form-group">
              <label className="form-label">Sobrenome</label>
              <input required type="text" className="form-control" value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </div>
            
            <div className="form-group">
              <label className="form-label">E-mail</label>
              <input required type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} disabled />
              <small style={{ color: 'var(--text-muted)' }}>O e-mail não pode ser alterado.</small>
            </div>

            <div className="form-group" style={{ marginTop: '2rem' }}>
              <label className="form-label">Nova Senha (opcional)</label>
              <input type="password" className="form-control" placeholder="Deixe em branco para não alterar" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>

            <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
              <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                <Save size={18} /> Salvar Alterações
              </button>
            </div>
          </form>
        </div>

        <div>
          <div className="card" style={{ padding: '2rem', marginBottom: '1.5rem', backgroundColor: 'var(--bg-main)', border: 'none' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <div style={{ 
                width: 80, height: 80, borderRadius: '50%', 
                backgroundColor: 'var(--primary)', color: 'white', 
                display: 'flex', justifyContent: 'center', alignItems: 'center',
                fontSize: '2rem', fontWeight: 600, marginBottom: '1rem'
              }}>
                {user.firstName.charAt(0)}{user.lastName.charAt(0)}
              </div>
              <h3 style={{ margin: 0 }}>{user.firstName} {user.lastName}</h3>
              <p style={{ color: 'var(--text-muted)' }}>{user.position}</p>
              
              <div style={{ marginTop: '1.5rem', padding: '0.5rem 1rem', backgroundColor: 'white', borderRadius: 'var(--radius-md)', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                <Shield size={16} style={{ color: 'var(--accent)' }} />
                <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                  Perfil: {user.role === 'admin' ? 'Administrador' : user.role === 'hr' ? 'Recursos Humanos' : 'Entrevistador'}
                </span>
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: '1.5rem', border: '1px solid var(--danger-light)', backgroundColor: 'var(--bg-surface)' }}>
            <h4 style={{ color: 'var(--danger)', marginBottom: '1rem' }}>Sessão</h4>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Ao sair da sua conta você precisará inserir suas credenciais novamente para acessar a plataforma.
            </p>
            <button className="btn btn-outline" style={{ color: 'var(--danger)', borderColor: 'var(--danger)', width: '100%' }} onClick={handleLogout}>
              <LogOut size={18} /> Sair da Conta
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

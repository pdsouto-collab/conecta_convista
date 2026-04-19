import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const users = api.getUsers();
    const user = users.find(u => u.email === email && u.password === password && u.active);

    if (user) {
      login(user);
      navigate('/dashboard');
    } else {
      setError('Credenciais inválidas ou usuário inativo.');
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: 'var(--bg-main)'
    }}>
      <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
            <div style={{ background: 'var(--primary)', color: 'white', padding: '0.5rem 1rem', borderRadius: '4px', fontWeight: 800, letterSpacing: '-0.5px', fontSize: '1.5rem', display: 'flex', gap: '0.2rem' }}>
              <span>CONECTA</span>
              <span style={{ color: 'var(--accent)' }}>CONVISTA</span>
            </div>
          </div>
          <h2 style={{ fontSize: '1.25rem', color: 'var(--text-main)', margin: 0 }}>Login</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Acesse a plataforma de recrutamento</p>
        </div>

        {error && (
          <div style={{ backgroundColor: 'var(--danger)', color: 'white', padding: '0.75rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: '0.875rem', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label className="form-label">E-mail</label>
            <input 
              type="email" 
              className="form-control" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ex: admin@convista.com"
              required 
            />
          </div>
          
          <div className="form-group" style={{ marginBottom: '2rem' }}>
            <label className="form-label">Senha</label>
            <input 
              type="password" 
              className="form-control" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Sua senha"
              required 
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', display: 'flex', justifyContent: 'center', padding: '0.75rem' }}>
            <LogIn size={20} /> Entrar
          </button>
        </form>

        <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          <strong>Usuários de Teste:</strong><br/>
          Admin: admin@convista.com / admin<br/>
          RH: rh@convista.com / rh<br/>
          Tech Lead: entrevistador@convista.com / tech
        </div>
      </div>
    </div>
  );
};

export default Login;

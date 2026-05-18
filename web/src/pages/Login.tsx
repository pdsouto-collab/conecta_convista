import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch((import.meta.env.VITE_API_URL || '/api') + '/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        throw new Error('Credenciais inválidas ou usuário inativo.');
      }

      const data = await response.json();
      localStorage.setItem('convista_token', data.token);
      localStorage.setItem('convista_user', JSON.stringify(data.user));
      login(data.user);
      
      // Resync data after login
      await api.syncFromServer();
      
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Erro ao realizar login.');
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      width: '100%',
      backgroundImage: "url('/bg-login.png')",
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundColor: 'var(--bg-main)'
    }}>
      <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '400px', padding: '2.5rem', backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}>
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
            <div style={{ position: 'relative' }}>
              <input 
                type={showPassword ? 'text' : 'password'} 
                className="form-control" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Sua senha"
                required 
                style={{ paddingRight: '2.5rem' }}
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-light)',
                  cursor: 'pointer',
                  padding: '0',
                  display: 'flex'
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', display: 'flex', justifyContent: 'center', padding: '0.75rem' }}>
            <LogIn size={20} /> Entrar
          </button>
        </form>


      </div>
    </div>
  );
};

export default Login;

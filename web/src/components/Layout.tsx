import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users as UsersIcon, Settings, LogOut, ShieldCheck, Activity } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import './Layout.css';

const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/candidates', icon: UsersIcon, label: 'Candidatos' },
  ];

  return (
    <div className="layout-wrapper">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo-container">
            <span className="logo-text">CONECTA</span>
            <span className="logo-highlight">CONVISTA</span>
          </div>
        </div>
        
        <nav className="sidebar-nav">
          <div className="nav-section">PRINCIPAL</div>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        
        <div className="sidebar-footer">
          <NavLink to="/settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Settings size={20} />
            <span>Configurações</span>
          </NavLink>
          {user?.role === 'admin' && (
            <>
              <NavLink to="/users" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <ShieldCheck size={20} />
                <span>Usuários</span>
              </NavLink>
              <NavLink to="/logs" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <Activity size={20} />
                <span>Logs do Sistema</span>
              </NavLink>
            </>
          )}
          <button className="nav-item logout" onClick={() => { logout(); navigate('/login'); }}>
            <LogOut size={20} />
            <span>Sair</span>
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="top-header">
          <div className="header-breadcrumbs">
            {/* Simple breadcrumb logic */}
            <span className="breadcrumb-path">
              {location.pathname === '/dashboard' ? 'Dashboard / Visão Geral' : 
               location.pathname.startsWith('/candidates/new') ? 'Candidatos / Novo Cadastro' :
               location.pathname.startsWith('/candidates') ? 'Candidatos' : ''}
            </span>
          </div>
          <div className="header-actions" onClick={() => navigate('/profile')} title="Acessar Meu Perfil">
            <div className="avatar">
              {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
            </div>
            <div className="user-info">
              <span className="user-name">{user?.firstName} {user?.lastName}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user?.position}</span>
            </div>
          </div>
        </header>
        
        <div className="content-area animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;

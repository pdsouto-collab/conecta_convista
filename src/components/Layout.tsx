import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Settings, LogOut } from 'lucide-react';
import './Layout.css';

const Layout = () => {
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/candidates', icon: Users, label: 'Candidatos' },
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
          <button className="nav-item logout">
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
          <div className="header-actions">
            <div className="avatar">RS</div>
            <div className="user-info">
              <span className="user-name">Recrutamento & Seleção</span>
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

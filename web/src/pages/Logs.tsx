import { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { SystemLog } from '../types';
import { Clock, Search } from 'lucide-react';

const Logs = () => {
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [entityFilter, setEntityFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');

  useEffect(() => {
    setLogs(api.getSystemLogs());
  }, []);

  const handleClearLogs = () => {
    if (window.confirm('Tem certeza que deseja apagar todos os logs do sistema? Isso não pode ser desfeito.')) {
      localStorage.setItem('@conecta_convista_logs', JSON.stringify([]));
      setLogs([]);
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchSearch = log.details.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        log.userName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchEntity = entityFilter ? log.entity === entityFilter : true;
    const matchAction = actionFilter ? log.action === actionFilter : true;
    return matchSearch && matchEntity && matchAction;
  });

  const getActionColor = (action: string) => {
    switch(action) {
      case 'CREATE': return 'var(--success)';
      case 'UPDATE': return 'var(--info)';
      case 'DELETE': return 'var(--danger)';
      case 'LOGIN': return 'var(--accent)';
      default: return 'var(--text-muted)';
    }
  };

  const getActionLabel = (action: string) => {
    switch(action) {
      case 'CREATE': return 'Criação';
      case 'UPDATE': return 'Edição';
      case 'DELETE': return 'Exclusão';
      case 'LOGIN': return 'Acesso';
      default: return 'Outro';
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Clock size={32} style={{ color: 'var(--primary)' }} />
          <div>
            <h1 style={{ fontSize: '1.875rem', margin: 0 }}>Logs do Sistema</h1>
            <p style={{ color: 'var(--text-muted)' }}>Histórico de modificações.</p>
          </div>
        </div>
        <button className="btn btn-outline" style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={handleClearLogs}>
          Limpar Histórico
        </button>
      </div>

      <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div className="form-group" style={{ marginBottom: 0, flex: '1 1 300px' }}>
            <label className="form-label">Buscar log ou usuário</label>
            <div style={{ position: 'relative' }}>
              <input 
                type="text" 
                className="form-control" 
                placeholder="Pesquisar..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
              />
              <Search size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
          </div>
          <div className="form-group" style={{ marginBottom: 0, flex: '1 1 200px' }}>
            <label className="form-label">Filtrar por Entidade</label>
            <select className="form-control" value={entityFilter} onChange={(e) => setEntityFilter(e.target.value)}>
              <option value="">Todas</option>
              <option value="Candidato">Candidatos</option>
              <option value="Usuário">Usuários</option>
              <option value="Configuração">Configurações</option>
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0, flex: '1 1 200px' }}>
            <label className="form-label">Filtrar por Ação</label>
            <select className="form-control" value={actionFilter} onChange={(e) => setActionFilter(e.target.value)}>
              <option value="">Todas</option>
              <option value="CREATE">Criação</option>
              <option value="UPDATE">Edição</option>
              <option value="DELETE">Exclusão</option>
              <option value="LOGIN">Acesso</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-main)', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-muted)' }}>Data e Hora</th>
                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-muted)' }}>Usuário Responsável</th>
                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-muted)' }}>Ação</th>
                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-muted)' }}>Módulo</th>
                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-muted)' }}>Detalhes</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    Nenhum log encontrado para estes filtros.
                  </td>
                </tr>
              ) : (
                filteredLogs.map(log => (
                  <tr key={log.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '1rem', whiteSpace: 'nowrap' }}>
                      {new Date(log.timestamp).toLocaleString('pt-BR')}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'var(--primary-light)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 'bold' }}>
                          {log.userName.charAt(0)}
                        </div>
                        {log.userName}
                      </div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ 
                        backgroundColor: `${getActionColor(log.action)}15`, 
                        color: getActionColor(log.action),
                        padding: '0.25rem 0.5rem',
                        borderRadius: '0.25rem',
                        fontSize: '0.75rem',
                        fontWeight: 600
                      }}>
                        {getActionLabel(log.action)}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', fontWeight: 500 }}>
                      {log.entity}
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>
                      {log.details}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Logs;

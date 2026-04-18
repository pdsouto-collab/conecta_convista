import { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { Candidate } from '../types';
import { Users, UserCheck, Clock, Layers } from 'lucide-react';

const Dashboard = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);

  useEffect(() => {
    setCandidates(api.getCandidates());
  }, []);

  const stats = [
    { label: 'Total de Candidatos', value: candidates.length, icon: Users, color: 'var(--primary)' },
    { label: 'Novos', value: candidates.filter(c => c.status === 'Novo').length, icon: Layers, color: 'var(--info)' },
    { label: 'Em Andamento', value: candidates.filter(c => c.status === 'Em Andamento').length, icon: Clock, color: 'var(--warning)' },
    { label: 'Aprovados', value: candidates.filter(c => c.status === 'Aprovado').length, icon: UserCheck, color: 'var(--success)' },
  ];

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.875rem', marginBottom: '0.5rem' }}>Dashboard</h1>
        <p style={{ color: 'var(--text-muted)' }}>Visão geral do banco de talentos Conecta Convista.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {stats.map((stat, idx) => (
          <div key={idx} className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ 
              backgroundColor: `${stat.color}20`, // 20% opacity 
              color: stat.color,
              padding: '1rem', 
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <stat.icon size={28} />
            </div>
            <div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 500, marginBottom: '0.25rem' }}>{stat.label}</p>
              <h3 style={{ fontSize: '1.75rem', margin: 0 }}>{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="card" style={{ padding: '1.5rem' }}>
        <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Candidatos Recentes</h3>
        {candidates.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '1rem 0', fontWeight: 500 }}>Nome</th>
                  <th style={{ padding: '1rem 0', fontWeight: 500 }}>E-mail</th>
                  <th style={{ padding: '1rem 0', fontWeight: 500 }}>Senioridade</th>
                  <th style={{ padding: '1rem 0', fontWeight: 500 }}>Módulos SAP</th>
                  <th style={{ padding: '1rem 0', fontWeight: 500 }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {candidates.slice(0, 5).map(c => (
                  <tr key={c.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '1rem 0', fontWeight: 500, color: 'var(--primary)' }}>{c.name}</td>
                    <td style={{ padding: '1rem 0', color: 'var(--text-muted)' }}>{c.email}</td>
                    <td style={{ padding: '1rem 0' }}>{c.seniority}</td>
                    <td style={{ padding: '1rem 0' }}>{c.sapModules.join(', ')}</td>
                    <td style={{ padding: '1rem 0' }}>
                      <span style={{
                        padding: '0.25rem 0.5rem',
                        borderRadius: '1rem',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        backgroundColor: c.status === 'Aprovado' ? 'var(--success)' : c.status === 'Novo' ? 'var(--info)' : 'var(--warning)',
                        color: 'white'
                      }}>
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0' }}>Nenhum candidato cadastrado ainda.</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

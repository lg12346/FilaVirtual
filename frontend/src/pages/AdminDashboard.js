import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getAdminTickets, callNextTicket, callSpecificTicket, completeTicket, markNoShow, getAdminStats } from '../services/api';
import { useSocket } from '../hooks/useSocket';
import '../styles/AdminDashboard.css';

function AdminDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState({ total: 0, open: 0, called: 0, completed: 0, notShowed: 0 });
  const [loading, setLoading] = useState(false);
  const [counterNumber, setCounterNumber] = useState('1');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // WebSocket
  const socket = useSocket('join_admin_room', (event, data) => {
    if (event === 'new_ticket') {
      loadTickets();
      loadStats();
    }
  });

  useEffect(() => {
    if (socket && user) {
      socket.emit('join_admin_room', user.id);
    }
  }, [socket, user]);

  useEffect(() => {
    loadTickets();
    loadStats();
    const interval = setInterval(() => {
      loadTickets();
      loadStats();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadTickets = async () => {
    try {
      const response = await getAdminTickets();
      setTickets(response.data);
    } catch (err) {
      setError('Erro ao carregar tickets');
    }
  };

  const loadStats = async () => {
    try {
      const response = await getAdminStats();
      setStats(response.data);
    } catch (err) {
      console.error('Erro ao carregar estatísticas');
    }
  };

  const handleCallNext = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await callNextTicket(counterNumber);
      setSuccess('Próxima senha chamada com sucesso!');
      loadTickets();
      loadStats();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao chamar próxima senha');
    } finally {
      setLoading(false);
    }
  };

  const handleCallSpecific = async (ticketId) => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await callSpecificTicket(ticketId, counterNumber);
      setSuccess('Senha específica chamada com sucesso!');
      loadTickets();
      loadStats();
      setSelectedTicket(null);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao chamar senha');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteTicket = async (ticketId) => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await completeTicket(ticketId);
      setSuccess('Atendimento concluído!');
      loadTickets();
      loadStats();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Erro ao concluir atendimento');
    } finally {
      setLoading(false);
    }
  };

  const handleNoShow = async (ticketId) => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await markNoShow(ticketId);
      setSuccess('Marcado como não compareceu!');
      loadTickets();
      loadStats();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Erro ao marcar não compareceu');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'aberto': '#3498db',
      'chamada': '#f39c12',
      'atendida': '#2ecc71',
      'não compareceu': '#e74c3c'
    };
    return colors[status] || '#95a5a6';
  };

  const getStatusIcon = (status) => {
    const icons = {
      'aberto': '⏳',
      'chamada': '📢',
      'atendida': '✅',
      'não compareceu': '❌'
    };
    return icons[status] || '❓';
  };

  const openTickets = tickets.filter(t => t.status === 'aberto');
  const calledTickets = tickets.filter(t => t.status === 'chamada');

  return (
    <div className="admin-dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>📋 Painel de Administrador</h1>
          <p>Bem-vindo, {user?.name}</p>
        </div>
        <button onClick={() => { logout(); navigate('/login'); }} className="logout-btn">
          Sair
        </button>
      </header>

      <main className="admin-main">
        <div className="admin-container">
          <div className="control-panel">
            <h2>🎛️ Painel de Controle</h2>
            
            <div className="control-section">
              <label htmlFor="counter">Número do Balcão:</label>
              <input
                type="number"
                id="counter"
                value={counterNumber}
                onChange={(e) => setCounterNumber(e.target.value)}
                min="1"
                max="99"
              />
            </div>

            <div className="action-buttons">
              <button
                className="btn-primary"
                onClick={handleCallNext}
                disabled={loading || openTickets.length === 0}
              >
                📢 Chamar Próxima
              </button>
              <a href="/public" className="btn-secondary" target="_blank" rel="noopener noreferrer">
                📺 Ver Tela Pública
              </a>
            </div>

            {success && <div className="success-message">{success}</div>}
            {error && <div className="error-message">{error}</div>}

            <div className="stats-grid">
              <div className="stat-card open">
                <span className="stat-number">{stats.open}</span>
                <span className="stat-label">Em Aberto</span>
              </div>
              <div className="stat-card called">
                <span className="stat-number">{stats.called}</span>
                <span className="stat-label">Chamadas</span>
              </div>
              <div className="stat-card completed">
                <span className="stat-number">{stats.completed}</span>
                <span className="stat-label">Atendidas</span>
              </div>
              <div className="stat-card not-showed">
                <span className="stat-number">{stats.notShowed}</span>
                <span className="stat-label">Não Compareceram</span>
              </div>
            </div>
          </div>

          <div className="tickets-container">
            {calledTickets.length > 0 && (
              <section className="tickets-section called-section">
                <h3>🎤 Chamadas Ativas ({calledTickets.length})</h3>
                <div className="tickets-list">
                  {calledTickets.map(ticket => (
                    <div key={ticket.id} className="ticket-row called">
                      <div className="ticket-main-info">
                        <span className="ticket-number">#{ticket.ticket_number}</span>
                        <span className="user-info">{ticket.user_name || 'Visitante'}</span>
                        {ticket.user_phone && <span className="user-phone">{ticket.user_phone}</span>}
                      </div>
                      <div className="ticket-actions">
                        <button
                          className="btn-success"
                          onClick={() => handleCompleteTicket(ticket.id)}
                          disabled={loading}
                        >
                          ✅ Atendida
                        </button>
                        <button
                          className="btn-warning"
                          onClick={() => handleNoShow(ticket.id)}
                          disabled={loading}
                        >
                          ❌ Não Compareceu
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section className="tickets-section open-section">
              <h3>⏳ Senhas em Aberto ({openTickets.length})</h3>
              {openTickets.length > 0 ? (
                <div className="tickets-list">
                  {openTickets.slice(0, 10).map(ticket => (
                    <div key={ticket.id} className="ticket-row">
                      <div className="ticket-main-info">
                        <span className="ticket-number">#{ticket.ticket_number}</span>
                        <span className="user-info">{ticket.user_name || 'Visitante'}</span>
                        {ticket.user_phone && <span className="user-phone">{ticket.user_phone}</span>}
                      </div>
                      <div className="ticket-time">
                        {new Date(ticket.created_at).toLocaleTimeString('pt-BR')}
                      </div>
                      <button
                        className="btn-call"
                        onClick={() => handleCallSpecific(ticket.id)}
                        disabled={loading}
                      >
                        📢 Chamar
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="empty-message">Nenhuma senha em aberto</p>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;

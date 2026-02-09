import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { generateTicket, getCurrentTicket, getTicketHistory } from '../services/api';
import { useSocket } from '../hooks/useSocket';
import '../styles/UserDashboard.css';

function UserDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const [currentTicket, setCurrentTicket] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notificationSound] = useState(new Audio('data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQIAAAAAAA=='));

  // WebSocket
  const socket = useSocket(`join_user_room_${user?.id}`, (event, data) => {
    if (event === 'ticket_called') {
      playNotificationSound();
      alert(`🎉 Sua senha ${data.ticket_number} foi chamada no ${data.counter}!`);
      loadCurrentTicket();
    } else if (event === 'ticket_completed') {
      alert(`✅ Seu atendimento foi finalizado!`);
      loadCurrentTicket();
    }
  });

  const playNotificationSound = () => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const now = audioContext.currentTime;
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();

    osc.connect(gain);
    gain.connect(audioContext.destination);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

    osc.frequency.setValueAtTime(800, now);
    osc.frequency.setValueAtTime(600, now + 0.1);

    osc.start(now);
    osc.stop(now + 0.5);
  };

  useEffect(() => {
    if (socket && user) {
      socket.emit('join_user_room', user.id);
    }
  }, [socket, user]);

  useEffect(() => {
    loadCurrentTicket();
    loadHistory();
  }, []);

  const loadCurrentTicket = async () => {
    try {
      const response = await getCurrentTicket();
      setCurrentTicket(response.data);
    } catch (err) {
      if (err.response?.status !== 404) {
        setError('Erro ao carregar ticket');
      }
    }
  };

  const loadHistory = async () => {
    try {
      const response = await getTicketHistory();
      setHistory(response.data);
    } catch (err) {
      setError('Erro ao carregar histórico');
    }
  };

  const handleGenerateTicket = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await generateTicket();
      setCurrentTicket(response.data);
      setHistory([response.data, ...history]);
    } catch (err) {
      setError('Erro ao gerar ticket');
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

  return (
    <div className="user-dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>📋 Fila Virtual</h1>
          <p>Bem-vindo, {user?.name}</p>
        </div>
        <button onClick={() => { logout(); navigate('/login'); }} className="logout-btn">
          Sair
        </button>
      </header>

      <main className="dashboard-main">
        <div className="ticket-container">
          <div className="current-ticket-section">
            <h2>Sua Senha Atual</h2>
            
            {currentTicket ? (
              <div className="ticket-card" style={{ borderLeftColor: getStatusColor(currentTicket.status) }}>
                <div className="ticket-number">
                  {getStatusIcon(currentTicket.status)}
                  <span className="number">{currentTicket.ticket_number}</span>
                </div>
                <div className="ticket-info">
                  <p className="status-label">Status:</p>
                  <p className="status" style={{ color: getStatusColor(currentTicket.status) }}>
                    {currentTicket.status.toUpperCase()}
                  </p>
                </div>
                <div className="ticket-time">
                  <small>Gerada em: {new Date(currentTicket.created_at).toLocaleString('pt-BR')}</small>
                </div>
              </div>
            ) : (
              <p className="no-ticket">Você ainda não gerou uma senha</p>
            )}

            <button
              className="generate-btn"
              onClick={handleGenerateTicket}
              disabled={loading}
            >
              {loading ? 'Gerando...' : '+ Gerar Nova Senha'}
            </button>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="history-section">
            <h2>Histórico de Senhas</h2>
            {history.length > 0 ? (
              <div className="history-list">
                {history.map((ticket) => (
                  <div key={ticket.id} className="history-item">
                    <span className="history-number">{getStatusIcon(ticket.status)} #{ticket.ticket_number}</span>
                    <span className="history-status" style={{ color: getStatusColor(ticket.status) }}>
                      {ticket.status}
                    </span>
                    <span className="history-time">
                      {new Date(ticket.created_at).toLocaleString('pt-BR')}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="empty-message">Nenhum histórico disponível</p>
            )}
          </div>
        </div>

        <aside className="info-sidebar">
          <div className="info-card">
            <h3>💡 Dicas</h3>
            <ul>
              <li>Mantenha a tela aberta para receber notificações</li>
              <li>O som de alerta toca quando sua senha é chamada</li>
              <li>Você pode gerar múltiplas senhas</li>
              <li>Acompanhe seu status em tempo real</li>
            </ul>
          </div>

          <div className="info-card">
            <h3>📺 Tela Pública</h3>
            <p>Veja as senhas sendo chamadas em tempo real</p>
            <a href="/public" className="public-link-btn">Abrir Tela Pública</a>
          </div>
        </aside>
      </main>
    </div>
  );
}

export default UserDashboard;

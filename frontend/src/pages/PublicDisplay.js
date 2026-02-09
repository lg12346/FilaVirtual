import React, { useState, useEffect } from 'react';
import { getPublicTickets } from '../services/api';
import { useSocket } from '../hooks/useSocket';
import '../styles/PublicDisplay.css';

function PublicDisplay() {
  const [ticketData, setTicketData] = useState({
    total: 0,
    open: 0,
    called: 0,
    completed: 0,
    notShowed: 0,
    tickets: []
  });
  const [currentlyCalled, setCurrentlyCalled] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const socket = useSocket('join_public_display', (event, data) => {
    if (event === 'ticket_called') {
      setCurrentlyCalled(data.ticket_number);
      playCallSound();
      setTimeout(() => setCurrentlyCalled(null), 5000);
    } else if (event === 'ticket_update') {
      loadTickets();
    }
  });

  const playCallSound = () => {
    // Som de chamada
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const now = audioContext.currentTime;

    for (let i = 0; i < 3; i++) {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();

      osc.connect(gain);
      gain.connect(audioContext.destination);

      gain.gain.setValueAtTime(0, now + i * 0.3);
      gain.gain.linearRampToValueAtTime(0.3, now + i * 0.3 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.3 + 0.3);

      osc.frequency.setValueAtTime(1000, now + i * 0.3);
      osc.start(now + i * 0.3);
      osc.stop(now + i * 0.3 + 0.3);
    }
  };

  useEffect(() => {
    if (socket) {
      socket.emit('join_public_display');
    }
  }, [socket]);

  useEffect(() => {
    loadTickets();
    const interval = setInterval(loadTickets, 3000);
    return () => clearInterval(interval);
  }, []);

  const loadTickets = async () => {
    try {
      const response = await getPublicTickets();
      setTicketData(response.data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Erro ao carregar tickets públicos');
    }
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
    <div className="public-display">
      <div className="display-header">
        <h1>📋 Fila Virtual - Acompanhamento</h1>
        <p>Sistema de Gerenciamento de Senhas</p>
      </div>

      <div className="display-content">
        {currentlyCalled && (
          <div className="calling-section animate-pulse">
            <div className="calling-label">Agora está sendo chamada:</div>
            <div className="calling-number">#{currentlyCalled}</div>
            <div className="calling-animation">
              <span className="pulse"></span>
              <span className="pulse"></span>
              <span className="pulse"></span>
            </div>
          </div>
        )}

        <div className="stats-section">
          <div className="stat-box open">
            <div className="stat-icon">⏳</div>
            <div className="stat-value">{ticketData.open}</div>
            <div className="stat-label">Em Aberto</div>
          </div>
          <div className="stat-box called">
            <div className="stat-icon">📢</div>
            <div className="stat-value">{ticketData.called}</div>
            <div className="stat-label">Sendo Atendidas</div>
          </div>
          <div className="stat-box completed">
            <div className="stat-icon">✅</div>
            <div className="stat-value">{ticketData.completed}</div>
            <div className="stat-label">Atendidas</div>
          </div>
          <div className="stat-box not-showed">
            <div className="stat-icon">❌</div>
            <div className="stat-value">{ticketData.notShowed}</div>
            <div className="stat-label">Não Compareceram</div>
          </div>
        </div>

        <div className="info-section">
          <div className="quote">
            "🎯 Aguarde sua vez com calma. Você será chamado em breve."
          </div>
          <div className="total-tickets">
            Total de senhas no sistema: <strong>{ticketData.total}</strong>
          </div>
        </div>

        <div className="recent-tickets-section">
          <h2>Últimas Movimentações</h2>
          <div className="recent-list">
            {ticketData.tickets.slice(0, 15).map((ticket, index) => (
              <div key={index} className={`recent-item ${ticket.status}`}>
                <span className="recent-number">#{ticket.ticket_number}</span>
                <span className="recent-icon">{getStatusIcon(ticket.status)}</span>
                <span className="recent-status">{ticket.status.toUpperCase()}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="footer">
          <p>Última atualização: {lastUpdated.toLocaleTimeString('pt-BR')}</p>
          <p>🔄 Atualizado automaticamente a cada 3 segundos</p>
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.3;
          }
        }
      `}</style>
    </div>
  );
}

export default PublicDisplay;

import { useEffect, useRef } from 'react';
import io from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

export const useSocket = (room, onEvent) => {
  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = io(SOCKET_URL, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    });

    if (room) {
      socketRef.current.emit(room);
    }

    socketRef.current.on('connect', () => {
      console.log('Conectado ao servidor');
    });

    socketRef.current.on('disconnect', () => {
      console.log('Desconectado do servidor');
    });

    if (onEvent) {
      socketRef.current.on('ticket_called', (data) => onEvent('ticket_called', data));
      socketRef.current.on('ticket_completed', (data) => onEvent('ticket_completed', data));
      socketRef.current.on('ticket_update', (data) => onEvent('ticket_update', data));
      socketRef.current.on('new_ticket', (data) => onEvent('new_ticket', data));
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [room, onEvent]);

  return socketRef.current;
};

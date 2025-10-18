
import { io, Socket } from 'socket.io-client';

const URL = 'http://localhost:8000'; // La URL de tu backend

let socket: Socket;

export const getSocket = (): Socket => {
  if (!socket) {
    const token = localStorage.getItem('token');
    
    socket = io(URL, {
      auth: {
        token: token
      },
      autoConnect: true, // Se conectará automáticamente
    });

    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
    });
  }
  return socket;
};

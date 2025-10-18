import { useState, useEffect, useRef } from 'react';
import { getSocket } from '../lib/socket';
import apiClient from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

interface Message {
  id?: number;
  message: string;
  timestamp: string;
  user: {
    id: number;
    username: string;
    role: string;
  };
}

export default function PublicChat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const socket = getSocket();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Efecto para scroll hacia abajo
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Efecto para cargar historial y configurar socket
  useEffect(() => {
    // Cargar historial de mensajes
    const fetchMessageHistory = async () => {
      try {
        const response = await apiClient.get('/api/chat/messages');
        setMessages(response.data);
      } catch (error) {
        console.error('Error fetching message history:', error);
      }
    };

    fetchMessageHistory();

    // Escuchar nuevos mensajes
    socket.on('public-message', (message) => {
      // El backend emite un objeto diferente, lo adaptamos
      const incomingMessage: Message = {
        message: message.message,
        timestamp: message.timestamp,
        user: {
          id: 0,
          username: message.user,
          role: message.role,
        },
      };
      setMessages((prevMessages) => [...prevMessages, incomingMessage]);
    });

    // Limpieza al desmontar el componente
    return () => {
      socket.off('public-message');
    };
  }, [socket]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      // Emitir el mensaje al servidor
      socket.emit('public-message', newMessage);
      setNewMessage('');
    }
  };

  return (
    <div className="flex flex-col h-[80vh] bg-white rounded-lg shadow-md">
      <div className="p-4 border-b">
        <h2 className="text-xl font-bold">Chat Público</h2>
      </div>
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-4">
          {messages.map((msg, index) => (
            <div 
              key={index} 
              className={`flex items-end gap-2 ${msg.user.username === user?.username ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-md p-3 rounded-lg ${msg.user.username === user?.username ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
                <p className="text-xs font-bold">{msg.user.username} ({msg.user.role})</p>
                <p>{msg.message}</p>
                <p className="text-xs opacity-70 mt-1">{new Date(msg.timestamp).toLocaleTimeString()}</p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <div className="p-4 border-t">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Escribe un mensaje..."
            className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button type="submit" className="px-4 py-2 font-semibold text-white bg-blue-500 rounded-md hover:bg-blue-600">
            Enviar
          </button>
        </form>
      </div>
    </div>
  );
}

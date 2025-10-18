import { useEffect, useState, useRef } from 'react';
import apiClient from '../lib/api';
import { getSocket } from '../lib/socket';
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
  recipient?: {
    id: number;
    username: string;
  };
}

interface UserItem {
  id: number;
  username: string;
  role: string;
}

export default function PrivateChat() {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [unread, setUnread] = useState<Record<number, number>>({});
  const [newMessage, setNewMessage] = useState('');
  const socket = getSocket();
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Cargar lista de usuarios (posibles destinatarios)
    const fetchUsers = async () => {
      try {
        const res = await apiClient.get('/user');
        setUsers(res.data.filter((u: UserItem) => u.id !== user?.id));
      } catch (err) {
        console.error('Error loading users', err);
      }
    };
    fetchUsers();
  }, [user]);

  useEffect(() => {
    if (!selectedUser) return;

    const fetchHistory = async () => {
      try {
        const res = await apiClient.get(`/api/chat/private/${selectedUser.id}`);
        setMessages(res.data);
      } catch (err) {
        console.error('Error fetching private history', err);
      }
    };
    fetchHistory();
  }, [selectedUser]);

  useEffect(() => {
    const handleIncoming = (data: any) => {
      // Evento recibido del servidor: private-message
      const incoming: Message = {
        id: data.id,
        message: data.message,
        timestamp: data.timestamp,
        user: { id: 0, username: data.user, role: data.role },
        recipient: { id: data.recipientId, username: '' },
      };
      // Si estamos en el chat con esta persona, añadir, sino marcar como pendiente
      if (selectedUser && data.user === selectedUser.username) {
        setMessages((prev) => [...prev, incoming]);
      } else {
        // Marcar como no leído para el remitente (usamos senderId si viene)
        const senderId = data.senderId ?? null;
        if (senderId) {
          setUnread(prev => ({ ...prev, [senderId]: (prev[senderId] || 0) + 1 }));
        }
      }
    };

    const handleSent = (data: any) => {
      const sent: Message = {
        id: data.id,
        message: data.message,
        timestamp: data.timestamp,
        user: { id: 0, username: data.user, role: data.role },
        recipient: { id: data.recipientId, username: '' },
      };
      if (selectedUser && data.recipientId === selectedUser.id) {
        setMessages((prev) => [...prev, sent]);
      }
    };

  socket.on('private-message', handleIncoming);
    socket.on('private-message-sent', handleSent);

    return () => {
      socket.off('private-message', handleIncoming);
      socket.off('private-message-sent', handleSent);
    };
  }, [socket, selectedUser]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedUser || !newMessage.trim()) return;
    // Emitir por socket para entrega en tiempo real
    socket.emit('private-message', { message: newMessage, recipientId: selectedUser.id });
    setNewMessage('');
    // Opcional: también persistir vía API (ya lo hace el servidor al recibir socket)
  };

  // Limpiar unread cuando se selecciona un usuario
  const handleSelectUser = (u: UserItem) => {
    setSelectedUser(u);
    setUnread(prev => {
      const copy = { ...prev };
      delete copy[u.id];
      return copy;
    });
  };

  return (
    <div className="flex gap-4">
      <div className="w-1/4 bg-white p-4 rounded-lg shadow-md">
        <h3 className="font-bold mb-2">Usuarios</h3>
        <ul className="space-y-2">
          {users.map(u => (
            <li key={u.id} className="relative">
              <button
                onClick={() => handleSelectUser(u)}
                className={`w-full text-left p-2 rounded ${selectedUser?.id === u.id ? 'bg-blue-100' : ''}`}
              >
                {u.username} <span className="text-xs text-gray-500">({u.role})</span>
              </button>
              {unread[u.id] ? (
                <span className="absolute top-1 right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">{unread[u.id]}</span>
              ) : null}
            </li>
          ))}
        </ul>
      </div>
      <div className="flex-1 flex flex-col bg-white p-4 rounded-lg shadow-md">
        <div className="border-b pb-2 mb-2">
          <h3 className="font-bold">{selectedUser ? `Chat con ${selectedUser.username}` : 'Selecciona un usuario'}</h3>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {messages.map((m, i) => (
            <div key={i} className={`mb-2 ${m.user.username === user?.username ? 'text-right' : 'text-left'}`}>
              <div className={`inline-block p-2 rounded ${m.user.username === user?.username ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
                <div className="text-xs font-semibold">{m.user.username}</div>
                <div>{m.message}</div>
                <div className="text-xs opacity-70">{new Date(m.timestamp).toLocaleTimeString()}</div>
              </div>
            </div>
          ))}
          <div ref={endRef} />
        </div>
        <form onSubmit={sendMessage} className="mt-2 flex gap-2">
          <input type="text" className="flex-1 px-3 py-2 border rounded" value={newMessage} onChange={e => setNewMessage(e.target.value)} disabled={!selectedUser} />
          <button type="submit" className="px-4 py-2 text-white bg-blue-500 rounded" disabled={!selectedUser}>Enviar</button>
        </form>
      </div>
    </div>
  );
}

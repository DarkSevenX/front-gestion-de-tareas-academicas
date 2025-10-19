import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import apiClient from '../lib/api';
import { jwtDecode } from "jwt-decode";
import { disconnectSocket, getSocket } from '../lib/socket';

// Interfaces para el payload del token y el usuario
interface DecodedToken {
  id: number;
  username: string;
  role: 'alumno' | 'tutor'; // Updated role type
  iat: number;
  exp: number;
}

interface User {
  id: number;
  username: string;
  role: 'alumno' | 'tutor'; // Updated role type
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (username: string, password: string) => Promise<void>;
  signUp: (username: string, password: string, role: 'alumno' | 'tutor') => Promise<void>; // Updated signature
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken = jwtDecode<DecodedToken>(token);
        if (decodedToken.exp * 1000 > Date.now()) {
          setUser({
            id: decodedToken.id,
            username: decodedToken.username,
            role: decodedToken.role.toLowerCase() as 'alumno' | 'tutor',
          });
          apiClient.defaults.headers.common['token'] = token;
        } else {
          localStorage.removeItem('token');
        }
      } catch (error) {
        console.error("Error decoding token:", error);
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const signIn = async (username: string, password: string) => {
    setLoading(true);
    try {
      // La respuesta de axios contiene los datos en `data` y las cabeceras en `headers`
      const response = await apiClient.post('/auth/login', { username, password });
      
      // Extraer el token de las cabeceras y el usuario del cuerpo
      const token = response.headers['token'];
      const userPayload = response.data.user;

      if (token && userPayload) {
        localStorage.setItem('token', token);
        setUser({
          id: userPayload.id,
          username: userPayload.username,
          role: userPayload.role.toLowerCase() as 'alumno' | 'tutor',
        });
        // Añadimos el token a las cabeceras por defecto para futuras peticiones
        apiClient.defaults.headers.common['token'] = token;
        // Reconectar el socket con el nuevo token
        disconnectSocket();
        getSocket();
      }
    } catch (error: any) {
      console.error('Error during sign in:', error);
      const errorMessage = error.response?.data?.message || 'Ocurrió un error durante el inicio de sesión';
      const errorStatus = error.response?.status || 500;
      throw new Error(JSON.stringify({ message: errorMessage, status: errorStatus }));
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (username: string, password: string, role: 'alumno' | 'tutor') => { // Updated signature
    setLoading(true);
    try {
      await apiClient.post('/auth/register', { username, password, role }); // Updated request body
      alert('¡Registro exitoso! Por favor, inicia sesión.');
    } catch (error: any) {
      console.error('Error during sign up:', error);
      const errorMessage = error.response?.data?.message || 'Ocurrió un error durante el registro';
      const errorStatus = error.response?.status || 500;
      throw new Error(JSON.stringify({ message: errorMessage, status: errorStatus }));
    } finally {
      setLoading(false);
    }
  };


  const signOut = () => {
    setUser(null);
    localStorage.removeItem('token');
    delete apiClient.defaults.headers.common['token'];
    disconnectSocket();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
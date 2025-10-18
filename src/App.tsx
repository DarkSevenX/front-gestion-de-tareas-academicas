import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import { TaskList } from './components/TaskList';
import Chat from './components/Chat';
import {AuthForm} from './components/AuthForm';

function AppContent() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<'processes' | 'chat'>('processes');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p>Hello, world!</p>
      </div>
    );
  }

  // Si no hay usuario, mostrar el formulario centrado en toda la pantalla
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <AuthForm />
      </div>
    );
  }

  // Si hay usuario, mostrar el Layout con el contenido de la app
  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === 'processes' ? <TaskList /> : <Chat />}
    </Layout>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;

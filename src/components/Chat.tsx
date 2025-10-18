import { useState } from 'react';
import PublicChat from './PublicChat';
import PrivateChat from './PrivateChat';

export default function Chat() {
  const [mode, setMode] = useState<'public' | 'private'>('public');

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <button className={`px-4 py-2 rounded ${mode === 'public' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`} onClick={() => setMode('public')}>Público</button>
        <button className={`px-4 py-2 rounded ${mode === 'private' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`} onClick={() => setMode('private')}>Privado</button>
      </div>
      {mode === 'public' ? <PublicChat /> : <PrivateChat />}
    </div>
  );
}
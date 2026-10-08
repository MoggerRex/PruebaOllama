import { useState } from 'react';
import { LLAMA_PERSONALITIES } from '../services/llamaService.js';

export default function ExplanationPanel({ activeAlgorithm }) {
  const [character, setCharacter] = useState('Goku');
  const [tab, setTab] = useState('teoria'); // 'teoria' | 'chat'

  return (
    <div className="flex flex-col h-full bg-gray-900 text-gray-200">
      {/* Selector e Imagen del Personaje */}
      <div className="p-4 border-b border-gray-800 flex items-center gap-4">
        <img src={`/assets/characters/${character.toLowerCase().replace(' ', '')}.png`} alt={character} className="w-16 h-16 rounded-full object-cover border-2 border-blue-500" />
        <div className="flex-1">
          <label className="text-xs text-gray-400">Explicando como:</label>
          <select 
            value={character} 
            onChange={(e) => setCharacter(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded p-1 text-sm text-white focus:border-blue-500"
          >
            {LLAMA_PERSONALITIES.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
          </select>
        </div>
      </div>

      {/* Pestañas (Teoría / Chat) */}
      <div className="flex border-b border-gray-800">
        <button onClick={() => setTab('teoria')} className={`flex-1 py-2 ${tab === 'teoria' ? 'border-b-2 border-blue-500 text-blue-400' : 'text-gray-500'}`}>Explicación</button>
        <button onClick={() => setTab('chat')} className={`flex-1 py-2 ${tab === 'chat' ? 'border-b-2 border-blue-500 text-blue-400' : 'text-gray-500'}`}>Chat Libre</button>
      </div>

      {/* Contenido */}
      <div className="p-4 flex-1 overflow-y-auto">
        {tab === 'teoria' ? (
           // Aquí muestras lo que te devuelve fetchAlgorithmOverview
            <p className="leading-relaxed text-sm">Aquí va la explicación de {activeAlgorithm} generada con {character}...</p>
        ) : (
            <p className="leading-relaxed text-sm">El chat libre con {character} está disponible desde el panel del dashboard.</p>
        )}
      </div>
    </div>
  )
}
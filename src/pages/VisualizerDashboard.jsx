import React, { useState } from 'react';

import QuickSortVisualizer from '../components/algorithms/quickSort/QuickSortVisualizer';
// Importa los demás cuando los refactorices
// import InsertionSortVisualizer from '../components/algorithms/insertionSort/InsertionSortVisualizer';
// import HashSearchVisualizer from '../components/algorithms/hashSearch/HashSearchVisualizer';
// import BinarySearchVisualizer from '../components/algorithms/binarySearch/BinarySearchVisualizer';

const CHARACTERS = [
  { id: 'goku', name: 'Goku' }, { id: 'naruto', name: 'Naruto' },
  { id: 'luffy', name: 'Luffy' }, { id: 'batman', name: 'Batman' },
  { id: 'spiderman', name: 'Spiderman' }, { id: 'arthur', name: 'Arthur Morgan' },
  { id: 'halo', name: 'Master Chief' }, { id: 'walter', name: 'Walter White' },
  { id: 'alex', name: 'Aleks Syntek' }, { id: 'samuel', name: 'Samuel García' }
];

export default function VisualizerDashboard() {
  const [activeAlgorithm, setActiveAlgorithm] = useState('quicksort');
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  
  // Estados para controlar el algoritmo
  const [isPlaying, setIsPlaying] = useState(false);
  const [arrayInputs, setArrayInputs] = useState([8, 3, 1, 7, 0, 10, 2]);
  const [selectedCharacter, setSelectedCharacter] = useState(CHARACTERS[1]); // Naruto por defecto
  
  // Estado para la explicación del paso a paso (recibida desde el algoritmo)
  const [stepExplanation, setStepExplanation] = useState('Esperando inicio del algoritmo...');

  const handleInputChange = (index, value) => {
    const newInputs = [...arrayInputs];
    newInputs[index] = Number(value);
    setArrayInputs(newInputs);
    setIsPlaying(false); // Pausa si se cambian los números
  };

  const generateRandom = () => {
    setArrayInputs(Array.from({ length: 7 }, () => Math.floor(Math.random() * 20)));
    setIsPlaying(false);
  };

  const renderVisualizer = () => {
    switch (activeAlgorithm) {
      case 'quicksort': 
        return (
          <QuickSortVisualizer 
            inputNumbers={arrayInputs} 
            selectedCharacter={selectedCharacter.name}
            isPlaying={isPlaying}
            setStepExplanation={setStepExplanation}
          />
        );
      // case 'insertionsort': return <InsertionSortVisualizer ... />;
      // case 'hashsearch': return <HashSearchVisualizer ... />;
      // case 'binarysearch': return <BinarySearchVisualizer ... />;
      default: 
        return <div className="text-gray-400">Selecciona un algoritmo</div>;
    }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-gray-50 text-gray-900 font-sans">
      {/* 1. HEADER & MENÚ */}
      <header className="flex items-center justify-between px-6 py-3 bg-white border-b border-gray-200 shadow-sm shrink-0">
        <div className="flex items-center gap-8">
          <h1 className="text-xl font-bold text-black tracking-tight">AlgoVis</h1>
          <nav className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            {[
              { id: 'quicksort', label: 'Quicksort' },
              { id: 'insertionsort', label: 'Insert Sort' },
              { id: 'hashsearch', label: 'Hash Search' },
              { id: 'binarysearch', label: 'Binary Search' }
            ].map((algo) => (
              <button
                key={algo.id}
                onClick={() => { setActiveAlgorithm(algo.id); setIsPlaying(false); }}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                  activeAlgorithm === algo.id
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                }`}
              >
                {algo.label}
              </button>
            ))}
          </nav>
        </div>
        <button
          onClick={() => setIsPanelOpen(!isPanelOpen)}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-blue-600 transition-colors"
        >
          {isPanelOpen ? 'Ocultar Panel Lateral ➔' : 'Ver Panel Lateral ⬅'}
        </button>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex flex-1 overflow-hidden">
        
        {/* 2. SECCIÓN IZQUIERDA (Visualización y Controles) */}
        <section className="flex flex-col flex-1 relative transition-all duration-300">
          
          {/* Controles Superiores */}
          <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
            <div className="flex items-center gap-4">
              <div className="flex gap-2">
                {arrayInputs.map((num, idx) => (
                  <input
                    key={idx}
                    type="number"
                    value={num}
                    onChange={(e) => handleInputChange(idx, e.target.value)}
                    className="w-12 h-10 text-center text-sm border border-gray-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                ))}
              </div>
              <button 
                onClick={generateRandom}
                className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Aleatorios
              </button>
            </div>

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`flex items-center gap-2 px-6 py-2 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors ${
                isPlaying ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isPlaying ? 'Pausar' : 'Reproducir'}
            </button>
          </div>

          {/* Área del Gráfico */}
          <div className="flex-1 bg-gray-50 flex items-center justify-center p-6 overflow-hidden">
            <div className="w-full h-full bg-white border border-gray-200 shadow-sm rounded-xl flex items-center justify-center relative overflow-hidden">
              {renderVisualizer()}
            </div>
          </div>

          {/* Área de Explicación Paso a Paso Inferior */}
          <div className="h-32 bg-white border-t border-gray-200 p-4 shrink-0 shadow-inner overflow-y-auto">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Paso Actual</h3>
            <p className="text-sm text-gray-800 font-medium">
              <span className="text-blue-600 mr-2">▶</span> 
              {stepExplanation}
            </p>
          </div>
        </section>

        {/* 3. SECCIÓN DERECHA (Panel Explicativo Llama) */}
        <aside
          className={`${
            isPanelOpen ? 'w-[400px] border-l border-gray-200' : 'w-0'
          } bg-white transition-all duration-300 overflow-hidden shrink-0 flex flex-col`}
        >
          <div className="w-[400px] h-full flex flex-col">
            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900 mb-1 capitalize">{activeAlgorithm}</h2>
              <div className="flex items-center gap-3 bg-white p-2 mt-4 rounded-lg border border-gray-200 shadow-sm">
                <div className="flex-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Personalidad Llama</label>
                  <select 
                    value={selectedCharacter.id}
                    onChange={(e) => {
                      setSelectedCharacter(CHARACTERS.find(c => c.id === e.target.value));
                      setIsPlaying(false);
                    }}
                    className="w-full text-sm bg-transparent border-none focus:ring-0 p-0 text-gray-800 font-medium cursor-pointer"
                  >
                    {CHARACTERS.map(char => (
                      <option key={char.id} value={char.id}>{char.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            
            {/* Aquí irá el componente del chat más adelante */}
            <div className="flex-1 p-4 bg-white flex items-center justify-center text-sm text-gray-400 italic text-center">
              Chat con {selectedCharacter.name} se conectará aquí...
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}
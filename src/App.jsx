import './App.css';
import { useState, useEffect } from 'react';
import QuickSortVisualizer from './components/algorithms/quickSort/QuickSortVisualizer.jsx';
import HashSearchVisualizer from './components/algorithms/hashSearch/HashSearchVisualizer.jsx';

function App() {
  const [activeTab, setActiveTab] = useState('quicksort');
  const [apiStatus, setApiStatus] = useState('Comprobando API...');

  const API_URL = 'http://127.0.0.1:8000';

  // Probar el endpoint GET "/" para verificar conexión
  useEffect(() => {
    fetch(`${API_URL}/`)
      .then((res) => res.json())
      .then((data) => setApiStatus(data.message))
      .catch(() => setApiStatus('Error al conectar con la API'));
  }, []);

  return (
    <div className="container">
      <header className="header">
        <h1>Asistente Llama 3.2</h1>
        <span className={`status ${apiStatus.includes('Error') ? 'offline' : 'online'}`}>
          {apiStatus}
        </span>
      </header>

      {/* Navegación por pestañas */}
      <nav aria-label="Visualizadores de algoritmos" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '10px', margin: '15px 0' }}>
        <button type="button" aria-pressed={activeTab === 'hash'} onClick={() => setActiveTab('hash')}
          style={{ backgroundColor: activeTab === 'hash' ? '#2563eb' : '#e5e7eb', color: activeTab === 'hash' ? 'white' : '#374151' }}>
          Búsqueda hash
        </button>
        <button
          onClick={() => setActiveTab('quicksort')}
          style={{
            padding: '8px 16px',
            backgroundColor: activeTab === 'quicksort' ? '#2563eb' : '#e5e7eb',
            color: activeTab === 'quicksort' ? 'white' : '#374151',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Visualizador Quicksort
        </button>

      </nav>

      {activeTab === 'quicksort' ? (
        <main className="algorithm-layout">
          <QuickSortVisualizer />
        </main>
      ) : (
        <main>
          <HashSearchVisualizer />
        </main>
      )}
    </div>
  );
}

export default App;

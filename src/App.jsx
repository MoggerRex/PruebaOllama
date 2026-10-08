import './App.css';
import { useState, useEffect } from 'react';
import QuickSortVisualizer from './components/algorithms/quickSort/QuickSortVisualizer.jsx';
import HashSearchVisualizer from './components/algorithms/hashSearch/HashSearchVisualizer.jsx';
import AlgorithmOverview from './components/common/AlgorithmOverview.jsx';

function App() {
  const [activeTab, setActiveTab] = useState('quicksort'); // 'chat' o 'quicksort'
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState('Comprobando API...');

  const API_URL = 'http://127.0.0.1:8000';

  // Probar el endpoint GET "/" para verificar conexión
  useEffect(() => {
    fetch(`${API_URL}/`)
      .then((res) => res.json())
      .then((data) => setApiStatus(data.message))
      .catch(() => setApiStatus('Error al conectar con la API'));
  }, []);

  // Enviar pregunta al endpoint POST "/ask"
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setResponse('');

    try {
      const res = await fetch(`${API_URL}/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();

      if (res.ok) {
        setResponse(data.answer);
      } else {
        setResponse(`Error: ${data.detail || 'Ocurrió un error inesperado.'}`);
      }
    } catch {
      setResponse('Error de red o el servidor FastAPI no está corriendo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <header className="header">
        <h1>Asistente Llama 3.2</h1>
        <span className={`status ${apiStatus.includes('Error') ? 'offline' : 'online'}`}>
          {apiStatus}
        </span>
      </header>

      {/* Navegación por pestañas */}
      <nav aria-label="Algoritmos y chat" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '10px', margin: '15px 0' }}>
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
        <button
          onClick={() => setActiveTab('chat')}
          style={{
            padding: '8px 16px',
            backgroundColor: activeTab === 'chat' ? '#2563eb' : '#e5e7eb',
            color: activeTab === 'chat' ? 'white' : '#374151',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Chat Libre
        </button>
      </nav>

      {/* Contenido según la pestaña seleccionada */}
      {activeTab === 'quicksort' ? (
        <main className="algorithm-layout">
          <QuickSortVisualizer />
          <AlgorithmOverview key="quicksort" algorithm="Quick Sort" />
        </main>
      ) : activeTab === 'hash' ? (
        <main className="algorithm-layout">
          <HashSearchVisualizer />
          <AlgorithmOverview key="hash" algorithm="Hash Search" />
        </main>
      ) : (
        <main className="chat-box">
          <form onSubmit={handleSubmit} className="form-container">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Escribe tu duda de programación aquí..."
              rows={4}
              disabled={loading}
            />
            <button type="submit" disabled={loading || !prompt.trim()}>
              {loading ? 'Consultando...' : 'Enviar Pregunta'}
            </button>
          </form>

          {response && (
            <div className="response-box">
              <h3>Respuesta del Asistente:</h3>
              <p className="response-text">{response}</p>
            </div>
          )}
        </main>
      )}
    </div>
  );
}

export default App;

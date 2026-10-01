import heroImg from './assets/hero.png'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import './App.css'
import { useState, useEffect } from 'react';

function App() {
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
    } catch (error) {
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
    </div>
  );
}

export default App;
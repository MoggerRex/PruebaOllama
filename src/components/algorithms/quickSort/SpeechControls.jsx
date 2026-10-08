import { useEffect, useRef, useState } from 'react';
import { fetchSpeech } from '../../../services/llamaService.js';

const buttonStyle = (active) => ({
  padding: '6px 12px',
  borderRadius: '6px',
  border: '1px solid #3b82f6',
  backgroundColor: active ? '#3b82f6' : 'transparent',
  color: '#e2e8f0',
  fontSize: '12px',
  cursor: 'pointer'
});

export default function SpeechControls({ text }) {
  const audioRef = useRef(null);
  const [status, setStatus] = useState('idle'); // idle | loading | playing
  const [activeProfile, setActiveProfile] = useState(null);
  const [error, setError] = useState(null);

  const stop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      URL.revokeObjectURL(audioRef.current.src);
      audioRef.current = null;
    }
    setStatus('idle');
    setActiveProfile(null);
  };

  // Detiene el audio si cambia el texto o se desmonta el componente
  useEffect(() => stop, [text]);

  const speak = async (profile) => {
    stop();
    setError(null);
    setStatus('loading');
    setActiveProfile(profile);

    try {
      const blob = await fetchSpeech(text, profile);
      const audio = new Audio(URL.createObjectURL(blob));
      audioRef.current = audio;
      audio.onended = stop;
      await audio.play();
      setStatus('playing');
    } catch (err) {
      console.error(err);
      setError('No se pudo reproducir el audio.');
      stop();
    }
  };

  return (
    <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <button onClick={() => speak('normal')} disabled={status === 'loading'} style={buttonStyle(activeProfile === 'normal')}>
          🔊 Voz normal
        </button>
        <button onClick={() => speak('energico')} disabled={status === 'loading'} style={buttonStyle(activeProfile === 'energico')}>
          ⚡ Voz enérgica
        </button>
        {status !== 'idle' && (
          <button onClick={stop} style={buttonStyle(false)}>
            ⏹ Detener
          </button>
        )}
      </div>
      {status === 'loading' && <span style={{ fontSize: '12px', color: '#94a3b8' }}>Generando audio...</span>}
      {error && <span style={{ fontSize: '12px', color: '#f87171' }}>{error}</span>}
    </div>
  );
}
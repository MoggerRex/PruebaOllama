import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchSpeech } from '../../services/llamaService.js';

const profiles = [
  { id: 'normal', label: 'Voz normal' },
  { id: 'energico', label: 'Voz enérgica' },
];

export default function SpeechControls({ text }) {
  const audioRef = useRef(null);
  const objectUrlRef = useRef(null);
  const requestIdRef = useRef(0);
  const [status, setStatus] = useState('idle');
  const [activeProfile, setActiveProfile] = useState(null);
  const [error, setError] = useState(null);

  const stop = useCallback((updateUi = true) => {
    requestIdRef.current += 1;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.onended = null;
      audioRef.current.onerror = null;
      audioRef.current.src = '';
      audioRef.current = null;
    }
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    if (updateUi) {
      setStatus('idle');
      setActiveProfile(null);
    }
  }, []);

  useEffect(() => {
    return () => stop(false);
  }, [text, stop]);

  const speak = async (profile) => {
    stop();
    const requestId = requestIdRef.current;
    setError(null);
    setStatus('loading');
    setActiveProfile(profile);

    try {
      const audioBlob = await fetchSpeech(text, profile);
      if (requestId !== requestIdRef.current) return;

      const objectUrl = URL.createObjectURL(audioBlob);
      objectUrlRef.current = objectUrl;
      const audio = new Audio(objectUrl);
      audioRef.current = audio;
      audio.onended = stop;
      audio.onerror = () => {
        if (requestId !== requestIdRef.current) return;
        stop();
        setError({ text, message: 'No se pudo reproducir el audio.' });
      };
      await audio.play();
      if (requestId === requestIdRef.current) setStatus('playing');
    } catch (requestError) {
      if (requestId !== requestIdRef.current) return;
      console.error(requestError);
      stop();
      setError({ text, message: requestError instanceof Error ? requestError.message : 'No se pudo reproducir el audio.' });
    }
  };

  const isDisabled = !text.trim() || status === 'loading';
  const errorMessage = error?.text === text ? error.message : '';

  return (
    <div className="mt-3 space-y-1.5" aria-label="Lectura de voz">
      <div className="flex flex-wrap gap-2">
        {profiles.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            disabled={isDisabled}
            onClick={() => speak(id)}
            aria-pressed={activeProfile === id && status === 'playing'}
            className={`inline-flex min-h-8 items-center gap-1.5 border px-2.5 py-1.5 text-[11px] font-semibold transition ${activeProfile === id && status !== 'idle' ? 'border-sky-600 bg-sky-600 text-white' : 'border-sky-200 bg-sky-50 text-sky-800 hover:border-sky-400 hover:bg-sky-100'} disabled:cursor-not-allowed disabled:opacity-45`}
          >
            <span aria-hidden="true">{id === 'energico' ? '⚡' : '◖'}</span>{label}
          </button>
        ))}
        {status !== 'idle' && (
          <button
            type="button"
            onClick={stop}
            className="inline-flex min-h-8 items-center gap-1.5 border border-zinc-300 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-zinc-700 transition hover:bg-zinc-100"
          ><span aria-hidden="true">■</span>Detener</button>
        )}
      </div>
      {status === 'loading' && <p className="text-[11px] text-zinc-500" role="status">Generando audio...</p>}
      {errorMessage && <p className="text-[11px] text-rose-700" role="alert">{errorMessage}</p>}
    </div>
  );
}
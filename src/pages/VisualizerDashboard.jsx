import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import AlgorithmCanvas from '../components/common/AlgorithmCanvas.jsx';
import useAlgorithmSimulation from '../hooks/useAlgorithmSimulation.js';
import { askLlama, fetchAlgorithmOverview, LLAMA_PERSONALITIES } from '../services/llamaService.js';

const ALGORITHMS = [
  { id: 'quicksort', name: 'Quick sort', kind: 'Ordenamiento', complexity: 'O(n log n)', worst: 'O(n²)', application: 'Ordenar colecciones grandes en memoria.', benefit: 'Muy rápido en promedio y requiere poca memoria adicional.', summary: 'Divide el arreglo alrededor de un pivote y ordena cada parte.' },
  { id: 'insertionsort', name: 'Insertion sort', kind: 'Ordenamiento', complexity: 'O(n²)', worst: 'O(n²)', application: 'Listas pequeñas o casi ordenadas.', benefit: 'Simple, estable y eficiente cuando hay pocos cambios.', summary: 'Inserta cada valor en la posición correcta de una sección ordenada.' },
  { id: 'hashsearch', name: 'Hash search', kind: 'Búsqueda', complexity: 'O(1) promedio', worst: 'O(n)', application: 'Índices, cachés y búsquedas por clave.', benefit: 'Acceso promedio constante con una buena distribución.', summary: 'Convierte una clave en una cubeta y resuelve posibles colisiones.' },
  { id: 'binarysearch', name: 'Binary search', kind: 'Búsqueda', complexity: 'O(log n)', worst: 'O(log n)', application: 'Colecciones ordenadas y catálogos.', benefit: 'Reduce a la mitad los datos candidatos en cada comparación.', summary: 'Compara el centro y descarta la mitad que no puede contener el objetivo.' },
];

const CHARACTERS = [
  { name: 'Goku', avatar: '⚡', tone: 'bg-orange-100 text-orange-700' },
  { name: 'Naruto', avatar: '🍥', tone: 'bg-amber-100 text-amber-700' },
  { name: 'Luffy', avatar: '☠', tone: 'bg-red-100 text-red-700' },
  { name: 'Batman', avatar: '🦇', tone: 'bg-zinc-200 text-zinc-800' },
  { name: 'Spiderman', avatar: '🕸', tone: 'bg-rose-100 text-rose-700' },
  { name: 'Arthur Morgan', avatar: '🤠', tone: 'bg-stone-200 text-stone-700' },
  { name: 'Halo', avatar: '🛡', tone: 'bg-emerald-100 text-emerald-700' },
  { name: 'Walter White', avatar: '⚗', tone: 'bg-lime-100 text-lime-800' },
  { name: 'Alex Sintek', avatar: '♫', tone: 'bg-sky-100 text-sky-700' },
  { name: 'Samuel Garcia', avatar: 'S', tone: 'bg-blue-100 text-blue-700' },
];

const INITIAL_VALUES = [8, 3, 1, 7, 0, 10, 2];

export default function VisualizerDashboard() {
  const [activeAlgorithm, setActiveAlgorithm] = useState('quicksort');
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [arrayInputs, setArrayInputs] = useState(INITIAL_VALUES);
  const [target, setTarget] = useState('7');
  const [selectedCharacter, setSelectedCharacter] = useState(CHARACTERS[1]);
  const [panelTab, setPanelTab] = useState('overview');
  const [overviewResult, setOverviewResult] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const activeInfo = ALGORITHMS.find((algorithm) => algorithm.id === activeAlgorithm);
  const overviewRequestKey = `${activeInfo.id}:${selectedCharacter.name}`;
  const overview = overviewResult?.key === overviewRequestKey ? overviewResult.text : '';
  const overviewLoading = overviewResult?.key !== overviewRequestKey;
  const { steps, currentStepIndex, currentStep, setCurrentStepIndex } = useAlgorithmSimulation(activeAlgorithm, arrayInputs, target);

  useEffect(() => {
    let isCurrentRequest = true;
    fetchAlgorithmOverview(activeInfo.name, selectedCharacter.name)
      .then((text) => { if (isCurrentRequest) setOverviewResult({ key: overviewRequestKey, text }); })
      .catch(() => { if (isCurrentRequest) setOverviewResult({ key: overviewRequestKey, text: `${activeInfo.summary} La explicación personalizada no está disponible; comprueba que Ollama y su API estén activos.` }); });
    return () => { isCurrentRequest = false; };
  }, [activeInfo, overviewRequestKey, selectedCharacter]);

  useEffect(() => {
    if (!isPlaying) return undefined;
    const timer = window.setInterval(() => {
      setCurrentStepIndex((index) => {
        if (index >= steps.length - 1) {
          setIsPlaying(false);
          return index;
        }
        return index + 1;
      });
    }, 1100);
    return () => window.clearInterval(timer);
  }, [isPlaying, setCurrentStepIndex, steps.length]);

  const updateNumber = (index, value) => {
    const parsed = Number(value);
    if (value === '' || Number.isSafeInteger(parsed)) {
      setArrayInputs((numbers) => numbers.map((number, itemIndex) => itemIndex === index ? (value === '' ? 0 : parsed) : number));
      setCurrentStepIndex(0);
      setIsPlaying(false);
    }
  };

  const selectAlgorithm = (id) => {
    setActiveAlgorithm(id);
    setCurrentStepIndex(0);
    setIsPlaying(false);
  };

  const togglePlayback = () => {
    if (!isPlaying && currentStepIndex === steps.length - 1) setCurrentStepIndex(0);
    setIsPlaying((playing) => !playing);
  };

  const sendChatMessage = async (event) => {
    event.preventDefault();
    const question = chatInput.trim();
    if (!question || chatLoading) return;
    const conversation = [...chatMessages, { role: 'user', content: question }];
    setChatMessages(conversation);
    setChatInput('');
    setChatLoading(true);
    const transcript = conversation.map((message) => `${message.role === 'user' ? 'Estudiante' : selectedCharacter.name}: ${message.content}`).join('\n');
    try {
      const answer = await askLlama(`Actúa como ${selectedCharacter.name}, con el estilo indicado para el personaje. Ayuda a un estudiante a entender ${activeInfo.name}. Mantén el rigor técnico, responde en español y de forma clara.\n\nConversación:\n${transcript}`);
      setChatMessages((messages) => [...messages, { role: 'assistant', content: answer }]);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo consultar Ollama.';
      setChatMessages((messages) => [...messages, { role: 'assistant', content: `No pude conectar con Ollama: ${message}` }]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#f3f4f6] text-zinc-900 lg:h-screen lg:overflow-hidden">
      <header className="z-10 flex min-h-[76px] flex-col gap-3 border-b border-zinc-200 bg-white px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-center gap-5">
          <a className="flex shrink-0 items-center gap-2.5" href="#inicio" aria-label="AlgoVis inicio">
            <span className="grid h-8 w-8 grid-cols-2 gap-1 rounded-md bg-zinc-900 p-1.5">
              <i className="rounded-[2px] bg-white" /><i className="rounded-[2px] bg-sky-400" />
              <i className="rounded-[2px] bg-white" /><i className="rounded-[2px] bg-white" />
            </span>
            <span className="text-sm font-bold tracking-wide">ALGOVIS</span>
          </a>
          <span className="hidden h-7 w-px bg-zinc-200 sm:block" />
          <nav aria-label="Seleccionar algoritmo" className="flex min-w-0 gap-1 overflow-x-auto pb-0.5">
            {ALGORITHMS.map((algorithm) => (
              <button
                key={algorithm.id}
                type="button"
                onClick={() => selectAlgorithm(algorithm.id)}
                aria-current={activeAlgorithm === algorithm.id ? 'page' : undefined}
                className={`whitespace-nowrap border-b-2 px-2.5 py-2 text-xs font-semibold transition-colors sm:px-3 sm:text-sm ${activeAlgorithm === algorithm.id ? 'border-sky-600 text-sky-700' : 'border-transparent text-zinc-500 hover:text-zinc-900'}`}
              >{algorithm.name}</button>
            ))}
          </nav>
        </div>
        <div className="flex items-center justify-between gap-3 lg:justify-end">
          <div className="hidden text-right sm:block">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-400">Entorno educativo</p>
            <p className="text-xs font-medium text-zinc-600">Algoritmos interactivos</p>
          </div>
          <button
            type="button"
            onClick={() => setIsPanelOpen((open) => !open)}
            aria-expanded={isPanelOpen}
            aria-label={isPanelOpen ? 'Ocultar panel explicativo' : 'Mostrar panel explicativo'}
            className="flex h-9 items-center gap-2 border border-zinc-200 px-3 text-xs font-semibold text-zinc-600 transition hover:border-sky-300 hover:text-sky-700"
          >
            <span aria-hidden="true">{isPanelOpen ? '›' : '‹'}</span>{isPanelOpen ? 'Ocultar explicación' : 'Ver explicación'}
          </button>
        </div>
      </header>

      <main className="flex flex-1 flex-col lg:min-h-0 lg:flex-row">
        <section className="flex min-w-0 flex-1 flex-col lg:min-h-0" aria-label={`Visualización de ${activeInfo.name}`}>
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-200 bg-white px-4 py-3 sm:px-6">
            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-4 gap-y-2">
              <span className="shrink-0 text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-400">Datos de entrada</span>
              <div className="flex flex-wrap gap-1.5">
                {arrayInputs.map((number, index) => (
                  <input
                    key={index}
                    type="number"
                    aria-label={`Valor ${index + 1} del arreglo`}
                    value={number}
                    onChange={(event) => updateNumber(index, event.target.value)}
                    className="h-9 w-11 border border-zinc-200 bg-zinc-50 text-center text-xs font-semibold outline-none transition focus:border-sky-500 focus:bg-white"
                  />
                ))}
              </div>
              {(activeAlgorithm === 'binarysearch' || activeAlgorithm === 'hashsearch') && (
                <label className="flex items-center gap-2 text-xs text-zinc-500">
                  <span>Buscar</span>
                  <input type="number" value={target} onChange={(event) => { setTarget(event.target.value); setCurrentStepIndex(0); setIsPlaying(false); }} className="h-9 w-16 border border-zinc-200 bg-zinc-50 px-2 text-center font-semibold text-zinc-800 outline-none focus:border-sky-500" />
                </label>
              )}
              <button
                type="button"
                onClick={() => { setArrayInputs(Array.from({ length: 7 }, () => Math.floor(Math.random() * 20))); setCurrentStepIndex(0); setIsPlaying(false); }}
                className="h-9 border border-zinc-200 px-3 text-xs font-semibold text-zinc-600 transition hover:bg-zinc-100"
              >Generar aleatorio</button>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <span className="hidden text-xs tabular-nums text-zinc-400 sm:inline">Paso {Math.min(currentStepIndex + 1, steps.length)} / {steps.length}</span>
              <button
                type="button"
                onClick={togglePlayback}
                aria-label={isPlaying ? 'Pausar animación' : 'Reproducir animación'}
                className={`flex h-10 min-w-[112px] items-center justify-center gap-2 px-4 text-sm font-semibold text-white transition ${isPlaying ? 'bg-zinc-700 hover:bg-zinc-800' : 'bg-sky-600 hover:bg-sky-700'}`}
              >
                <span aria-hidden="true">{isPlaying ? 'Ⅱ' : '▶'}</span>{isPlaying ? 'Pausar' : 'Reproducir'}
              </button>
            </div>
          </div>

          <div className="relative min-h-[350px] flex-1 overflow-hidden bg-[radial-gradient(#d6d9df_0.7px,transparent_0.7px)] [background-size:18px_18px] lg:min-h-0">
            <div className="absolute left-5 top-5 z-[1]">
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-400">{activeInfo.kind}</p>
              <h1 className="mt-1 text-xl font-semibold tracking-tight text-zinc-800">{activeInfo.name}</h1>
            </div>
            <div className="mx-auto h-full min-h-[350px] max-w-5xl px-3 pb-4 pt-16 sm:px-8 lg:min-h-0">
              {currentStep && <AlgorithmCanvas algorithm={activeAlgorithm} step={currentStep} target={target} />}
            </div>
          </div>

          <div className="flex min-h-[122px] shrink-0 items-start gap-4 border-t border-zinc-200 bg-white px-5 py-4 sm:px-7">
            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center border border-sky-200 bg-sky-50 text-xs font-bold text-sky-700">
              {String(currentStepIndex + 1).padStart(2, '0')}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-400">Razonamiento del paso</h2>
                <div className="flex gap-1">
                  <button type="button" aria-label="Paso anterior" disabled={currentStepIndex === 0} onClick={() => { setIsPlaying(false); setCurrentStepIndex((index) => Math.max(0, index - 1)); }} className="h-7 w-8 border border-zinc-200 text-zinc-600 hover:bg-zinc-100 disabled:opacity-30">‹</button>
                  <button type="button" aria-label="Paso siguiente" disabled={currentStepIndex >= steps.length - 1} onClick={() => { setIsPlaying(false); setCurrentStepIndex((index) => Math.min(steps.length - 1, index + 1)); }} className="h-7 w-8 border border-zinc-200 text-zinc-600 hover:bg-zinc-100 disabled:opacity-30">›</button>
                </div>
              </div>
              <motion.p key={`${activeAlgorithm}-${currentStepIndex}`} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="mt-2 max-w-4xl text-sm leading-6 text-zinc-700">
                {currentStep?.explanation}
              </motion.p>
            </div>
          </div>
        </section>

        <aside
          aria-label="Explicación y chat"
          aria-hidden={!isPanelOpen}
          inert={!isPanelOpen}
          className={`grid shrink-0 overflow-hidden border-t border-zinc-200 bg-white transition-[width,opacity] duration-300 lg:h-auto lg:border-l lg:border-t-0 ${isPanelOpen ? 'grid-rows-[auto_1fr] opacity-100 lg:w-[370px]' : 'grid-rows-[0fr_0fr] opacity-0 lg:w-0'}`}
        >
          <div className="w-full min-w-0 border-b border-zinc-200 px-5 pt-5 lg:w-[370px]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-sky-700">Guía del algoritmo</p>
                <h2 className="mt-1 text-lg font-semibold text-zinc-900">{activeInfo.name}</h2>
              </div>
              <label className="sr-only" htmlFor="speaker-select">Personaje de la explicación</label>
              <select id="speaker-select" value={selectedCharacter.name} onChange={(event) => setSelectedCharacter(CHARACTERS.find((character) => character.name === event.target.value))} className="max-w-[145px] border border-zinc-200 bg-zinc-50 px-2 py-2 text-xs font-medium text-zinc-700 outline-none focus:border-sky-500">
                {LLAMA_PERSONALITIES.map(({ name }) => <option key={name} value={name}>{name}</option>)}
              </select>
            </div>
            <div className="mt-4 flex border-b border-zinc-200" role="tablist" aria-label="Contenido del panel">
              {[['overview', 'Explicación'], ['chat', 'Chat libre']].map(([tab, label]) => (
                <button key={tab} role="tab" aria-selected={panelTab === tab} onClick={() => setPanelTab(tab)} className={`border-b-2 px-3 pb-2.5 text-xs font-semibold ${panelTab === tab ? 'border-sky-600 text-sky-700' : 'border-transparent text-zinc-400 hover:text-zinc-700'}`}>{label}</button>
              ))}
            </div>
          </div>

          <div className="min-h-0 overflow-hidden lg:w-[370px]">
            {panelTab === 'overview' ? (
              <div className="h-full overflow-y-auto px-5 py-5">
                <div className="flex items-center gap-3 border-b border-zinc-100 pb-4">
                  <div role="img" aria-label={`Avatar temático de ${selectedCharacter.name}`} className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-xl ${selectedCharacter.tone}`}>{selectedCharacter.avatar}</div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Explica como</p>
                    <p className="mt-0.5 text-sm font-semibold text-zinc-800">{selectedCharacter.name}</p>
                  </div>
                  {overviewLoading && <span className="ml-auto h-4 w-4 animate-spin rounded-full border-2 border-zinc-200 border-t-sky-600" aria-label="Generando explicación" />}
                </div>
                <p className="py-5 text-sm leading-6 text-zinc-600">{overview || activeInfo.summary}</p>
                <div className="border-y border-zinc-200 py-4">
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-400">Complejidad temporal</h3>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <div className="bg-zinc-50 p-3"><p className="text-[10px] text-zinc-400">Promedio</p><p className="mt-1 font-mono text-sm font-semibold text-zinc-800">{activeInfo.complexity}</p></div>
                    <div className="bg-zinc-50 p-3"><p className="text-[10px] text-zinc-400">Peor caso</p><p className="mt-1 font-mono text-sm font-semibold text-zinc-800">{activeInfo.worst}</p></div>
                  </div>
                </div>
                <div className="space-y-4 py-4">
                  <div><h3 className="text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-400">Aplicaciones</h3><p className="mt-1.5 text-sm leading-5 text-zinc-600">{activeInfo.application}</p></div>
                  <div><h3 className="text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-400">Ventaja principal</h3><p className="mt-1.5 text-sm leading-5 text-zinc-600">{activeInfo.benefit}</p></div>
                </div>
                <button onClick={() => setPanelTab('chat')} className="mt-1 w-full border border-sky-200 bg-sky-50 px-3 py-2.5 text-left text-xs font-semibold text-sky-800 transition hover:bg-sky-100">Preguntar una duda a {selectedCharacter.name} <span aria-hidden="true" className="float-right">→</span></button>
              </div>
            ) : (
              <div className="flex h-full min-h-[350px] flex-col">
                <div className="flex items-center gap-3 border-b border-zinc-100 px-5 py-3">
                  <div role="img" aria-label={`Avatar temático de ${selectedCharacter.name}`} className={`flex h-9 w-9 items-center justify-center rounded-full text-lg ${selectedCharacter.tone}`}>{selectedCharacter.avatar}</div>
                  <div><p className="text-xs font-semibold text-zinc-800">Chat con {selectedCharacter.name}</p><p className="mt-0.5 text-[10px] text-zinc-400">Sobre {activeInfo.name}</p></div>
                </div>
                <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4" aria-live="polite">
                  {chatMessages.length === 0 && <p className="mt-5 text-center text-xs leading-5 text-zinc-400">Escribe una pregunta sobre el algoritmo. Llama responderá en el estilo de {selectedCharacter.name}.</p>}
                  {chatMessages.map((message, index) => (
                    <div key={`${message.role}-${index}`} className={`max-w-[90%] px-3 py-2.5 text-xs leading-5 ${message.role === 'user' ? 'ml-auto bg-zinc-900 text-white' : 'border border-zinc-200 bg-zinc-50 text-zinc-700'}`}>
                      <p className="mb-1 text-[9px] font-bold uppercase tracking-wider opacity-60">{message.role === 'user' ? 'Tú' : selectedCharacter.name}</p>{message.content}
                    </div>
                  ))}
                  {chatLoading && <p className="text-xs text-zinc-400">{selectedCharacter.name} está pensando...</p>}
                </div>
                <form onSubmit={sendChatMessage} className="flex gap-2 border-t border-zinc-200 p-3">
                  <input value={chatInput} onChange={(event) => setChatInput(event.target.value)} placeholder="Escribe tu pregunta..." aria-label="Pregunta para el chat" className="min-w-0 flex-1 border border-zinc-200 px-3 py-2 text-xs outline-none focus:border-sky-500" />
                  <button disabled={chatLoading || !chatInput.trim()} aria-label="Enviar pregunta" className="h-9 w-10 bg-sky-600 text-sm text-white transition hover:bg-sky-700 disabled:bg-zinc-300">↑</button>
                </form>
              </div>
            )}
          </div>
        </aside>
      </main>
    </div>
  );
}
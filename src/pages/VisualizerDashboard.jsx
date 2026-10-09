import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import AlgorithmCanvas from '../components/common/AlgorithmCanvas.jsx';
import SpeechControls from '../components/common/SpeechControls.jsx';
import useAlgorithmSimulation from '../hooks/useAlgorithmSimulation.js';
import { fetchAlgorithmOverview, LLAMA_PERSONALITIES } from '../services/llamaService.js';


const ALGORITHMS = [
  { id: 'binarysearch', name: 'Binary search', kind: 'Búsqueda', complexity: 'O(log n)', worst: 'O(log n)', application: 'Colecciones ordenadas y catálogos.', benefit: 'Reduce a la mitad los datos candidatos en cada comparación.', summary: 'Compara el centro y descarta la mitad que no puede contener el objetivo.' },
  { id: 'insertionsort', name: 'Insertion sort', kind: 'Ordenamiento', complexity: 'O(n²)', worst: 'O(n²)', application: 'Listas pequeñas o casi ordenadas.', benefit: 'Simple, estable y eficiente cuando hay pocos cambios.', summary: 'Inserta cada valor en la posición correcta de una sección ordenada.' },
  { id: 'hashsearch', name: 'Hash search', kind: 'Búsqueda', complexity: 'O(1) promedio', worst: 'O(n)', application: 'Índices, cachés y búsquedas por clave.', benefit: 'Acceso promedio constante con una buena distribución.', summary: 'Convierte una clave en una cubeta y resuelve posibles colisiones.' },
  { id: 'quicksort', name: 'Quick sort', kind: 'Ordenamiento', complexity: 'O(n log n)', worst: 'O(n²)', application: 'Ordenar colecciones grandes en memoria.', benefit: 'Muy rápido en promedio y requiere poca memoria adicional.', summary: 'Divide el arreglo alrededor de un pivote y ordena cada parte.' },
];

const CHARACTER_PRESENTATION = {
  Goku: { avatar: '⚡', tone: 'bg-orange-100 text-orange-700' },
  Naruto: { avatar: '🍥', tone: 'bg-amber-100 text-amber-700' },
  Luffy: { avatar: '☠', tone: 'bg-red-100 text-red-700' },
  Batman: { avatar: '🦇', tone: 'bg-zinc-200 text-zinc-800' },
  Spiderman: { avatar: '🕸', tone: 'bg-rose-100 text-rose-700' },
  'Arthur Morgan': { avatar: '🤠', tone: 'bg-stone-200 text-stone-700' },
  Halo: { avatar: '🛡', tone: 'bg-emerald-100 text-emerald-700' },
  'Walter White': { avatar: '⚗', tone: 'bg-lime-100 text-lime-800' },
  'Alex Sintek': { avatar: '♫', tone: 'bg-sky-100 text-sky-700' },
  'Profesor BIHQ': { avatar: '🎓', tone: 'bg-violet-100 text-violet-700' },
  'Samuel Garcia': { avatar: 'S', tone: 'bg-blue-100 text-blue-700' },
};

const CHARACTERS = LLAMA_PERSONALITIES.map(({ name }) => ({
  name,
  ...(CHARACTER_PRESENTATION[name] ?? { avatar: name.charAt(0), tone: 'bg-zinc-200 text-zinc-700' }),
}));

const INITIAL_VALUES = [8, 3, 1, 7, 0, 10, 2];

export default function VisualizerDashboard() {
  const [activeAlgorithm, setActiveAlgorithm] = useState('quicksort');
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [arrayInputs, setArrayInputs] = useState(INITIAL_VALUES);
  const [target, setTarget] = useState('7');
  const [selectedCharacter, setSelectedCharacter] = useState(
    CHARACTERS.find((character) => character.name === 'Profesor BIHQ') ?? CHARACTERS[0],
  );
  const [overviewResult, setOverviewResult] = useState(null);
  const [overviewRequestVersion, setOverviewRequestVersion] = useState(0);
  const [explanationTab, setExplanationTab] = useState('step');
  const activeInfo = ALGORITHMS.find((algorithm) => algorithm.id === activeAlgorithm);
  const overviewRequestKey = `${activeInfo.id}:${selectedCharacter.name}`;
  const overview = overviewResult?.key === overviewRequestKey && overviewResult?.requestVersion === overviewRequestVersion ? overviewResult.text : '';
  const overviewLoading = overviewResult?.key !== overviewRequestKey || overviewResult?.requestVersion !== overviewRequestVersion;
  const { steps, currentStepIndex, currentStep, setCurrentStepIndex } = useAlgorithmSimulation(activeAlgorithm, arrayInputs, target);
  const comparisons = steps.slice(0, currentStepIndex + 1).filter((step) => step.comparingIndices?.length).length;
  const movements = steps.slice(0, currentStepIndex + 1).filter((step) => step.swappedIndices?.length).length;
  const isComplete = currentStepIndex === steps.length - 1;
  const stepTitle = currentStep?.status === 'found' ? 'Elemento encontrado' :
    currentStep?.status === 'missing' ? 'Búsqueda finalizada' :
      currentStep?.status === 'invalid' ? 'Objetivo no válido' :
      isComplete ? 'Algoritmo completado' :
        currentStepIndex === 0 ? 'Inicio' : 'En progreso';
  const visualGuide = activeAlgorithm === 'quicksort'
    ? [['bg-cyan-600', 'Pivote'], ['bg-rose-600', 'Comparación'], ['bg-emerald-600', 'En orden'], ['bg-indigo-600', 'Pendiente']]
    : activeAlgorithm === 'insertionsort'
      ? [['bg-cyan-600', 'KEY · elemento seleccionado'], ['bg-rose-600', 'Comparación'], ['bg-emerald-600', 'Zona ordenada'], ['bg-indigo-600', 'Pendiente']]
      : [['bg-rose-600', 'Comparación'], ['bg-emerald-600', 'Encontrado'], ['bg-zinc-300', 'Descartado'], ['bg-indigo-600', 'Pendiente']];

  useEffect(() => {
    let isCurrentRequest = true;
    fetchAlgorithmOverview(activeInfo.name, selectedCharacter.name)
      .then((text) => { if (isCurrentRequest) setOverviewResult({ key: overviewRequestKey, requestVersion: overviewRequestVersion, text, error: false }); })
      .catch(() => { if (isCurrentRequest) setOverviewResult({ key: overviewRequestKey, requestVersion: overviewRequestVersion, text: `${activeInfo.summary} La API de Llama no respondió. Comprueba que Ollama y el backend estén activos e inténtalo de nuevo.`, error: true }); });
    return () => { isCurrentRequest = false; };
  }, [activeInfo, overviewRequestKey, overviewRequestVersion, selectedCharacter]);

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

  return (
    <div className="flex min-h-screen flex-col bg-[#f3f4f6] text-zinc-900 lg:h-screen lg:overflow-hidden">
      <header className="z-10 flex min-h-[76px] flex-col gap-3 border-b border-zinc-200 bg-white px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-center gap-5">
          <a className="flex shrink-0 items-center gap-2.5" href="#inicio" aria-label="AlgoVis inicio">
            <span className="grid h-8 w-8 grid-cols-2 gap-1 rounded-md bg-zinc-900 p-1.5">
              <i className="rounded-[2px] bg-white" /><i className="rounded-[2px] bg-sky-400" />
              <i className="rounded-[2px] bg-white" /><i className="rounded-[2px] bg-white" />
            </span>
            <span className="text-sm font-bold tracking-wide">BIHQLAB</span>
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
                aria-label="Paso anterior"
                disabled={currentStepIndex === 0}
                onClick={() => { setIsPlaying(false); setCurrentStepIndex((index) => Math.max(0, index - 1)); }}
                className="flex h-10 items-center gap-2 border border-sky-200 bg-sky-50 px-3 text-xs font-bold text-sky-800 transition hover:border-sky-400 hover:bg-sky-100 disabled:cursor-not-allowed disabled:opacity-40"
              ><span aria-hidden="true" className="text-lg leading-none">‹</span><span className="hidden sm:inline">Anterior</span></button>
              <button
                type="button"
                onClick={togglePlayback}
                aria-label={isPlaying ? 'Pausar animación' : 'Reproducir animación'}
                className={`flex h-10 min-w-[112px] items-center justify-center gap-2 px-4 text-sm font-semibold text-white transition ${isPlaying ? 'bg-zinc-700 hover:bg-zinc-800' : 'bg-sky-600 hover:bg-sky-700'}`}
              >
                <span aria-hidden="true">{isPlaying ? 'Ⅱ' : '▶'}</span>{isPlaying ? 'Pausar' : 'Reproducir'}
              </button>
              <button
                type="button"
                aria-label="Paso siguiente"
                disabled={currentStepIndex >= steps.length - 1}
                onClick={() => { setIsPlaying(false); setCurrentStepIndex((index) => Math.min(steps.length - 1, index + 1)); }}
                className="flex h-10 items-center gap-2 border border-sky-600 bg-sky-600 px-3 text-xs font-bold text-white shadow-sm transition hover:border-sky-700 hover:bg-sky-700 disabled:cursor-not-allowed disabled:border-zinc-200 disabled:bg-zinc-100 disabled:text-zinc-400 disabled:shadow-none"
              ><span className="hidden sm:inline">Siguiente</span><span aria-hidden="true" className="text-lg leading-none">›</span></button>
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

        </section>

        <aside
          aria-label="Panel del algoritmo"
          aria-hidden={!isPanelOpen}
          inert={!isPanelOpen}
          className={`grid shrink-0 overflow-hidden border-t border-zinc-200 bg-white transition-[width,opacity] duration-300 lg:h-auto lg:border-l lg:border-t-0 ${isPanelOpen ? 'grid-rows-[auto_1fr] opacity-100 lg:w-[370px]' : 'grid-rows-[0fr_0fr] opacity-0 lg:w-0'}`}
        >
          <div className="w-full min-w-0 border-b border-zinc-200 px-5 py-4 lg:w-[370px]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-sky-700">Laboratorio de algoritmos</p>
              </div>
            </div>
          </div>

          <div className="min-h-0 overflow-y-auto px-5 py-4 lg:w-[370px]">
            <section className="border-b border-zinc-200 pb-4" aria-label="Explicación del algoritmo">
              <div className="flex items-center justify-between gap-2 border-b border-zinc-200">
                <div className="flex gap-1" role="tablist" aria-label="Tipo de explicación">
                  <button type="button" role="tab" aria-selected={explanationTab === 'step'} onClick={() => setExplanationTab('step')} className={`border-b-1 px-3 py-2.5 text-[10px] font-semibold transition-colors ${explanationTab === 'step' ? 'border-sky-600 text-sky-700' : 'border-transparent text-zinc-500 hover:text-zinc-800'}`}>Paso a paso</button>
                  <button type="button" role="tab" aria-selected={explanationTab === 'llama'} onClick={() => setExplanationTab('llama')} className={`border-b-1 px-3 py-2.5 text-[10px] font-semibold transition-colors ${explanationTab === 'llama' ? 'border-sky-600 text-sky-700' : 'border-transparent text-zinc-500 hover:text-zinc-800'}`}>Descripción Llama</button>
                </div>
              </div>

              {explanationTab === 'step' ? (
                <motion.div
                  key={`${activeAlgorithm}-${currentStepIndex}`}
                  initial={{ borderColor: '#0284c7', boxShadow: '0 0 0 3px rgba(14, 165, 233, 0.18)' }}
                  animate={{ borderColor: '#e4e4e7', boxShadow: '0 0 0 0 rgba(14, 165, 233, 0)' }}
                  transition={{ duration: 0.9, ease: 'easeOut' }}
                  className="mt-3 rounded-sm border bg-white p-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-400">Paso {currentStepIndex + 1} de {steps.length}</span>
                    <span className={`h-2 w-2 rounded-full ${isPlaying ? 'animate-pulse bg-emerald-500' : isComplete ? 'bg-sky-500' : 'bg-zinc-300'}`} />
                  </div>
                  <h3 className="mt-2 text-base font-semibold text-zinc-900">{stepTitle}</h3>
                  <p className="mt-1.5 text-xs leading-5 text-zinc-600">{currentStep?.explanation}</p>
                </motion.div>
              ) : (
                <div className="pt-3">
                  <div className="flex items-center gap-3">
                    <div role="img" aria-label={`Avatar temático de ${selectedCharacter.name}`} className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-lg ${selectedCharacter.tone}`}>{selectedCharacter.avatar}</div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Estilo del personaje</p>
                      <label className="sr-only" htmlFor="speaker-select">Personaje de la descripción</label>
                      <select id="speaker-select" value={selectedCharacter.name} onChange={(event) => setSelectedCharacter(CHARACTERS.find((character) => character.name === event.target.value))} className="mt-1 max-w-full border border-zinc-200 bg-zinc-50 px-2 py-1.5 text-xs font-medium text-zinc-700 outline-none focus:border-sky-500">
                        {LLAMA_PERSONALITIES.map(({ name }) => <option key={name} value={name}>{name}</option>)}
                      </select>
                    </div>
                    {overviewLoading && <span className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-zinc-200 border-t-sky-600" aria-label="Generando descripción" />}
                  </div>
                  <button
                    type="button"
                    disabled={overviewLoading}
                    onClick={() => setOverviewRequestVersion((version) => version + 1)}
                    className="mt-3 border border-sky-200 bg-sky-50 px-2.5 py-1.5 text-[11px] font-semibold text-sky-800 transition hover:border-sky-400 hover:bg-sky-100 disabled:cursor-wait disabled:opacity-50"
                  >{overviewResult?.error && overviewResult.key === overviewRequestKey ? 'Reintentar descripción' : 'Generar de nuevo'}</button>
                  <div aria-live="polite" className={`mt-3 whitespace-pre-line text-xs leading-6 ${overviewResult?.error && overviewResult.key === overviewRequestKey ? 'text-rose-700' : 'text-zinc-600'}`}>{overview || activeInfo.summary}</div>
                  <SpeechControls key={`${overviewRequestKey}:${overviewRequestVersion}`} text={overview} />
                  <div className="mt-3 space-y-2 border-t border-zinc-100 pt-3">
                    <div><h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Aplicaciones</h4><p className="mt-1 text-xs leading-5 text-zinc-600">{activeInfo.application}</p></div>
                    <div><h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Ventaja principal</h4><p className="mt-1 text-xs leading-5 text-zinc-600">{activeInfo.benefit}</p></div>
                  </div>
                </div>
              )}
            </section>

            <section className="border-b border-zinc-200 py-4" aria-label="Estadísticas del algoritmo">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-400">Actividad y complejidad</h3>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {[
                  ['Comparaciones', comparisons],
                  ['Movimientos', movements],
                  ['Elementos', currentStep?.array?.length ?? 0],
                  ['Promedio', activeInfo.complexity],
                ].map(([label, value]) => (
                  <div key={label} className="min-h-[76px] border border-zinc-200 bg-zinc-50 p-3">
                    <p className="text-[11px] font-medium text-zinc-500">{label}</p>
                    <p className="mt-1 font-mono text-lg font-bold text-zinc-900">{value}</p>
                  </div>
                ))}
              </div>
              <p className="mt-2 text-[10px] text-zinc-400">Peor caso: <span className="font-mono font-semibold text-zinc-600">{activeInfo.worst}</span></p>
            </section>

            <section className="border-b border-zinc-200 py-4" aria-label="Guía visual de colores">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-400">Guía visual</h3>
              <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2">
                {visualGuide.map(([color, label]) => (
                  <span key={label} className="inline-flex min-w-0 items-center gap-2 text-[11px] text-zinc-600">
                    <span className={`h-2.5 w-2.5 shrink-0 rounded-sm ${color}`} />{label}
                  </span>
                ))}
              </div>
            </section>

          </div>
        </aside>
      </main>
    </div>
  );
}
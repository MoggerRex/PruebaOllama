import { useLayoutEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import SpeechControls from './SpeechControls.jsx';  

export default function QuickSortTree({ currentStep, algorithmOverview }) {
  const visualizerColumnRef = useRef(null);
  const [visualizerHeight, setVisualizerHeight] = useState(null);

  useLayoutEffect(() => {
    const visualizerColumn = visualizerColumnRef.current;
    if (!visualizerColumn) return;

    const resizeObserver = new ResizeObserver(() => {
      setVisualizerHeight(visualizerColumn.getBoundingClientRect().height);
    });

    resizeObserver.observe(visualizerColumn);
    return () => resizeObserver.disconnect();
  }, [currentStep]);

  if (!currentStep) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>
        Ingresa tus 7 números arriba y haz clic en "Iniciar Quicksort".
      </div>
    );
  }

  const { array, pivotIndex, comparingIndices = [], swappedIndices = [], explanation } = currentStep;
  // Si algún paso no trae ids, usa la posición como respaldo
  const ids = currentStep.ids ?? array.map((_, i) => i);

  const maxVal = Math.max(...array, 1)

  const getBarColor = (index) => {
    if (index === pivotIndex) return '#ec4899';             // Rosa: Pivote
    if (swappedIndices.includes(index)) return '#ef4444';   // Rojo: Intercambiado
    if (comparingIndices.includes(index)) return '#f59e0b'; // Amarillo: Comparando
    return '#3b82f6';                                       // Azul: Normal
  };

  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.25rem', width: '100%' }}>
      <div ref={visualizerColumnRef} style={{ flex: '1.6', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
{/* Contenedor Gráfico de Barras */}
<div style={{
  display: 'flex',
  alignItems: 'flex-end',
  justifyContent: 'center',
  gap: '12px',
  height: '200px',
  width: '100%',
  borderBottom: '2px solid #4b5563',
  paddingBottom: '8px'
}}>
  {array.map((value, idx) => {
    const barHeight = Math.max((value / maxVal) * 160, 24);
    const isPivot = idx === pivotIndex;
    const isSwapped = swappedIndices.includes(idx);

    return (
      <motion.div
        key={ids[idx]}               // identidad estable: la barra "viaja" al intercambiarse
        layout="position"            // anima solo el movimiento horizontal
        initial={{ height: 0, opacity: 0 }}
        animate={{
          height: barHeight,         // crece / decrece
          opacity: 1,
          backgroundColor: getBarColor(idx),
          scale: isPivot ? 1.08 : 1,
          y: isSwapped ? -10 : 0     // pequeño salto al intercambiarse
        }}
        exit={{ height: 0, opacity: 0 }}
        transition={{
          layout: { type: 'spring', stiffness: 260, damping: 26 },
          height: { type: 'spring', stiffness: 200, damping: 20 },
          backgroundColor: { duration: 0.3 },
          scale: { type: 'spring', stiffness: 300, damping: 18 },
          y: { type: 'spring', stiffness: 400, damping: 15 }
        }}
        style={{
          width: '45px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          alignItems: 'center',
          color: 'white',
          fontWeight: 'bold',
          borderRadius: '4px 4px 0 0',
          paddingBottom: '4px',
          overflow: 'hidden'
        }}
      >
        <span style={{ fontSize: '12px' }}>{value}</span>
      </motion.div>
    );
  })}
</div>

        {/* Leyenda de colores */}
        <div style={{ display: 'flex', gap: '15px', fontSize: '12px', color: '#e5e7eb', flexWrap: 'wrap', justifyContent: 'center' }}>
          <span><strong style={{ color: '#ec4899' }}>■</strong> Pivote</span>
          <span><strong style={{ color: '#f59e0b' }}>■</strong> Comparando</span>
          <span><strong style={{ color: '#ef4444' }}>■</strong> Intercambiado</span>
          <span><strong style={{ color: '#3b82f6' }}>■</strong> Normal</span>
        </div>

        {/* Contenedor del Paso del Algoritmo */}
        <div style={{
          backgroundColor: '#ffffff',
          padding: '1rem',
          borderRadius: '8px',
          textAlign: 'center',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          width: '100%',
          maxWidth: '550px'
        }}>
          <h4 style={{ margin: '0 0 6px 0', color: '#1f2937', fontSize: '16px' }}>
            Paso {currentStep.stepIndex}
          </h4>
          <p style={{ margin: 0, color: '#4b5563', fontSize: '14px', lineHeight: '1.4' }}>
            {explanation}
          </p>
        </div>
      </div>

      {/* Panel de aportación de la IA a la derecha */}
      <div style={{
        flex: '0.95',
        minWidth: '260px',
        minHeight: 0,
        maxWidth: '360px',
        height: visualizerHeight === null ? undefined : `${visualizerHeight}px`,
        boxSizing: 'border-box',
        overflowY: 'auto',
        backgroundColor: '#0f172a',
        border: '1px solid #3b82f6',
        borderRadius: '12px',
        padding: '1rem',
        color: '#e2e8f0',
        boxShadow: '0 6px 20px rgba(0,0,0,0.18)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
          <span style={{ fontSize: '18px' }}>🤖</span>
          <strong style={{ color: '#60a5fa', fontSize: '14px' }}>Aportación del chat</strong>
        </div>

        {algorithmOverview ? (
          <>
            <p style={{ margin: 0, lineHeight: '1.6', fontSize: '13px', whiteSpace: 'pre-wrap' }}>
              {algorithmOverview}
            </p>
            <SpeechControls text={algorithmOverview} />
          </>
        ) : (
          <p style={{ margin: 0, color: '#94a3b8', lineHeight: '1.6', fontSize: '13px' }}>
            La explicación general de Quick Sort aparecerá aquí.
          </p>
        )}
      </div>
    </div>
  );
}
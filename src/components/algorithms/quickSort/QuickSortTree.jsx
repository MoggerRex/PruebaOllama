import { useLayoutEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion'; 

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
      <div className="text-center p-8 text-gray-400">
        Ingresa tus 7 números arriba y haz clic en "Iniciar Quicksort".
      </div>
    );
  }

  const { array, pivotIndex, comparingIndices = [], swappedIndices = [], explanation } = currentStep;

  // Determinar valor máximo para escalar la altura de las barras
  const maxVal = Math.max(...array, 1);

  // Reemplazamos los códigos hexadecimales por clases de fondo de Tailwind
  const getBarColorClass = (index) => {
    if (index === pivotIndex) return 'bg-pink-500';             // Rosa: Pivote
    if (swappedIndices.includes(index)) return 'bg-red-500';    // Rojo: Intercambiado
    if (comparingIndices.includes(index)) return 'bg-amber-500';// Amarillo: Comparando
    return 'bg-blue-500';                                       // Azul: Normal
  };

  return (
    <div className="flex items-start gap-5 w-full">
      
      {/* SECCIÓN IZQUIERDA: Gráfica y Explicación del Paso */}
      <div ref={visualizerColumnRef} className="flex-[1.6] flex flex-col items-center gap-6">
        
        {/* Contenedor Gráfico de Barras */}
        <div className="flex items-end justify-center gap-3 h-52 w-full border-b-2 border-slate-600 pb-2">
          {array.map((value, idx) => {
            const barHeight = Math.max((value / maxVal) * 160, 24);
            return (
              // Reemplazamos <div> por <motion.div> con la propiedad "layout"
              <motion.div
                layout
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                key={value} // El key debe ser el valor para que Framer Motion detecte el movimiento horizontal
                style={{ height: `${barHeight}px` }}
                className={`w-11 flex flex-col justify-end items-center text-white font-bold rounded-t-md pb-1 ${getBarColorClass(idx)}`}
              >
                <span className="text-xs">{value}</span>
              </motion.div>
            );
          })}
        </div>

        {/* Leyenda de colores */}
        <div className="flex gap-4 text-xs text-gray-200 flex-wrap justify-center">
          <span><strong className="text-pink-500">■</strong> Pivote</span>
          <span><strong className="text-amber-500">■</strong> Comparando</span>
          <span><strong className="text-red-500">■</strong> Intercambiado</span>
          <span><strong className="text-blue-500">■</strong> Normal</span>
        </div>

        {/* Contenedor del Paso del Algoritmo */}
        <div className="bg-slate-800 p-4 rounded-lg text-center shadow-md w-full max-w-lg">
          <h4 className="m-0 mb-1 text-slate-100 text-base font-semibold">
            Paso {currentStep.stepIndex}
          </h4>
          <p className="m-0 text-slate-300 text-sm leading-relaxed">
            {explanation}
          </p>
        </div>
      </div>

      {/* SECCIÓN DERECHA: Panel de aportación de la IA */}
      {/* Nota: En el paso 2 moveremos este panel hacia afuera (App.jsx), pero por ahora lo adaptamos a Tailwind */}
      <div 
        className="flex-[0.95] min-w-[260px] max-w-[360px] overflow-y-auto bg-slate-900 border border-blue-500 rounded-xl p-4 text-slate-200 shadow-xl"
        style={{ height: visualizerHeight === null ? undefined : `${visualizerHeight}px` }}
      >
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">🤖</span>
          <strong className="text-blue-400 text-sm">Aportación del chat</strong>
        </div>

        {algorithmOverview ? (
          <p className="m-0 leading-relaxed text-sm whitespace-pre-wrap">
            {algorithmOverview}
          </p>
        ) : (
          <p className="m-0 text-slate-400 leading-relaxed text-sm">
            La explicación general de Quick Sort aparecerá aquí.
          </p>
        )}
      </div>
    </div>
  );
}
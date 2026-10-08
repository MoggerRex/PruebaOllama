import { motion } from 'framer-motion';

function BarArray({ step, algorithm, target }) {
  const { array, comparingIndices = [], swappedIndices = [], activeIndices = [], pivotIndex } = step;
  const maxValue = Math.max(...array.map((value) => Math.abs(value)), 1);
  const isSearch = algorithm === 'binarysearch';

  return (
    <div className="flex min-h-[250px] w-full items-end justify-center gap-2 border-b border-zinc-300 px-2 pb-3 sm:gap-4">
      {array.map((value, index) => {
        const height = 36 + (Math.abs(value) / maxValue) * 145;
        const isOutsideRange = isSearch && (index < step.low || index > step.high);
        const color = activeIndices.includes(index) ? 'bg-emerald-500' :
          swappedIndices.includes(index) ? 'bg-blue-600' :
            comparingIndices.includes(index) ? 'bg-amber-500' :
              index === pivotIndex ? 'bg-sky-500' :
                isOutsideRange ? 'bg-zinc-200' : 'bg-zinc-500';

        return (
          <motion.div
            key={`${index}-${algorithm}`}
            layout
            initial={{ height: 0, opacity: 0.4 }}
            animate={{ height, opacity: isOutsideRange ? 0.45 : 1 }}
            transition={{ type: 'spring', stiffness: 250, damping: 24 }}
            className={`relative flex w-9 max-w-[12vw] shrink items-end justify-center rounded-t-sm pb-2 text-xs font-semibold text-white sm:w-12 ${color}`}
            aria-label={`Índice ${index}, valor ${value}`}
          >
            <span className="absolute -bottom-7 text-[11px] font-normal text-zinc-400">{index}</span>
            {value}
            {algorithm === 'binarysearch' && index === step.middle && (
              <span className="absolute -top-6 whitespace-nowrap text-[10px] font-semibold text-sky-700">medio</span>
            )}
            {target !== '' && value === Number(target) && algorithm !== 'quicksort' && algorithm !== 'insertionsort' && (
              <span className="absolute -top-10 whitespace-nowrap text-[10px] font-semibold text-zinc-500">objetivo</span>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}

function HashBuckets({ step }) {
  return (
    <div className="grid w-full max-w-2xl grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
      {(step.buckets ?? []).map((bucket, index) => (
        <motion.div
          layout
          key={index}
          className={`min-h-20 border p-3 transition-colors ${step.activeBucket === index ? 'border-sky-500 bg-sky-50' : 'border-zinc-200 bg-white'}`}
        >
          <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Cubeta {index}</span>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {bucket.length ? bucket.map((value, itemIndex) => (
              <motion.span
                layout
                key={`${value}-${itemIndex}`}
                initial={{ scale: 0.75, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={`min-w-7 rounded-sm px-2 py-1 text-center text-xs font-semibold ${step.activeBucket === index && step.activeChainIndex === itemIndex ? 'bg-emerald-500 text-white' : 'bg-zinc-100 text-zinc-700'}`}
              >{value}</motion.span>
            )) : <span className="text-xs text-zinc-300">vacía</span>}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export default function AlgorithmCanvas({ algorithm, step, target }) {
  const legend = algorithm === 'quicksort'
    ? [['bg-sky-500', 'Pivote'], ['bg-amber-500', 'Comparación'], ['bg-blue-600', 'Intercambio']]
    : algorithm === 'insertionsort'
      ? [['bg-amber-500', 'Actual'], ['bg-blue-600', 'Desplazamiento'], ['bg-emerald-500', 'Insertado']]
      : [['bg-amber-500', 'Comparación'], ['bg-emerald-500', 'Encontrado'], ['bg-zinc-200', 'Descartado']];

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-8 px-4 py-8 sm:px-8">
      {algorithm === 'hashsearch' ? <HashBuckets step={step} /> : <BarArray step={step} algorithm={algorithm} target={target} />}
      <div className="flex flex-wrap justify-center gap-x-5 gap-y-2">
        {legend.map(([color, label]) => (
          <span key={label} className="inline-flex items-center gap-2 text-[11px] text-zinc-500">
            <span className={`h-2.5 w-2.5 rounded-sm ${color}`} />{label}
          </span>
        ))}
      </div>
    </div>
  );
}
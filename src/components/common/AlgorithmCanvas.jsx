import { motion } from 'framer-motion';

function BarArray({ step, algorithm, target }) {
  const { array, itemIds = [], comparingIndices = [], swappedIndices = [], activeIndices = [], pivotIndex } = step;
  const maxValue = Math.max(...array.map((value) => Math.abs(value)), 1);
  const isSearch = algorithm === 'binarysearch';

  return (
    <div className="flex min-h-[250px] w-full items-end justify-center gap-2 border-b border-zinc-300 px-2 pb-2 sm:gap-4">
      {array.map((value, index) => {
        const height = 36 + (Math.abs(value) / maxValue) * 145;
        const isOutsideRange = isSearch && (index < step.low || index > step.high);
        const isActive = activeIndices.includes(index);
        const isComparing = comparingIndices.includes(index);
        const isShifted = swappedIndices.includes(index);
        const isSorted = algorithm === 'insertionsort' && index <= (step.sortedThrough ?? -1);
        const isQuickSorted = algorithm === 'quicksort' && (step.sortedIndices ?? []).includes(index);
        const isKey = algorithm === 'insertionsort' && isActive;
        const isPivot = algorithm === 'quicksort' && index === pivotIndex;
        const colors = isKey || isPivot ? ['#67e8f9', '#0891b2'] :
          isComparing || isShifted ? ['#fb7185', '#e11d48'] :
            isSorted || isQuickSorted || (algorithm === 'binarysearch' && isActive) ? ['#6ee7b7', '#059669'] :
              isOutsideRange ? ['#d4d4d8', '#a1a1aa'] : ['#a5b4fc', '#4f46e5'];
        const lift = isComparing || isShifted || isPivot ? -14 : 0;

        return (
          <motion.div
            key={itemIds[index] ?? `${algorithm}-${index}`}
            layout
            initial={{ height: 0, opacity: 0.4 }}
            animate={{
              height,
              opacity: isOutsideRange ? 0.45 : 1,
              scale: isKey || isPivot ? 1.05 : 1,
              y: lift,
            }}
            transition={{
              layout: { type: 'spring', stiffness: 220, damping: 22 },
              height: { type: 'spring', stiffness: 250, damping: 24 },
              scale: { duration: 0.2 },
              y: { type: 'spring', stiffness: 360, damping: 22 },
            }}
            style={{
              background: `linear-gradient(180deg, ${colors[0]}, ${colors[1]})`,
              boxShadow: `0 0 18px ${isKey || isPivot ? 'rgba(34, 211, 238, 0.45)' : isComparing || isShifted ? 'rgba(244, 63, 94, 0.4)' : isSorted ? 'rgba(16, 185, 129, 0.3)' : 'rgba(99, 102, 241, 0.24)'}`,
            }}
            className="relative flex w-9 max-w-[12vw] shrink items-end justify-center rounded-t-sm pb-2 text-xs font-semibold text-white sm:w-12"
            aria-label={`Índice ${index}, valor ${value}`}
          >
            <span className="absolute -bottom-10 text-[11px] font-normal text-zinc-400">{index}</span>
            {(isKey || isPivot) && (
              <span className="absolute -top-6 left-1/2 -translate-x-1/2 rounded-sm border border-cyan-300/50 bg-cyan-950/90 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wide text-cyan-100 shadow-[0_0_12px_rgba(34,211,238,0.35)]">
                {isPivot ? 'Pivote' : 'Key'}
              </span>
            )}
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

function BinarySearchCells({ step, target }) {
  const { array, low, high, middle, status } = step;

  return (
    <div className="w-full max-w-4xl px-1 sm:px-4">
      <p className="mb-7 text-center text-sm font-medium text-zinc-500">Búsqueda de <span className="font-semibold text-zinc-800">{target}</span></p>
      <div className="overflow-x-auto pb-8">
        <div className="flex min-w-max justify-center gap-px px-4 pt-6">
          {array.map((value, index) => {
            const isDiscarded = index < low || index > high;
            const isMiddle = index === middle;
            const isFound = status === 'found' && isMiddle;
            const cellStyle = isDiscarded
              ? 'border-zinc-300 bg-zinc-200 text-zinc-400'
              : isFound
                ? 'border-emerald-700 bg-emerald-600 text-white'
                : isMiddle
                  ? 'border-rose-700 bg-rose-600 text-white'
                  : 'border-zinc-300 bg-white text-zinc-800';

            return (
              <motion.div
                key={`${value}-${index}`}
                layout
                animate={{ opacity: isDiscarded ? 0.55 : 1, y: isMiddle && !isDiscarded ? -4 : 0 }}
                transition={{ type: 'spring', stiffness: 240, damping: 22 }}
                className={`relative flex h-12 w-12 shrink-0 items-center justify-center border text-sm font-semibold sm:h-14 sm:w-16 sm:text-base ${cellStyle}`}
                aria-label={`Índice ${index}, valor ${value}${isDiscarded ? ', descartado' : isMiddle ? ', centro' : ''}`}
              >
                {index === low && low <= high && <span className="absolute -top-6 text-[10px] font-black uppercase text-sky-700">L</span>}
                {index === high && low <= high && <span className="absolute -top-6 text-[10px] font-black uppercase text-sky-700">H</span>}
                {value}
              </motion.div>
            );
          })}
        </div>
      </div>
      <div className="flex justify-center gap-5 text-[11px] font-medium text-zinc-500">
        <span className="inline-flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-sm bg-rose-600" />Comparación</span>
        <span className="inline-flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-sm bg-zinc-300" />Descartado</span>
        <span className="inline-flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-sm bg-emerald-600" />Encontrado</span>
      </div>
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
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-8 px-4 py-8 sm:px-8">
      {algorithm === 'hashsearch'
        ? <HashBuckets step={step} />
        : algorithm === 'binarysearch'
          ? <BinarySearchCells step={step} target={target} />
          : <BarArray step={step} algorithm={algorithm} target={target} />}
    </div>
  );
}
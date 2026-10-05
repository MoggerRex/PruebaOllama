export default function QuickSortTree({ steps = [], currentStep = 0 }) {
  const step = steps[currentStep];

  return (
    <div className="quick-sort-tree" aria-live="polite">
      {step ? <p>{step.description}</p> : <p>Árbol de particiones de Quicksort</p>}
    </div>
  );
}
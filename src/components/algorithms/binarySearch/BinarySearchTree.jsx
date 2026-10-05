export default function BinarySearchTree({ steps = [], currentStep = 0 }) {
  const step = steps[currentStep];

  return (
    <div className="binary-search-tree" aria-live="polite">
      {step ? <p>{step.description}</p> : <p>Visualización de búsqueda binaria</p>}
    </div>
  );
}
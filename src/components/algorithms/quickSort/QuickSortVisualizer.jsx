import React from 'react';
import QuickSortTree from './QuickSortTree.jsx';
import useQuickSortLogic from './useQuickSortLogic.js';

export default function QuickSortVisualizer() {
  const {
    steps,
    currentStep,
    currentStepIndex,
    loading,
    error,
    loadQuickSortSteps,
    nextStep,
    prevStep
  } = useQuickSortLogic();

  return (
    <section style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>Visualizador de Quicksort con Llama 3.2 3B</h2>

      {/* Botón para llamar a Llama */}
      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={() => loadQuickSortSteps([8, 3, 1, 7, 0, 10, 2])}
          disabled={loading}
          style={{
            padding: '10px 20px',
            backgroundColor: loading ? '#9ca3af' : '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Generando pasos con Llama...' : 'Cargar Quicksort con Llama'}
        </button>
      </div>

      {error && <div style={{ color: 'red', marginBottom: '15px' }}>{error}</div>}

      {/* Componente de Visualización */}
      <QuickSortTree currentStep={currentStep} />

      {/* Barra de Controles de Reproducción */}
      {steps.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '20px' }}>
          <button
            onClick={prevStep}
            disabled={currentStepIndex === 0}
            style={{ padding: '8px 16px', cursor: currentStepIndex === 0 ? 'not-allowed' : 'pointer' }}
          >
            ◀ Anterior
          </button>
          
          <span style={{ alignSelf: 'center', fontWeight: 'bold' }}>
            {currentStepIndex + 1} / {steps.length}
          </span>

          <button
            onClick={nextStep}
            disabled={currentStepIndex === steps.length - 1}
            style={{ padding: '8px 16px', cursor: currentStepIndex === steps.length - 1 ? 'not-allowed' : 'pointer' }}
          >
            Siguiente ▶
          </button>
        </div>
      )}
    </section>
  );
}
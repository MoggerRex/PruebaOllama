import React, { useState } from 'react';
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

  // Estado para gestionar los 7 valores ingresados por el usuario
  const [inputNumbers, setInputNumbers] = useState([8, 3, 1, 7, 0, 10, 2]);

  const handleInputChange = (index, value) => {
    const updated = [...inputNumbers];
    updated[index] = value === '' ? '' : Number(value);
    setInputNumbers(updated);
  };

  const handleStartSimulation = (e) => {
    e.preventDefault();
    // Reemplaza valores vacíos o no numéricos por 0
    const cleanNumbers = inputNumbers.map((num) => (isNaN(num) || num === '' ? 0 : Number(num)));
    loadQuickSortSteps(cleanNumbers);
  };

  const handleRandomize = () => {
    const randomArray = Array.from({ length: 7 }, () => Math.floor(Math.random() * 20));
    setInputNumbers(randomArray);
    loadQuickSortSteps(randomArray);
  };

  return (
    <section style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>Visualizador de Quicksort Interactivo</h2>

      {/* Formulario de Entrada de Datos */}
      <form onSubmit={handleStartSimulation} style={{ marginBottom: '25px', textAlign: 'center' }}>
        <p style={{ fontWeight: '500', marginBottom: '10px' }}>Ingresa los 7 números a ordenar:</p>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '15px' }}>
          {inputNumbers.map((num, idx) => (
            <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <label style={{ fontSize: '12px', color: '#6b7280', marginBottom: '2px' }}>n{idx + 1}</label>
              <input
                type="number"
                value={num}
                onChange={(e) => handleInputChange(idx, e.target.value)}
                style={{
                  width: '50px',
                  padding: '8px',
                  textAlign: 'center',
                  fontSize: '14px',
                  borderRadius: '6px',
                  border: '1px solid #ccc'
                }}
              />
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '10px 20px',
              backgroundColor: loading ? '#9ca3af' : '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Procesando...' : 'Iniciar Quicksort'}
          </button>

          <button
            type="button"
            onClick={handleRandomize}
            disabled={loading}
            style={{
              padding: '10px 16px',
              backgroundColor: '#4b5563',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            Aleatorios
          </button>
        </div>
      </form>

      {error && <div style={{ color: 'red', textAlign: 'center', marginBottom: '15px' }}>{error}</div>}

      {/* Visualización en Barras */}
      <QuickSortTree currentStep={currentStep} />

      {/* Controles de Reproducción Paso a Paso */}
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
            Paso {currentStepIndex + 1} de {steps.length}
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
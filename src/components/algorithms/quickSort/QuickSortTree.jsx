import React from 'react';

export default function QuickSortTree({ currentStep }) {
  if (!currentStep) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
        Presiona "Cargar Quicksort con Llama" para iniciar la simulación.
      </div>
    );
  }

  const { array, pivotIndex, comparingIndices = [], swappedIndices = [], explanation } = currentStep;

  // Asigna colores según el estado que reportó Llama en el paso
  const getBarColor = (index) => {
    if (index === pivotIndex) return '#ec4899';             // Rosa: Pivote
    if (swappedIndices.includes(index)) return '#ef4444';   // Rojo: Intercambiado
    if (comparingIndices.includes(index)) return '#f59e0b'; // Amarillo: Comparando
    return '#3b82f6';                                       // Azul: Normal
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', width: '100%' }}>
      {/* Gráfico de Barras Básico */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        gap: '12px',
        height: '200px',
        width: '100%',
        borderBottom: '2px solid #ccc',
        paddingBottom: '8px'
      }}>
        {array.map((value, idx) => (
          <div
            key={idx}
            style={{
              height: `${Math.max(value * 15, 25)}px`,
              width: '40px',
              backgroundColor: getBarColor(idx),
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              alignItems: 'center',
              color: 'white',
              fontWeight: 'bold',
              borderRadius: '4px 4px 0 0',
              transition: 'all 0.3s ease',
              paddingBottom: '4px'
            }}
          >
            <span style={{ fontSize: '12px' }}>{value}</span>
          </div>
        ))}
      </div>

      {/* Leyenda de colores */}
      <div style={{ display: 'flex', gap: '15px', fontSize: '12px' }}>
        <span><strong style={{ color: '#ec4899' }}>■</strong> Pivote</span>
        <span><strong style={{ color: '#f59e0b' }}>■</strong> Comparando</span>
        <span><strong style={{ color: '#ef4444' }}>■</strong> Intercambiado</span>
        <span><strong style={{ color: '#3b82f6' }}>■</strong> Normal</span>
      </div>

      {/* Explicación generada por Llama */}
      <div style={{
        backgroundColor: '#f3f4f6',
        padding: '1rem',
        borderRadius: '8px',
        maxWidth: '500px',
        width: '100%',
        textAlign: 'center',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
      }}>
        <h4 style={{ margin: '0 0 8px 0', color: '#374151' }}>
          Paso {currentStep.stepIndex}
        </h4>
        <p style={{ margin: 0, color: '#4b5563', fontSize: '14px' }}>
          {explanation}
        </p>
      </div>
    </div>
  );
}
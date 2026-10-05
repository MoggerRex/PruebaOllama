import React from 'react';

export default function QuickSortTree({ currentStep }) {
  if (!currentStep) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
        Ingresa tus 7 números arriba y haz clic en "Iniciar Quicksort".
      </div>
    );
  }

  const { array, pivotIndex, comparingIndices = [], swappedIndices = [], explanation } = currentStep;

  // Determinar valor máximo para escalar la altura de las barras
  const maxVal = Math.max(...array, 1);

  const getBarColor = (index) => {
    if (index === pivotIndex) return '#ec4899';             // Rosa: Pivote
    if (swappedIndices.includes(index)) return '#ef4444';   // Rojo: Intercambiado
    if (comparingIndices.includes(index)) return '#f59e0b'; // Amarillo: Comparando
    return '#3b82f6';                                       // Azul: Normal
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', width: '100%' }}>
      {/* Contenedor Gráfico de Barras */}
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
        {array.map((value, idx) => {
          const barHeight = Math.max((value / maxVal) * 160, 24);
          return (
            <div
              key={idx}
              style={{
                height: `${barHeight}px`,
                width: '45px',
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
          );
        })}
      </div>

      {/* Leyenda de colores */}
      <div style={{ display: 'flex', gap: '15px', fontSize: '12px' }}>
        <span><strong style={{ color: '#ec4899' }}>■</strong> Pivote</span>
        <span><strong style={{ color: '#f59e0b' }}>■</strong> Comparando</span>
        <span><strong style={{ color: '#ef4444' }}>■</strong> Intercambiado</span>
        <span><strong style={{ color: '#3b82f6' }}>■</strong> Normal</span>
      </div>

      {/* Explicación en Español del Paso Actual */}
      <div style={{
        backgroundColor: '#f3f4f6',
        padding: '1rem',
        borderRadius: '8px',
        maxWidth: '550px',
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
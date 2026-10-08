import { useState } from 'react';
import { fetchAlgorithmOverview } from '../../../services/llamaService.js';

function generateQuickSortSteps(arr) {
  const steps = [];
  const array = [...arr];
  // Cada barra tiene un id fijo que se mueve junto con su valor
  const ids = arr.map((_, i) => i);

  const swap = (a, b) => {
    [array[a], array[b]] = [array[b], array[a]];
    [ids[a], ids[b]] = [ids[b], ids[a]];
  };

  function quickSortHelper(low, high) {
    if (low < high) {
      const pivotIndex = partition(low, high);
      quickSortHelper(low, pivotIndex - 1);
      quickSortHelper(pivotIndex + 1, high);
    }
  }

  function partition(low, high) {
    const pivotValue = array[high];
    let i = low - 1;

    steps.push({
      stepIndex: steps.length + 1,
      array: [...array],
      ids: [...ids],
      pivotIndex: high,
      comparingIndices: [],
      swappedIndices: [],
      explanation: `Seleccionado pivote ${pivotValue} en el índice ${high}. Analizando rango [${low} a ${high}].`,
    });

    for (let j = low; j < high; j++) {
      if (array[j] < pivotValue) {
        i++;
        if (i !== j) {
          swap(i, j);
          steps.push({
            stepIndex: steps.length + 1,
            array: [...array],
            ids: [...ids],
            pivotIndex: high,
            comparingIndices: [],
            swappedIndices: [i, j],
            explanation: `Intercambiando ${array[i]} e índice ${j} porque es menor que el pivote ${pivotValue}.`,
          });
        }
      }
    }

    if (i + 1 !== high) {
      swap(i + 1, high);
    }

    steps.push({
      stepIndex: steps.length + 1,
      array: [...array],
      ids: [...ids],
      pivotIndex: i + 1,
      comparingIndices: [],
      swappedIndices: [i + 1, high],
      explanation: `Pivote ${pivotValue} colocado en su posición definitiva (índice ${i + 1}).`,
    });

    return i + 1;
  }

  quickSortHelper(0, array.length - 1);

  steps.push({
    stepIndex: steps.length + 1,
    array: [...array],
    ids: [...ids],
    pivotIndex: null,
    comparingIndices: [],
    swappedIndices: [],
    explanation: '¡Proceso finalizado! El arreglo ha sido ordenado.',
  });

  return steps;
}

export default function useQuickSortLogic() {
  const [steps, setSteps] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [algorithmOverview, setAlgorithmOverview] = useState('');

  const loadQuickSortSteps = async (initialArray, selectedCharacter = 'Naruto') => {
    setLoading(true);
    setError(null);
    setCurrentStepIndex(0);
    setAlgorithmOverview('');

    try {
      // 1. Generar la secuencia gráfica local
      const baseSteps = generateQuickSortSteps(initialArray);

      // 2. Obtener una explicación general del algoritmo, independiente de los pasos
      try {
        const overview = await fetchAlgorithmOverview('Quick Sort', selectedCharacter);
        setAlgorithmOverview(overview);
      } catch (llamaErr) {
        console.warn('No se pudo cargar la explicación general de Llama:', llamaErr);
        setAlgorithmOverview('No se pudo generar la explicación general del algoritmo.');
      }

      setSteps(baseSteps);
    } catch (err) {
      console.error(err);
      setError('Error al generar los pasos: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  return {
    steps,
    currentStep: steps[currentStepIndex] || null,
    currentStepIndex,
    loading,
    error,
    algorithmOverview,
    loadQuickSortSteps,
    nextStep,
    prevStep
  };
}
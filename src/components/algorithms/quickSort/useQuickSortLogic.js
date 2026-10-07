import { useState } from 'react';
import { fetchAlgorithmOverview } from '../../../services/llamaService.js';

function generateQuickSortSteps(arr) {
  const steps = [];
  const array = [...arr];

  function quickSortHelper(arrCopy, low, high) {
    if (low < high) {
      const pivotIndex = partition(arrCopy, low, high);
      quickSortHelper(arrCopy, low, pivotIndex - 1);
      quickSortHelper(arrCopy, pivotIndex + 1, high);
    }
  }

  function partition(arrCopy, low, high) {
    const pivotValue = arrCopy[high];
    let i = low - 1;

    steps.push({
      stepIndex: steps.length + 1,
      array: [...arrCopy],
      pivotIndex: high,
      comparingIndices: [],
      swappedIndices: [],
      explanation: `Seleccionado pivote ${pivotValue} en el índice ${high}. Analizando rango [${low} a ${high}].`,
    });

    for (let j = low; j < high; j++) {
      if (arrCopy[j] < pivotValue) {
        i++;
        if (i !== j) {
          [arrCopy[i], arrCopy[j]] = [arrCopy[j], arrCopy[i]];
          steps.push({
            stepIndex: steps.length + 1,
            array: [...arrCopy],
            pivotIndex: high,
            comparingIndices: [],
            swappedIndices: [i, j],
            explanation: `Intercambiando ${arrCopy[i]} e índice ${j} porque es menor que el pivote ${pivotValue}.`,
          });
        }
      }
    }

    if (i + 1 !== high) {
      [arrCopy[i + 1], arrCopy[high]] = [arrCopy[high], arrCopy[i + 1]];
    }

    steps.push({
      stepIndex: steps.length + 1,
      array: [...arrCopy],
      pivotIndex: i + 1,
      comparingIndices: [],
      swappedIndices: [i + 1, high],
      explanation: `Pivote ${pivotValue} colocado en su posición definitiva (índice ${i + 1}).`,
    });

    return i + 1;
  }

  quickSortHelper(array, 0, array.length - 1);

  steps.push({
    stepIndex: steps.length + 1,
    array: [...array],
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
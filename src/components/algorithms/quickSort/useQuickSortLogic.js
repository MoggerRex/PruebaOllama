import { useState } from 'react';

// Algoritmo Quicksort determinista que registra cada paso con precisión
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
    const pivotIndex = high;
    let i = low - 1;

    steps.push({
      stepIndex: steps.length + 1,
      array: [...arrCopy],
      pivotIndex: pivotIndex,
      comparingIndices: [],
      swappedIndices: [],
      explanation: `Seleccionado pivote ${pivotValue} en el índice ${pivotIndex}. Analizando subarreglo de índice ${low} a ${high}.`
    });

    for (let j = low; j < high; j++) {
      steps.push({
        stepIndex: steps.length + 1,
        array: [...arrCopy],
        pivotIndex: pivotIndex,
        comparingIndices: [j, pivotIndex],
        swappedIndices: [],
        explanation: `Comparando elemento ${arrCopy[j]} en índice ${j} con el pivote ${pivotValue}.`
      });

      if (arrCopy[j] < pivotValue) {
        i++;
        [arrCopy[i], arrCopy[j]] = [arrCopy[j], arrCopy[i]];
        steps.push({
          stepIndex: steps.length + 1,
          array: [...arrCopy],
          pivotIndex: pivotIndex,
          comparingIndices: [],
          swappedIndices: [i, j],
          explanation: `Intercambiando ${arrCopy[i]} (índice ${i}) con ${arrCopy[j]} (índice ${j}).`
        });
      }
    }

    [arrCopy[i + 1], arrCopy[high]] = [arrCopy[high], arrCopy[i + 1]];
    steps.push({
      stepIndex: steps.length + 1,
      array: [...arrCopy],
      pivotIndex: i + 1,
      comparingIndices: [],
      swappedIndices: [i + 1, high],
      explanation: `Colocando pivote ${pivotValue} en su posición ordenada final (índice ${i + 1}).`
    });

    return i + 1;
  }

  quickSortHelper(array, 0, array.length - 1);

  // Paso final con el arreglo completamente ordenado
  steps.push({
    stepIndex: steps.length + 1,
    array: [...array],
    pivotIndex: null,
    comparingIndices: [],
    swappedIndices: [],
    explanation: '¡Proceso finalizado! El arreglo ha sido completamente ordenado.'
  });

  return steps;
}

export default function useQuickSortLogic() {
  const [steps, setSteps] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadQuickSortSteps = async (initialArray = [8, 3, 1, 7, 0, 10, 2]) => {
    setLoading(true);
    setError(null);
    setCurrentStepIndex(0);

    try {
      const generatedSteps = generateQuickSortSteps(initialArray);
      setSteps(generatedSteps);
    } catch (err) {
      console.error(err);
      setError('Error al generar los pasos de Quicksort: ' + err.message);
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
    loadQuickSortSteps,
    nextStep,
    prevStep
  };
}
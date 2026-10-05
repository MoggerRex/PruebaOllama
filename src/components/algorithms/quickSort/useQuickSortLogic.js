import { useState } from 'react';
import { fetchAlgorithmSteps } from '../../../services/llamaService.js';

export default function useQuickSortLogic() {
  const [steps, setSteps] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Ejecuta la consulta a Llama 3.2 3B
  const loadQuickSortSteps = async (initialArray = [8, 3, 1, 7, 0, 10, 2]) => {
    setLoading(true);
    setError(null);
    setCurrentStepIndex(0);

    try {
      const result = await fetchAlgorithmSteps('QuickSort', initialArray);
      if (result && Array.isArray(result.steps)) {
        setSteps(result.steps);
      } else {
        throw new Error('Formato de pasos no válido.');
      }
    } catch (err) {
      console.error(err);
      setError('Error al conectar con Llama para Quicksort: ' + err.message);
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
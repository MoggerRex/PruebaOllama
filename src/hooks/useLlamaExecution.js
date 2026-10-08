import { useState } from 'react';
import { fetchAlgorithmExplanation } from '../services/llamaService.js';

export default function useLlamaExecution() {
  const [explanation, setExplanation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generateExplanation = async (algorithm, character) => {
    setLoading(true);
    setError('');
    setExplanation('');

    try {
      const answer = await fetchAlgorithmExplanation(algorithm, character);
      setExplanation(answer);
      return answer;
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : 'Error al consultar Llama.';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const clearExplanation = () => {
    setExplanation('');
    setError('');
  };

  return { explanation, loading, error, generateExplanation, clearExplanation };
}

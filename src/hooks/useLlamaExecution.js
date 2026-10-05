import { useState } from 'react';
import { askLlama } from '../services/llamaService.js';

export default function useLlamaExecution() {
  const [explanation, setExplanation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generateExplanation = async (prompt) => {
    setLoading(true);
    setError('');

    try {
      const answer = await askLlama(prompt);
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

  return { explanation, loading, error, generateExplanation };
}
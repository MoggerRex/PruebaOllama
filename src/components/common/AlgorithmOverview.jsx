import { useState } from 'react';
import useLlamaExecution from '../../hooks/useLlamaExecution.js';
import ExplanationPanel from './ExplanationPanel.jsx';
import { LLAMA_PERSONALITIES } from '../../services/llamaService.js';

export default function AlgorithmOverview({ algorithm }) {
  const [character, setCharacter] = useState('Naruto');
  const { explanation, loading, error, generateExplanation, clearExplanation } = useLlamaExecution();

  return (
    <aside className="algorithm-overview">
      <form className="form-container" onSubmit={(event) => {
        event.preventDefault();
        generateExplanation(algorithm, character);
      }}>
        <h2>Tu personaje explica {algorithm}</h2>
        <label>
          Personaje
          <select value={character} disabled={loading}
            onChange={(event) => {
              setCharacter(event.target.value);
              clearExplanation();
            }}>
            {LLAMA_PERSONALITIES.map(({ name }) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </label>
        <button disabled={loading} type="submit">
          {loading ? 'Generando…' : 'Explicar algoritmo'}
        </button>
      </form>
      <ExplanationPanel explanation={explanation} loading={loading} error={error} />
    </aside>
  );
}

import characterPrompts from '../config/llamaCharacters.json';

const API_URL = 'http://127.0.0.1:8000';

/** Genera la explicación general; los pasos se calculan en cada algoritmo. */
export async function fetchAlgorithmExplanation(algorithm, character, apiUrl = API_URL) {
  if (!Object.hasOwn(characterPrompts, character)) {
    throw new Error('Selecciona un personaje del catálogo.');
  }
  const response = await fetch(`${apiUrl}/algorithm`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ algorithm, character }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(typeof data.detail === 'string'
      ? data.detail
      : 'Verifica el algoritmo y los datos del personaje.');
  }
  return data.explanation;
}

export const LLAMA_PERSONALITIES = Object.keys(characterPrompts).map((name) => ({ name }));

/** Obtiene la explicación del algoritmo usando el perfil del catálogo del backend. */
export async function fetchAlgorithmOverview(algorithmName, selectedCharacter = 'Naruto', apiUrl = API_URL) {
  return fetchAlgorithmExplanation(algorithmName, selectedCharacter, apiUrl);
}

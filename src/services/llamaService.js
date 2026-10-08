import characterPrompts from '../config/llamaCharacters.json';

const API_URL = 'http://127.0.0.1:8000';
export const LLAMA_PERSONALITIES = Object.keys(characterPrompts).map((name) => ({ name }));

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

/**
 * Consulta genérica a la API de Llama
 */
export async function askLlama(prompt, apiUrl = API_URL) {
  const response = await fetch(`${apiUrl}/ask`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || 'No se pudo obtener una respuesta de Llama.');
  }

  return data.answer;
}

/**
 * Solicita los pasos de un algoritmo de búsqueda o de ordenamiento a Llama
 * devolviendo un objeto JSON estructurado con la secuencia de pasos y explicaciones.
 * 
 * @param {string} algorithmName - Nombre del algoritmo (ej: 'Binary Search', 'Insertion Sort', 'Quick Sort', 'Hash Search')
 * @param {Array|Object} inputData - Arreglo numérico o datos de entrada
 * @param {number|string|null} target - Elemento a buscar (para algoritmos de búsqueda)
 * @param {string} apiUrl - URL base de la API backend
 */
export async function fetchAlgorithmSteps(algorithmName, inputData, target = null, apiUrl = API_URL) {
  const targetInfo = target !== null ? ` con el elemento objetivo "${target}"` : '';

  const prompt = `Eres un asistente educativo de ciencias de la computación.
Dado el algoritmo de "${algorithmName}" y los datos de entrada: ${JSON.stringify(inputData)}${targetInfo}.

Genera el paso a paso detallado de la ejecución en formato JSON estricto sin texto adicional fuera del JSON.

El formato JSON debe seguir esta estructura exacta:
{
  "algorithm": "${algorithmName}",
  "initialData": ${JSON.stringify(inputData)},
  "target": ${JSON.stringify(target)},
  "steps": [
    {
      "stepIndex": 1,
      "array": [ ...estado_actual_del_arreglo... ],
      "activeIndices": [ ...índices_clave_o_punteros_activos... ],
      "comparingIndices": [ ...índices_que_se_comparan... ],
      "swappedIndices": [ ...índices_intercambiados_o_modificados... ],
      "pivotIndex": null,
      "explanation": "Explicación clara en español de lo que sucede en este paso"
    }
  ]
}`;

  const rawAnswer = await askLlama(prompt, apiUrl);

  try {
    // Limpia envoltorios de Markdown si el modelo los devuelve (ej. ```json ... ```)
    const cleanedAnswer = rawAnswer.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
    return JSON.parse(cleanedAnswer);
  } catch (error) {
    console.error('Error parseando la respuesta JSON de Llama:', error, rawAnswer);
    throw new Error('La respuesta recibida de Llama no tenía un formato JSON válido.', { cause: error });
  }
}

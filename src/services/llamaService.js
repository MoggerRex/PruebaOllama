import LLAMA_CHARACTER_PROFILES from '../config/llamaCharacters.json' with { type: 'json' };

const API_URL = 'http://127.0.0.1:8000';

export const LLAMA_PERSONALITIES = Object.keys(LLAMA_CHARACTER_PROFILES).map((name) => ({ name }));

const ALGORITHM_NAME_ALIASES = {
  quicksort: 'quickSort',
  binarysearch: 'binarySearch',
  busquedabinaria: 'binarySearch',
  hashsearch: 'hashSearch',
  busquedahash: 'hashSearch',
  insertionsort: 'insertionSort',
  ordenamientoporinsercion: 'insertionSort',
};

const API_ALGORITHM_NAMES = {
  quickSort: 'Quick Sort',
  binarySearch: 'Binary Search',
  hashSearch: 'Hash Search',
  insertionSort: 'Insertion Sort',
};

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

export async function fetchSpeech(text, profile = 'normal', apiUrl = API_URL) {
  const response = await fetch(`${apiUrl}/speech`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, profile }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.detail || 'No se pudo generar el audio de voz.');
  }

  return response.blob();
}


/** Generates one personality-based overview for the selected algorithm. */
export async function fetchAlgorithmOverview(algorithmName, selectedCharacter = 'Profesor BIHQ', apiUrl = API_URL) {
  const normalizedName = algorithmName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z]/gi, '')
    .toLowerCase();
  const algorithmKey = ALGORITHM_NAME_ALIASES[normalizedName];
  const apiAlgorithmName = API_ALGORITHM_NAMES[algorithmKey];

  if (!apiAlgorithmName) {
    throw new Error(`No hay una explicación base configurada para "${algorithmName}".`);
  }

  const character = LLAMA_CHARACTER_PROFILES[selectedCharacter] ? selectedCharacter : 'Profesor BIHQ';
  const response = await fetch(`${apiUrl}/algorithm`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ algorithm: apiAlgorithmName, character }),
  });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || 'No se pudo obtener una explicación de Llama.');
  }

  return data.explanation.trim();
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
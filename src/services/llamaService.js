const API_URL = 'http://127.0.0.1:8000';

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
 * Recibe el arreglo inicial e instruye a Llama a generar las explicaciones paso a paso en JSON.
 */
export async function fetchLlamaExplanations(initialArray, apiUrl = API_URL) {
  const prompt = `Eres un asistente educativo de algoritmos.
Analiza la ejecución de Quicksort para los siguientes números: ${JSON.stringify(initialArray)}.

Tu tarea es devolver un JSON estricto con un arreglo llamado "explanations".
Cada elemento del arreglo debe explicar brevemente el paso correspondiente del algoritmo en español, manteniendo un tono claro y didáctico.

Ejemplo de formato esperado:
{
  "explanations": [
    "En el paso 1 elegimos el pivote y revisamos el rango del arreglo.",
    "En el paso 2 comparamos los valores para ubicar los elementos menores y mayores que el pivote."
  ]
}

Responde ÚNICAMENTE con el objeto JSON estricto, sin bloques de texto adicionales.`;

  const rawAnswer = await askLlama(prompt, apiUrl);
  const cleanedAnswer = rawAnswer.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
  return JSON.parse(cleanedAnswer);
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
    throw new Error('La respuesta recibida de Llama no tenía un formato JSON válido.');
  }
}
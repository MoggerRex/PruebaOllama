const API_URL = 'http://127.0.0.1:8000';

const LLAMA_PERSONALITY_PROMPTS = {
  Goku: `Voz: héroe artista marcial optimista, valiente y siempre emocionado por aprender. Intensidad: muy alta, cálida y energética.
Saludo original para el primer paso: "¡Hola, soy Goku!"
Expresión recurrente original: "¡Esto va a ser epico papus!"
Despedida original para el último paso: "¡Buen trabajo, equipo; seguimos entrenando!"`,
  Naruto: `Voz: joven ninja perseverante, leal y entusiasta, que anima a sus compañeros. Intensidad: muy alta, sincera y determinada.
Saludo original para el primer paso: "¡Hola, compañero, misión en marcha!"
Expresión recurrente original: "¡No nos rendimos, avanzamos!"
Despedida original para el último paso: "¡Misión cumplida; cuenta conmigo para la siguiente!"`,
  Luffy: `Voz: capitán pirata espontáneo, directo, alegre y aventurero, que valora a su tripulación. Intensidad: muy alta, juguetona y libre.
Saludo original para el primer paso: "¡Tripulación, comienza la aventura!"
Expresión recurrente original: "¡Sin miedo, vamos al siguiente reto!"
Despedida original para el último paso: "¡Aventura terminada; nos vemos en la próxima isla!"`,
  Batman: `Voz: detective nocturno serio, observador, estratégico y conciso. Intensidad: baja, controlada y firme.
Saludo original para el primer paso: "Buenas noches. Comencemos la investigación."
Expresión recurrente original: "Cada detalle cuenta."
Despedida original para el último paso: "Caso resuelto. Mantente alerta."`,
  Spiderman: `Voz: héroe urbano cercano, ingenioso, empático y ágil, con humor ligero incluso bajo presión. Intensidad: media-alta, vivaz y amistosa.
Saludo original para el primer paso: "¡Hola! Vamos a resolverlo en equipo."
Expresión recurrente original: "Un buen reflejo ayuda; seguimos."
Despedida original para el último paso: "¡Todo en orden por ahora; nos vemos en la próxima!"`,
  'Arthur Morgan': `Voz: forajido del viejo oeste, franco, curtido y reflexivo, con humor seco. Intensidad: media-baja, pausada y sobria.
Saludo original para el primer paso: "Buenas. Veamos cómo se acomoda este asunto."
Expresión recurrente original: "Paso firme, cabeza fría."
Despedida original para el último paso: "Eso es todo por ahora. Cuídate en el camino."`,
  Halo: `Voz: soldado de ciencia ficción disciplinado, táctico y enfocado en cumplir la misión. Intensidad: alta, precisa y contenida.
Saludo original para el primer paso: "Unidad lista. Iniciando análisis."
Expresión recurrente original: "Objetivo identificado; continuando."
Despedida original para el último paso: "Operación completada. Fin de transmisión."`,
  'Walter White': `Voz: profesor de química meticuloso, analítico y seguro, que explica cada resultado con precisión. Intensidad: media, controlada y creciente ante un hallazgo importante.
Saludo original para el primer paso: "Analicemos la reacción inicial."
Expresión recurrente original: "Los datos no mienten."
Despedida original para el último paso: "Experimento concluido. Resultado confirmado."`,
  'Alex Sintek': `Voz: músico pop creativo, cálido y expresivo, que encuentra ritmo y armonía en las ideas. Intensidad: media-alta, alegre y melódica.
Saludo original para el primer paso: "¡Qué gusto! Afinemos este algoritmo."
Expresión recurrente original: "Cada paso tiene su ritmo."
Despedida original para el último paso: "¡La secuencia cerró en armonía!"`,
  'Samuel Garcia': `Voz: comunicador público moderno, dinámico, seguro y conversacional, que presenta las ideas con entusiasmo. Intensidad: alta, fluida y persuasiva sin exagerar.
Saludo original para el primer paso: "¡Qué tal! Vamos a revisar estos números."
Expresión recurrente original: "Así es como se mueve el proceso."
Despedida original para el último paso: "¡Listo, quedó claro y en orden!"`,
};

export const LLAMA_PERSONALITIES = Object.keys(LLAMA_PERSONALITY_PROMPTS).map((name) => ({ name }));

const ALGORITHM_OVERVIEWS = {
  quickSort: `Quicksort es un algoritmo de ordenamiento rápido y eficiente basado en la estrategia "Divide y Vencerás". Elige un pivote y particiona el arreglo colocando los números menores a un lado y los mayores al otro; después repite el proceso recursivamente en ambas sublistas. Ordena directamente en memoria con poco espacio extra y suele tardar O(n log n) en promedio, aunque puede llegar a O(n²) si se eligen pivotes desfavorables. Se usa para ordenar datos en memoria y su estrategia influye en implementaciones de ordenamiento de lenguajes y bases de datos.`,
  binarySearch: `La búsqueda binaria encuentra un elemento en una colección ordenada comparándolo con el valor central. En cada comparación descarta la mitad que no puede contener el objetivo y repite sobre la mitad restante. Por eso requiere que los datos estén ordenados y localiza elementos en O(log n), usando espacio constante cuando se implementa de forma iterativa.`,
  hashSearch: `La búsqueda hash utiliza una función hash para convertir una clave en una posición de una tabla y acceder rápidamente al dato asociado. Si dos claves llegan a la misma posición, la tabla debe resolver esa colisión y continuar permitiendo la búsqueda. Su tiempo promedio de consulta es O(1), aunque puede llegar a O(n) en el peor caso; es útil cuando se necesitan búsquedas rápidas por clave.`,
  insertionSort: `El ordenamiento por inserción construye una sección ordenada poco a poco: toma el siguiente elemento, desplaza a la derecha los valores mayores y lo inserta en su lugar. Ordena en el mismo arreglo, es estable y necesita solo O(1) espacio adicional. Su costo promedio y en el peor caso es O(n²), por lo que funciona especialmente bien con conjuntos pequeños o casi ordenados.`,
};

const ALGORITHM_NAME_ALIASES = {
  quicksort: 'quickSort',
  binarysearch: 'binarySearch',
  busquedabinaria: 'binarySearch',
  hashsearch: 'hashSearch',
  busquedahash: 'hashSearch',
  insertionsort: 'insertionSort',
  ordenamientoporinsercion: 'insertionSort',
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


/** Generates one personality-based overview for the selected algorithm. */
export async function fetchAlgorithmOverview(algorithmName, selectedCharacter = 'Naruto', apiUrl = API_URL) {
  const normalizedName = algorithmName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z]/gi, '')
    .toLowerCase();
  const algorithmKey = ALGORITHM_NAME_ALIASES[normalizedName];
  const algorithmOverview = ALGORITHM_OVERVIEWS[algorithmKey];

  if (!algorithmOverview) {
    throw new Error(`No hay una explicación base configurada para "${algorithmName}".`);
  }

  const personalityPrompt = LLAMA_PERSONALITY_PROMPTS[selectedCharacter] ?? LLAMA_PERSONALITY_PROMPTS.Naruto;
  const prompt = `Eres un asistente educativo de ciencias de la computación. El algoritmo seleccionado es ${algorithmName}.

Explicación base del algoritmo:
${algorithmOverview}

Personalidad activa (${selectedCharacter}):
${personalityPrompt}

Parafrasea la explicación base en español con la personalidad activa. Describe qué es el algoritmo, cómo funciona en términos generales, cuándo conviene usarlo y su rendimiento, sin narrar una ejecución concreta ni enumerar pasos. Escribe un único párrafo breve, incluye el saludo configurado al inicio, integra la expresión recurrente una vez de forma natural y termina con la despedida configurada. Conserva la precisión técnica y no agregues afirmaciones que no aparezcan en la explicación base. Devuelve solo texto plano, sin JSON ni Markdown.`;

  return (await askLlama(prompt, apiUrl)).trim();
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
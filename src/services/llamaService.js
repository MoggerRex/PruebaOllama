const API_URL = 'http://127.0.0.1:8000';

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
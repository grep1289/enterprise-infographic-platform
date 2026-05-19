// When VITE_API_URL is set, use it; otherwise assume same-origin (use Vite proxy)
const BASE_URL = import.meta.env.VITE_API_URL ?? '';

export async function generateDiagram(prompt, provider) {
  const response = await fetch(`${BASE_URL}/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, provider })
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error?.error || 'Generate request failed');
  }

  return response.json();
}

export async function exportPptx(ast) {
  const response = await fetch(`${BASE_URL}/export`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ast })
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error?.error || 'Export request failed');
  }

  return response.json();
}

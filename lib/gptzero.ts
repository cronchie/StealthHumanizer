const GPTZERO_API_URL = 'https://api.gptzero.me/v2/predict/text';

export interface GPTZeroResult {
  score: number | null;
  verdict: string | null;
  sentences: unknown[];
}

export async function detectWithGPTZero(text: string): Promise<GPTZeroResult> {
  const apiKey = process.env.GPTZERO_API_KEY;
  if (!apiKey) {
    throw new Error('GPTZero API key is not configured. Set GPTZERO_API_KEY in your environment.');
  }

  let lastError: Error | null = null;
  const maxRetries = 1;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15_000);

    try {
      const response = await fetch(GPTZERO_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
        },
        body: JSON.stringify({ document: text.trim() }),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!response.ok) {
        const errorBody = await response.text();
        if (response.status >= 500 && attempt < maxRetries) {
          lastError = new Error(`GPTZero API error: ${response.status}`);
          continue;
        }
        throw new Error(`GPTZero API error: ${response.status} — ${errorBody}`);
      }

      const data = await response.json();
      const doc = data?.documents?.[0] ?? data;

      return {
        score: doc.completely_generated_prob ?? doc.average_generated_prob ?? null,
        verdict: doc.predicted_class ?? null,
        sentences: doc.sentences ?? [],
      };
    } catch (err: unknown) {
      clearTimeout(timeout);
      if (err instanceof Error && err.name === 'AbortError') {
        throw new Error('GPTZero API request timed out (15s)');
      }
      lastError = err instanceof Error ? err : new Error('Unknown error');
      if (attempt < maxRetries) continue;
    }
  }

  throw lastError || new Error('GPTZero detection failed');
}

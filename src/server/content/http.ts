export async function fetchJson(url: string, init: RequestInit = {}, timeoutMs = 8000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...init,
      signal: controller.signal
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(buildHttpErrorMessage(response.status, body));
    }

    return await response.json();
  } finally {
    clearTimeout(timeout);
  }
}

function buildHttpErrorMessage(status: number, body: string) {
  try {
    const parsed = JSON.parse(body) as { error?: { message?: string } };
    const message = parsed.error?.message;

    if (message) {
      return `request failed with ${status}: ${message}`;
    }
  } catch {
    // Keep the fallback message below if the response is not JSON.
  }

  return `request failed with ${status}`;
}

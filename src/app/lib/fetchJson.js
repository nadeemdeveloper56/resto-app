const inFlightRequests = new Map();

export async function fetchJson(url) {
  let request = inFlightRequests.get(url);

  if (!request) {
    request = fetch(url).then(async (response) => {
      const text = await response.text();

      if (!response.ok) {
        throw new Error(`Request failed: ${response.status} - ${text}`);
      }

      if (!text.trim()) {
        throw new Error("Request returned an empty response");
      }

      return JSON.parse(text);
    });

    inFlightRequests.set(url, request);
  }

  try {
    return await request;
  } finally {
    if (inFlightRequests.get(url) === request) {
      inFlightRequests.delete(url);
    }
  }
}

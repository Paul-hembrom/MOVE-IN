/**
 * Nominatim OpenStreetMap API client with strict 1-second debounce / rate-limiting
 * Respects Nominatim's policy of max 1 request per second.
 */

let lastCallTimestamp = 0;

export async function debouncedNominatimFetch(url: string): Promise<Response> {
  const now = Date.now();
  const timeSinceLastCall = now - lastCallTimestamp;
  const minimumDelayMs = 1000; // 1-second debounce before every Nominatim call

  if (timeSinceLastCall < minimumDelayMs) {
    const waitTime = minimumDelayMs - timeSinceLastCall;
    await new Promise((resolve) => setTimeout(resolve, waitTime));
  }

  lastCallTimestamp = Date.now();

  return fetch(url, {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'MoveIn-Nepal-RealEstate-Platform/1.0',
    },
  });
}

export async function reverseGeocodeNominatim(lat: number, lng: number) {
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=jsonv2`;
  const res = await debouncedNominatimFetch(url);
  if (!res.ok) {
    throw new Error(`Nominatim reverse geocode error: ${res.status}`);
  }
  return res.json();
}

export async function searchAddressNominatim(query: string, countryCode = 'np') {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
    query.trim()
  )}&format=jsonv2&countrycodes=${countryCode}&limit=5`;
  const res = await debouncedNominatimFetch(url);
  if (!res.ok) {
    throw new Error(`Nominatim search error: ${res.status}`);
  }
  return res.json();
}

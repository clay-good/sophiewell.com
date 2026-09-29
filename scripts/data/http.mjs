// scripts/data/http.mjs -- spec-v1621 §2.
//
// get(url, opts) over Node's fetch, with a user agent that names the project,
// retries with backoff on network errors, 429 and 5xx, a timeout sized for
// large federal files, and conditional requests from the last run's validators
// so an unchanged file costs one small request.

export const USER_AGENT = 'sophiewell.com data refresh (+https://github.com/clay-good/sophiewell.com)';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// get(url, { etag, lastModified, timeoutMs, retries, backoffMs, fetchImpl })
//   -> { status, notModified, bytes: Buffer|null, etag, lastModified, url }
// Throws after the last retry, or at once on a 4xx other than 429: a missing
// page is a failed fetch the summary names, never retried into a timeout.
export async function get(url, opts = {}) {
  const {
    etag, lastModified, timeoutMs = 10 * 60 * 1000, retries = 3, backoffMs = 2000,
    fetchImpl = globalThis.fetch,
  } = opts;
  const headers = { 'user-agent': USER_AGENT, accept: '*/*' };
  if (etag) headers['if-none-match'] = etag;
  if (lastModified) headers['if-modified-since'] = lastModified;
  let lastError;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    if (attempt) await sleep(backoffMs * 2 ** (attempt - 1));
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      const res = await fetchImpl(url, { headers, redirect: 'follow', signal: ctrl.signal });
      const meta = { status: res.status, etag: res.headers.get('etag'), lastModified: res.headers.get('last-modified'), url: res.url || url };
      if (res.status === 304) return { ...meta, notModified: true, bytes: null };
      if (res.status === 429 || res.status >= 500) { lastError = new Error(`http: ${url} returned ${res.status}`); continue; }
      if (!res.ok) throw Object.assign(new Error(`http: ${url} returned ${res.status}`), { fatal: true });
      return { ...meta, notModified: false, bytes: Buffer.from(await res.arrayBuffer()) };
    } catch (err) {
      if (err.fatal) throw err;
      lastError = err.name === 'AbortError' ? new Error(`http: ${url} timed out after ${timeoutMs} ms`) : err;
    } finally {
      clearTimeout(timer);
    }
  }
  throw lastError;
}

export async function getText(url, opts) {
  const r = await get(url, opts);
  return r.bytes ? r.bytes.toString('utf8') : '';
}

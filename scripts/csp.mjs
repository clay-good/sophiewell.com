// Compute CSP source-list entries for inline <script> blocks in an HTML
// document. We keep `script-src 'self'` and add a sha256 hash for each
// inline script so the CSP stays strict (no 'unsafe-inline').

import { createHash } from 'node:crypto';

const SCRIPT_RE = /<script(\s[^>]*)?>([\s\S]*?)<\/script>/g;

export function inlineScriptHashes(html) {
  const hashes = [];
  let m;
  while ((m = SCRIPT_RE.exec(html))) {
    const attrs = m[1] || '';
    if (/\ssrc\s*=/.test(attrs)) continue;
    const body = m[2];
    const h = createHash('sha256').update(body, 'utf8').digest('base64');
    hashes.push(`'sha256-${h}'`);
  }
  return hashes;
}

export function withInlineHashes(cspBaseline, html) {
  const hashes = inlineScriptHashes(html);
  if (hashes.length === 0) return cspBaseline;
  return cspBaseline.replace(
    /script-src ([^;]+)/,
    (_, sources) => `script-src ${sources.trim()} ${hashes.join(' ')}`,
  );
}

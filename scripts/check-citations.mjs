#!/usr/bin/env node
// spec-v54 §4.1: citation-integrity lint gate.
//
// Enforces the three v54 invariants - inline, current-or-justified-stale, and
// well-formed/wrapping - on every clinical tile's source citation. The catalog
// truth is `UTILITIES` (app.js, the `clinical` flag) and `META` (lib/meta.js,
// the citation text). The staleness ledger is docs/citation-staleness.md.
//
// Five rules (spec-v54 §4.1):
//   1. Every `clinical: true` tile has a non-empty `META[id].citation`.
//   2. `citation` contains no raw `http://` / `https://` (URLs -> `citationUrl`).
//   3. `citationUrl`, when present, parses as a valid `https://` URL.
//   4. Every tile whose citation matches the guideline-issuer pattern has an
//      `accessed` date (`citationAccessed` or `source.accessed`) AND a row in
//      docs/citation-staleness.md.
//   5. No `citation` contains the unpinned phrases "current edition",
//      "latest version", or "most recent".
//
// The detector `findCitationViolations` is pure and exported so test/unit can
// prove each rule bites on a synthetic violation. Exit 0 clean, 1 on violation.

import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(fileURLToPath(import.meta.url), '..', '..');

// The guideline-issuer pattern (spec-v54 §4.1 rule 4). Case-sensitive so the
// uppercase acronyms do not match the English words "who", "nice", "esc", etc.
// "Joint Commission" is a literal multi-word issuer name.
export const ISSUER_PATTERN =
  /\b(CDC|KDIGO|AGS|ACC|AHA|ATS|IDSA|ESC|WHO|AAP|ACOG|SAMHSA|NICE)\b|Joint Commission/;

// Unpinned-edition phrases banned by rule 5.
const UNPINNED = /current edition|latest version|most recent/i;

// hasAccessed(meta) -> bool. An accessed date may live on the lightweight
// `citationAccessed` string (formula tiles) or on the dataset stamp
// `source.accessed` (spec-v54 §4.3).
function hasAccessed(m) {
  return Boolean(m.citationAccessed || (m.source && m.source.accessed));
}

// isValidHttpsUrl(s) -> bool. Syntactic only (no network; spec-v54 §7).
function isValidHttpsUrl(s) {
  try {
    const u = new URL(s);
    return u.protocol === 'https:';
  } catch {
    return false;
  }
}

// findCitationViolations({ tiles, meta, ledgerIds }) -> [string].
// Pure. `tiles` is [{ id, clinical }]; `meta` is the META map; `ledgerIds` is a
// Set of tile ids present in the staleness ledger.
export function findCitationViolations({ tiles, meta, ledgerIds }) {
  const out = [];
  for (const t of tiles) {
    const m = meta[t.id] || {};
    const citation = typeof m.citation === 'string' ? m.citation : '';

    // Rule 1: clinical tile must carry a non-empty inline citation.
    if (t.clinical && citation.trim() === '') {
      out.push(`${t.id}: rule 1 - clinical tile has no inline META.citation`);
      // The remaining rules read `citation`; nothing more to say for an empty one.
      continue;
    }
    if (citation === '') continue; // non-clinical tile with no citation: allowed.

    // Rule 2: no bare URL in citation text.
    if (/https?:\/\//.test(citation)) {
      out.push(`${t.id}: rule 2 - bare URL in citation text (move it to citationUrl)`);
    }

    // Rule 3: citationUrl, if present, is a valid https URL.
    if (m.citationUrl !== undefined && !isValidHttpsUrl(m.citationUrl)) {
      out.push(`${t.id}: rule 3 - citationUrl is not a valid https:// URL`);
    }

    // Rule 5: no unpinned-edition phrase.
    if (UNPINNED.test(citation)) {
      out.push(`${t.id}: rule 5 - unpinned phrase ("current edition"/"latest version"/"most recent")`);
    }

    // Rule 4: guideline-issuer citation needs accessed date + ledger row.
    if (ISSUER_PATTERN.test(citation)) {
      if (!hasAccessed(m)) {
        out.push(`${t.id}: rule 4 - guideline-issuer citation has no accessed date`);
      }
      if (!ledgerIds.has(t.id)) {
        out.push(`${t.id}: rule 4 - guideline-issuer citation has no docs/citation-staleness.md row`);
      }
    }
  }
  return out;
}

// parseTiles(appJsText) -> [{ id, clinical }]. Static parse of the UTILITIES
// array (same boundary walk as scripts/check-catalog-truth.mjs). Each top-level
// entry carries `id: '...'` and `clinical: true|false` on its line.
export function parseTiles(appJsText) {
  const start = appJsText.indexOf('const UTILITIES = [');
  if (start === -1) throw new Error('check-citations: cannot locate `const UTILITIES = [` in app.js');
  let depth = 0;
  let i = appJsText.indexOf('[', start);
  let end = -1;
  for (; i < appJsText.length; i += 1) {
    const ch = appJsText[i];
    if (ch === '[') depth += 1;
    else if (ch === ']') { depth -= 1; if (depth === 0) { end = i; break; } }
  }
  if (end === -1) throw new Error('check-citations: cannot locate end of UTILITIES array');
  const body = appJsText.slice(start, end);
  const re = /\{ id: '([^']+)'[^}]*?clinical:\s*(true|false)/g;
  const tiles = [];
  let m;
  while ((m = re.exec(body)) !== null) tiles.push({ id: m[1], clinical: m[2] === 'true' });
  if (!tiles.length) throw new Error('check-citations: zero UTILITIES entries matched; regex stale?');
  return tiles;
}

// parseLedgerIds(markdown) -> Set<string>. Reads the first column of every
// pipe-table data row (skips the header and the `---` separator).
export function parseLedgerIds(markdown) {
  const ids = new Set();
  for (const line of String(markdown || '').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed.startsWith('|')) continue;
    const cells = trimmed.split('|').map((c) => c.trim());
    // cells[0] is '' (before the leading pipe); cells[1] is the first column.
    const first = cells[1] || '';
    if (!first || first === 'tile id' || /^-+$/.test(first.replace(/[:\s]/g, ''))) continue;
    // The id cell may be wrapped in backticks.
    const id = first.replace(/`/g, '').trim();
    if (id) ids.add(id);
  }
  return ids;
}

async function main() {
  const [appJs, ledgerMd, metaMod] = await Promise.all([
    readFile(join(ROOT, 'app.js'), 'utf8'),
    readFile(join(ROOT, 'docs/citation-staleness.md'), 'utf8').catch(() => ''),
    import(join(ROOT, 'lib/meta.js')),
  ]);
  const tiles = parseTiles(appJs);
  const ledgerIds = parseLedgerIds(ledgerMd);
  const violations = findCitationViolations({ tiles, meta: metaMod.META, ledgerIds });

  if (violations.length) {
    console.error('check-citations: FAIL - citation-integrity violations (spec-v54):');
    for (const v of violations) console.error('  ' + v);
    process.exit(1);
  }
  const issuerCount = tiles.filter((t) => {
    const c = metaMod.META[t.id] && metaMod.META[t.id].citation;
    return c && ISSUER_PATTERN.test(c);
  }).length;
  console.log(
    `check-citations: clean (${tiles.length} tiles, ` +
    `${issuerCount} guideline-issuer tiles dated + ledgered, ${ledgerIds.size} ledger rows).`,
  );
}

if (process.argv[1] && process.argv[1].endsWith('check-citations.mjs')) {
  main().catch((err) => { console.error(err); process.exit(1); });
}

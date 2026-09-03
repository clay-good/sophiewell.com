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
//   3. `citationUrl`, when present, parses as a valid `https://` URL. A tile
//      whose citation names two or more papers may carry `citationUrls`
//      instead -- a labelled list, two entries or more, never alongside the
//      singular field (spec-v942).
//   4. Every tile whose citation matches the guideline-issuer pattern has an
//      `accessed` date (`citationAccessed` or `source.accessed`) AND a row in
//      docs/citation-staleness.md.
//   5. No `citation` contains the unpinned phrases "current edition",
//      "latest version", or "most recent".
//   8. (spec-v1000) No `citation` hedges an attribution -- "e.g. Chen L, et al."
//      names a source the citation does not commit to and a reader cannot check
//      (PubMed carried no such paper). Name the paper, or say plainly that the
//      instrument has no single derivation.
//   7. (spec-v943) No source link is a search-results page. "Read the source"
//      promises the paper; a `?term=` URL delivers a result list that may hold
//      the paper, six unrelated ones, or none. The tiles whose source is a book
//      chapter, a meeting abstract or a pre-1946 paper that no index carries are
//      grandfathered in `SEARCH_URL_GRANDFATHERED` below, and render as "Search
//      PubMed" rather than "Read the source". The list shrinks only. (It said
//      "Eight" here long after the set held twelve -- spec-v1001: a count
//      restated in prose beside the list it counts is a second copy.)
//   6. (spec-v938) A citation that names a year names a real, findable paper.
//      Every such tile carries a `citationUrl` (or `citationUrls`) unless its id is in the frozen
//      backlog `data/citation-url-backlog.json`. The backlog may only shrink:
//      a new tile may not join it, and a tile that gains a `citationUrl` must
//      be removed from it. 220 tiles were grandfathered at v938.
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

// Rule 8 (spec-v1000). An attribution introduced by "e.g." or "such as" names a
// source the citation does not commit to, and a reader cannot check it. `nmr`
// credited "e.g. Chen L, et al. and subsequent validations" -- PubMed carries no
// paper by that author on that ratio, so the search returns zero. Either name a
// paper properly, or say plainly that there is no single source; do not gesture.
const HEDGED_ATTRIBUTION = /\b(?:e\.?g\.?|such as|including)[\s,]+[A-Z][A-Za-z'-]+\s+[A-Z]{1,3}\b/;

// A four-digit year is what separates "Wells PJ, et al. Thromb Haemost. 2000"
// -- a paper someone can go read -- from "MAP = ((2 * DBP) + SBP) / 3", which
// has no document behind it to link. Rule 6 only bites on the former.
const DATED_CITATION = /\b(19|20)\d\d\b/;

// hasAccessed(meta) -> bool. An accessed date may live on the lightweight
// `citationAccessed` string (formula tiles) or on the dataset stamp
// `source.accessed` (spec-v54 §4.3).
function hasAccessed(m) {
  return Boolean(m.citationAccessed || (m.source && m.source.accessed));
}

// The twelve tiles whose only reachable pointer is a PubMed search: six book
// chapters (Bromage 1978, Russell-Taylor 1992, Rockwood 1984, Narakas 1987,
// Schwab-England 1969, Lippitt 1993), four pre-1946 papers (Waldenstrom 1938,
// Severin 1941, Berggren 1942, Lund-Browder 1944), one meeting abstract
// (Bigliani, Orthop Trans 1986) and one tile whose citation names no single
// paper (nmr). No index carries any of them, so the page says "Search PubMed
// for this source" rather than promising a paper the link cannot open.
// Frozen at spec-v943; shrinks only.
export const SEARCH_URL_GRANDFATHERED = new Set([
  'bigliani-acromion', 'bromage-scale', 'lund-browder', 'narakas-obpp', 'nmr',
  'rockwood-ac', 'russell-taylor-subtroch', 'schwab-england', 'severin-ddh',
  'shunt-fraction', 'simple-shoulder-test', 'waldenstrom-perthes',
]);

// isSearchUrl(s) -> bool. A results page, not a document: a query string that
// carries a search term. Syntactic only, like every other rule here.
export function isSearchUrl(s) {
  try {
    const u = new URL(s);
    return ['term', 'q', 'query', 'search'].some((k) => u.searchParams.has(k));
  } catch {
    return false;
  }
}

// hasCitationLink(meta) -> bool. A tile reaches its source through either the
// singular `citationUrl` or the labelled `citationUrls` list (spec-v942).
function hasCitationLink(m) {
  return Boolean(m.citationUrl || (Array.isArray(m.citationUrls) && m.citationUrls.length));
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
// Set of tile ids present in the staleness ledger; `backlogIds` is a Set of the
// tile ids grandfathered by rule 6; `searchUrlIds` is the set grandfathered by
// rule 7. Both default to empty so a synthetic catalog sees only its own rules.
export function findCitationViolations({
  tiles, meta, ledgerIds, backlogIds = new Set(), searchUrlIds = new Set(),
}) {
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

    // Rule 3b (spec-v942): a citation that names two or more papers links each
    // of them through `citationUrls`, a labelled list. One link cannot stand
    // for two papers, and an unlabelled second link does not say which paper
    // it opens -- so every entry carries a label and a valid https URL, the
    // list is never shorter than two, and it never sits beside the singular
    // field (which surface would then be the source of truth?).
    if (m.citationUrls !== undefined) {
      if (!Array.isArray(m.citationUrls) || m.citationUrls.length < 2) {
        out.push(`${t.id}: rule 3 - citationUrls must be a list of two or more entries (one link belongs in citationUrl)`);
      } else if (m.citationUrl !== undefined) {
        out.push(`${t.id}: rule 3 - tile carries both citationUrl and citationUrls (use one)`);
      } else {
        for (const [i, entry] of m.citationUrls.entries()) {
          if (!entry || typeof entry.label !== 'string' || entry.label.trim() === '') {
            out.push(`${t.id}: rule 3 - citationUrls[${i}] has no label (a reader must know which paper the link opens)`);
          }
          if (!entry || !isValidHttpsUrl(entry.url)) {
            out.push(`${t.id}: rule 3 - citationUrls[${i}] is not a valid https:// URL`);
          }
        }
      }
    }

    // Rule 7 (spec-v943): a source link points at the source, not at a search
    // for it. Grandfathered tiles are the ones no index carries.
    const links = [m.citationUrl, ...(Array.isArray(m.citationUrls) ? m.citationUrls.map((e) => e && e.url) : [])];
    if (links.some((u) => u && isSearchUrl(u)) && !searchUrlIds.has(t.id)) {
      out.push(`${t.id}: rule 7 - source link is a search-results page, not the source (link the record, not the query)`);
    }

    // Rule 8: no hedged attribution.
    if (HEDGED_ATTRIBUTION.test(citation)) {
      out.push(`${t.id}: rule 8 - hedged attribution ("e.g. <Author> ..."); name the paper or say there is no single source`);
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

    // Rule 6: a dated citation is reachable, or is a known-and-frozen exception.
    if (DATED_CITATION.test(citation) && !hasCitationLink(m) && !backlogIds.has(t.id)) {
      out.push(
        `${t.id}: rule 6 - citation names a dated source but has no citationUrl, ` +
        'and the backlog is frozen (add a real citationUrl; do not add the tile ' +
        'to data/citation-url-backlog.json)',
      );
    }
  }

  // Rule 6, the other direction: the backlog shrinks and never goes stale. A
  // tile that has since gained a citationUrl -- or been retired -- must leave
  // the list, otherwise the frozen set slowly stops describing anything.
  for (const id of backlogIds) {
    if (!meta[id]) {
      out.push(`${id}: rule 6 - listed in data/citation-url-backlog.json but is not a tile (remove the row)`);
    } else if (hasCitationLink(meta[id])) {
      out.push(`${id}: rule 6 - now has a citationUrl; remove it from data/citation-url-backlog.json`);
    }
  }

  // Rule 7, the other direction: the grandfathered search-link set shrinks and
  // never goes stale, exactly like the backlog above.
  for (const id of searchUrlIds) {
    const m = meta[id];
    if (!m) {
      out.push(`${id}: rule 7 - grandfathered as a search link but is not a tile (remove it from SEARCH_URL_GRANDFATHERED)`);
    } else if (!isSearchUrl(m.citationUrl || '')) {
      out.push(`${id}: rule 7 - no longer links a search; remove it from SEARCH_URL_GRANDFATHERED`);
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
  const [appJs, ledgerMd, backlogJson, metaMod] = await Promise.all([
    readFile(join(ROOT, 'app.js'), 'utf8'),
    readFile(join(ROOT, 'docs/citation-staleness.md'), 'utf8').catch(() => ''),
    readFile(join(ROOT, 'data/citation-url-backlog.json'), 'utf8'),
    import(join(ROOT, 'lib/meta.js')),
  ]);
  const tiles = parseTiles(appJs);
  const ledgerIds = parseLedgerIds(ledgerMd);
  const backlogIds = new Set(JSON.parse(backlogJson).tiles);
  const violations = findCitationViolations({
    tiles, meta: metaMod.META, ledgerIds, backlogIds, searchUrlIds: SEARCH_URL_GRANDFATHERED,
  });

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
    `${issuerCount} guideline-issuer tiles dated + ledgered, ${ledgerIds.size} ledger rows, ` +
    `${backlogIds.size} dated citations still unlinked).`,
  );
}

if (process.argv[1] && process.argv[1].endsWith('check-citations.mjs')) {
  main().catch((err) => { console.error(err); process.exit(1); });
}

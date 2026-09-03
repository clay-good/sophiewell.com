// spec-v54 §4.1 / §6: prove the citation-integrity gate bites on each of its
// five rules and does not false-positive on a well-formed catalog.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  findCitationViolations,
  parseTiles,
  parseLedgerIds,
  ISSUER_PATTERN,
  SEARCH_URL_GRANDFATHERED,
  isSearchUrl,
} from '../../scripts/check-citations.mjs';

// A minimal well-formed baseline: one clinical guideline tile (dated + ledgered
// + linked) and one non-clinical tile with no citation (allowed). The guideline
// tile carries a citationUrl because spec-v938 rule 6 requires one of any
// citation that names a year.
function baseline() {
  return {
    tiles: [
      { id: 'kdigo-aki', clinical: true },
      { id: 'appeal-letter', clinical: false },
    ],
    meta: {
      'kdigo-aki': {
        citation: 'KDIGO Clinical Practice Guideline for Acute Kidney Injury. Kidney Int Suppl 2012;2:1-138.',
        citationUrl: 'https://doi.org/10.1038/kisup.2012.1',
        citationAccessed: '2026-06-05',
      },
      'appeal-letter': { citation: '' },
    },
    ledgerIds: new Set(['kdigo-aki']),
  };
}

test('the gate passes a well-formed catalog (no false positives)', () => {
  assert.deepEqual(findCitationViolations(baseline()), []);
});

test('rule 1 - a clinical tile with no inline citation fails', () => {
  const b = baseline();
  b.meta['kdigo-aki'].citation = '';
  const v = findCitationViolations(b);
  assert.equal(v.length, 1);
  assert.match(v[0], /rule 1/);
});

test('rule 2 - a bare URL in citation text fails', () => {
  const b = baseline();
  b.meta['kdigo-aki'].citation += ' See https://doi.org/10.1038/kisup.2012.1';
  const v = findCitationViolations(b);
  assert.ok(v.some((x) => /rule 2/.test(x)));
});

test('rule 3 - a malformed citationUrl fails', () => {
  const b = baseline();
  b.meta['kdigo-aki'].citationUrl = 'doi:10.1038/notaurl'; // not https://
  const v = findCitationViolations(b);
  assert.ok(v.some((x) => /rule 3/.test(x)));
});

test('rule 3 - a valid https citationUrl passes', () => {
  const b = baseline();
  b.meta['kdigo-aki'].citationUrl = 'https://doi.org/10.1038/kisup.2012.1';
  assert.deepEqual(findCitationViolations(b), []);
});

test('rule 4 - a guideline-issuer tile missing its accessed date fails', () => {
  const b = baseline();
  delete b.meta['kdigo-aki'].citationAccessed;
  const v = findCitationViolations(b);
  assert.ok(v.some((x) => /rule 4.*accessed date/.test(x)));
});

test('rule 4 - a guideline-issuer tile missing its ledger row fails', () => {
  const b = baseline();
  b.ledgerIds = new Set(); // ledger row removed
  const v = findCitationViolations(b);
  assert.ok(v.some((x) => /rule 4.*citation-staleness/.test(x)));
});

test('rule 4 - accessed may live on source.accessed instead of citationAccessed', () => {
  const b = baseline();
  delete b.meta['kdigo-aki'].citationAccessed;
  b.meta['kdigo-aki'].source = { dataset: 'x', label: 'X', accessed: '2026-06-05' };
  assert.deepEqual(findCitationViolations(b), []);
});

test('rule 5 - an unpinned "current edition" phrase fails', () => {
  const b = baseline();
  b.meta['kdigo-aki'].citation = 'CDC tetanus prophylaxis recommendations (current edition).';
  const v = findCitationViolations(b);
  assert.ok(v.some((x) => /rule 5/.test(x)));
});

test('the issuer pattern is case-sensitive (does not match the words who/nice/esc)', () => {
  assert.equal(ISSUER_PATTERN.test('who is nice can esc the room'), false);
  assert.equal(ISSUER_PATTERN.test('WHO 2014 HCV guideline'), true);
  assert.equal(ISSUER_PATTERN.test('Joint Commission recommended'), true);
  // Acronyms inside longer words do not match (word boundary).
  assert.equal(ISSUER_PATTERN.test('the ACCORD trial'), false);
});

test('parseTiles extracts id + clinical flag from a UTILITIES fragment', () => {
  const app = "x\nconst UTILITIES = [\n  { id: 'bmi', name: 'BMI', clinical: true },\n  { id: 'appeal-letter', name: 'A', clinical: false },\n];\ny";
  const tiles = parseTiles(app);
  assert.deepEqual(tiles, [
    { id: 'bmi', clinical: true },
    { id: 'appeal-letter', clinical: false },
  ]);
});

test('parseLedgerIds reads the first table column, skipping header/separator and backticks', () => {
  const md = [
    '| tile id | instrument | accessed |',
    '|---|---|---|',
    '| kdigo-aki | KDIGO | 2026-06-05 |',
    '| `beers-check` | AGS | 2026-06-05 |',
    'not a table row',
  ].join('\n');
  const ids = parseLedgerIds(md);
  assert.ok(ids.has('kdigo-aki'));
  assert.ok(ids.has('beers-check'));
  assert.ok(!ids.has('tile id'));
  assert.equal(ids.size, 2);
});

// ---- spec-v938 rule 6: a dated citation is reachable ----

test('rule 6 - a dated citation with no citationUrl fails unless it is grandfathered', () => {
  const b = baseline();
  delete b.meta['kdigo-aki'].citationUrl;
  const v = findCitationViolations(b);
  assert.equal(v.filter((x) => x.includes('rule 6')).length, 1, v.join('\n'));

  // The frozen backlog is the only way a dated citation may go unlinked.
  const grandfathered = findCitationViolations({ ...b, backlogIds: new Set(['kdigo-aki']) });
  assert.deepEqual(grandfathered.filter((x) => x.includes('rule 6')), []);
});

test('rule 6 - an undated citation needs no link: there is no paper to reach', () => {
  const b = baseline();
  b.meta['kdigo-aki'] = { citation: 'Standard physiology: MAP = ((2 * DBP) + SBP) / 3.' };
  b.ledgerIds = new Set();
  assert.deepEqual(findCitationViolations(b).filter((x) => x.includes('rule 6')), []);
});

test('rule 6 - the backlog may only shrink: a linked or retired tile may not stay on it', () => {
  const b = baseline();
  const linked = findCitationViolations({ ...b, backlogIds: new Set(['kdigo-aki']) });
  assert.equal(linked.filter((x) => x.includes('remove it from')).length, 1, linked.join('\n'));

  const retired = findCitationViolations({ ...b, backlogIds: new Set(['gone']) });
  assert.equal(retired.filter((x) => x.includes('is not a tile')).length, 1, retired.join('\n'));
});

test('rule 6 - the shipped backlog matches the catalog exactly', async () => {
  const { META } = await import('../../lib/meta.js');
  const { readFileSync } = await import('node:fs');
  const listed = JSON.parse(
    readFileSync(new URL('../../data/citation-url-backlog.json', import.meta.url), 'utf8'),
  ).tiles;
  const actual = Object.keys(META)
    .filter((id) => !META[id].citationUrl && !META[id].citationUrls
      && /\b(19|20)\d\d\b/.test(META[id].citation || ''))
    .sort();
  assert.deepEqual(listed, actual,
    'data/citation-url-backlog.json has drifted from lib/meta.js');
});

// ---- spec-v942 rule 3b: a citation naming two papers links both, labelled ----

test('rule 3 - citationUrls links every paper, each with a label', () => {
  const b = baseline();
  delete b.meta['kdigo-aki'].citationUrl;
  b.meta['kdigo-aki'].citationUrls = [
    { label: 'KDIGO 2012', url: 'https://doi.org/10.1038/kisup.2012.1' },
    { label: 'KDIGO 2024', url: 'https://doi.org/10.1016/j.kint.2023.10.018' },
  ];
  assert.deepEqual(findCitationViolations(b).filter((x) => x.includes('rule 3')), []);
  // It also satisfies rule 6: the paper is reachable.
  assert.deepEqual(findCitationViolations(b).filter((x) => x.includes('rule 6')), []);
});

test('rule 3 - a one-entry list, an unlabelled entry, a bad URL, or both fields, all fail', () => {
  const cases = [
    [[{ label: 'KDIGO 2012', url: 'https://doi.org/10.1038/kisup.2012.1' }], 'two or more entries'],
    [[{ label: '  ', url: 'https://doi.org/10.1038/kisup.2012.1' },
      { label: 'KDIGO 2024', url: 'https://doi.org/10.1016/j.kint.2023.10.018' }], 'has no label'],
    [[{ label: 'KDIGO 2012', url: 'http://doi.org/10.1038/kisup.2012.1' },
      { label: 'KDIGO 2024', url: 'https://doi.org/10.1016/j.kint.2023.10.018' }], 'not a valid https'],
  ];
  for (const [urls, needle] of cases) {
    const b = baseline();
    delete b.meta['kdigo-aki'].citationUrl;
    b.meta['kdigo-aki'].citationUrls = urls;
    const v = findCitationViolations(b).filter((x) => x.includes('rule 3'));
    assert.equal(v.length, 1, `${needle}: ${JSON.stringify(v)}`);
    assert.ok(v[0].includes(needle), v[0]);
  }

  // Both fields at once: which one is the source of truth?
  const both = baseline();
  both.meta['kdigo-aki'].citationUrls = [
    { label: 'KDIGO 2012', url: 'https://doi.org/10.1038/kisup.2012.1' },
    { label: 'KDIGO 2024', url: 'https://doi.org/10.1016/j.kint.2023.10.018' },
  ];
  const v = findCitationViolations(both).filter((x) => x.includes('rule 3'));
  assert.equal(v.length, 1, JSON.stringify(v));
  assert.ok(v[0].includes('both citationUrl and citationUrls'), v[0]);
});

test('rule 6 - a backlogged tile that gained a citationUrls list must leave the list', () => {
  const b = baseline();
  delete b.meta['kdigo-aki'].citationUrl;
  b.meta['kdigo-aki'].citationUrls = [
    { label: 'KDIGO 2012', url: 'https://doi.org/10.1038/kisup.2012.1' },
    { label: 'KDIGO 2024', url: 'https://doi.org/10.1016/j.kint.2023.10.018' },
  ];
  const v = findCitationViolations({ ...b, backlogIds: new Set(['kdigo-aki']) });
  assert.equal(v.filter((x) => x.includes('remove it from')).length, 1, v.join('\n'));
});

// ---- spec-v943 rule 7: a source link is the source, not a search for it ----

test('isSearchUrl separates a record from a query for it', () => {
  assert.ok(isSearchUrl('https://pubmed.ncbi.nlm.nih.gov/?term=Bromage+epidural'));
  assert.ok(isSearchUrl('https://www.alsg.org/en/?q=APLS'));
  assert.ok(!isSearchUrl('https://pubmed.ncbi.nlm.nih.gov/920239/'));
  assert.ok(!isSearchUrl('https://doi.org/10.1038/kisup.2012.1'));
  assert.ok(!isSearchUrl('not a url'));
});

test('rule 7 - a search-results link fails unless the tile is grandfathered', () => {
  const b = baseline();
  b.meta['kdigo-aki'].citationUrl = 'https://pubmed.ncbi.nlm.nih.gov/?term=KDIGO+acute+kidney+injury';
  const v = findCitationViolations(b).filter((x) => x.includes('rule 7') && x.includes('kdigo-aki'));
  assert.equal(v.length, 1, JSON.stringify(v));

  // A grandfathered tile passes -- and its label on the page says "Search PubMed".
  const [grandfathered] = [...SEARCH_URL_GRANDFATHERED];
  const g = {
    tiles: [{ id: grandfathered, clinical: true }],
    meta: { [grandfathered]: { citation: 'Bromage PR. Epidural Analgesia. 1978.', citationUrl: 'https://pubmed.ncbi.nlm.nih.gov/?term=Bromage' } },
    ledgerIds: new Set(),
    searchUrlIds: SEARCH_URL_GRANDFATHERED,
  };
  assert.deepEqual(findCitationViolations(g).filter((x) => x.startsWith(`${grandfathered}:`)), []);
});

test('rule 7 - a search link in a citationUrls entry fails too', () => {
  const b = baseline();
  delete b.meta['kdigo-aki'].citationUrl;
  b.meta['kdigo-aki'].citationUrls = [
    { label: 'KDIGO 2012', url: 'https://doi.org/10.1038/kisup.2012.1' },
    { label: 'KDIGO 2024', url: 'https://pubmed.ncbi.nlm.nih.gov/?term=KDIGO+2024' },
  ];
  const v = findCitationViolations(b).filter((x) => x.includes('rule 7') && x.startsWith('kdigo-aki'));
  assert.equal(v.length, 1, JSON.stringify(v));
});

test('rule 7 - the grandfathered set shrinks only', () => {
  // A grandfathered tile that has since gained a real link must leave the set.
  const [first] = [...SEARCH_URL_GRANDFATHERED];
  const fixed = findCitationViolations({
    tiles: [{ id: first, clinical: true }],
    meta: { [first]: { citation: 'Bromage PR. Epidural Analgesia. 1978.', citationUrl: 'https://doi.org/10.1000/x' } },
    ledgerIds: new Set(),
    searchUrlIds: SEARCH_URL_GRANDFATHERED,
  });
  assert.equal(fixed.filter((x) => x.startsWith(`${first}:`) && x.includes('no longer links a search')).length, 1,
    fixed.join('\n'));

  // Against a catalog that holds none of them, every id reports as retired.
  const empty = findCitationViolations({
    tiles: [], meta: {}, ledgerIds: new Set(), searchUrlIds: SEARCH_URL_GRANDFATHERED,
  });
  assert.equal(
    empty.filter((x) => x.includes('rule 7') && x.includes('is not a tile')).length,
    SEARCH_URL_GRANDFATHERED.size,
  );
});

test('rule 7 - the shipped grandfathered set matches the catalog exactly', async () => {
  const { META } = await import('../../lib/meta.js');
  const actual = Object.keys(META)
    .filter((id) => isSearchUrl(META[id].citationUrl || ''))
    .sort();
  assert.deepEqual([...SEARCH_URL_GRANDFATHERED].sort(), actual,
    'SEARCH_URL_GRANDFATHERED has drifted from lib/meta.js');
});

// spec-v1000: rule 8. `nmr` credited "e.g. Chen L, et al. and subsequent
// validations of the neutrophil-to-monocyte ratio" -- PubMed carries no paper by
// that author on that ratio, so a reader following the citation found nothing.
// The rule catches the SHAPE that let it in: an attribution the citation
// gestures at rather than commits to.

test('rule 8 - a hedged "e.g. <Author>" attribution fails', () => {
  const b = baseline();
  b.meta['kdigo-aki'].citation = 'Prognostic value reviewed across cohorts (e.g. Chen L, et al.).';
  const v = findCitationViolations(b);
  assert.ok(v.some((x) => /rule 8/.test(x)), v.join('; '));
});

test('rule 8 - "such as" and "including" hedge the same way', () => {
  for (const hedge of ['such as Smith AB', 'including Smith AB']) {
    const b = baseline();
    b.meta['kdigo-aki'].citation = `Reviewed across cohorts, ${hedge}, and others.`;
    assert.ok(findCitationViolations(b).some((x) => /rule 8/.test(x)), hedge);
  }
});

test('rule 8 - a properly named paper is not a hedge', () => {
  // The rule must not fire on a citation that actually names its source, nor on
  // an "e.g." that introduces something other than an author.
  for (const ok of [
    'Chen L, Wang Y, Zhang Q. A cohort study. Blood. 2019;133(4):301-310.',
    'Standard infusion arithmetic (e.g. mL/hr from a dose per minute).',
    'KDIGO AKI staging, e.g. stage 2 and stage 3 thresholds.',
  ]) {
    const b = baseline();
    b.meta['kdigo-aki'].citation = ok;
    assert.deepEqual(
      findCitationViolations(b).filter((x) => /rule 8/.test(x)), [], ok,
    );
  }
});

// spec-v54 §4.1 / §6: prove the citation-integrity gate bites on each of its
// five rules and does not false-positive on a well-formed catalog.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  findCitationViolations,
  parseTiles,
  parseLedgerIds,
  ISSUER_PATTERN,
} from '../../scripts/check-citations.mjs';

// A minimal well-formed baseline: one clinical guideline tile (dated + ledgered)
// and one non-clinical tile with no citation (allowed).
function baseline() {
  return {
    tiles: [
      { id: 'kdigo-aki', clinical: true },
      { id: 'appeal-letter', clinical: false },
    ],
    meta: {
      'kdigo-aki': {
        citation: 'KDIGO Clinical Practice Guideline for Acute Kidney Injury. Kidney Int Suppl 2012;2:1-138.',
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

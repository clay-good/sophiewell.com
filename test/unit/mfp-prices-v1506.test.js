// spec-v1506 tool 9: Medicare negotiated price check.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mfpPriceCheck as m, DRUGS } from '../../lib/mfp-prices-v1506.js';

test('the spec example: Eliquis $231 in 2026, $237.25 from January 1, 2027', () => {
  const r = m({ drug: 'eliquis', date: '2026-06-01' });
  assert.equal(r.price, 231);
  assert.match(r.band, /From January 1, 2027: \$237\.25/);
  assert.equal(m({ drug: 'eliquis', date: '2027-03-01' }).price, 237.25);
});

test('the four deselected drugs say so from January 1, 2027', () => {
  for (const d of ['entresto', 'novolog', 'stelara', 'xarelto']) {
    assert.match(m({ drug: d, date: '2026-12-31' }).band, /deselected/, d);
    assert.equal(m({ drug: d, date: '2027-01-01' }).bandLabel, 'Deselected', d);
  }
});

test('a 2027 drug before its start, and a 2028 drug with no price yet', () => {
  assert.equal(m({ drug: 'ozempic', date: '2026-09-26' }).bandLabel, 'Not yet in effect');
  assert.equal(m({ drug: 'biktarvy', date: '2026-09-26' }).bandLabel, 'Price not yet published');
});

test('past the table\'s end it asks instead of printing a stale price', () => {
  assert.equal(m({ drug: 'eliquis', date: '2028-01-01' }).valid, false);
});

test('40 drugs, a blank drug asks, a blank date uses today and says so', () => {
  assert.equal(DRUGS.length, 40);
  assert.equal(m({}).valid, false);
  assert.match(m({ drug: 'eliquis' }, new Date(Date.UTC(2026, 8, 26))).notes[0], /today/);
});

// The CMS file's NDC rows, as data/mfp-negotiated-prices ships them.
const ROWS = [
  { drug: 'ELIQUIS; ELIQUIS SPRINKLE', ndc11: '00003-0893-21', effective: '2026-01-01', end: '2026-12-31', perUnit: 4.145072 },
  { drug: 'ELIQUIS; ELIQUIS SPRINKLE', ndc11: '00003-0893-21', effective: '2027-01-01', end: null, perUnit: 4.257193 },
  { drug: 'ENTRESTO; ENTRESTO SPRINKLE', ndc11: '00078-0777-20', effective: '2026-01-01', end: '2025-12-31', perUnit: 4.9 },
];

test('an NDC names its drug and gives the per-unit price on the day, in any of its written forms', () => {
  for (const ndc of ['00003-0893-21', '0003-0893-21', '00003089321']) {
    const r = m({ ndc, date: '2027-02-01', ndcRows: ROWS });
    assert.equal(r.price, 237.25, ndc);
    assert.match(r.notes[0], /^NDC 00003-0893-21: \$4\.257193 per unit on February 1, 2027/);
  }
  assert.match(m({ ndc: '00003-0893-21', drug: 'xarelto', date: '2026-06-01', ndcRows: ROWS }).notes[0], /not the drug chosen/);
});

test('an NDC dropped before its price took effect has no period, and an unknown NDC is refused, not read as no price', () => {
  assert.match(m({ ndc: '00078-0777-20', date: '2026-06-01', ndcRows: ROWS }).notes[0], /has no negotiated price on June 1, 2026/);
  assert.match(m({ ndc: '00003-0893-99', date: '2026-06-01', ndcRows: ROWS }).message, /is not in the CMS/);
  assert.match(m({ ndc: '0003089321', date: '2026-06-01', ndcRows: ROWS }).message, /10-digit NDC without hyphens/);
});

test('an NDC list that could not be loaded is said so, never taken as "not in the file"', () => {
  const r = m({ ndc: '00003-0893-21', date: '2026-06-01', ndcRows: null });
  assert.equal(r.valid, false);
  assert.match(r.message, /could not be loaded/);
});

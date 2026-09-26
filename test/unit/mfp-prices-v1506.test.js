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

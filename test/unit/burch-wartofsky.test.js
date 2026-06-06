// spec-v58 §2.9: Burch-Wartofsky point scale.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { burchWartofsky } from '../../lib/scoring-v6.js';

test('example: total 75, highly suggestive (>=45)', () => {
  const r = burchWartofsky({ temp: 15, cns: 10, gi: 10, hr: 15, chf: 5, afib: true, precipitant: true });
  assert.equal(r.total, 75);
  assert.match(r.band, /Highly suggestive/);
});
test('band boundaries: 25 impending, <25 unlikely', () => {
  assert.match(burchWartofsky({ temp: 15, cns: 10 }).band, /Impending/);
  assert.match(burchWartofsky({ temp: 5, cns: 0 }).band, /unlikely/);
});
test('empty input -> 0 unlikely (no throw)', () => {
  assert.equal(burchWartofsky({}).total, 0);
});

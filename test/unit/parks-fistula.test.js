// spec-v395: Parks classification of an anal fistula (inter/trans/supra/extra-sphincteric). Worked-example
// tests: each type and its sphincter-relationship description, the complex flag on supra/extra, alias +
// grade input, and the invalid-type guard. Types transcribed from Parks 1976 (Br J Surg) (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parksFistula } from '../../lib/parks-fistula-v395.js';

test('transsphincteric: through both sphincters (the META example)', () => {
  const r = parksFistula({ type: 'transsphincteric' });
  assert.equal(r.valid, true);
  assert.equal(r.type, 'transsphincteric');
  assert.equal(r.complex, false);
  assert.match(r.band, /through both the internal and external sphincters/);
});

test('intersphincteric: internal sphincter only, most common, not complex', () => {
  const r = parksFistula({ type: 'intersphincteric' });
  assert.equal(r.complex, false);
  assert.match(r.band, /the most common type/);
});

test('suprasphincteric: above the puborectalis, complex, flagged', () => {
  const r = parksFistula({ type: 'suprasphincteric' });
  assert.equal(r.complex, true);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /above the puborectalis/);
});

test('extrasphincteric: outside the sphincter complex, complex, flagged', () => {
  const r = parksFistula({ type: 'extrasphincteric' });
  assert.equal(r.complex, true);
  assert.match(r.band, /outside the external sphincter/);
});

test('short alias and grade input map to the types', () => {
  assert.equal(parksFistula({ type: 'inter' }).type, 'intersphincteric');
  assert.equal(parksFistula({ type: 'SUPRA' }).type, 'suprasphincteric');
  assert.equal(parksFistula({ type: 'II' }).type, 'transsphincteric');
  assert.equal(parksFistula({ type: 4 }).type, 'extrasphincteric');
});

test('a missing or unknown type is invalid', () => {
  assert.equal(parksFistula({}).valid, false);
  assert.equal(parksFistula({ type: 'superficial' }).valid, false);
});

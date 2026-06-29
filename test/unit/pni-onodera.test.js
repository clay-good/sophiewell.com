// spec-v178 §2.2: Onodera PNI = 10*alb(g/dL) + 0.005*lymphocytes.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pniOnodera } from '../../lib/ltcga-v178.js';

test('PNI worked example (alb 4.0, lymph 1500) = 47.5', () => {
  const r = pniOnodera({ albuminGdl: 4.0, lymphocytes: 1500 });
  assert.equal(r.value, 47.5);
  assert.match(r.band, /no increased risk/);
});

test('PNI 40 and 45 band edges', () => {
  assert.match(pniOnodera({ albuminGdl: 3.5, lymphocytes: 1000 }).band, /moderate/); // 40
  assert.match(pniOnodera({ albuminGdl: 3.0, lymphocytes: 1000 }).band, /high risk/); // 35
  assert.match(pniOnodera({ albuminGdl: 4.5, lymphocytes: 0.0001 }).band, /no increased risk/);
});

test('PNI guards blanks', () => {
  assert.equal(pniOnodera({ albuminGdl: 4.0 }).valid, false);
  assert.equal(pniOnodera({}).valid, false);
});

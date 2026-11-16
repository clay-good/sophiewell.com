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

// spec-v1746: an entered value outside the range read as blank and was asked for again.
test('spec-v1746: pni-onodera names the range of an impossible entry and still asks for a blank one', () => {
  const ex = { albuminGdl: 4, lymphocytes: 1500 };
  assert.equal(pniOnodera(ex).valid, true);
  for (const k of Object.keys(ex)) {
    const r = pniOnodera({ ...ex, [k]: -999999 });
    assert.equal(r.valid, false);
    assert.match(r.message, /must be greater than 0/);
    assert.match(pniOnodera({ ...ex, [k]: '' }).message, /^Enter serum albumin \(g\/dL\) and total lymphocyte/);
  }
});

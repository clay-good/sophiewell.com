// spec-v502: Norwood (Hamilton-Norwood) scale of male-pattern hair loss (stages I-VII, plus III vertex).
// Worked-example tests: the endpoints, the III vertex stage and its aliases, numeric input, invalid-stage
// guard. Stages transcribed from Norwood 1975 (South Med J) (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { norwoodHairloss } from '../../lib/norwood-hairloss-v502.js';

test('stage IV: recession and vertex loss separated by a band (the META example)', () => {
  const r = norwoodHairloss({ stage: 'IV' });
  assert.equal(r.valid, true);
  assert.equal(r.stage, 'IV');
  assert.match(r.band, /separated by a band of hair across the top/);
});

test('stage I is the floor: no or minimal recession', () => {
  assert.match(norwoodHairloss({ stage: 'I' }).band, /no recession, or minimal recession/);
});

test('stage VII is the ceiling: only a horseshoe band remains', () => {
  const r = norwoodHairloss({ stage: 'VII' });
  assert.equal(r.stage, 'VII');
  assert.match(r.band, /only a horseshoe band of hair remains/);
});

test('III vertex is a distinct stage with several accepted aliases', () => {
  for (const alias of ['III vertex', 'iii vertex', '3 vertex', '3v', 'IIIv']) {
    const r = norwoodHairloss({ stage: alias });
    assert.equal(r.valid, true, `alias ${alias}`);
    assert.equal(r.stage, 'III vertex');
  }
  assert.match(norwoodHairloss({ stage: '3 vertex' }).band, /mainly vertex \(crown\) hair loss/);
});

test('the confluence stages V and VI turn on the bridging band', () => {
  assert.match(norwoodHairloss({ stage: 'V' }).band, /narrower and sparser/);
  assert.match(norwoodHairloss({ stage: 'VI' }).band, /bridging band is gone/);
});

test('numeric input maps to the main stages', () => {
  assert.equal(norwoodHairloss({ stage: 1 }).stage, 'I');
  assert.equal(norwoodHairloss({ stage: 7 }).stage, 'VII');
});

test('a missing or out-of-range stage is invalid', () => {
  assert.equal(norwoodHairloss({}).valid, false);
  assert.equal(norwoodHairloss({ stage: '0' }).valid, false);
  assert.equal(norwoodHairloss({ stage: 'VIII' }).valid, false);
});

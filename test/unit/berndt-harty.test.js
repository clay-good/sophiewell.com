// spec-v403: Berndt-Harty classification of an osteochondral lesion of the talus (stages I/II/III/IV).
// Worked-example tests: each stage and its radiographic description, roman + numeric input, and the
// invalid-stage guard. Stages transcribed from Berndt-Harty 1959 (J Bone Joint Surg Am) (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { berndtHarty } from '../../lib/berndt-harty-v403.js';

test('stage III: detached, non-displaced (the META example)', () => {
  const r = berndtHarty({ stage: 'III' });
  assert.equal(r.valid, true);
  assert.equal(r.stage, 'III');
  assert.match(r.band, /completely detached fragment remaining in the crater/);
  assert.match(r.band, /without displacement/);
});

test('stage I: subchondral compression, cartilage intact', () => {
  const r = berndtHarty({ stage: 'I' });
  assert.equal(r.stage, 'I');
  assert.match(r.band, /subchondral compression/);
  assert.match(r.band, /cartilage is intact/);
});

test('stage II vs IV: partial detachment vs displaced loose body', () => {
  assert.match(berndtHarty({ stage: 'II' }).band, /partially detached/);
  const four = berndtHarty({ stage: 'IV' });
  assert.equal(four.stage, 'IV');
  assert.match(four.band, /displaced osteochondral fragment/);
});

test('numeric input maps to the stages', () => {
  assert.equal(berndtHarty({ stage: 1 }).stage, 'I');
  assert.equal(berndtHarty({ stage: 4 }).stage, 'IV');
});

test('a missing or out-of-range stage is invalid', () => {
  assert.equal(berndtHarty({}).valid, false);
  assert.equal(berndtHarty({ stage: 'V' }).valid, false);
  assert.equal(berndtHarty({ stage: '0' }).valid, false);
});

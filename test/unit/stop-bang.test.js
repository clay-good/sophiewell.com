import { test } from 'node:test';
import assert from 'node:assert/strict';
import { stopBang } from '../../lib/scoring-v4.js';

const zero = {
  snore: false, tired: false, observedApnea: false, highBp: false,
  bmiGt35: false, ageGt50: false, neckGt40cm: false, male: false,
};

test('stop-bang 0 of 8 -> low risk band (Chung 2012)', () => {
  const r = stopBang(zero);
  assert.equal(r.score, 0);
  assert.match(r.band, /low risk/i);
});

test('stop-bang 2 of 8 stays in low-risk band', () => {
  const r = stopBang({ ...zero, snore: true, tired: true });
  assert.equal(r.score, 2);
  assert.match(r.band, /low risk/i);
});

test('stop-bang 3 of 8 -> intermediate-risk band (cutoff 3-4)', () => {
  const r = stopBang({ ...zero, snore: true, tired: true, observedApnea: true });
  assert.equal(r.score, 3);
  assert.match(r.band, /intermediate/i);
});

test('stop-bang 5 of 8 -> high-risk band (Chung 2012 cutoff >=5)', () => {
  const r = stopBang({ ...zero, snore: true, tired: true, observedApnea: true, highBp: true, male: true });
  assert.equal(r.score, 5);
  assert.match(r.band, /high risk for moderate-to-severe OSA/i);
});

test('stop-bang 8 of 8 -> high-risk band (maximum)', () => {
  const r = stopBang({
    snore: true, tired: true, observedApnea: true, highBp: true,
    bmiGt35: true, ageGt50: true, neckGt40cm: true, male: true,
  });
  assert.equal(r.score, 8);
  assert.match(r.band, /high risk/i);
});

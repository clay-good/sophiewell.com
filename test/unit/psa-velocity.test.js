// spec-v130 2.3: PSA velocity (Carter 1992). Two-point rate (later - earlier) /
// years; > 0.75 ng/mL/yr raises suspicion for cancer.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { psaVelocity } from '../../lib/uro-v130.js';

test('rising velocity above 0.75 is flagged', () => {
  const r = psaVelocity({ psa1: 3, psa2: 4.5, months: 12 });
  assert.equal(r.valid, true);
  assert.equal(r.velocity, 1.5); // (4.5-3)/1yr
  assert.equal(r.abnormal, true);
  assert.match(r.band, /raising suspicion/);
});

test('slow rise below threshold is not flagged; interval scales to years', () => {
  const r = psaVelocity({ psa1: 4, psa2: 4.5, months: 24 });
  assert.equal(r.velocity, 0.25); // 0.5 over 2 years
  assert.equal(r.abnormal, false);
});

test('falling PSA reports a negative velocity', () => {
  const r = psaVelocity({ psa1: 5, psa2: 4, months: 12 });
  assert.equal(r.velocity, -1);
  assert.equal(r.abnormal, false);
  assert.match(r.band, /falling/);
});

test('blank field -> valid:false; scalar -> valid:false', () => {
  assert.equal(psaVelocity({ psa1: 3, psa2: 4.5 }).valid, false);
  assert.equal(psaVelocity(7).valid, false);
});

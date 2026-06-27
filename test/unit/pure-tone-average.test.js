// spec-v167 2.5: pure-tone average. 3-frequency vs 4-frequency average and the
// severity bands.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pureToneAverage } from '../../lib/oneformula-v167.js';

test('tile example: 4-frequency PTA 50 dB HL, moderate', () => {
  // 4FA = mean(40,45,50,65) = 50; 3FA = mean(40,45,50) = 45
  const r = pureToneAverage({ t500: 40, t1000: 45, t2000: 50, t4000: 65 });
  assert.equal(r.valid, true);
  assert.equal(r.pta3, 45);
  assert.equal(r.pta4, 50);
  assert.equal(r.bandLabel, 'Moderate');
});

test('3-frequency only when 4000 Hz omitted', () => {
  const r = pureToneAverage({ t500: 20, t1000: 25, t2000: 30 });
  assert.equal(r.pta3, 25);
  assert.equal(r.pta4, null);
  assert.equal(r.bandLabel, 'Normal'); // 25 <= 25
});

test('severity bands at boundaries (25 normal, 26 mild, 90 severe, 91 profound)', () => {
  assert.equal(pureToneAverage({ t500: 25, t1000: 25, t2000: 25 }).bandLabel, 'Normal');
  assert.equal(pureToneAverage({ t500: 26, t1000: 26, t2000: 26 }).bandLabel, 'Mild');
  assert.equal(pureToneAverage({ t500: 90, t1000: 90, t2000: 90 }).bandLabel, 'Severe');
  assert.equal(pureToneAverage({ t500: 91, t1000: 91, t2000: 91 }).bandLabel, 'Profound');
});

test('guards: missing required frequency', () => {
  assert.equal(pureToneAverage({ t500: 20, t1000: 25 }).valid, false);
  assert.equal(pureToneAverage({}).valid, false);
});

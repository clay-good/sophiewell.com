// spec-v117 2.4: HAT score (Lou 2008). NIHSS (<15=0/15-20=+1/>20=+2), CT
// hypodensity (none=0/<=1/3 MCA=+1/>1/3=+2), diabetes or glucose >200 mg/dL
// (+1); total 0-5. Symptomatic ICH verbatim: 2/5/10/15/44% at 0/1/2/3/>3.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hatScore } from '../../lib/neuro-v117.js';

test('worked max: NIHSS 22, >1/3 MCA hypodensity, diabetes -> 5/5, sICH ~44%', () => {
  const r = hatScore({ nihss: 22, hypodensity: 'more', diabetes: true });
  assert.equal(r.valid, true);
  assert.equal(r.total, 5);
  assert.equal(r.sich, '44%');
  assert.equal(r.abnormal, true);
});

test('worked min: NIHSS 10, no hypodensity, no diabetes -> 0/5, sICH ~2%', () => {
  const r = hatScore({ nihss: 10 });
  assert.equal(r.total, 0);
  assert.equal(r.sich, '2%');
  assert.equal(r.abnormal, false);
});

test('mid case: NIHSS 18 (+1), <=1/3 MCA (+1), no diabetes -> 2/5, sICH ~10%', () => {
  const r = hatScore({ nihss: 18, hypodensity: 'third' });
  assert.equal(r.total, 2);
  assert.equal(r.sich, '10%');
});

test('NIHSS band boundary: 15 scores +1, 20 scores +1, 21 scores +2', () => {
  assert.equal(hatScore({ nihss: 15 }).total, 1);
  assert.equal(hatScore({ nihss: 20 }).total, 1);
  assert.equal(hatScore({ nihss: 21 }).total, 2);
});

test('missing NIHSS renders a complete-the-fields fallback', () => {
  const r = hatScore({ hypodensity: 'more' });
  assert.equal(r.valid, false);
  assert.match(r.band, /Enter the baseline NIHSS/);
});

// spec-v104 2.2: Vereckei aVR algorithm, 4 sequential steps (Vereckei 2008).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { vereckeiAvr } from '../../lib/cardio-v104.js';

test('all steps negative -> supraventricular (defined verdict)', () => {
  const r = vereckeiAvr({});
  assert.equal(r.vt, false);
  assert.equal(r.verdict, 'supraventricular');
  assert.equal(r.firedStep, null);
});

test('step 1 positive -> VT, names step 1', () => {
  const r = vereckeiAvr({ initialR: true });
  assert.equal(r.vt, true);
  assert.match(r.firedStep, /Step 1/);
});

test('vi/vt <= 1 (step 4) alone -> VT', () => {
  const r = vereckeiAvr({ viVt: true });
  assert.equal(r.vt, true);
  assert.match(r.firedStep, /Step 4/);
});

test('first positive step wins: step 2 named when 1 negative', () => {
  const r = vereckeiAvr({ initialWidth: true, notch: true });
  assert.match(r.firedStep, /Step 2/);
});

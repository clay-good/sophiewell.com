// spec-v127 2.2: RIFLE (Bellomo 2004). Worst of creatinine/GFR and urine output.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { rifleAki } from '../../lib/nephro-v127.js';

test('creatinine x2.2 -> Injury', () => {
  const r = rifleAki({ baselineCr: 1.0, currentCr: 2.2 });
  assert.equal(r.valid, true);
  assert.equal(r.className, 'Injury');
  assert.match(r.band, /creatinine\/GFR/);
});

test('worst-of rule: urine output Failure overrides a mild creatinine', () => {
  const r = rifleAki({ baselineCr: 1.0, currentCr: 1.0, uoClass: '3' });
  assert.equal(r.className, 'Failure');
  assert.match(r.band, /urine output/);
});

test('x1.5 -> Risk; x3 -> Failure', () => {
  assert.equal(rifleAki({ baselineCr: 1.0, currentCr: 1.6 }).className, 'Risk');
  assert.equal(rifleAki({ baselineCr: 1.0, currentCr: 3.0 }).className, 'Failure');
});

test('no criteria met / nothing entered handled', () => {
  assert.equal(rifleAki({ baselineCr: 1.0, currentCr: 1.0 }).class, 0);
  assert.equal(rifleAki({}).valid, false);
  assert.equal(rifleAki(9).valid, false);
});

// spec-v1209: the urine-output category is a 0-3 selection; the clamp read
// anything higher as Failure, the worst RIFLE class.
test('a urine-output category off the scale is refused', () => {
  const r = rifleAki({ uoClass: 9999 });
  assert.equal(r.valid, false);
  assert.match(r.message, /urine-output category must be between 0 and 3/);
});

test('the worst real category still classifies', () => {
  assert.equal(rifleAki({ uoClass: 3 }).class, 3);
});

// spec-v1211: the creatinine arm compares CURRENT against BASELINE, so an
// impossible BASELINE makes a real current value look unremarkable.
test('an impossible baseline creatinine used to erase the whole staging', () => {
  const real = rifleAki({ baselineCr: 1.0, currentCr: 3.0 });
  assert.match(real.band, /RIFLE class Failure/);
  const bad = rifleAki({ baselineCr: 250, currentCr: 3.0 });
  assert.equal(bad.valid, false);
  assert.match(bad.message, /baseline creatinine in mg\/dL must be between 0.1 and 25/);
  assert.ok(!/no criteria met/.test(bad.message));
});

test('the creatinine arm stays optional: urine output alone still classifies', () => {
  // gradeFault skips a blank, so a tile scored from urine output is untouched.
  assert.equal(rifleAki({ uoClass: 2 }).class, 2);
});

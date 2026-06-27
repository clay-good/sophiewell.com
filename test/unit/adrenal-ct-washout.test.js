// spec-v165 2.2: adrenal CT washout - absolute (APW) and relative (RPW). The
// (E−U) and E denominators are guarded.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { adrenalCtWashout } from '../../lib/radiology-v165.js';

test('tile example: APW ≥ 60% adenoma path', () => {
  // APW = (80-35)/(80-15) = 45/65 = 69.2%; RPW = (80-35)/80 = 56.3%
  const r = adrenalCtWashout({ enhanced: 80, delayed: 35, unenhanced: 15 });
  assert.equal(r.valid, true);
  assert.equal(r.apw, 69.2);
  assert.equal(r.rpw, 56.3);
  assert.equal(r.apwAdenoma, true);
  assert.match(r.band, /adenoma/);
});

test('RPW-only path when no unenhanced scan', () => {
  const r = adrenalCtWashout({ enhanced: 80, delayed: 35 });
  assert.equal(r.valid, true);
  assert.equal(r.apw, null);
  assert.equal(r.rpw, 56.3);
  assert.equal(r.rpwAdenoma, true);
});

test('washout below threshold → indeterminate / non-adenoma', () => {
  // APW = (60-50)/(60-20) = 10/40 = 25% < 60
  const r = adrenalCtWashout({ enhanced: 60, delayed: 50, unenhanced: 20 });
  assert.equal(r.apw, 25);
  assert.equal(r.apwAdenoma, false);
  assert.equal(r.bandLabel, 'Indeterminate / non-adenoma');
});

test('lipid-rich adenoma flagged when unenhanced ≤ 10 HU', () => {
  const r = adrenalCtWashout({ enhanced: 40, delayed: 38, unenhanced: 5 });
  assert.equal(r.lipidRich, true);
});

test('guards: E=0, E−U=0, blank cells', () => {
  assert.equal(adrenalCtWashout({ enhanced: 0, delayed: 10 }).valid, false);
  assert.equal(adrenalCtWashout({ enhanced: 50, delayed: 20, unenhanced: 50 }).valid, false); // E-U=0
  assert.equal(adrenalCtWashout({ enhanced: 80 }).valid, false);
  assert.equal(adrenalCtWashout({}).valid, false);
});

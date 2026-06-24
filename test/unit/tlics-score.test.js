// spec-v146 2.4: TLICS - Thoracolumbar Injury Classification and Severity
// (Vaccaro 2005). Morphology + neurology + PLC sum 0-10; <= 3 nonoperative, 4
// indeterminate, >= 5 operative. Incomplete cord (3) > complete cord (2).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { tlicsScore } from '../../lib/spine-v146.js';

test('total 3 -> nonoperative (boundary)', () => {
  const r = tlicsScore({ morphology: 'compression', neuro: 'intact', plc: 'disrupted' }); // 1+0+3... = 4? no
  // build exactly 3: burst(2)+intact(0)+... need PLC 1? none. Use translation? Use compression+root+intact = 3
  const r3 = tlicsScore({ morphology: 'compression', neuro: 'root', plc: 'intact' }); // 1+2+0 = 3
  assert.equal(r3.valid, true);
  assert.equal(r3.score, 3);
  assert.equal(r3.bandLabel, 'Nonoperative');
  assert.equal(r3.abnormal, false);
  void r;
});

test('total 4 -> indeterminate', () => {
  const r = tlicsScore({ morphology: 'burst', neuro: 'intact', plc: 'indeterminate' }); // 2+0+2 = 4
  assert.equal(r.score, 4);
  assert.equal(r.bandLabel, 'Indeterminate');
  assert.equal(r.abnormal, true);
});

test('total 5 -> operative (4->5 indeterminate->operative flip)', () => {
  const r = tlicsScore({ morphology: 'compression', neuro: 'root', plc: 'indeterminate' }); // 1+2+2 = 5
  assert.equal(r.score, 5);
  assert.equal(r.bandLabel, 'Operative');
  assert.equal(r.abnormal, true);
});

test('incomplete cord (3) scores higher than complete cord (2)', () => {
  const complete = tlicsScore({ morphology: 'compression', neuro: 'complete', plc: 'intact' }); // 1+2+0 = 3
  const incomplete = tlicsScore({ morphology: 'compression', neuro: 'incomplete', plc: 'intact' }); // 1+3+0 = 4
  assert.equal(complete.score, 3);
  assert.equal(incomplete.score, 4);
});

test('ceiling 10', () => {
  assert.equal(tlicsScore({ morphology: 'distraction', neuro: 'incomplete', plc: 'disrupted' }).score, 10); // 4+3+3
});

test('blank category -> complete-the-fields fallback', () => {
  const r = tlicsScore({ morphology: 'burst', neuro: 'intact' });
  assert.equal(r.valid, false);
  assert.match(r.message, /posterior ligamentous complex/);
});

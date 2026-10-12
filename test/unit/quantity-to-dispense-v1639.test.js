// spec-v1639 tool 1: the quantity to dispense.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { quantityToDispense as q } from '../../lib/quantity-to-dispense-v1639.js';

test('tablets: halves round up to whole tablets', () => {
  const r = q({ form: 'solid-oral', days: 15, perDose: 0.5, dosesPerDay: 1 });
  assert.deepEqual([r.quantity, r.daysCovered], [8, 16]);
  const b = q({ form: 'solid-oral', days: 30, perDose: 1, dosesPerDay: 3, packageSize: 100 });
  assert.deepEqual([b.quantity, b.packages, b.leftover, b.daysCovered], [90, 1, 10, 33]);
});

test('taper: the sum over steps, and the days are the step days', () => {
  const r = q({ form: 'taper', taperSteps: '4, 1, 3\n3, 1, 3\n2, 1, 3\n1, 1, 3' });
  assert.deepEqual([r.quantity, r.daysWanted, r.daysCovered], [30, 12, undefined]);
  assert.match(q({ form: 'taper', taperSteps: '4, 1' }).message, /step 1 as three numbers/);
  assert.match(q({ form: 'taper' }).message, /^Enter the taper steps/);
});

test('insulin: priming counted per injection; the discard limit can bind', () => {
  // 40 units + 2 x 2 priming = 44 a day; 30 days = 1,320 units; 300-unit pens: 5 pens.
  const r = q({ form: 'pens-or-vials', days: 30, unitsPerDay: 40, injectionsPerDay: 2, primingUnits: 2, unitsPerMl: 100, mlPerPen: 3, packageSize: 5 });
  assert.deepEqual([r.quantity, r.packages, r.daysCovered], [5, 1, 34]);
  // 5 units a day: one pen by units, but a 28-day in-use limit makes 90 days need 4.
  const d = q({ form: 'pens-or-vials', days: 90, unitsPerDay: 5, injectionsPerDay: 1, primingUnits: 0, unitsPerMl: 100, mlPerPen: 3, discardDays: 28 });
  assert.deepEqual([d.quantity, d.daysCovered], [4, 112]);
  assert.match(d.note, /in-use discard limit binds/);
  assert.match(q({ form: 'pens-or-vials', days: 30, unitsPerDay: 40, injectionsPerDay: 2, unitsPerMl: 100, mlPerPen: 3 }).note, /Priming units per injection were not entered/);
});

test('inhaler, drops, patches and supplies', () => {
  assert.equal(q({ form: 'inhaler', days: 90, puffsPerDose: 2, dosesPerDay: 2, actuations: 120 }).quantity, 3);
  assert.equal(q({ form: 'inhaler', days: 90, puffsPerDose: 2, dosesPerDay: 2, actuations: 120, primingPuffs: 4 }).quantity, 4);
  const e = q({ form: 'drops', days: 30, dropsPerEye: 1, eyes: 2, dosesPerDay: 2, dropsPerMl: 20, packageSize: 5 });
  assert.deepEqual([e.quantity, e.packages, e.daysCovered], [6, 2, 50]);
  assert.match(q({ form: 'drops', days: 30, dropsPerEye: 1, eyes: 2, dosesPerDay: 2 }).message, /drops per mL/);
  const p = q({ form: 'patch', days: 30, changeInterval: 72, changeUnit: 'hr-interval', patchesWorn: 1, packageSize: 5 });
  assert.deepEqual([p.quantity, p.packages, p.daysCovered], [10, 2, 30]);
  assert.equal(q({ form: 'patch', days: 28, changeInterval: 7, changeUnit: 'day-interval', patchesWorn: 1 }).quantity, 4);
  assert.match(q({ form: 'patch', days: 28, changeInterval: 7, patchesWorn: 1 }).message, /hours or days/);
  const t = q({ form: 'countable-item', days: 90, usesPerDay: 3, packageSize: 50 });
  assert.deepEqual([t.quantity, t.packages, t.leftover], [270, 6, 30]);
});

test('refusals', () => {
  assert.equal(q({}).message, 'Choose the dosage form.');
  assert.match(q({ form: 'solid-oral', perDose: 1, dosesPerDay: 1 }).message, /days supply wanted/);
});

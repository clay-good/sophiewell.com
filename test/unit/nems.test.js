// spec-v544: NEMS.
// Worked-example tests: the two MUTUALLY EXCLUSIVE pairs made structural, the 56 ceiling versus the 66 naive
// sum that proves the exclusivity, the routine-care exclusion on item 8, and the guards. Items and weights
// transcribed from Reis Miranda and colleagues 1997 (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  nems, NEMS_INDEPENDENT, NEMS_VENTILATION, NEMS_VASOACTIVE, NEMS_MAX, NEMS_NAIVE_SUM,
} from '../../lib/nems-v544.js';

function base(over = {}) {
  const args = { ventilation: 'none', vasoactive: 'none' };
  for (const i of NEMS_INDEPENDENT) args[i.key] = 'no';
  return nems({ ...args, ...over });
}

test('nine items in total: five independent plus two exclusive pairs', () => {
  assert.equal(NEMS_INDEPENDENT.length, 5);
  // Each pair contributes two of the nine named items, offered as one three-way choice.
  assert.equal(NEMS_VENTILATION.length, 3);
  assert.equal(NEMS_VASOACTIVE.length, 3);
  assert.equal(NEMS_INDEPENDENT.length + 2 + 2, 9);
});

test('THE CEILING IS 56, AND A NAIVE SUM WOULD HAVE GIVEN 66', () => {
  const max = base({
    basicMonitoring: 'yes', ivMedication: 'yes', dialysis: 'yes',
    interventionsInIcu: 'yes', interventionsOutsideIcu: 'yes',
    ventilation: 'mechanical', vasoactive: 'multiple',
  });
  assert.equal(max.total, 56);
  assert.equal(max.max, NEMS_MAX);
  assert.equal(NEMS_MAX, 56);
  assert.equal(NEMS_NAIVE_SUM, 66);
  // 9 + 6 + 12 + 12 + 6 + 5 + 6 = 56, i.e. exactly one from each exclusive pair.
  assert.equal(9 + 6 + 12 + 12 + 6 + 5 + 6, 56);
});

test('ventilation is ONE choice, so mechanical and supplementary cannot both score', () => {
  assert.equal(base({ ventilation: 'supplementary' }).total, 3);
  assert.equal(base({ ventilation: 'mechanical' }).total, 12);
  // There is no way to reach 15.
  assert.equal(base({ ventilation: 'mechanical' }).ventilationPoints, 12);
  const mech = NEMS_VENTILATION.find((v) => v.value === 'mechanical');
  assert.match(mech.text, /EXCLUDES supplementary ventilatory care/);
});

test('vasoactive is ONE choice, so multiple REPLACES single rather than adding', () => {
  assert.equal(base({ vasoactive: 'single' }).total, 7);
  assert.equal(base({ vasoactive: 'multiple' }).total, 12);
  // Not 19.
  assert.notEqual(base({ vasoactive: 'multiple' }).total, 19);
  const multi = NEMS_VASOACTIVE.find((v) => v.value === 'multiple');
  assert.match(multi.text, /REPLACES the single-drug score/);
});

test('the independent item weights are the published ones', () => {
  const byKey = Object.fromEntries(NEMS_INDEPENDENT.map((i) => [i.key, i.points]));
  assert.deepEqual(byKey, {
    basicMonitoring: 9, ivMedication: 6, dialysis: 6, interventionsInIcu: 5, interventionsOutsideIcu: 6,
  });
});

test('IV medication explicitly excludes vasoactive drugs', () => {
  const iv = NEMS_INDEPENDENT.find((i) => i.key === 'ivMedication');
  assert.match(iv.text, /NOT including vasoactive or inotropic drugs/);
});

test('item 8 excludes routine care, the commonest scoring error', () => {
  const item8 = NEMS_INDEPENDENT.find((i) => i.key === 'interventionsInIcu');
  assert.match(item8.text, /Routine radiographs, echocardiograms, ECGs, dressings, and venous or arterial line insertion do NOT count/);
  assert.match(base().note, /inflates a large fraction of ICU patients by five points/);
});

test('a worked example (the META example)', () => {
  const r = base({ basicMonitoring: 'yes', ivMedication: 'yes', ventilation: 'mechanical', vasoactive: 'single' });
  assert.equal(r.total, 9 + 6 + 12 + 7);
  assert.equal(r.total, 34);
  assert.match(r.bandLabel, /NEMS 34 of 56/);
  assert.equal(r.ventilationPoints, 12);
  assert.equal(r.vasoactivePoints, 7);
});

test('the copy separates workload from severity and refuses the staffing reading', () => {
  const n = base().note;
  assert.match(n, /NURSING WORKLOAD consumed, not illness severity/);
  assert.match(n, /not a mortality predictor, and not a triage tool/);
  assert.match(n, /not a nurse-to-patient ratio/);
  assert.match(n, /under-counts the care of the dying/);
  assert.match(base().band, /not a nurse-to-patient ratio/);
});

test('the 63 disagreement is recorded rather than hidden', () => {
  assert.match(base().note, /One published source states the maximum as 63/);
});

test('the guards', () => {
  assert.equal(nems({}).valid, false);
  assert.equal(base({ ventilation: '' }).valid, false);
  const bad = base({ ventilation: 'both' });
  assert.equal(bad.valid, false);
  assert.match(bad.message, /mutually exclusive, so they are one choice rather than two items/);
  assert.equal(base({ vasoactive: 'two' }).valid, false);
  assert.equal(base({ basicMonitoring: 'maybe' }).valid, false);
});

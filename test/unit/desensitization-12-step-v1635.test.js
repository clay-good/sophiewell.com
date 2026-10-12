// spec-v1635 tool 15: three-bag, 12-step desensitization arithmetic against the published table.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { desensitization12Step } from '../../lib/desensitization-12-step-v1635.js';

const d = (i) => desensitization12Step(i);

test('600 mg in 250 mL bags reproduces every row of Table 5 (Tsao 2022)', () => {
  const r = d({ targetDose: 600, bagVolume: 250, finalRate: 80 });
  // The table prints 0.024, 0.24 and 2.38 mg/mL; 9.38, 18.75 and 250 mL infused; 6, 60 and 595.27 mg per bag.
  assert.deepEqual(r.bags.map((b) => [b.concentration, b.infused, b.drug]), [[0.024, 9.375, 6], [0.24, 18.75, 60], [2.3811, 250, 595.275]]);
  // step, solution, rate, minutes, volume, dose, cumulative: the table's rows, to its two decimals.
  const table = [
    [1, 1, 2.5, 15, 0.63, 0.015, 0.015], [2, 1, 5, 15, 1.25, 0.03, 0.045], [3, 1, 10, 15, 2.5, 0.06, 0.11], [4, 1, 20, 15, 5, 0.12, 0.23],
    [5, 2, 5, 15, 1.25, 0.3, 0.53], [6, 2, 10, 15, 2.5, 0.6, 1.13], [7, 2, 20, 15, 5, 1.2, 2.33], [8, 2, 40, 15, 10, 2.4, 4.73],
    [9, 3, 10, 15, 2.5, 5.95, 10.68], [10, 3, 20, 15, 5, 11.91, 22.58], [11, 3, 40, 15, 10, 23.81, 46.39], [12, 3, 80, 174.38, 232.5, 553.61, 600],
  ];
  assert.equal(r.steps.length, 12);
  for (const [i, [step, solution, rate, minutes, volume, dose, cumulative]] of table.entries()) {
    const s = r.steps[i];
    assert.deepEqual([s.step, s.solution, s.rate, s.minutes], [step, solution, rate, minutes], `step ${step}`);
    assert.ok(Math.abs(s.volume - volume) <= 0.0051, `step ${step} volume ${s.volume}`);
    assert.ok(Math.abs(s.dose - dose) <= 0.0051, `step ${step} dose ${s.dose}`);
    assert.ok(Math.abs(s.cumulative - cumulative) <= 0.0051, `step ${step} cumulative ${s.cumulative}`);
  }
  assert.equal(r.totalMinutes, 339.38);
});

test('the three bags always deliver the whole target dose', () => {
  for (const [targetDose, bagVolume, finalRate] of [[600, 250, 80], [175, 500, 160], [1000, 100, 40], [85, 250, 80]]) {
    const r = d({ targetDose, bagVolume, finalRate });
    assert.ok(Math.abs(r.steps[11].cumulative - targetDose) < 1e-6 * targetDose, `${targetDose}`);
    assert.ok(Math.abs(r.steps.filter((s) => s.solution === 3).reduce((a, s) => a + s.volume, 0) - bagVolume) < 0.01);
  }
});

test('a different bag volume or final rate is used as entered, and said', () => {
  const r = d({ targetDose: 600, bagVolume: 500, finalRate: 160 });
  assert.equal(r.steps[11].rate, 160);
  assert.match(r.notes.join(' '), /published table uses 250 mL bags and a final rate of 80 mL\/h/);
  assert.doesNotMatch(d({ targetDose: 600, bagVolume: 250, finalRate: 80 }).notes.join(' '), /this result uses the values entered/);
});

test('nothing is defaulted, and a bag too small for the ladder is refused', () => {
  assert.match(d({}).message, /^Enter the total target dose/);
  assert.match(d({ targetDose: 600 }).message, /^Enter the bag volume/);
  assert.match(d({ targetDose: 600, bagVolume: 250 }).message, /^Enter the final rate/);
  assert.equal(d({ targetDose: 600, bagVolume: 20, finalRate: 80 }).valid, false);
  assert.equal(d({ targetDose: 0, bagVolume: 250, finalRate: 80 }).valid, false);
  assert.equal(desensitization12Step(null).valid, false);
});

// spec-v1633 tool 23: percent of the guideline target dose (2022 AHA/ACC/HFSA, Table 14).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hfGdmtTargetPercent as d, DRUGS } from '../../lib/hf-gdmt-target-percent-v1633.js';

test('the targets are the table\'s, as total daily doses', () => {
  assert.deepEqual(Object.fromEntries(DRUGS.map((x) => [x.arg, x.target[0] === x.target[1] ? x.target[0] : x.target])), {
    captopril: 150, enalapril: [20, 40], fosinopril: 40, lisinopril: [20, 40], perindopril: [8, 16], quinapril: 40, ramipril: 10, trandolapril: 4,
    candesartan: 32, losartan: [50, 150], valsartan: 320, sacubitrilValsartan: 400,
    bisoprolol: 10, carvedilol: [50, 100], carvedilolCr: 80, metoprololSuccinate: 200,
    spironolactone: [25, 50], eplerenone: 50, dapagliflozin: 10, empagliflozin: 10,
    isdnHydralazineFixed: 120, isosorbideDinitrate: 120, hydralazine: 300, ivabradine: 15, vericiguat: 10,
  });
  assert.equal(DRUGS.some((x) => /digoxin/i.test(x.text)), false);
});

test('a single target gives one percent', () => {
  const m = d({ metoprololSuccinate: 100 });
  assert.equal(m.drugs[0].percentOfLow, 50);
  assert.equal(m.bandLabel, '50% of target');
  assert.equal(d({ sacubitrilValsartan: 200 }).drugs[0].percentOfHigh, 50);
  assert.equal(d({ dapagliflozin: 10 }).drugs[0].percentOfLow, 100);
  assert.equal(d({ isdnHydralazineFixed: 60 }).drugs[0].percentOfLow, 50);
});

test('a target range is shown against both ends and neither is picked', () => {
  const c = d({ carvedilol: 25 });
  assert.deepEqual([c.drugs[0].percentOfLow, c.drugs[0].percentOfHigh], [50, 25]);
  assert.equal(c.bandLabel, '25% to 50% of target');
  assert.match(c.notes[0], /both ends are shown/);
  const l = d({ lisinopril: 10 });
  assert.deepEqual([l.drugs[0].percentOfLow, l.drugs[0].percentOfHigh], [50, 25]);
});

test('several drugs are each compared; a dose above target is said, not judged', () => {
  const r = d({ lisinopril: 10, bisoprolol: 5, spironolactone: 25, empagliflozin: 10 });
  assert.equal(r.drugs.length, 4);
  assert.equal(r.bandLabel, '4 drugs compared');
  assert.equal(r.abnormal, false);
  assert.match(d({ bisoprolol: 20 }).notes[0], /200% .*above the table's target dose/);
  assert.match(d({ bisoprolol: 5 }).notes[0], /Mean dose achieved in the trials: 8\.6 mg total daily/);
  assert.doesNotMatch(d({ ramipril: 5 }).notes[0], /Mean dose/);
});

test('nothing entered, zero, or an impossible dose is refused', () => {
  assert.match(d({}).message, /^Enter the total daily dose/);
  assert.equal(d({ bisoprolol: 0 }).valid, false);
  assert.equal(d({ bisoprolol: 101 }).valid, false);
  assert.equal(d({ bisoprolol: 'x' }).valid, false);
  assert.equal(d(null).valid, false);
  assert.equal(d({ digoxin: 0.125 }).valid, false);
});

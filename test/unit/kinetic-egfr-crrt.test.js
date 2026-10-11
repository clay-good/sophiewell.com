// spec-v1631 tools 18 and 20: kinetic eGFR (Chen) and drug clearance by CRRT.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { kineticEgfr as ke, category } from '../../lib/kinetic-egfr-v1631.js';
import { crrtDrugClearance as crrt } from '../../lib/crrt-drug-clearance-v1631.js';

const base = { baselineCreatinine: 1, baselineClearance: 100, creatinine1: 1, creatinine2: 1, hours: 24, weight: 70 };

test('kinetic eGFR: an unchanged creatinine at baseline returns the baseline clearance', () => {
  const r = ke(base);
  assert.deepEqual([r.kineticEgfr, r.categoryChanged, r.abnormal], [100, false, false]);
  // 1.44 x 1 x 100 / (0.6 x 70) = 3.429 mg/dL per day.
  assert.equal(r.maxRisePerDay, 3.429);
});

test('kinetic eGFR: a rising creatinine lowers it, and a rise at the maximum rate gives zero', () => {
  const up = ke({ ...base, creatinine2: 2 });
  // (100 / 1.5) x (1 - 1 / 3.4286) = 47.22.
  assert.deepEqual([up.kineticEgfr, up.category, up.baselineCategory, up.categoryChanged, up.abnormal], [47.22, '30 to 59', '60 or more', true, true]);
  const max = ke({ ...base, creatinine2: 1 + 1.44 * 100 / 42 });
  assert.ok(Math.abs(max.rawValue) < 1e-9 || max.kineticEgfr === 0);
  const beyond = ke({ ...base, creatinine2: 5 });
  assert.deepEqual([beyond.kineticEgfr, beyond.rawValue < 0], [0, true]);
  assert.match(beyond.notes.join(' '), /reported as 0/);
  // A falling creatinine raises it above the static figure for the mean.
  assert.ok(ke({ ...base, creatinine1: 3, creatinine2: 2 }).kineticEgfr > 100 / 2.5);
});

test('kinetic eGFR: the same change over twice the time counts half as much', () => {
  const day = ke({ ...base, creatinine2: 2 }); const two = ke({ ...base, creatinine2: 2, hours: 48 });
  assert.ok(two.kineticEgfr > day.kineticEgfr);
  assert.equal(two.kineticEgfr, Number(((100 / 1.5) * (1 - 24 / (48 * (144 / 42)))).toPrecision(4)));
});

test('kinetic eGFR: weight or a maximum rise, not both; the categories are 60, 30 and 15', () => {
  assert.match(ke({ ...base, maxRise: 3 }).message, /not both/);
  assert.match(ke({ ...base, weight: '' }).message, /not both/);
  assert.equal(ke({ ...base, weight: '', maxRise: 3.429, creatinine2: 2 }).kineticEgfr, 47.22);
  assert.deepEqual([category(60), category(59.9), category(30), category(29.9), category(15), category(14.9)], ['60 or more', '30 to 59', '30 to 59', '15 to 29', '15 to 29', 'under 15']);
});

test('CRRT: convective is SC x ultrafiltrate flow, diffusive is SA x dialysate flow, in any flow unit', () => {
  const hf = crrt({ mode: 'hemofiltration', flowUnit: 'mL-h', ultrafiltrateFlow: 2000, sievingCoefficient: 0.8, otherClearance: 10 });
  assert.deepEqual([hf.crrtMlMin, hf.crrtLPerHour, hf.totalMlMin, hf.crrtSharePercent], [26.67, 1.6, 36.67, 72.73]);
  assert.equal(crrt({ mode: 'hemofiltration', flowUnit: 'L-h', ultrafiltrateFlow: 2, sievingCoefficient: 0.8 }).crrtMlMin, 26.67);
  assert.equal(crrt({ mode: 'hemodialysis', flowUnit: 'mL-min', dialysateFlow: 20, saturationCoefficient: 0.7 }).crrtMlMin, 14);
  const hdf = crrt({ mode: 'hemodiafiltration', flowUnit: 'L-h', ultrafiltrateFlow: 1, sievingCoefficient: 0.8, dialysateFlow: 1, saturationCoefficient: 0.7 });
  assert.deepEqual([hdf.convectiveMlMin, hdf.diffusiveMlMin, hdf.crrtMlMin], [13.33, 11.67, 25]);
});

test('CRRT: fluid given before the filter lowers the convective clearance by Qp / (Qp + pre-filter flow)', () => {
  const r = crrt({ mode: 'hemofiltration', flowUnit: 'mL-h', ultrafiltrateFlow: 2000, sievingCoefficient: 0.8, plasmaFlow: 6000, preFilterFlow: 1000 });
  // 26.67 x 6 / 7.
  assert.equal(r.crrtMlMin, 22.86);
  assert.equal(crrt({ mode: 'hemofiltration', flowUnit: 'mL-h', ultrafiltrateFlow: 2000, sievingCoefficient: 0.8, plasmaFlow: 6000, preFilterFlow: 0 }).crrtMlMin, 26.67);
  assert.match(crrt({ mode: 'hemofiltration', flowUnit: 'mL-h', ultrafiltrateFlow: 2000, sievingCoefficient: 0.8, plasmaFlow: 6000 }).message, /both the plasma flow and the pre-filter flow/);
  assert.match(crrt({ mode: 'hemodialysis', flowUnit: 'mL-min', dialysateFlow: 20, saturationCoefficient: 0.7, plasmaFlow: 100, preFilterFlow: 10 }).message, /for hemofiltration/);
});

test('CRRT: no coefficient is supplied, and a field from another mode is refused', () => {
  assert.match(crrt({ mode: 'hemofiltration', flowUnit: 'mL-h', ultrafiltrateFlow: 2000 }).message, /sieving coefficient/);
  assert.match(crrt({ mode: 'hemodialysis', flowUnit: 'L-h', dialysateFlow: 1, saturationCoefficient: 0.7, sievingCoefficient: 0.8 }).message, /not part of hemodialysis/);
  assert.match(crrt({ mode: 'hemofiltration', ultrafiltrateFlow: 2000, sievingCoefficient: 0.8 }).message, /unit the flows/);
  assert.match(crrt({ flowUnit: 'mL-h' }).message, /Choose the mode/);
  assert.match(crrt({ mode: 'hemofiltration', flowUnit: 'mL-h', ultrafiltrateFlow: 2000, sievingCoefficient: 0.8 }).notes.join(' '), /No other clearance was entered/);
});

// spec-v1699: drug-interaction-kinetics tools 3, 7, 8 and 9. Every vector is from the change's design.md, each
// cutoff on both sides of its boundary.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ddiStrengthClassify as dsc } from '../../lib/ddi-strength-classify-v1699.js';
import { doseHistoryLevel as dhl, doseLevel } from '../../lib/dose-history-level-v1699.js';
import { twoCompartmentParams as tcp } from '../../lib/two-compartment-params-v1699.js';
import { emaxHillEffect as ehe } from '../../lib/emax-hill-effect-v1699.js';

test('FDA inhibitor classes at and around each line', () => {
  const cls = (ratio) => dsc({ role: 'precipitant', ratio }).cls;
  assert.equal(cls('6.2'), 'Strong inhibitor');
  assert.equal(cls('5'), 'Strong inhibitor');
  assert.equal(cls('4.99'), 'Moderate inhibitor');
  assert.equal(cls('2'), 'Moderate inhibitor');
  assert.equal(cls('1.99'), 'Weak inhibitor');
  assert.equal(cls('1.25'), 'Weak inhibitor');
  assert.equal(cls('1.24'), 'Below the weak inhibitor threshold');
  assert.equal(cls('1'), 'No change');
});

test('FDA inducer classes by percent decrease', () => {
  const cls = (ratio) => dsc({ role: 'precipitant', ratio }).cls;
  assert.equal(cls('0.15'), 'Strong inducer');
  assert.equal(cls('0.2'), 'Strong inducer');
  assert.equal(cls('0.21'), 'Moderate inducer');
  assert.equal(cls('0.5'), 'Moderate inducer');
  assert.equal(cls('0.51'), 'Weak inducer');
  assert.equal(cls('0.8'), 'Weak inducer');
  assert.equal(cls('0.81'), 'Below the weak inducer threshold');
  assert.ok(dsc({ role: 'precipitant', ratio: '0.15' }).notes.some((n) => n.includes('85%')));
});

test('substrate sensitivity needs a strong-inhibitor study and an increase', () => {
  assert.equal(dsc({ role: 'substrate', ratio: '7', strongInhibitor: true }).cls, 'Sensitive substrate');
  assert.equal(dsc({ role: 'substrate', ratio: '4.99', strongInhibitor: 'true' }).cls, 'Moderate sensitive substrate');
  assert.equal(dsc({ role: 'substrate', ratio: '1.9', strongInhibitor: true }).cls, 'Below the moderate sensitive threshold');
  assert.match(dsc({ role: 'substrate', ratio: '7' }).message, /strong inhibitor/);
  assert.match(dsc({ role: 'substrate', ratio: '0.5', strongInhibitor: true }).message, /below 1 has no substrate class/);
});

test('ratio from two AUCs, and refusals', () => {
  assert.equal(dsc({ role: 'precipitant', aucWith: '62', aucWithout: '10' }).cls, 'Strong inhibitor');
  assert.match(dsc({ role: 'precipitant', ratio: '2', aucWith: '1' }).message, /not both/);
  assert.match(dsc({ role: 'precipitant' }).message, /^Enter the AUC ratio/);
  assert.match(dsc({ ratio: '2' }).message, /^Choose/);
  assert.match(dsc({ role: 'precipitant', ratio: '0' }).message, /above 0/);
});

const bolus = { route: 'bolus', vd: '50', halfLife: '12', interval: '12' };
test('dose history: a dose 3 h late gives 16.89 mg/L at 24 h against 15.00 on schedule', () => {
  const r = dhl({ ...bolus, doses: '0, 1000\n15, 1000', evalTimes: '24' });
  assert.deepEqual(r.levels[0], { t: 24, actual: 16.89, onTime: 15 });
});

test('dose history: infusion 19.43 at its end and 10.29 at 12 h', () => {
  const r = dhl({ ...bolus, route: 'infusion', infusionHours: '1', doses: '0, 1000', evalTimes: '1; 12' });
  assert.deepEqual(r.levels.map((l) => l.actual), [19.43, 10.29]);
});

test('dose history: oral 9.304 mg/L at 2 h, Cmax 9.429 at tmax 2.440 h', () => {
  const r = dhl({ route: 'oral', doses: '0, 500', vd: '40', halfLife: '6', interval: '24', ka: '1', bioavailability: '1', evalTimes: '2' });
  // 9.30446: design.md printed 9.305, a rounding of a rounded value; four figures of the exact value are 9.304.
  assert.equal(r.levels[0].actual, 9.304);
  assert.equal(r.peak, 9.429);
  assert.ok(r.notes.some((n) => n.includes('peak 9.429 mg/L at 2.44 h')));
});

test('dose history: ka equal to k uses the limit form, matching ka = k + 1e-7', () => {
  const k = Math.LN2 / 6;
  const p = { route: 'oral', v: 40, k, f: 1 };
  const limit = doseLevel(3, 500, { ...p, ka: k });
  const near = doseLevel(3, 500, { ...p, ka: k + 1e-7 });
  assert.equal(Number(limit.toPrecision(4)), 3.063);
  assert.equal(Number(limit.toPrecision(4)), Number(near.toPrecision(4)));
});

test('dose history: clock times, two doses at once, and refusals', () => {
  const r = dhl({ ...bolus, doses: '2026-11-07 08:00, 1000\n2026-11-07 23:00, 1000', evalTimes: '2026-11-08 08:00' });
  assert.equal(r.levels[0].actual, 16.89);
  const twice = dhl({ ...bolus, doses: '0, 500\n0, 500', evalTimes: '6' });
  assert.ok(twice.notes.some((n) => /2 doses at 0 h were counted as given together/.test(n)));
  assert.match(dhl({ ...bolus, doses: '0, 1000\n2026-11-07 08:00, 1000', evalTimes: '1' }).message, /not a mix/);
  assert.match(dhl({ ...bolus, doses: '', evalTimes: '1' }).message, /^Enter the doses/);
  assert.match(dhl({ ...bolus, halfLife: '12', clearance: '3', doses: '0, 1', evalTimes: '1' }).message, /not both/);
  assert.match(dhl({ ...bolus, route: 'oral', ka: '1', doses: '0, 1', evalTimes: '1' }).message, /bioavailability/);
  assert.match(dhl({ ...bolus, doses: '0, 1', evalTimes: '1', route: '' }).message, /^Choose the route/);
});

test('two-compartment parameters from A 10, alpha 1, B 5, beta 0.1 and 150 mg', () => {
  const r = tcp({ dose: '150', a: '10', alpha: '1', b: '5', beta: '0.1' });
  assert.deepEqual([r.k21, r.k10, r.k12, r.vc, r.auc, r.cl, r.vss, r.vbeta, r.halfLifeAlpha, r.halfLifeBeta], [0.4, 0.25, 0.45, 10, 60, 2.5, 21.25, 25, 0.6931, 6.931]);
  assert.ok(r.notes.some((n) => n.startsWith('Check: CL equals k10 x Vc')));
  assert.match(tcp({ dose: '150', a: '10', alpha: '1', b: '5', beta: '1' }).message, /larger than beta/);
  assert.match(tcp({ dose: '150', a: '0', alpha: '1', b: '5', beta: '0.1' }).message, /above 0/);
});

test('sigmoid Emax and its inverse', () => {
  const base = { e0: '0', emax: '100', ec50: '10' };
  assert.equal(ehe({ ...base, hill: '1', concentration: '10' }).effect, 50);
  assert.equal(ehe({ ...base, hill: '2', concentration: '20' }).effect, 80);
  assert.equal(ehe({ ...base, hill: '2', targetEffect: '80' }).concentration, 20);
  assert.match(ehe({ ...base, hill: '2', targetEffect: '100' }).message, /strictly between/);
  assert.equal(ehe({ ...base, emax: '-100', hill: '1', concentration: '10' }).effect, -50);
  assert.equal(ehe({ ...base, emax: '-100', hill: '1', targetEffect: '-50' }).concentration, 10);
  assert.match(ehe({ ...base, hill: '1', concentration: '1', targetEffect: '2' }).message, /not both/);
  assert.match(ehe({ ...base, hill: '0', concentration: '1' }).message, /Hill coefficient/);
});

// spec-v1631 tools 15, 16 and 17: one-compartment prediction, trapezoidal AUC, time above the MIC.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pkSteadyStatePredict as pk, singleDose, steadyState } from '../../lib/pk-steady-state-predict-v1631.js';
import { aucTrapezoid as auc } from '../../lib/auc-trapezoid-v1631.js';
import { tmicBetaLactam as tmic, hoursAboveMic } from '../../lib/tmic-beta-lactam-v1631.js';

const close = (a, b, tol) => assert.ok(Math.abs(a - b) <= tol, `${a} vs ${b}`);

test('prediction: an interval of one half-life gives an accumulation factor of 2, and 90% takes 3.32 half-lives', () => {
  const r = pk({ dose: 1000, infusionHours: 1, interval: 12, vd: 50, halfLife: 12 });
  assert.equal(r.accumulationFactor, 2);
  close(r.hoursTo90 / r.halfLife, 3.32, 0.005);
  assert.deepEqual([r.peak, r.trough], [38.87, 20.59]);
  // Average concentration is dose / (CL x tau), whatever the infusion time.
  close(r.averageConcentration, 1000 / (r.clearance * 12), 0.02);
});

test('prediction: a bolus does not divide by zero, and k, half-life and clearance agree', () => {
  const bolus = pk({ dose: 1000, infusionHours: 0, interval: 6, vd: 50, halfLife: 6 });
  assert.deepEqual([bolus.peak, bolus.trough, bolus.accumulationFactor], [40, 20, 2]);
  const k = Math.LN2 / 6;
  assert.equal(pk({ dose: 1000, infusionHours: 0, interval: 6, vd: 50, k }).peak, 40);
  assert.equal(pk({ dose: 1000, infusionHours: 0, interval: 6, vd: 50, clearance: k * 50 }).peak, 40);
  assert.match(pk({ dose: 1000, infusionHours: 0, interval: 6, vd: 50, k, halfLife: 6 }).message, /exactly one/);
  assert.match(pk({ dose: 1000, infusionHours: 0, interval: 6, vd: 50 }).message, /exactly one/);
  assert.match(pk({ dose: 1000, interval: 6, vd: 50, halfLife: 6 }).message, /0 as the infusion time for a bolus/);
  assert.match(pk({ dose: 1000, infusionHours: 6, interval: 6, vd: 50, halfLife: 6 }).message, /shorter than the dosing interval/);
});

test('prediction: superposition approaches the steady-state closed form', () => {
  const [dose, tInf, tau, k, vd] = [1000, 1, 12, Math.LN2 / 12, 50];
  const ss = steadyState(dose, tInf, tau, k, vd);
  let peak = 0;
  for (let i = 0; i < 60; i += 1) peak += singleDose(dose, tInf, k, vd, tInf + i * tau);
  close(peak, ss.peak, 1e-6);
  // The first dose alone, at the end of its infusion.
  const first = pk({ dose, infusionHours: tInf, interval: tau, vd, halfLife: 12, doseNumber: 1, timeAfter: 1 });
  close(first.levelAtTime, singleDose(dose, tInf, k, vd, 1), 0.01);
  assert.equal(pk({ dose, infusionHours: 0, interval: 6, vd, halfLife: 6, level: 30, target: 15 }).hoursToFall, 6);
  assert.match(pk({ dose, infusionHours: 0, interval: 6, vd, halfLife: 6, level: 30 }).message, /both the level and the target/);
  assert.match(pk({ dose, infusionHours: 0, interval: 6, vd, halfLife: 6, doseNumber: 2 }).message, /both the dose number/);
});

test('AUC: a pure exponential sampled densely returns dose / (k x Vd) within 1%', () => {
  const points = Array.from({ length: 49 }, (_, i) => `${i * 0.5}, ${(20 * Math.exp(-0.2 * i * 0.5)).toFixed(4)}`).join('\n');
  for (const method of ['linear', 'linear-up-log-down']) {
    const r = auc({ method, extrapolate: 'yes', terminalPoints: 3, points, dose: 1000 });
    close(r.aucInfinity, 1000 / (0.2 * 50), 1);
    close(r.clearance, 10, 0.1);
    close(r.terminalHalfLife, Math.LN2 / 0.2, 0.02);
  }
});

test('AUC: linear and log-down segments, and equal or zero levels do not divide by zero', () => {
  assert.equal(auc({ method: 'linear', extrapolate: 'no', points: '0, 10\n1, 10\n2, 5' }).auc, 17.5);
  // The falling segment by log-down: (10 - 5) x 1 / ln 2 = 7.213; the flat one stays linear.
  assert.equal(auc({ method: 'linear-up-log-down', extrapolate: 'no', points: '0, 10\n1, 10\n2, 5' }).auc, 17.21);
  assert.equal(auc({ method: 'linear-up-log-down', extrapolate: 'no', points: '0, 10\n1, 0' }).auc, 5);
  assert.match(auc({ method: 'linear', extrapolate: 'yes', terminalPoints: 2, points: '0, 5\n1, 5' }).message, /not falling/);
  assert.match(auc({ method: 'linear', extrapolate: 'yes', terminalPoints: 2, points: '0, 5\n1, 0' }).message, /zero/);
  assert.match(auc({ method: 'linear', extrapolate: 'yes', points: '0, 5\n1, 4' }).message, /terminal points/);
  assert.match(auc({ method: 'linear', extrapolate: 'no', points: '0, 5\n0, 4' }).message, /time order/);
  assert.match(auc({ extrapolate: 'no', points: '0, 5\n1, 4' }).message, /Choose the method/);
  assert.match(auc({ method: 'linear', extrapolate: 'yes', terminalPoints: 2, points: '0, 5\n1, 4' }).notes.join(' '), /No dose was entered/);
});

test('time above MIC: 100% when the free trough clears the MIC, 0% when the free peak does not', () => {
  const base = { dose: 2000, infusionHours: 0.5, interval: 8, vd: 20, halfLife: 1, unboundFraction: 1 };
  assert.equal(tmic({ ...base, mic: 0.4 }).percentAboveMic, 100);
  assert.equal(tmic({ ...base, mic: 90 }).percentAboveMic, 0);
});

test('time above MIC: the spec\'s case, where a longer infusion lowers the result', () => {
  const base = { dose: 2000, interval: 8, vd: 20, halfLife: 1, unboundFraction: 1, mic: 32 };
  const short = tmic({ ...base, infusionHours: 0.5 });
  assert.deepEqual([short.hoursAboveMic.toFixed(2), short.percentAboveMic.toFixed(1)], ['1.74', '21.7']);
  const long = tmic({ ...base, infusionHours: 4 });
  // The spec prints the peak as 33.9 mg/L; to four figures it is 33.95.
  assert.deepEqual([long.hoursAboveMic.toFixed(2), long.percentAboveMic.toFixed(1), long.freePeak], ['1.02', '12.8', 33.95]);
  assert.match(short.notes.join(' '), /A longer infusion lowered the result here/);
  assert.doesNotMatch(`${short.band} ${short.notes.join(' ')}`, /target of|goal of/);
});

test('time above MIC: the closed form matches a numerical integration to 0.01 hours', () => {
  const k = Math.LN2;
  for (const [tInf, fu, mic] of [[0.5, 1, 32], [4, 1, 32], [3, 0.7, 8], [0, 0.9, 16], [1, 0.5, 4]]) {
    const [dose, tau, vd] = [2000, 8, 20];
    // Steady state by superposing 40 doses, sampled every 0.0005 hours.
    let above = 0; const step = 0.0005;
    for (let t = 0; t < tau; t += step) {
      let c = 0;
      for (let i = 0; i < 40; i += 1) c += singleDose(dose, tInf, k, vd, t + i * tau);
      if (fu * c > mic) above += step;
    }
    close(hoursAboveMic(dose, tInf, tau, k, vd, fu, mic).hours, above, 0.01);
  }
});

test('time above MIC: the unbound fraction is required and bounded', () => {
  const base = { dose: 2000, infusionHours: 0.5, interval: 8, vd: 20, halfLife: 1, mic: 32 };
  assert.match(tmic(base).message, /unbound fraction/);
  assert.match(tmic({ ...base, unboundFraction: 1.2 }).message, /unbound fraction/);
  assert.match(tmic({ ...base, unboundFraction: 1, halfLife: '' }).message, /exactly one/);
});

test('time above MIC: the same amount as a continuous infusion is all or none', () => {
  const base = { dose: 2000, infusionHours: 0.5, interval: 8, vd: 20, halfLife: 1, unboundFraction: 1 };
  // 250 mg/h over a clearance of ln 2 x 20 L/h = 13.86 L/h: 18.03 mg/L.
  const below = tmic({ ...base, mic: 32 });
  assert.deepEqual([below.continuous.rateMgPerHour, below.continuous.freeCss, below.continuous.aboveMic], [250, 18.03, false]);
  assert.match(below.notes.join(' '), /continuous infusion \(250 mg\/h\): a free steady-state concentration of 18\.03 mg\/L, below the MIC/);
  assert.equal(tmic({ ...base, mic: 16 }).continuous.aboveMic, true);
  // The unbound fraction scales it.
  assert.equal(tmic({ ...base, unboundFraction: 0.5, mic: 16 }).continuous.aboveMic, false);
});

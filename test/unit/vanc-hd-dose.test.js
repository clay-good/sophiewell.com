// spec-v1631 tool 2: vancomycin in intermittent hemodialysis, the 2020 guideline's tabulation.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { vancHdDose as hd, TABLE, LOAD_CAP, PRE_LEVEL } from '../../lib/vanc-hd-dose-v1631.js';

const base = { timing: 'after', permeability: 'high', weight: 70 };

test('the guideline\'s tabulation, mg/kg', () => {
  assert.deepEqual(TABLE, { after: { low: [25, 7.5, 7.5], high: [25, 10, 10] }, intra: { low: [30, 7.5, 10], high: [35, 10, 15] } });
  assert.deepEqual([LOAD_CAP, PRE_LEVEL], [3000, [15, 20]]);
});

test('each row on 70 kg, with the 25% larger dose for the 3-day gap', () => {
  const row = (timing, permeability) => { const r = hd({ timing, permeability, weight: 70 }); return [r.loadingDose, r.maintenanceLow, r.maintenanceHigh, r.longGapLow, r.longGapHigh]; };
  assert.deepEqual(row('after', 'low'), [1750, 525, 525, 656.3, 656.3]);
  assert.deepEqual(row('after', 'high'), [1750, 700, 700, 875, 875]);
  assert.deepEqual(row('intra', 'low'), [2100, 525, 700, 656.3, 875]);
  assert.deepEqual(row('intra', 'high'), [2450, 700, 1050, 875, 1313]);
  assert.match(hd(base).band, /maintenance 700 mg three times a week/);
});

test('a loading dose is held to 3,000 mg and says so', () => {
  const r = hd({ timing: 'intra', permeability: 'high', weight: 100 });
  assert.deepEqual([r.loadingDose, r.loadingCapped], [3000, true]);
  assert.match(r.notes[0], /3,500 mg\. The guideline says loading doses should not exceed 3,000 mg/);
  assert.equal(hd(base).loadingCapped, false);
});

test('a predialysis level is set against 15 to 20 mg/L; without one no band is claimed', () => {
  assert.deepEqual([12, 15, 20, 20.1].map((preLevel) => hd({ ...base, preLevel }).levelAgainst), ['below', 'within', 'within', 'above']);
  assert.equal(hd({ ...base, preLevel: 12 }).abnormal, true);
  assert.equal(hd(base).levelAgainst, undefined);
});

test('the hybrid and CRRT starting doses are printed on the same weight', () => {
  const text = hd(base).notes.join(' ');
  assert.match(text, /Hybrid dialysis .* 1,400 to 1,750 mg; maintenance 15 mg\/kg = 1,050 mg/);
  assert.match(text, /CRRT .* 7\.5 to 10 mg\/kg = 525 to 700 mg every 12 hours/);
});

test('nothing is defaulted', () => {
  assert.match(hd({}).message, /Choose when the dose is given/);
  assert.match(hd({ ...base, permeability: '' }).message, /permeability/);
  assert.equal(hd({ ...base, weight: '' }).valid, false);
  assert.equal(hd({ ...base, weight: 10 }).valid, false);
  assert.equal(hd({ ...base, preLevel: -1 }).valid, false);
});

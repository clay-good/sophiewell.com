// spec-v1635 tools 5, 10 and 14: dexrazoxane, rasburicase and capecitabine, each from its label.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { rasburicaseDose, LABEL as ELITEK } from '../../lib/rasburicase-dose-v1635.js';
import { dexrazoxaneRatioDose, LABEL as DEX } from '../../lib/dexrazoxane-ratio-dose-v1635.js';
import { capecitabineTabletDose, LABEL as XELODA } from '../../lib/capecitabine-tablet-dose-v1635.js';
import { labelRow } from '../../lib/label-row.js';
import { LABEL_EDITIONS } from '../../lib/label-editions.js';

const now = new Date('2026-10-11T12:00:00Z');
const ras = (i, t) => rasburicaseDose(i, now, t); const dex = (i, t) => dexrazoxaneRatioDose(i, now, t); const cap = (i, t) => capecitabineTabletDose(i, now, t);
const dead = (id) => ({ ...LABEL_EDITIONS, [id]: { ...LABEL_EDITIONS[id], supersededOn: '2026-10-10' } });

test('all three label rows answer, and a superseded one withholds the figures', () => {
  for (const l of [ELITEK, DEX, XELODA]) assert.equal(labelRow(l.setId, now).answers, true, l.name);
  assert.equal(ras({ weight: 70, g6pd: 'normal' }, dead(ELITEK.setId)).doseMg, undefined);
  assert.equal(dex({ doxorubicinDose: 50, unit: 'mg-m2', crcl: 80 }, dead(DEX.setId)).dose, undefined);
  assert.equal(cap({ level: '1250', bsa: 1.8, crcl: 80, percent: '100' }, dead(XELODA.setId)).options, undefined);
});

test('rasburicase: 0.2 mg/kg and the least-waste vials', () => {
  const r = ras({ weight: 70, g6pd: 'normal', day: 2 });
  assert.deepEqual([r.doseMg, r.vials75, r.vials15, r.wasteMg], [14, 2, 0, 1]);
  assert.deepEqual((({ doseMg, vials75, vials15 }) => [doseMg, vials75, vials15])(ras({ weight: 12, g6pd: 'normal' })), [2.4, 0, 2]);
  // 45 kg: 9 mg is one 7.5 mg and one 1.5 mg vial, with nothing left over.
  assert.deepEqual((({ vials75, vials15, wasteMg }) => [vials75, vials15, wasteMg])(ras({ weight: 45, g6pd: 'normal' })), [1, 1, 0]);
});

test('rasburicase: G6PD deficiency and day 6 return no dose; untested carries the screening sentence', () => {
  const g = ras({ weight: 70, g6pd: 'deficient' });
  assert.deepEqual([g.flag, g.doseMg], ['contraindicated', undefined]);
  assert.deepEqual([ras({ weight: 70, g6pd: 'normal', day: 6 }).flag, ras({ weight: 70, g6pd: 'normal', day: 5 }).flag], ['beyond-5-days', 'dose']);
  assert.match(ras({ weight: 70, g6pd: 'not-tested' }).notes.join(' '), /screen patients at higher risk/);
  assert.match(ras({ weight: 70 }).message, /^Choose the G6PD status/);
  assert.match(ras({}).message, /^Enter the weight/);
  assert.equal(rasburicaseDose(null, now).valid, false);
});

test('dexrazoxane: 10:1, or 5:1 below a creatinine clearance of 40', () => {
  assert.deepEqual((({ ratio, dose }) => [ratio, dose])(dex({ doxorubicinDose: 50, unit: 'mg-m2', crcl: 80, cumulativeDoxorubicin: 350 })), [10, 500]);
  assert.equal(dex({ doxorubicinDose: 50, unit: 'mg-m2', crcl: 40 }).ratio, 10);
  assert.deepEqual((({ ratio, dose }) => [ratio, dose])(dex({ doxorubicinDose: 50, unit: 'mg-m2', crcl: 39.9 })), [5, 250]);
  assert.equal(dex({ doxorubicinDose: 50, unit: 'mg-m2', crcl: 80, cumulativeDoxorubicin: 299 }).flag, 'below-indication');
  assert.equal(dex({ doxorubicinDose: 50, unit: 'mg-m2', crcl: 80, cumulativeDoxorubicin: 300 }).flag, 'ratio');
  assert.match(dex({ doxorubicinDose: 50, unit: 'mg-m2', crcl: 80 }).notes.join(' '), /within 30 minutes after the dexrazoxane infusion/);
  assert.match(dex({ doxorubicinDose: 50, unit: 'mg-m2' }).message, /is not assumed/);
  assert.match(dex({ doxorubicinDose: 50, crcl: 80 }).message, /^Choose the unit/);
  assert.equal(dexrazoxaneRatioDose(null, now).valid, false);
});

test('capecitabine: the calculated dose, the renal 25 percent, and rounding to the nearest 150 mg', () => {
  const r = cap({ level: '1250', bsa: 1.8, crcl: 80, percent: '100', daysOn: 14 });
  assert.deepEqual([r.calculatedMg, r.options], [2250, [{ doseMg: 2250, t500: 3, t150: 5, percentChange: 0, cycle500: 84, cycle150: 140 }]]);
  const renal = cap({ level: '1000', bsa: 1.7, crcl: 45, percent: '75' });
  assert.deepEqual([renal.calculatedMg, renal.renalReduction, renal.options[0].doseMg], [956.3, true, 900]);
  assert.equal(cap({ level: '1000', bsa: 1.7, crcl: 50, percent: '100' }).renalReduction, true);
  assert.equal(cap({ level: '1000', bsa: 1.7, crcl: 50.1, percent: '100' }).renalReduction, false);
  assert.equal(cap({ level: '1250', bsa: 1.8, crcl: 29.9, percent: '100' }).flag, 'not-established');
  assert.equal(cap({ level: '1250', bsa: 1.8, crcl: 30, percent: '100' }).renalReduction, true);
  // Every rounded dose is whole tablets.
  for (const bsa of [1.2, 1.45, 1.63, 1.9, 2.3]) { const x = cap({ level: '1250', bsa, crcl: 80, percent: '100' }).options[0]; assert.equal(500 * x.t500 + 150 * x.t150, x.doseMg); assert.ok(Math.abs(x.doseMg - 1250 * bsa) <= 75); }
});

test('capecitabine: a dose exactly halfway is shown both ways', () => {
  const r = cap({ level: 'typed', typedLevel: 1000, bsa: 1.575, crcl: 80, percent: '100' });
  assert.deepEqual([r.flag, r.options.map((x) => x.doseMg)], ['halfway', [1500, 1650]]);
  assert.match(r.notes.join(' '), /does not say which way to round/);
});

test('capecitabine refusals', () => {
  assert.match(cap({}).message, /^Choose the dose level/);
  assert.match(cap({ level: 'typed' }).message, /^Enter the dose level/);
  assert.match(cap({ level: '1250' }).message, /^Enter the body surface area/);
  assert.match(cap({ level: '1250', bsa: 1.8 }).message, /^Enter the creatinine clearance/);
  assert.match(cap({ level: '1250', bsa: 1.8, crcl: 80 }).message, /^Choose the percent/);
  assert.equal(capecitabineTabletDose(null, now).valid, false);
});

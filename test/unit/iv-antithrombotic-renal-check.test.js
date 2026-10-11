// spec-v1632 tool 3: bivalirudin, eptifibatide, tirofiban and argatroban, on four label rows.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ivAntithromboticRenalCheck as d, DRUGS, EPTIFIBATIDE_TOP } from '../../lib/iv-antithrombotic-renal-check-v1632.js';
import { LABEL_EDITIONS } from '../../lib/label-editions.js';
import { labelRow } from '../../lib/label-row.js';

const now = new Date('2026-10-11T12:00:00Z');
const run = (i) => d(i, now);

test('four labels, each answering', () => {
  assert.deepEqual(DRUGS.map((x) => x.value), ['bivalirudin', 'eptifibatide', 'tirofiban', 'argatroban']);
  for (const x of DRUGS) assert.equal(labelRow(x.setId, now).answers, true, x.value);
  assert.deepEqual(EPTIFIBATIDE_TOP, { above: 121, bolusMg: 22.6, infusionMgH: 15, reducedMgH: 7.5 });
});

test('bivalirudin: 1.75 mg/kg/h, 1 below a clearance of 30, 0.25 on hemodialysis; the bolus never changes', () => {
  const b = (i) => run({ drug: 'bivalirudin', weight: 80, dialysis: 'no', ...i });
  assert.deepEqual([b({ crcl: 30 }).infusionPerKg, b({ crcl: 30 }).infusion, b({ crcl: 30 }).bolus], [1.75, 140, 60]);
  assert.deepEqual([b({ crcl: 29.9 }).infusionPerKg, b({ crcl: 29.9 }).infusion, b({ crcl: 29.9 }).bolus], [1, 80, 60]);
  const hd = b({ dialysis: 'yes' });
  assert.deepEqual([hd.infusionPerKg, hd.infusion, hd.bolus], [0.25, 20, 60]);
  assert.match(b({ crcl: '' }).message, /creatinine clearance/);
  assert.match(run({ drug: 'bivalirudin', weight: 80, crcl: 25 }).message, /on dialysis/);
});

test('eptifibatide: 2 mcg/kg/min, 1 below a clearance of 50; a second bolus for PCI; dialysis is a contraindication', () => {
  const e = (i) => run({ drug: 'eptifibatide', weight: 80, crcl: 80, dialysis: 'no', setting: 'acs', ...i });
  // 180 mcg/kg x 80 = 14.4 mg; 2 x 80 = 160 mcg/min = 9.6 mg/h.
  assert.deepEqual([e({}).bolus, e({}).infusion, e({}).infusionPerKg], [14.4, 9.6, 2]);
  assert.deepEqual([e({ crcl: 50 }).infusionPerKg, e({ crcl: 49.9 }).infusionPerKg, e({ crcl: 49.9 }).infusion], [2, 1, 4.8]);
  assert.match(e({ setting: 'pci' }).band, /repeated once at 10 minutes/);
  assert.doesNotMatch(e({}).band, /repeated once/);
  assert.equal(e({ dialysis: 'yes' }).flag, 'contraindicated');
  assert.match(e({ setting: '' }).message, /Choose the setting/);
});

test('eptifibatide above 121 kg: the dosing chart\'s single row, with the per-kilogram figures beside it', () => {
  const big = run({ drug: 'eptifibatide', weight: 130, crcl: 80, dialysis: 'no', setting: 'acs' });
  assert.deepEqual([big.bolus, big.infusion], [22.6, 15]);
  assert.match(big.band, /above 121 kg .* 22\.6 mg bolus then 15 mg\/h/);
  assert.match(big.notes.join(' '), /bolus 23\.4 mg; infusion 260 mcg\/min \(15\.6 mg\/h\)/);
  assert.equal(run({ drug: 'eptifibatide', weight: 130, crcl: 40, dialysis: 'no', setting: 'acs' }).infusion, 7.5);
  assert.equal(run({ drug: 'eptifibatide', weight: 121, crcl: 80, dialysis: 'no', setting: 'acs' }).bolus, 21.78);
});

test('tirofiban: 0.15 mcg/kg/min, 0.075 at a clearance of 60 or below', () => {
  const t = (crcl) => run({ drug: 'tirofiban', weight: 60, crcl });
  assert.deepEqual([t(61).infusionPerKg, t(61).infusion, t(61).bolus], [0.15, 9, 1500]);
  assert.deepEqual([t(60).infusionPerKg, t(60).infusion], [0.075, 4.5]);
  assert.match(t(60).notes.join(' '), /actual body weight/);
  assert.match(run({ drug: 'tirofiban', weight: 60, crcl: 30, dialysis: 'yes' }).notes.join(' '), /gives no separate line/);
});

test('argatroban: 2 mcg/kg/min, 0.5 for moderate or severe hepatic impairment, no row for mild', () => {
  const a = (hepatic, extra = {}) => run({ drug: 'argatroban', weight: 70, hepatic, ...extra });
  assert.deepEqual([a('none').infusion, a('moderate-severe').infusion], [140, 35]);
  assert.equal(a('mild').flag, 'no-recommendation-given');
  assert.equal(a('mild').infusion, undefined);
  assert.match(a('none').notes.join(' '), /not above 10 mcg\/kg\/min/);
  assert.match(a('none', { crcl: 20 }).notes.join(' '), /clearance entered is not used/);
  assert.match(a('').message, /Choose the hepatic function/);
});

test('nothing is defaulted', () => {
  assert.match(run({}).message, /Choose the drug/);
  assert.equal(run({ drug: 'tirofiban', crcl: 60 }).valid, false);
  assert.equal(run({ drug: 'tirofiban', weight: 60 }).valid, false);
  assert.equal(run({ drug: 'tirofiban', weight: 10, crcl: 60 }).valid, false);
});

test('fail closed: a superseded label withholds that drug only', () => {
  const id = DRUGS[2].setId;
  const table = { ...LABEL_EDITIONS, [id]: { ...LABEL_EDITIONS[id], supersededOn: '2026-10-10' } };
  const r = d({ drug: 'tirofiban', weight: 60, crcl: 60 }, now, table);
  assert.deepEqual([r.valid, r.withheld, r.infusion], [true, true, undefined]);
  assert.match(r.labelUrl, /setid=fe0ced75/);
  assert.equal(d({ drug: 'argatroban', weight: 70, hepatic: 'none' }, now, table).withheld, undefined);
});

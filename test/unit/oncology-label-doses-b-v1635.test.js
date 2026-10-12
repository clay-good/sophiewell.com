// spec-v1635 tools 6, 8 and 9: mesna, glucarpidase and intrathecal methotrexate, each from its label.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mesnaIfosfamideSchedule, LABEL as MESNEX } from '../../lib/mesna-ifosfamide-schedule-v1635.js';
import { glucarpidaseDose, LABEL as VORAXAZE } from '../../lib/glucarpidase-dose-v1635.js';
import { itMethotrexateAgeDose, LABEL as MTX } from '../../lib/it-methotrexate-age-dose-v1635.js';
import { labelRow } from '../../lib/label-row.js';
import { LABEL_EDITIONS } from '../../lib/label-editions.js';

const now = new Date('2026-10-11T12:00:00Z');
const mes = (i, t) => mesnaIfosfamideSchedule(i, now, t); const glu = (i, t) => glucarpidaseDose(i, now, t); const itm = (i, t) => itMethotrexateAgeDose(i, now, t);
const dead = (id) => ({ ...LABEL_EDITIONS, [id]: { ...LABEL_EDITIONS[id], supersededOn: '2026-10-10' } });

test('all three label rows answer, and a superseded one withholds the figures', () => {
  for (const l of [MESNEX, VORAXAZE, MTX]) assert.equal(labelRow(l.setId, now).answers, true, l.name);
  assert.equal(mes({ dose: 1.2, unit: 'g-m2', bsa: 1, plan: 'iv' }, dead(MESNEX.setId)).doses, undefined);
  assert.equal(glu({ weight: 70, methotrexate: 12, delayed: 'yes' }, dead(VORAXAZE.setId)).units, undefined);
  assert.equal(itm({ age: 5, ageUnit: 'years' }, dead(MTX.setId)).doseLowMg, undefined);
});

test('mesna: the label\'s own rows, 1.2 g/m² giving 240 × 3 and 240, 480, 480 mg/m²', () => {
  const iv = mes({ dose: 1.2, unit: 'g-m2', bsa: 1, plan: 'iv', start: '2026-10-11T22:00' });
  assert.deepEqual(iv.doses.map((d) => [d.hour, d.mg, d.at]), [[0, 240, '2026-10-11 22:00'], [4, 240, '2026-10-12 02:00'], [8, 240, '2026-10-12 06:00']]);
  assert.deepEqual([iv.totalMg, iv.totalPercent, iv.flag], [720, 60, 'schedule']);
  const oral = mes({ dose: 1200, unit: 'mg-m2', bsa: 1, plan: 'iv-oral', start: '2026-10-11T08:00' });
  assert.deepEqual(oral.doses.map((d) => [d.hour, d.mg, d.route, d.at.slice(11)]), [[0, 240, 'intravenous bolus', '08:00'], [2, 480, 'by mouth', '10:00'], [6, 480, 'by mouth', '14:00']]);
  assert.deepEqual([oral.totalMg, oral.totalPercent], [1200, 100]);
});

test('mesna: above 2 g/m² the oral plan carries the label sentence; exactly 2 does not; the intravenous plan never does', () => {
  const hi = mes({ dose: 2.5, unit: 'g-m2', bsa: 1.8, plan: 'iv-oral' });
  assert.equal(hi.flag, 'oral-ratio-not-established');
  assert.match(hi.notes[0], /has not been established as being effective for daily doses of ifosfamide higher than 2 g\/m²/);
  assert.equal(mes({ dose: 2, unit: 'g-m2', bsa: 1.8, plan: 'iv-oral' }).flag, 'schedule');
  assert.equal(mes({ dose: 2.5, unit: 'g-m2', bsa: 1.8, plan: 'iv' }).flag, 'schedule');
  // A dose in mg with no body surface area cannot be tested against 2 g/m², and says so.
  assert.equal(mes({ dose: 2000, unit: 'mg', plan: 'iv-oral' }).flag, 'oral-ratio-unchecked');
  assert.equal(mes({ dose: 5000, unit: 'mg', bsa: 2, plan: 'iv-oral' }).flag, 'oral-ratio-not-established');
});

test('mesna: nothing is defaulted', () => {
  assert.match(mes({}).message, /^Choose the unit/);
  assert.match(mes({ unit: 'mg' }).message, /^Enter the ifosfamide dose/);
  assert.match(mes({ dose: 1.2, unit: 'g-m2', plan: 'iv' }).message, /^Enter the body surface area/);
  assert.match(mes({ dose: 1.2, unit: 'g-m2', bsa: 1 }).message, /^Choose the route plan/);
  assert.match(mes({ dose: 1.2, unit: 'g-m2', bsa: 1, plan: 'constructor' }).message, /^Choose the route plan/);
  assert.match(mes({ dose: 1.2, unit: 'g-m2', bsa: 1, plan: 'iv', start: '2026-02-30T08:00' }).message, /^Enter the ifosfamide start/);
  assert.equal(mesnaIfosfamideSchedule(null, now).valid, false);
});

test('glucarpidase: 50 Units/kg and whole 1,000-Unit vials', () => {
  const r = glu({ weight: 70, methotrexate: 12, delayed: 'yes' });
  assert.deepEqual([r.units, r.vials, r.flag, r.leucovorinOk], [3500, 4, 'dose', null]);
  assert.deepEqual((({ units, vials }) => [units, vials])(glu({ weight: 20, methotrexate: 12, delayed: 'yes' })), [1000, 1]);
  assert.deepEqual((({ units, vials }) => [units, vials])(glu({ weight: 20.1, methotrexate: 12, delayed: 'yes' })), [1005, 2]);
});

test('glucarpidase: leucovorin 90 minutes before fails the window; 2 hours either side passes', () => {
  const base = { weight: 70, methotrexate: 12, delayed: 'yes', glucarpidaseTime: '2026-10-11T12:00' };
  const close = glu({ ...base, lastLeucovorin: '2026-10-11T10:30' });
  assert.deepEqual([close.flag, close.leucovorinOk], ['leucovorin-too-close', false]);
  assert.match(close.notes[0], /1 h 30 min before.*no earlier than 2026-10-11 12:30/);
  assert.deepEqual((({ flag, leucovorinOk }) => [flag, leucovorinOk])(glu({ ...base, lastLeucovorin: '2026-10-11T10:00', nextLeucovorin: '2026-10-11T14:00' })), ['dose', true]);
  assert.equal(glu({ ...base, nextLeucovorin: '2026-10-11T13:59' }).flag, 'leucovorin-too-close');
  assert.match(glu({ weight: 70, methotrexate: 12, delayed: 'yes', lastLeucovorin: '2026-10-11T10:00' }).message, /^Enter the planned glucarpidase time/);
  assert.match(glu({ ...base, lastLeucovorin: '2026-10-11T13:00' }).message, /after the planned glucarpidase time/);
});

test('glucarpidase: the indication is tested, never assumed', () => {
  assert.equal(glu({ weight: 70, methotrexate: 1, delayed: 'yes' }).flag, 'indication-not-met');
  assert.equal(glu({ weight: 70, methotrexate: 1.01, delayed: 'yes' }).flag, 'dose');
  assert.equal(glu({ weight: 70, methotrexate: 12, delayed: 'no' }).flag, 'indication-not-met');
  const na = glu({ weight: 70, methotrexate: 12, delayed: 'not-assessed' });
  assert.deepEqual([na.flag, na.abnormal], ['indication-not-assessed', true]);
  assert.match(na.band, /^Delayed clearance was not assessed/);
  assert.match(glu({ weight: 70, methotrexate: 12 }).message, /^Choose whether methotrexate clearance is delayed/);
  assert.match(glu({ weight: 70 }).message, /^Enter the plasma methotrexate/);
  assert.equal(glucarpidaseDose(null, now).valid, false);
});

test('intrathecal methotrexate: the label bands, with each boundary age in the upper band', () => {
  const dose = (age, ageUnit) => (({ doseLowMg, doseHighMg }) => [doseLowMg, doseHighMg])(itm({ age, ageUnit }));
  assert.deepEqual(dose(11, 'months'), [6, 6]);
  assert.deepEqual(dose(0, 'months'), [6, 6]);
  assert.deepEqual([dose(1, 'years'), dose(12, 'months'), dose(23, 'months')], [[8, 8], [8, 8], [8, 8]]);
  assert.deepEqual([dose(2, 'years'), dose(35, 'months')], [[10, 10], [10, 10]]);
  assert.deepEqual([dose(3, 'years'), dose(107, 'months'), dose(8.9, 'years')], [[12, 12], [12, 12], [12, 12]]);
  assert.deepEqual([dose(9, 'years'), dose(108, 'months'), dose(40, 'years')], [[12, 15], [12, 15], [12, 15]]);
});

test('intrathecal methotrexate: the top band stays a range, and the age unit is asked', () => {
  const r = itm({ age: 9, ageUnit: 'years' });
  assert.deepEqual([r.flag, r.bandLabel], ['range', '12 to 15 mg']);
  assert.match(r.notes.join(' '), /no single figure is picked/);
  assert.match(r.notes.join(' '), /preservative-free 0\.9% sodium chloride/);
  assert.match(itm({ age: 5 }).message, /^Choose whether the age is in months or years/);
  assert.match(itm({ ageUnit: 'years' }).message, /^Enter the age/);
  assert.match(itm({ age: 121, ageUnit: 'years' }).message, /age/);
  assert.equal(itMethotrexateAgeDose(null, now).valid, false);
});

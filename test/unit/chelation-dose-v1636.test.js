// spec-v1636 tool 10: succimer, edetate calcium disodium and dimercaprol, from the labels.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { chelationDose, LABELS, REGIMENS } from '../../lib/chelation-dose-v1636.js';
import { labelRow } from '../../lib/label-row.js';
import { LABEL_EDITIONS } from '../../lib/label-editions.js';

const now = new Date('2026-10-12T12:00:00Z');
const c = (i, t) => chelationDose(i, now, t);
const dead = (id) => ({ ...LABEL_EDITIONS, [id]: { ...LABEL_EDITIONS[id], supersededOn: '2026-10-10' } });
const succ = (weight) => c({ regimen: 'succimer-lead', weight });

test('all three label rows answer; a regimen withholds only on its own label', () => {
  for (const l of Object.values(LABELS)) assert.equal(labelRow(l.setId, now).answers, true, l.name);
  assert.equal(c({ regimen: 'succimer-lead', weight: 20 }, dead(LABELS.succimer.setId)).flag, 'withheld');
  assert.equal(c({ regimen: 'succimer-lead', weight: 20 }, dead(LABELS.edetate.setId)).flag, 'dose');
  assert.equal(REGIMENS.length, 7);
});

test('succimer: every row of the capsule table, and 43 doses in the course', () => {
  for (const [kg, mg, caps] of [[8, 100, 1], [15, 100, 1], [16, 200, 2], [23, 200, 2], [24, 300, 3], [34, 300, 3], [35, 400, 4], [44, 400, 4], [46, 500, 5], [80, 500, 5]]) {
    const r = succ(kg);
    assert.deepEqual([r.doseMg, r.capsules, r.courseCapsules], [mg, caps, caps * 43], `${kg} kg`);
  }
  assert.match(succ(20).notes[0], /15 doses.*28 doses.*19 days and 43 doses/);
});

test('succimer: 45 kg itself and the whole-kilogram gaps return both rows; under 8 kg has no row', () => {
  for (const kg of [45, 15.5, 44.5]) assert.deepEqual([succ(kg).flag, succ(kg).doseMg], ['between-rows', undefined], `${kg}`);
  assert.match(succ(45).band, /leaves 45 kg itself unstated/);
  assert.deepEqual([succ(6).flag, succ(6).doseMg], ['weight-not-in-table', undefined]);
});

test('edetate calcium disodium: 1,000 mg/m² a day; the nephropathy regimens by creatinine', () => {
  const r = c({ regimen: 'edetate-lead', bsa: 0.8 });
  assert.deepEqual([r.dailyMg, r.volumeMl], [800, 4]);
  const n = (creatinine) => c({ regimen: 'edetate-lead-nephropathy', bsa: 1.8, creatinine });
  assert.match(n(2.5).band, /900 mg .* every 24 hours for 5 days/);
  assert.match(n(3.5).band, /every 48 hours for 3 doses/);
  assert.match(n(4).band, /every 48 hours for 3 doses/);
  assert.match(n(5).band, /once weekly/);
  assert.equal(n(3).flag, 'label-does-not-settle');
  assert.equal(n(1.5).flag, 'creatinine-not-in-table');
});

test('dimercaprol: per-kilogram doses, mL at 100 mg/mL, and the dose counts', () => {
  const d = (regimen) => c({ regimen, weight: 70 });
  assert.deepEqual([d('dimercaprol-arsenic-gold-mild').doseMg, d('dimercaprol-arsenic-gold-mild').courseDoses], [175, 20]);
  assert.deepEqual([d('dimercaprol-arsenic-gold-severe').doseMg, d('dimercaprol-arsenic-gold-severe').courseDoses], [210, 36]);
  assert.match(d('dimercaprol-arsenic-gold-mild').band, /1\.75 mL of 100 mg\/mL/);
  assert.deepEqual([d('dimercaprol-mercury').doseMg, d('dimercaprol-mercury').flag], [350, 'label-gives-a-choice']);
  assert.match(d('dimercaprol-lead-encephalopathy').band, /280 mg .* alone as the first dose, then every 4 hours together with edetate/);
});

test('nothing is defaulted', () => {
  assert.match(c({}).message, /^Choose the agent and the poisoning/);
  assert.match(c({ regimen: 'succimer-lead' }).message, /^Enter the weight/);
  assert.match(c({ regimen: 'edetate-lead' }).message, /^Enter the body surface area/);
  assert.match(c({ regimen: 'edetate-lead-nephropathy', bsa: 1.8 }).message, /^Enter the serum creatinine/);
  assert.equal(chelationDose(null, now).valid, false);
});

// spec-v1636 tool 10: the dose calendar from an optional first dose.
test('calendar: succimer by its 8- and 12-hour intervals, edetate by day, dimercaprol by doses a day', () => {
  const t = new Date('2026-10-14T12:00:00Z');
  const s = chelationDose({ regimen: 'succimer-lead', weight: 20, start: '2026-10-14T08:00' }, t);
  assert.equal(s.calendar.length, 43);
  assert.deepEqual([s.calendar[0], s.calendar[14], s.calendar[15], s.calendar[42]], ['2026-10-14T08:00', '2026-10-19T00:00', '2026-10-19T08:00', '2026-11-01T20:00']);
  assert.match(chelationDose({ regimen: 'edetate-lead-nephropathy', bsa: 1.8, creatinine: 3.5, start: '2026-10-14' }, t).notes.join(' '), /Calendar: Wed Oct 14, 2026; Fri Oct 16, 2026; Sun Oct 18, 2026\./);
  assert.match(chelationDose({ regimen: 'dimercaprol-arsenic-gold-mild', weight: 70, start: '2026-10-14' }, t).notes.join(' '), /4 doses a day; Fri Oct 16, 2026: 2 doses a day; Sat Oct 17, 2026 to Mon Oct 26, 2026: 1 dose a day/);
  assert.match(chelationDose({ regimen: 'dimercaprol-mercury', weight: 70, start: '2026-10-14' }, t).notes.join(' '), /No calendar/);
  assert.equal(chelationDose({ regimen: 'succimer-lead', weight: 20 }, t).calendar, undefined);
  assert.match(chelationDose({ regimen: 'succimer-lead', weight: 20, start: '2026-02-30T08:00' }, t).message, /^Enter the first dose as a date and time/);
});

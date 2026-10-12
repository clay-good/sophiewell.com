// spec-v1639 tool 11: an OTC 24-hour total against the label's or monograph's maximum.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { otcDailyMaxCheck as dm, INGREDIENTS } from '../../lib/otc-daily-max-check-v1639.js';

const row = (label, extra = {}) => ({ label, splVersion: 1, publishedOn: '2026-01-01', verifiedOn: '2026-10-12', validThrough: '2027-10-12', ...extra });
const T = Object.fromEntries(INGREDIENTS.filter((i) => i.setId).map((i) => [i.setId, row(i.brand)]));
const NOW = new Date('2026-10-12T12:00:00Z');
const run = (o, t = T) => dm(o, NOW, t);

test('the adult maximums as stated', () => {
  const adult = (v) => { const i = INGREDIENTS.find((x) => x.value === v); const g = i.groups.find((x) => x.a[0] === 12 || x.a[0] === 17); return i.mg !== null ? g.max * i.mg : g.maxMg; };
  assert.deepEqual(['ibuprofen-200', 'naproxen-sodium-220', 'acetylsalicylic-acid-325', 'loperamide-2', 'diphenhydramine-hcl', 'dextromethorphan-hbr', 'dextromethorphan-polistirex-er', 'guaifenesin-ir', 'oral-decongestant-pse', 'peg-3350'].map(adult), [1200, 660, 3900, 8, 300, 120, 120, 2400, 240, 17000]);
});

test('label rows: total, over by how much, single dose and interval', () => {
  const ok = run({ ingredient: 'ibuprofen-200', ageYears: 30, amount24h: 6, singleDose: 2, intervalHours: 6 });
  assert.deepEqual([ok.totalMg, ok.maxMg, ok.flag, ok.abnormal], [1200, 1200, 'within-the-stated-limit', false]);
  assert.match(ok.note, /At the stated maximum\./);
  const over = run({ ingredient: 'ibuprofen-200', ageYears: 30, amount24h: 8, singleDose: 3, intervalHours: 3 });
  assert.deepEqual([over.overByMg, over.flag], [400, 'outside-the-stated-limit']);
  assert.match(over.note, /Over the stated maximum by 400 mg \(2 capsules\)/);
  assert.match(over.note, /more than the largest single dose stated \(2 capsules\)/);
  assert.match(over.note, /3 hours between doses is shorter than the 4 hours stated/);
  assert.match(run({ ingredient: 'naproxen-sodium-220', ageYears: 40, amount24h: 3, singleDose: 2 }).note, /first-dose allowance/);
  // Aspirin: 3 tablets needs 6 hours; 2 tablets needs 4.
  assert.equal(run({ ingredient: 'acetylsalicylic-acid-325', ageYears: 40, amount24h: 12, singleDose: 3, intervalHours: 4 }).abnormal, true);
  assert.equal(run({ ingredient: 'acetylsalicylic-acid-325', ageYears: 40, amount24h: 12, singleDose: 2, intervalHours: 4 }).abnormal, false);
  assert.match(run({ ingredient: 'acetylsalicylic-acid-325', ageYears: 40, amount24h: 12 }).note, /4,000 milligrams in 24 hours/);
});

test('monograph rows: the reader enters the strength; children 6 to under 12 have their own maximum', () => {
  const a = run({ ingredient: 'diphenhydramine-hcl', ageYears: 30, amount24h: 8, unitMg: 50 });
  assert.deepEqual([a.totalMg, a.maxMg, a.overByMg], [400, 300, 100]);
  const c = run({ ingredient: 'diphenhydramine-hcl', ageYears: 8, amount24h: 6, unitMg: 25, singleDose: 1, intervalHours: 4 });
  assert.deepEqual([c.totalMg, c.maxMg, c.abnormal], [150, 150, false]);
  assert.equal(run({ ingredient: 'oral-decongestant-pse', ageYears: 9, amount24h: 5, unitMg: 30 }).overByMg, 30);
  assert.equal(run({ ingredient: 'guaifenesin-ir', ageYears: 20, amount24h: 6, unitMg: 400 }).abnormal, false);
  // Dextromethorphan: 30 mg needs 6 hours.
  assert.equal(run({ ingredient: 'dextromethorphan-hbr', ageYears: 20, amount24h: 4, unitMg: 30, singleDose: 1, intervalHours: 4 }).abnormal, true);
  assert.match(run({ ingredient: 'guaifenesin-ir', ageYears: 20, amount24h: 6 }).message, /milligrams in each unit/);
});

test('Delsym in mL, and MiraLAX days', () => {
  const d = run({ ingredient: 'dextromethorphan-polistirex-er', ageYears: 8, amount24h: 15, singleDose: 5, intervalHours: 12 });
  assert.deepEqual([d.totalMg, d.maxMg, d.overByMg], [90, 60, 30]);
  const p = run({ ingredient: 'peg-3350', ageYears: 40, amount24h: 1, days: 10 });
  assert.deepEqual([p.flag, p.overByMg], ['outside-the-stated-limit', 0]);
  assert.match(p.note, /10 days of use is more than the 7 days/);
  assert.equal(run({ ingredient: 'peg-3350', ageYears: 16, amount24h: 1 }).flag, 'no-limit-computed');
});

test('no cough-and-cold figure under 6; "ask a doctor" rows are the answer', () => {
  for (const v of ['dextromethorphan-hbr', 'dextromethorphan-polistirex-er', 'guaifenesin-ir', 'oral-decongestant-pse', 'diphenhydramine-hcl']) {
    const r = run({ ingredient: v, ageYears: 5, amount24h: 2, unitMg: 5 });
    assert.deepEqual([r.flag, r.totalMg], ['no-limit-computed', undefined], v);
  }
  assert.match(run({ ingredient: 'dextromethorphan-polistirex-er', ageYears: 3 }).note, /children under 4 years of age, do not use/);
  assert.match(run({ ingredient: 'ibuprofen-200', ageYears: 10 }).band, /ask a doctor/);
  assert.match(run({ ingredient: 'loperamide-2', ageYears: 7 }).note, /children's chart tool/);
});

test('refusals and a withheld label', () => {
  assert.match(run({}).message, /^Choose the active ingredient/);
  assert.match(run({ ingredient: 'acetylsalicylic-acid-325' }).message, /age in years/);
  assert.match(run({ ingredient: 'acetylsalicylic-acid-325', ageYears: 40 }).message, /tablets taken or planned in 24 hours/);
  const i = INGREDIENTS.find((x) => x.value === 'acetylsalicylic-acid-325');
  const w = run({ ingredient: 'acetylsalicylic-acid-325', ageYears: 40, amount24h: 4 }, { ...T, [i.setId]: row('Bayer', { supersededOn: '2026-11-01' }) });
  assert.deepEqual([w.withheld, w.totalMg], [true, undefined]);
  assert.match(run({ ingredient: 'acetylsalicylic-acid-325', ageYears: 40, amount24h: 4 }).note, /does not say that a total is safe/);
});

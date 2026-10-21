// spec-v1633 tool 1: the switching rules of four DOAC labels.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { anticoagSwitchClock as d, LABELS, DRUGS } from '../../lib/anticoag-switch-clock-v1633.js';
import { labelRow } from '../../lib/label-row.js';

const now = new Date('2026-10-11T12:00:00Z');
const run = (i) => d({ population: 'adult', ...i }, now);
const all = (r) => `${r.band} ${r.notes.join(' ')}`;

test('the four labels answer', () => {
  for (const l of Object.values(LABELS)) assert.equal(labelRow(l.setId, now).answers, true, l.brand);
  assert.equal(DRUGS.length, 7);
});

test('from warfarin: each label has its own INR threshold, and none is carried to another drug', () => {
  const met = (to, inr, population = 'adult') => run({ from: 'warfarin', to, inr, population }).met;
  assert.deepEqual([met('apixaban', 1.9), met('apixaban', 2.0)], [true, false]); // below 2.0
  assert.deepEqual([met('dabigatran', 1.9), met('dabigatran', 2.0)], [true, false]); // below 2.0
  assert.deepEqual([met('rivaroxaban', 2.9), met('rivaroxaban', 3.0)], [true, false]); // below 3.0, adults
  assert.deepEqual([met('rivaroxaban', 2.4, 'pediatric'), met('rivaroxaban', 2.5, 'pediatric')], [true, false]); // below 2.5
  assert.deepEqual([met('edoxaban', 2.5), met('edoxaban', 2.6)], [true, false]); // 2.5 or below
  const r = run({ from: 'warfarin', to: 'apixaban', inr: 2.7 });
  assert.deepEqual([r.flag, r.abnormal], ['not-yet', true]);
  assert.match(r.band, /INR 2\.7 is not yet below 2\.0: not yet/);
  assert.match(run({ from: 'warfarin', to: 'apixaban' }).message, /^Enter the current INR/);
});

test('to warfarin: the plan of the drug being stopped', () => {
  const a = run({ from: 'apixaban', to: 'warfarin', nextDose: '2026-10-12T08:00' });
  assert.deepEqual([a.flag, a.startAt], ['overlap-plan', '2026-10-12 08:00']);
  assert.match(a.band, /one approach/);
  assert.match(all(run({ from: 'rivaroxaban', to: 'warfarin' })), /No clinical trial data|no clinical trial data/);
  const ped = run({ from: 'rivaroxaban', to: 'warfarin', population: 'pediatric' });
  assert.match(ped.band, /at least 2 days after the first dose of warfarin/);
  assert.match(all(ped), /24 hours after the last dose/);
  const days = (crcl, population = 'adult') => run({ from: 'dabigatran', to: 'warfarin', crcl, population }).daysBefore;
  // The label prints 50 in two rows (50 or above, 30-50) as it does 30 (spec-v1665).
  assert.deepEqual([days(51), days(50), days(49), days(31), days(30), days(29), days(15)], [[3], [3, 2], [2], [2], [2, 1], [1], [1]]);
  assert.equal(run({ from: 'dabigatran', to: 'warfarin', crcl: 14 }).flag, 'no-recommendation-given');
  assert.deepEqual(days(50, 'pediatric'), [3]);
  assert.equal(run({ from: 'dabigatran', to: 'warfarin', crcl: 49, population: 'pediatric' }).flag, 'no-recommendation-given');
  assert.match(run({ from: 'dabigatran', to: 'warfarin' }).message, /^Enter the creatinine clearance/);
  assert.match(all(run({ from: 'dabigatran', to: 'warfarin', crcl: 60 })), /stopped for at least 2 days/);
});

test('edoxaban to warfarin: the option is asked for, and the oral option halves the dose', () => {
  assert.match(run({ from: 'edoxaban', to: 'warfarin' }).message, /oral option or the parenteral option/);
  assert.match(run({ from: 'edoxaban', to: 'warfarin', edoxabanOption: 'oral' }).message, /60 mg or 30 mg/);
  assert.equal(run({ from: 'edoxaban', to: 'warfarin', edoxabanOption: 'oral', edoxabanDose: '60' }).reducedDoseMg, 30);
  assert.equal(run({ from: 'edoxaban', to: 'warfarin', edoxabanOption: 'oral', edoxabanDose: '30' }).reducedDoseMg, 15);
  const p = run({ from: 'edoxaban', to: 'warfarin', edoxabanOption: 'parenteral', nextDose: '2026-10-12T09:30' });
  assert.equal(p.startAt, '2026-10-12 09:30');
  assert.match(all(p), /stable INR of 2\.0 or above/);
});

test('between two non-warfarin drugs: timing rules, as dates when a time is supplied', () => {
  const x = run({ from: 'lmwh', to: 'rivaroxaban', nextDose: '2026-10-12T08:00' });
  assert.deepEqual([x.flag, x.windowFrom, x.startAt], ['timed', '2026-10-12 06:00', '2026-10-12 08:00']);
  assert.equal(run({ from: 'ufh', to: 'rivaroxaban' }).flag, 'start-now');
  assert.match(run({ from: 'ufh', to: 'edoxaban' }).band, /4 hours later/);
  assert.match(run({ from: 'lmwh', to: 'edoxaban', nextDose: '2026-10-12T08:00' }).band, /next scheduled administration of LMWH\. That is 2026-10-12 08:00/);
  assert.match(run({ from: 'lmwh', to: 'dabigatran' }).band, /0 to 2 hours before/);
  assert.match(run({ from: 'ufh', to: 'dabigatran' }).band, /continuous infusion is discontinued/);
  assert.match(run({ from: 'lmwh', to: 'apixaban' }).band, /usual time of the next dose/);
  // Without a time the rule is the answer, and the result says how to get a date.
  const r = run({ from: 'lmwh', to: 'apixaban' });
  assert.equal(r.flag, 'rule');
  assert.match(all(r), /Enter the time of the next scheduled dose/);
});

test('dabigatran to a parenteral drug waits 12 or 24 hours by clearance; children 12', () => {
  const at = (crcl, population = 'adult') => run({ from: 'dabigatran', to: 'lmwh', crcl, population, lastDose: '2026-10-11T20:00' }).startAt;
  assert.deepEqual([at(30), at(29.9), at('', 'pediatric')], ['2026-10-12 08:00', '2026-10-12 20:00', '2026-10-12 08:00']);
  assert.match(run({ from: 'dabigatran', to: 'ufh' }).message, /^Enter the creatinine clearance/);
  assert.match(all(run({ from: 'dabigatran', to: 'ufh', crcl: 60 })), /Enter the time of the last Pradaxa dose/);
});

test('two DOACs: both labels are shown, and a label with no rule says so', () => {
  const r = run({ from: 'apixaban', to: 'rivaroxaban', nextDose: '2026-10-12T08:00' });
  assert.match(r.band, /^The Eliquis label: .*usual time of the next dose of Eliquis\. That is 2026-10-12 08:00/);
  assert.match(all(r), /Xarelto label: start Xarelto 0 to 2 hours before .* between 2026-10-12 06:00 and 2026-10-12 08:00/);
  assert.match(all(r), /neither is chosen for you/);
  assert.match(all(run({ from: 'apixaban', to: 'dabigatran' })), /Pradaxa label gives no rule for a switch to Pradaxa from another oral anticoagulant/);
  assert.match(run({ from: 'dabigatran', to: 'apixaban' }).band, /^The Eliquis label: discontinue Pradaxa and begin Eliquis/);
});

test('refusals and what the labels do not cover', () => {
  assert.match(d({}, now).message, /being stopped/);
  assert.match(d({ from: 'warfarin' }, now).message, /being started/);
  assert.match(d({ from: 'warfarin', to: 'warfarin' }, now).message, /two different/);
  assert.match(d({ from: 'warfarin', to: 'apixaban' }, now).message, /adult or pediatric/);
  assert.equal(run({ from: 'warfarin', to: 'lmwh' }).flag, 'not-covered');
  assert.equal(run({ from: 'lmwh', to: 'ufh' }).flag, 'not-covered');
  assert.match(run({ from: 'lmwh', to: 'dabigatran', nextDose: 'tomorrow' }).message, /date and time/);
  assert.match(run({ from: 'lmwh', to: 'dabigatran', nextDose: '2026-02-30T08:00' }).message, /date and time/);
  assert.match(all(run({ from: 'warfarin', to: 'edoxaban', inr: 2, population: 'pediatric' })), /no pediatric indication/);
});

test('a superseded label withholds its rule; the other label in a two-label switch still answers', () => {
  const T = Object.fromEntries(Object.values(LABELS).map((l) => [l.setId, { label: l.brand, splVersion: 1, publishedOn: '2026-01-01', verifiedOn: '2026-10-11', validThrough: '2027-10-11' }]));
  T[LABELS.apixaban.setId].supersededOn = '2026-10-12';
  const w = d({ from: 'warfarin', to: 'apixaban', population: 'adult', inr: 1.5 }, now, T);
  assert.equal(w.withheld, true);
  assert.equal(w.met, undefined);
  const two = d({ from: 'apixaban', to: 'rivaroxaban', population: 'adult' }, now, T);
  assert.match(two.band, /^The Xarelto label/);
  assert.match(two.notes.join(' '), /Eliquis label's rule is withheld/);
});

// spec-v1633 tool 2: DOAC interruption around a procedure, by the label and by PAUSE.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { doacPeriproceduralTiming as d, DRUGS } from '../../lib/doac-periprocedural-timing-v1633.js';
import { labelRow } from '../../lib/label-row.js';

const now = new Date('2026-10-11T12:00:00Z');
// A Thursday at 08:00.
const run = (i) => d({ population: 'adult', source: 'both', procedure: '2026-10-15T08:00', ...i }, now);
const all = (r) => `${r.band} ${r.notes.join(' ')}`;

test('the four labels answer', () => {
  for (const l of DRUGS) assert.equal(labelRow(l.setId, now).answers, true, l.brand);
});

test('PAUSE: 1 day omitted before a low-risk and 2 before a high-risk procedure, plus the day itself', () => {
  const hi = run({ drug: 'apixaban', risk: 'high', crcl: 80, source: 'pause' });
  // Procedure Thursday, two days omitted (Tuesday, Wednesday): last dose Monday.
  assert.deepEqual([hi.pauseDaysOmitted, hi.pauseLastDoseDay, hi.pauseResumeFrom, hi.pauseResumeTo], [2, '2026-10-12', '2026-10-17', '2026-10-18']);
  assert.match(hi.band, /last dose on Monday 2026-10-12/);
  const lo = run({ drug: 'rivaroxaban', risk: 'low', crcl: 80, source: 'pause' });
  assert.deepEqual([lo.pauseDaysOmitted, lo.pauseLastDoseDay, lo.pauseResumeFrom, lo.pauseResumeTo], [1, '2026-10-13', '2026-10-16', undefined]);
  assert.match(all(lo), /provided hemostasis is achieved/);
});

test('PAUSE: dabigatran below 50 mL/min has 2 and 4 days; 50 is the ordinary row', () => {
  const omit = (crcl, risk) => run({ drug: 'dabigatran', risk, crcl, source: 'pause' }).pauseDaysOmitted;
  assert.deepEqual([omit(49, 'high'), omit(50, 'high'), omit(49, 'low'), omit(50, 'low')], [4, 2, 2, 1]);
  assert.equal(run({ drug: 'dabigatran', risk: 'high', crcl: 49, source: 'pause' }).pauseLastDoseDay, '2026-10-10');
});

test('PAUSE says where it was not studied instead of giving a line', () => {
  const e = run({ drug: 'edoxaban', risk: 'low' });
  assert.equal(e.pauseDaysOmitted, undefined);
  assert.match(all(e), /PAUSE did not study edoxaban/);
  assert.match(e.band, /^Savaysa label/);
  const a = run({ drug: 'apixaban', risk: 'low', crcl: 24 });
  assert.equal(a.pauseDaysOmitted, undefined);
  assert.match(all(a), /below 25 mL\/min, so the protocol was not studied at 24/);
  assert.equal(run({ drug: 'apixaban', risk: 'low', crcl: 25 }).pauseDaysOmitted, 1);
  assert.equal(run({ drug: 'rivaroxaban', risk: 'low', crcl: 29 }).pauseDaysOmitted, undefined);
  assert.equal(run({ drug: 'dabigatran', risk: 'low', crcl: 29 }).pauseDaysOmitted, undefined);
  const only = run({ drug: 'apixaban', risk: 'low', crcl: 24, source: 'pause' });
  assert.deepEqual([only.flag, only.abnormal], ['no-recommendation-given', true]);
  assert.match(all(run({ drug: 'dabigatran', risk: 'low', crcl: 90, population: 'pediatric' })), /PAUSE enrolled adults/);
});

test('the labels: hours before the procedure, each drug its own', () => {
  const by = (i) => run({ source: 'label', ...i }).labelLastDoseBy;
  assert.equal(by({ drug: 'apixaban', risk: 'high' }), '2026-10-13 08:00'); // 48 hours
  assert.equal(by({ drug: 'apixaban', risk: 'low' }), '2026-10-14 08:00'); // 24 hours
  assert.equal(by({ drug: 'rivaroxaban', risk: 'high' }), '2026-10-14 08:00');
  assert.equal(by({ drug: 'edoxaban', risk: 'high' }), '2026-10-14 08:00');
  const dab = run({ drug: 'dabigatran', risk: 'low', crcl: 50, source: 'label' });
  assert.deepEqual([dab.labelLastDoseFrom, dab.labelLastDoseBy], ['2026-10-13 08:00', '2026-10-14 08:00']); // 1 to 2 days
  const low = run({ drug: 'dabigatran', risk: 'low', crcl: 49, source: 'label' });
  assert.deepEqual([low.labelLastDoseFrom, low.labelLastDoseBy], ['2026-10-10 08:00', '2026-10-12 08:00']); // 3 to 5 days
  assert.match(low.band, /consider longer times for major surgery/);
  assert.match(low.band, /as soon as medically appropriate/);
  assert.match(run({ drug: 'apixaban', risk: 'low', source: 'label' }).band, /adequate hemostasis/);
});

test('pediatric dabigatran: 24 hours above 80, 2 days at 50 to 80, nothing below 50', () => {
  const p = (crcl) => run({ drug: 'dabigatran', risk: 'low', crcl, population: 'pediatric', source: 'label' });
  assert.equal(p(81).labelLastDoseBy, '2026-10-14 08:00');
  assert.equal(p(80).labelLastDoseBy, '2026-10-13 08:00');
  assert.equal(p(50).labelLastDoseBy, '2026-10-13 08:00');
  assert.deepEqual([p(49).flag, p(49).labelLastDoseBy, p(49).abnormal], ['no-recommendation-given', undefined, true]);
});

test('both sources side by side, and nothing defaulted', () => {
  const r = run({ drug: 'apixaban', risk: 'high', crcl: 80 });
  assert.match(r.band, /^Eliquis label/);
  assert.match(all(r), /PAUSE protocol \(high bleeding risk\)/);
  assert.match(all(r), /neither is chosen for you/);
  assert.match(d({}, now).message, /Choose the DOAC/);
  assert.match(d({ drug: 'apixaban' }, now).message, /adult or pediatric/);
  assert.match(d({ drug: 'apixaban', population: 'adult' }, now).message, /bleeding risk/);
  assert.match(d({ drug: 'apixaban', population: 'adult', risk: 'low' }, now).message, /source/);
  assert.match(d({ drug: 'apixaban', population: 'adult', risk: 'low', source: 'label' }, now).message, /procedure date and time/);
  assert.match(run({ drug: 'apixaban', risk: 'low', procedure: '2026-10-15' }).message, /procedure date and time/);
  assert.match(run({ drug: 'rivaroxaban', risk: 'low' }).message, /^Enter the creatinine clearance/);
  assert.equal(run({ drug: 'rivaroxaban', risk: 'low', source: 'label' }).valid, true); // the label line needs no clearance
  assert.match(run({ drug: 'dabigatran', risk: 'low', source: 'label' }).message, /^Enter the creatinine clearance/);
});

test('a superseded label withholds its line; PAUSE still answers', () => {
  const T = Object.fromEntries(DRUGS.map((l) => [l.setId, { label: l.brand, splVersion: 1, publishedOn: '2026-01-01', verifiedOn: '2026-10-11', validThrough: '2027-10-11', supersededOn: '2026-10-12' }]));
  const r = d({ drug: 'apixaban', population: 'adult', risk: 'high', source: 'both', procedure: '2026-10-15T08:00', crcl: 80 }, now, T);
  assert.match(r.band, /^PAUSE protocol/);
  assert.equal(r.labelLastDoseBy, undefined);
  assert.match(r.notes.join(' '), /Eliquis label's times are withheld/);
  const only = d({ drug: 'apixaban', population: 'adult', risk: 'high', source: 'label', procedure: '2026-10-15T08:00' }, now, T);
  assert.deepEqual([only.withheld, only.flag], [true, 'withheld']);
});

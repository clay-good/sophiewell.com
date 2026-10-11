// spec-v1633 tool 13: antiepileptic formulation and route switches from six labels.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { aedFormulationSwitch as d, LABELS, SWITCHES, DEPAKOTE_ROWS } from '../../lib/aed-formulation-switch-v1633.js';
import { labelRow } from '../../lib/label-row.js';

const now = new Date('2026-10-11T12:00:00Z');
const at = (sw, dailyDose) => d({ switch: sw, dailyDose }, now);

test('the six labels answer', () => {
  for (const l of Object.values(LABELS)) assert.equal(labelRow(l.setId, now).answers, true, l.brand);
  assert.equal(SWITCHES.length, 8);
});

test('Depakote to Depakote ER: every row of Table 1, each about 8 to 20% higher except the asterisked ones', () => {
  assert.deepEqual(DEPAKOTE_ROWS.map((r) => r[2]), [750, 1000, 1250, 1500, 1750, 2000, 2250, 2500, 2750, 3000, 3250, 3500]);
  const er = (v) => at('depakote-to-er', v).targetDailyDose;
  assert.deepEqual([500, 625, 750, 875, 1000, 1125, 1250, 1375, 1500, 1625, 1750, 1875, 2000, 2125, 2250, 2375, 2500, 2750, 2875, 3000, 3125].map(er), [750, 750, 1000, 1000, 1250, 1250, 1500, 1500, 1750, 1750, 2000, 2250, 2250, 2500, 2500, 2750, 3000, 3000, 3250, 3500, 3500]);
  for (const [lo, hi, target] of DEPAKOTE_ROWS) {
    for (const v of [lo, hi]) {
      const pct = ((target - v) / v) * 100;
      // The label's own table: 1,625 to 1,750 is 7.7%, a shade under its "8 to 20%". Printed as computed.
      if (![500, 750, 1000].includes(v)) assert.ok(pct >= 7.6 && pct <= 20 + 1e-9, `${v} -> ${target} is ${pct}%`);
    }
  }
  const star = at('depakote-to-er', 500);
  assert.deepEqual([star.flag, star.abnormal, star.targetDailyDose], ['dose-with-caution', true, 750]);
  assert.match(star.notes.join(' '), /asterisk.*next higher Depakote dose/);
  assert.equal(at('depakote-to-er', 1250).flag, 'dose');
});

test('Depakote: a dose off the table, and one above it, give no ER dose', () => {
  const off = at('depakote-to-er', 900);
  assert.deepEqual([off.flag, off.targetDailyDose], ['not-in-table', undefined]);
  assert.match(off.band, /750 to 875 mg \(Depakote ER 1,000 mg\) and 1,000 to 1,125 mg \(Depakote ER 1,250 mg\)/);
  assert.equal(at('depakote-to-er', 250).flag, 'not-in-table');
  const over = at('depakote-to-er', 3126);
  assert.deepEqual([over.flag, over.targetDailyDose], ['no-recommendation-given', undefined]);
  assert.match(over.band, /insufficient data/);
});

test('the same-dose switches say so in the label\'s own terms', () => {
  for (const sw of ['valproate-oral-to-iv', 'levetiracetam-oral-and-iv', 'carbamazepine-tablets-to-xr', 'carbamazepine-tablets-to-suspension', 'phenytoin-oral-to-fosphenytoin']) assert.equal(at(sw, 1000).targetDailyDose, 1000, sw);
  assert.match(at('valproate-oral-to-iv', 1000).notes.join(' '), /60-minute infusion, at no more than 20 mg a minute/);
  assert.match(at('carbamazepine-tablets-to-xr', 800).band, /twice a day/);
  assert.match(at('carbamazepine-tablets-to-suspension', 800).band, /smaller, more frequent doses/);
  const f = at('phenytoin-oral-to-fosphenytoin', 300);
  assert.match(f.band, /300 mg PE a day/);
  assert.match(f.notes.join(' '), /no molecular-weight adjustment/);
  assert.match(f.notes.join(' '), /may increase modestly/);
});

test('phenytoin free acid and sodium salt: a content comparison, never a new dose', () => {
  const a = at('phenytoin-acid-to-sodium', 300);
  assert.deepEqual([a.flag, a.acidContentBefore, a.acidContentAfter, a.percentChange, a.targetDailyDose], ['content-comparison', 300, 276, -8, undefined]);
  const s = at('phenytoin-sodium-to-acid', 300);
  assert.deepEqual([s.acidContentBefore, s.acidContentAfter, s.percentChange, s.targetDailyDose], [276, 300, 8.7, undefined]);
  assert.match(s.notes.join(' '), /does not pick the new dose/);
  assert.match(s.notes.join(' '), /approximately 8% more drug content/);
});

test('nothing is defaulted, and a superseded label withholds its statement', () => {
  assert.match(d({}, now).message, /^Choose the switch/);
  assert.match(d({ switch: 'depakote-to-er' }, now).message, /^Enter the current total daily dose/);
  const T = Object.fromEntries(Object.values(LABELS).map((l) => [l.setId, { label: l.brand, splVersion: 1, publishedOn: '2026-01-01', verifiedOn: '2026-10-11', validThrough: '2027-10-11' }]));
  T[LABELS.depakote.setId].supersededOn = '2026-10-12';
  const w = d({ switch: 'depakote-to-er', dailyDose: 1250 }, now, T);
  assert.deepEqual([w.withheld, w.targetDailyDose], [true, undefined]);
  assert.equal(d({ switch: 'carbamazepine-tablets-to-xr', dailyDose: 800 }, now, T).targetDailyDose, 800);
});

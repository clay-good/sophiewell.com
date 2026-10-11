// spec-v1633 tool 14: tacrolimus, cyclosporine and mycophenolate product switches from four labels.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { transplantFormulationSwitch as d, LABELS, SWITCHES, MMF_TO_MPA } from '../../lib/transplant-formulation-switch-v1633.js';
import { labelRow } from '../../lib/label-row.js';

const now = new Date('2026-10-11T12:00:00Z');
const at = (sw, dailyDose) => d({ switch: sw, dailyDose }, now);

test('the four labels answer', () => {
  for (const l of Object.values(LABELS)) assert.equal(labelRow(l.setId, now).answers, true, l.brand);
  assert.equal(SWITCHES.length, 5);
});

test('tacrolimus immediate-release to Envarsus XR is 80% of the daily dose, once daily', () => {
  const r = at('tacrolimus-ir-to-envarsus', 6);
  assert.deepEqual([r.flag, r.targetDailyDose], ['dose', 4.8]);
  assert.match(r.band, /80% of the total daily dose/);
  assert.match(r.notes.join(' '), /no rounding rule/);
  assert.equal(at('tacrolimus-ir-to-envarsus', 10).targetDailyDose, 8);
});

test('Sandimmune to Neoral is 1:1 then to trough; the reverse has a warning and no dose', () => {
  const r = at('sandimmune-to-neoral', 300);
  assert.deepEqual([r.flag, r.targetDailyDose], ['dose', 300]);
  assert.match(r.band, /pre-conversion cyclosporine trough/);
  const back = at('neoral-to-sandimmune', 300);
  assert.deepEqual([back.flag, back.targetDailyDose, back.abnormal], ['no-recommendation-given', undefined, true]);
  assert.match(back.band, /may result in lower cyclosporine blood concentrations/);
});

test('mycophenolate: content as mycophenolic acid, 739 mg per 1,000 mg of mofetil, and no new dose', () => {
  assert.equal(MMF_TO_MPA, 0.739);
  const m = at('mmf-to-myfortic', 2000);
  assert.deepEqual([m.flag, m.mpaDailyMg, m.targetDailyDose], ['content-comparison', 1478, undefined]);
  // The label's own pair: mofetil 1,000 mg twice daily is 1,478 mg a day as acid, against Myfortic 1,440.
  const y = at('myfortic-to-mmf', 1440);
  assert.deepEqual([y.mpaDailyMg, y.targetDailyDose], [1440, undefined]);
  for (const r of [m, y]) {
    assert.match(r.notes.join(' '), /near equimolar/);
    assert.match(r.notes.join(' '), /should not be used interchangeably without physician supervision/);
  }
});

test('nothing is defaulted; either mycophenolate label going stale withholds the comparison', () => {
  assert.match(d({}, now).message, /^Choose the switch/);
  assert.match(d({ switch: 'sandimmune-to-neoral' }, now).message, /^Enter the current total daily dose/);
  const T = Object.fromEntries(Object.values(LABELS).map((l) => [l.setId, { label: l.brand, splVersion: 1, publishedOn: '2026-01-01', verifiedOn: '2026-10-11', validThrough: '2027-10-11' }]));
  T[LABELS.cellcept.setId].supersededOn = '2026-10-12';
  const w = d({ switch: 'mmf-to-myfortic', dailyDose: 2000 }, now, T);
  assert.deepEqual([w.withheld, w.mpaDailyMg], [true, undefined]);
  assert.equal(d({ switch: 'tacrolimus-ir-to-envarsus', dailyDose: 6 }, now, T).targetDailyDose, 4.8);
});

// spec-v1632 tool 15: tranexamic acid by serum creatinine, on two label rows.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { tranexamicAcidRenalDose as d, ROUTES, IV_BANDS, ORAL_BANDS } from '../../lib/tranexamic-acid-renal-dose-v1632.js';
import { LABEL_EDITIONS } from '../../lib/label-editions.js';
import { labelRow } from '../../lib/label-row.js';

const now = new Date('2026-10-11T12:00:00Z');
const iv = (creatinine, weight = 70) => d({ route: 'iv', creatinine, weight }, now);
const oral = (creatinine) => d({ route: 'oral', creatinine }, now);

test('two labels answering; the two tables have different edges', () => {
  for (const r of ROUTES) assert.equal(labelRow(r.setId, now).answers, true, r.brand);
  assert.deepEqual(IV_BANDS.map((b) => [b.from, b.to]), [[null, 1.36], [1.36, 2.83], [2.83, 5.66], [5.66, null]]);
  assert.deepEqual(ORAL_BANDS.map((b) => [b.from, b.to]), [[null, 1.4], [1.4, 2.8], [2.8, 5.7], [5.7, null]]);
});

test('intravenous: the mg/kg row and the milligrams at the weight entered; 2.83 is in two rows', () => {
  assert.equal(iv(1.0).flag, 'no-adjustment');
  assert.deepEqual([iv(1.36).rows[0], iv(1.36).dosesMg], ['10 mg/kg intravenously twice daily', [700]]);
  assert.deepEqual(iv(2.83).rows, ['10 mg/kg intravenously twice daily', '10 mg/kg intravenously daily']);
  assert.equal(iv(5.66).rows[0], '10 mg/kg intravenously daily');
  assert.deepEqual([iv(5.67).rows[0], iv(5.67).dosesMg], ['10 mg/kg intravenously every 48 hours or 5 mg/kg intravenously every 24 hours', [700, 350]]);
  assert.match(iv(2, 80).notes.join(' '), /At 80 kg actual body weight: 10 mg\/kg = 800 mg per dose/);
  assert.match(d({ route: 'iv', creatinine: 2 }, now).message, /actual body weight .* not a clearance/);
});

test('oral: above 1.4, above 2.8, above 5.7', () => {
  assert.equal(oral(1.4).flag, 'no-adjustment');
  assert.match(oral(1.4).band, /1,300 mg three times daily/);
  assert.deepEqual([1.41, 2.8, 2.81, 5.7, 5.71].map((v) => oral(v).rows[0]), ['1,300 mg two times a day (2,600 mg/day)', '1,300 mg two times a day (2,600 mg/day)', '1,300 mg once a day', '1,300 mg once a day', '650 mg once a day']);
  assert.match(oral(3).notes.join(' '), /maximum of 5 days/);
  assert.equal(oral(3).dosesMg, undefined);
});

test('nothing is defaulted; a superseded label withholds that route only', () => {
  assert.match(d({}, now).message, /Choose the route/);
  assert.equal(oral('').valid, false);
  assert.equal(oral(0).valid, false);
  const id = ROUTES[0].setId;
  const table = { ...LABEL_EDITIONS, [id]: { ...LABEL_EDITIONS[id], supersededOn: '2026-10-10' } };
  assert.equal(d({ route: 'iv', creatinine: 2, weight: 70 }, now, table).withheld, true);
  assert.equal(d({ route: 'oral', creatinine: 2 }, now, table).withheld, undefined);
});

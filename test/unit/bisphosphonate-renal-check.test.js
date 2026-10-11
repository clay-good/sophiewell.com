// spec-v1632 tool 14: zoledronic acid dose and bisphosphonate clearance cutoffs, on four label rows.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { bisphosphonateRenalCheck as d, LABELS, REGIMENS } from '../../lib/bisphosphonate-renal-check-v1632.js';
import { LABEL_EDITIONS } from '../../lib/label-editions.js';
import { labelRow } from '../../lib/label-row.js';

const now = new Date('2026-10-11T12:00:00Z');
const at = (regimen, kidney) => d({ regimen, dialysis: 'none', kidney }, now);

test('four labels answering, five rows', () => {
  for (const l of Object.values(LABELS)) assert.equal(labelRow(l.setId, now).answers, true, l.brand);
  assert.equal(REGIMENS.length, 5);
});

test('zoledronic acid 4 mg: the reduced doses of Table 1, and no dose below 30', () => {
  assert.deepEqual([61, 60, 50, 49, 40, 39, 30].map((v) => at('zoledronic-4mg-bone', v).rows[0].slice(0, 6)), ['4 mg, ', '3.5 mg', '3.5 mg', '3.3 mg', '3.3 mg', '3 mg', '3 mg']);
  assert.deepEqual(at('zoledronic-4mg-bone', 49.5).rows, ['3.3 mg', '3.5 mg']);
  const low = at('zoledronic-4mg-bone', 29.9);
  assert.equal(low.flag, 'no-recommendation-given');
  assert.match(low.band, /stops at 30 mL\/min/);
  const hcm = d({ regimen: 'zoledronic-4mg-hcm', dialysis: 'none' }, now);
  assert.deepEqual([hcm.valid, hcm.flag], [true, 'dose']);
  assert.match(hcm.band, /serum creatinine less than 4\.5 mg\/dL.*minimum of 7 days/);
});

test('Reclast is contraindicated below 35; alendronate not recommended below 35; risedronate below 30', () => {
  assert.deepEqual([at('reclast', 35).flag, at('reclast', 34.9).flag], ['dose', 'contraindicated']);
  assert.match(at('reclast', 50).notes.join(' '), /actual body weight/);
  assert.deepEqual([at('alendronate', 35).flag, at('alendronate', 34.9).flag], ['no-adjustment', 'not-recommended']);
  assert.deepEqual([at('risedronate', 30).flag, at('risedronate', 29.9).flag], ['no-adjustment', 'not-recommended']);
});

test('none of these labels has a dialysis line; nothing is defaulted; a superseded label withholds one drug', () => {
  assert.equal(d({ regimen: 'alendronate', dialysis: 'hd' }, now).flag, 'no-recommendation-given');
  assert.match(d({}, now).message, /Choose the drug and indication/);
  assert.match(at('reclast', '').message, /Enter the creatinine clearance/);
  const id = LABELS.reclast.setId;
  const table = { ...LABEL_EDITIONS, [id]: { ...LABEL_EDITIONS[id], supersededOn: '2026-10-10' } };
  assert.equal(d({ regimen: 'reclast', dialysis: 'none', kidney: 50 }, now, table).withheld, true);
  assert.equal(d({ regimen: 'risedronate', dialysis: 'none', kidney: 50 }, now, table).withheld, undefined);
});

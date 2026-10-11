// spec-v1632 tool 12: spironolactone and eplerenone by potassium and kidney function, on two label rows.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mraPotassiumDoseCheck as d, LABELS, MODES, EPLERENONE_DOSES } from '../../lib/mra-potassium-dose-check-v1632.js';
import { LABEL_EDITIONS } from '../../lib/label-editions.js';
import { labelRow } from '../../lib/label-row.js';

const now = new Date('2026-10-11T12:00:00Z');
const sp = (potassium, egfr) => d({ mode: 'spironolactone-hf', potassium, egfr }, now);
const adj = (potassium, currentDose) => d({ mode: 'eplerenone-adjust', potassium, currentDose }, now);
const htn = (i) => d({ mode: 'eplerenone-start-htn', potassium: 4.5, crcl: 80, cyp3a: 'no', sex: 'male', creatinine: 1, microalbuminuria: 'no', potassiumSparing: 'no', ...i }, now);

test('two labels answering; four questions; three eplerenone doses', () => {
  for (const l of Object.values(LABELS)) assert.equal(labelRow(l.setId, now).answers, true, l.brand);
  assert.equal(MODES.length, 4);
  assert.deepEqual(EPLERENONE_DOSES.map((x) => x.value), ['25-qod', '25-daily', '50-daily']);
});

test('spironolactone for heart failure: 25 mg daily at potassium <= 5.0 and eGFR > 50; every other day at 30 to 50', () => {
  assert.match(sp(5.0, 51).band, /start at 25 mg once daily/);
  assert.match(sp(5.0, 50).band, /consider starting at 25 mg every other day/);
  assert.match(sp(4.0, 30).band, /consider starting at 25 mg every other day/);
  assert.equal(sp(5.1, 60).flag, 'no-recommendation-given');
  assert.equal(sp(4.0, 29).flag, 'no-recommendation-given');
  assert.match(sp(4.0, 60).notes.join(' '), /hyperkalemia on 25 mg once daily may go to 25 mg every other day/);
});

test('eplerenone Table 1: step up below 5.0, hold at 5.0 to 5.4, step down at 5.5 to 5.9, withhold at 6.0', () => {
  assert.deepEqual([adj(4.9, '25-qod').next, adj(4.9, '25-daily').next, adj(4.9, '50-daily').next], ['25-daily', '50-daily', '50-daily']);
  assert.equal(adj(4.9, '50-daily').flag, 'no-adjustment');
  assert.deepEqual([adj(5.0, '25-daily').flag, adj(5.4, '25-daily').next], ['no-adjustment', '25-daily']);
  assert.deepEqual([adj(5.5, '50-daily').next, adj(5.9, '25-daily').next, adj(5.5, '25-qod').next], ['25-daily', '25-qod', 'withhold']);
  assert.equal(adj(5.5, '25-qod').flag, 'hold');
  const top = adj(6.0, '50-daily');
  assert.equal(top.flag, 'hold');
  assert.match(top.band, /restart at 25 mg every other day when the potassium falls below 5\.5/);
  // The table prints one decimal: 5.44 reads as 5.4, 5.46 as 5.5.
  assert.equal(adj(5.44, '25-daily').flag, 'no-adjustment');
  assert.equal(adj(5.46, '25-daily').next, '25-qod');
  assert.match(adj(5.46, '25-daily').notes.join(' '), /read to one decimal/);
  assert.match(adj(5, '').message, /current eplerenone dose/);
});

test('eplerenone before starting: the label\'s contraindications, for all patients and for hypertension', () => {
  const hf = (i) => d({ mode: 'eplerenone-start-hf', potassium: 4.5, crcl: 80, cyp3a: 'no', ...i }, now);
  assert.equal(hf({}).flag, 'dose');
  assert.match(hf({}).band, /starting dose is 25 mg once daily/);
  assert.equal(hf({ potassium: 5.5 }).flag, 'dose');
  assert.deepEqual(hf({ potassium: 5.6 }).contraindications.length, 1);
  assert.equal(hf({ crcl: 30 }).flag, 'contraindicated');
  assert.equal(hf({ crcl: 31 }).flag, 'dose');
  assert.equal(hf({ cyp3a: 'yes' }).flag, 'contraindicated');
  assert.match(htn({}).band, /starting dose is 50 mg once daily/);
  assert.equal(htn({ crcl: 49 }).flag, 'contraindicated');
  assert.equal(htn({ crcl: 50 }).flag, 'dose');
  assert.equal(htn({ creatinine: 2.0 }).flag, 'dose');
  assert.equal(htn({ creatinine: 2.1 }).flag, 'contraindicated');
  assert.equal(htn({ sex: 'female', creatinine: 1.9 }).flag, 'contraindicated');
  assert.equal(htn({ microalbuminuria: 'yes' }).flag, 'contraindicated');
  assert.equal(htn({ potassiumSparing: 'yes' }).contraindications.length, 1);
  assert.equal(htn({ crcl: 20 }).contraindications.length, 1);
});

test('nothing is defaulted; a superseded label withholds that drug only', () => {
  assert.match(d({}, now).message, /Choose the drug and the question/);
  assert.equal(sp('', 60).valid, false);
  assert.equal(sp(4.5, '').valid, false);
  assert.match(htn({ sex: '' }).message, /Choose the sex/);
  assert.match(htn({ microalbuminuria: '' }).message, /microalbuminuria/);
  assert.match(d({ mode: 'eplerenone-start-hf', potassium: 4.5, crcl: 80 }, now).message, /strong CYP3A inhibitor/);
  const id = LABELS.eplerenone.setId;
  const table = { ...LABEL_EDITIONS, [id]: { ...LABEL_EDITIONS[id], supersededOn: '2026-10-10' } };
  assert.equal(d({ mode: 'eplerenone-adjust', potassium: 5, currentDose: '25-daily' }, now, table).withheld, true);
  assert.equal(d({ mode: 'spironolactone-hf', potassium: 4.5, egfr: 60 }, now, table).withheld, undefined);
});

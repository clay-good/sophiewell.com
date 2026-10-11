// spec-v1632 tool 1: DOAC dose by indication and kidney function, on four label rows.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { doacDoseCheck as d, DRUGS, INDICATIONS } from '../../lib/doac-dose-check-v1632.js';
import { LABEL_EDITIONS } from '../../lib/label-editions.js';
import { labelRow } from '../../lib/label-row.js';

const now = new Date('2026-10-11T12:00:00Z');
const run = (i) => d({ interaction: 'no', ...i }, now);
const pair = (i) => { const r = run(i); return [r.flag, r.band]; };

test('four labels, each answering; the indication list is the label\'s own per drug', () => {
  assert.deepEqual(DRUGS.map((x) => x.value), ['apixaban', 'rivaroxaban', 'dabigatran', 'edoxaban']);
  for (const x of DRUGS) assert.equal(labelRow(x.setId, now).answers, true, x.brand);
  const has = (drug) => INDICATIONS.filter((i) => i.drugs.includes(drug)).map((i) => i.value);
  assert.deepEqual(has('edoxaban'), ['af', 'vte-treatment']);
  assert.deepEqual(has('dabigatran'), ['af', 'vte-treatment', 'vte-recurrence', 'hip']);
  assert.match(run({ drug: 'dabigatran', indication: 'knee', crcl: 60 }).message, /Pradaxa label's adult dosing section has no row/);
});

test('apixaban AF: 2.5 mg with at least two of age >= 80, weight <= 60, creatinine >= 1.5', () => {
  const af = (age, weight, creatinine) => run({ drug: 'apixaban', indication: 'af', age, weight, creatinine }).band;
  assert.match(af(79, 61, 1.4), /gives 5 mg twice daily/);
  assert.match(af(80, 61, 1.4), /gives 5 mg twice daily/);
  assert.match(af(80, 60, 1.4), /gives 2\.5 mg twice daily/);
  assert.match(af(79, 60, 1.5), /gives 2\.5 mg twice daily/);
  assert.match(af(80, 61, 1.5), /gives 2\.5 mg twice daily/);
  assert.match(run({ drug: 'apixaban', indication: 'af', age: 82, weight: 58, creatinine: 1 }).notes[0], /2 of the label's 3 characteristics met/);
  assert.match(run({ drug: 'apixaban', indication: 'af', age: 82 }).message, /Enter the weight/);
});

test('apixaban: the age, weight and creatinine rule is not applied outside AF', () => {
  const r = run({ drug: 'apixaban', indication: 'vte-treatment', age: 90, weight: 45, creatinine: 2 });
  assert.match(r.band, /10 mg twice daily for 7 days, then 5 mg twice daily/);
  assert.match(r.notes[0], /for atrial fibrillation only and is not applied here/);
  assert.match(run({ drug: 'apixaban', indication: 'vte-recurrence' }).band, /2\.5 mg twice daily/);
  assert.match(run({ drug: 'apixaban', indication: 'knee' }).notes[0], /for 12 days/);
  assert.match(run({ drug: 'apixaban', indication: 'hip' }).notes[0], /for 35 days/);
});

test('apixaban with a combined P-gp and strong CYP3A4 inhibitor: halve 5 or 10 mg, avoid at 2.5 mg', () => {
  const w = (i) => d({ drug: 'apixaban', interaction: 'yes', ...i }, now);
  assert.match(w({ indication: 'af', age: 70, weight: 80, creatinine: 1 }).band, /reduced by 50%.*: 2\.5 mg twice daily\./);
  assert.match(w({ indication: 'vte-treatment' }).band, /5 mg twice daily for 7 days, then 2\.5 mg twice daily\./);
  assert.deepEqual([w({ indication: 'hip' }).flag, w({ indication: 'af', age: 85, weight: 55, creatinine: 1 }).flag], ['avoid', 'avoid']);
});

test('rivaroxaban: AF turns at 50 (exactly 50 is 15 mg); the other rows turn at 15', () => {
  assert.match(run({ drug: 'rivaroxaban', indication: 'af', crcl: 51 }).band, /20 mg once daily/);
  assert.match(run({ drug: 'rivaroxaban', indication: 'af', crcl: 50 }).band, /15 mg once daily/);
  assert.match(run({ drug: 'rivaroxaban', indication: 'af', crcl: 20 }).notes.join(' '), /below 30 mL\/min were not studied/);
  for (const indication of ['vte-treatment', 'vte-recurrence', 'hip', 'knee', 'medical']) {
    assert.equal(run({ drug: 'rivaroxaban', indication, crcl: 14.9 }).flag, 'avoid', indication);
    assert.equal(run({ drug: 'rivaroxaban', indication, crcl: 15 }).flag, 'dose', indication);
  }
  assert.match(run({ drug: 'rivaroxaban', indication: 'vte-treatment', crcl: 60 }).band, /15 mg twice daily with food for 21 days, then 20 mg once daily/);
  assert.match(run({ drug: 'rivaroxaban', indication: 'medical', crcl: 60 }).band, /31 to 39 days/);
  assert.equal(run({ drug: 'rivaroxaban', indication: 'cad-pad', crcl: 5 }).flag, 'no-adjustment');
  assert.match(run({ drug: 'rivaroxaban', indication: 'af', crcl: 60 }).notes.join(' '), /actual body weight/);
});

test('dabigatran: no recommendation below the band, not a contraindication; the P-gp rows', () => {
  assert.deepEqual(pair({ drug: 'dabigatran', indication: 'af', crcl: 31 })[0], 'dose');
  assert.match(run({ drug: 'dabigatran', indication: 'af', crcl: 31 }).band, /150 mg twice daily/);
  assert.match(run({ drug: 'dabigatran', indication: 'af', crcl: 30 }).band, /75 mg twice daily/);
  assert.match(run({ drug: 'dabigatran', indication: 'af', crcl: 15 }).band, /75 mg twice daily/);
  assert.equal(run({ drug: 'dabigatran', indication: 'af', crcl: 14 }).flag, 'no-recommendation-given');
  const w = (indication, crcl) => d({ drug: 'dabigatran', interaction: 'yes', indication, crcl }, now);
  assert.match(w('af', 50).band, /75 mg twice daily when given with dronedarone or systemic ketoconazole/);
  assert.match(w('af', 30).band, /75 mg twice daily when given with/);
  assert.equal(w('af', 29).flag, 'avoid');
  assert.match(w('af', 51).band, /150 mg twice daily/);
  for (const indication of ['vte-treatment', 'vte-recurrence', 'hip']) {
    assert.equal(run({ drug: 'dabigatran', indication, crcl: 30 }).flag, 'no-recommendation-given', indication);
    assert.equal(run({ drug: 'dabigatran', indication, crcl: 31 }).flag, 'dose', indication);
    assert.equal(w(indication, 49).flag, 'avoid', indication);
    assert.equal(w(indication, 50).flag, 'dose', indication);
  }
  assert.match(run({ drug: 'dabigatran', indication: 'hip', crcl: 60 }).band, /110 mg .* then 220 mg once daily for 28 to 35 days/);
});

test('edoxaban: do not use above 95 in AF; 30 mg at 15 to 50; not recommended below 15', () => {
  assert.equal(run({ drug: 'edoxaban', indication: 'af', crcl: 96 }).flag, 'not-recommended');
  assert.match(run({ drug: 'edoxaban', indication: 'af', crcl: 95 }).band, /60 mg once daily/);
  assert.match(run({ drug: 'edoxaban', indication: 'af', crcl: 51 }).band, /60 mg once daily/);
  assert.match(run({ drug: 'edoxaban', indication: 'af', crcl: 50 }).band, /30 mg once daily/);
  assert.match(run({ drug: 'edoxaban', indication: 'af', crcl: 15 }).band, /30 mg once daily/);
  const low = run({ drug: 'edoxaban', indication: 'af', crcl: 14 });
  assert.equal(low.flag, 'not-recommended');
  assert.match(low.band, /section 8\.6/);
  assert.match(d({ drug: 'edoxaban', indication: 'af', interaction: 'yes', crcl: 70 }, now).notes.join(' '), /no dose reduction is recommended .*section 7\.3/);
  assert.match(d({ drug: 'edoxaban', indication: 'af', interaction: 'yes', crcl: 70 }, now).band, /60 mg once daily/);
});

test('edoxaban DVT or PE: 30 mg for clearance 15 to 50, weight <= 60 kg, or a listed P-gp inhibitor; no upper clearance rule', () => {
  const v = (i) => d({ drug: 'edoxaban', indication: 'vte-treatment', interaction: 'no', crcl: 96, weight: 80, ...i }, now);
  assert.match(v({}).band, /60 mg once daily after 5 to 10 days/);
  assert.match(v({ weight: 60 }).band, /30 mg once daily/);
  assert.match(v({ crcl: 50 }).band, /30 mg once daily/);
  const p = v({ interaction: 'yes' });
  assert.match(p.band, /30 mg once daily/);
  assert.match(p.notes.join(' '), /section 14\.2 names .* verapamil, quinidine/);
  assert.match(v({ weight: '' }).message, /Enter the weight/);
  assert.equal(v({ crcl: 10 }).flag, 'not-recommended');
});

test('nothing is defaulted', () => {
  assert.match(d({}, now).message, /Choose the drug/);
  assert.match(d({ drug: 'rivaroxaban' }, now).message, /Choose the indication/);
  assert.match(d({ drug: 'rivaroxaban', indication: 'af', crcl: 60 }, now).message, /Say whether the patient takes/);
  assert.equal(run({ drug: 'rivaroxaban', indication: 'af' }).valid, false);
  assert.equal(run({ drug: 'dabigatran', indication: 'af', crcl: -1 }).valid, false);
  assert.match(run({ drug: 'apixaban', indication: 'hip', crcl: 20 }).notes.join(' '), /clearance entered is not used/);
});

test('fail closed: a superseded label withholds that drug only', () => {
  const id = DRUGS[1].setId;
  const table = { ...LABEL_EDITIONS, [id]: { ...LABEL_EDITIONS[id], supersededOn: '2026-10-10' } };
  const r = d({ drug: 'rivaroxaban', indication: 'af', interaction: 'no', crcl: 60 }, now, table);
  assert.deepEqual([r.valid, r.withheld, r.flag], [true, true, undefined]);
  assert.match(r.labelUrl, /setid=10db92f9/);
  assert.equal(d({ drug: 'apixaban', indication: 'hip', interaction: 'no' }, now, table).withheld, undefined);
});

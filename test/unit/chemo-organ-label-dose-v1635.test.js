// spec-v1635 tool 13: the label's dose modification for liver and kidney function.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { chemoOrganLabelDose, LABELS, DRUGS } from '../../lib/chemo-organ-label-dose-v1635.js';
import { labelRow } from '../../lib/label-row.js';
import { LABEL_EDITIONS } from '../../lib/label-editions.js';

const now = new Date('2026-10-11T12:00:00Z');
const c = (i, t) => chemoOrganLabelDose(i, now, t);
const dead = (id) => ({ ...LABEL_EDITIONS, [id]: { ...LABEL_EDITIONS[id], supersededOn: '2026-10-10' } });
const got = (i) => { const r = c(i); return [r.flag, r.rows.map((x) => x.text.match(/\d+(?:\.\d+)?%|\d+ mg\/m²|one (?:half|quarter)|[Aa]void|no recommended dose|not been established|not recommended|[Cc]ontraindicated|no adjustment|consider/)?.[0] ?? '?')]; };

test('every label row answers; a drug withholds only on a label it reads', () => {
  for (const l of Object.values(LABELS)) assert.equal(labelRow(l.setId, now).answers, true, l.name);
  assert.equal(c({ drug: 'bleomycin', crcl: 45 }, dead(LABELS.bleomycin.setId)).flag, 'withheld');
  assert.equal(c({ drug: 'bleomycin', crcl: 45 }, dead(LABELS.paclitaxel.setId)).flag, 'dose');
  // Doxorubicin reads two labels: the Pfizer table and the ADRIAMYCIN heading that says "reduction".
  assert.equal(c({ drug: 'doxorubicin', bilirubin: 2 }, dead(LABELS.adriamycin.setId)).flag, 'withheld');
  assert.equal(DRUGS.length, 13);
});

test('doxorubicin: reductions of 50% and 75%, the 3 to 3.1 gap, and contraindicated above 5', () => {
  assert.deepEqual(got({ drug: 'doxorubicin', bilirubin: 2 }), ['dose', ['50%']]);
  assert.deepEqual(got({ drug: 'doxorubicin', bilirubin: 1.2 }), ['dose', ['50%']]);
  assert.deepEqual(got({ drug: 'doxorubicin', bilirubin: 4 }), ['dose', ['75%']]);
  assert.deepEqual(got({ drug: 'doxorubicin', bilirubin: 5 }), ['dose', ['75%']]);
  assert.deepEqual(got({ drug: 'doxorubicin', bilirubin: 3.05 }), ['label-does-not-settle', ['75%', '50%']]);
  assert.deepEqual(got({ drug: 'doxorubicin', bilirubin: 5.1 }), ['contraindicated', ['Contraindicated']]);
  const low = c({ drug: 'doxorubicin', bilirubin: 0.8 });
  assert.deepEqual([low.flag, low.abnormal, low.rows.length], ['no-row', false, 0]);
  assert.match(c({ drug: 'doxorubicin', bilirubin: 2 }).notes.join(' '), /"Dose reduction", so 50% and 75% are the cut/);
});

test('epirubicin: either bilirubin or AST sets the row; the renal line is separate; untested values are named', () => {
  assert.deepEqual(got({ drug: 'epirubicin', bilirubin: 2, transaminaseXuln: 1, creatinine: 1 }), ['dose', ['one half']]);
  assert.deepEqual(got({ drug: 'epirubicin', bilirubin: 1, transaminaseXuln: 5, creatinine: 1 }), ['dose', ['one quarter']]);
  assert.deepEqual(got({ drug: 'epirubicin', bilirubin: 3.5, transaminaseXuln: 3, creatinine: 1 }), ['dose', ['one quarter']]);
  assert.deepEqual(got({ drug: 'epirubicin', bilirubin: 6, transaminaseXuln: 1, creatinine: 1 }), ['contraindicated', ['contraindicated']]);
  assert.equal(c({ drug: 'epirubicin', bilirubin: 1, transaminaseXuln: 1, creatinine: 6 }).rows[0].flag, 'no-recommendation-given');
  const partial = c({ drug: 'epirubicin', bilirubin: 1 });
  assert.deepEqual([partial.flag, partial.abnormal, partial.untested], ['no-row-incomplete', true, ['AST', 'serum creatinine']]);
  assert.match(c({ drug: 'epirubicin' }).message, /^Enter at least one of the values/);
});

test('daunorubicin: 75% and 50% by bilirubin, 50% by creatinine, and the two are not multiplied', () => {
  assert.deepEqual(got({ drug: 'daunorubicin', bilirubin: 3, creatinine: 1 }), ['dose', ['75%']]);
  assert.deepEqual(got({ drug: 'daunorubicin', bilirubin: 3.1, creatinine: 1 }), ['dose', ['50%']]);
  const both = c({ drug: 'daunorubicin', bilirubin: 2, creatinine: 4 });
  assert.equal(both.rows.length, 2);
  assert.match(both.notes.join(' '), /does not say how to combine them; nothing is multiplied/);
  assert.equal(c({ drug: 'daunorubicin', bilirubin: 1, creatinine: 3 }).flag, 'no-row');
});

test('idarubicin: the hepatic table, exactly 5 mg/dL left unstated, and the renal table quoted but not applied', () => {
  assert.deepEqual(got({ drug: 'idarubicin', bilirubin: 2.6 }), ['no-adjustment', ['no adjustment']]);
  assert.deepEqual(got({ drug: 'idarubicin', bilirubin: 3 }), ['dose', ['50%']]);
  assert.deepEqual(got({ drug: 'idarubicin', bilirubin: 5 }), ['label-does-not-settle', ['avoid', '50%']]);
  assert.deepEqual(got({ drug: 'idarubicin', bilirubin: 5.1 }), ['not-recommended', ['avoid']]);
  // The reference label's renal table is not on the generic labels, so it is reported and never applied.
  const r = c({ drug: 'idarubicin', bilirubin: 2, crcl: 20 });
  assert.deepEqual([r.flag, r.rows.length], ['no-adjustment', 1]);
  assert.match(r.notes.join(' '), /Kidney function is not tested here, because the labels differ.*reduce the dose by 33%/);
  assert.match(c({ drug: 'idarubicin', crcl: 20 }).message, /^Enter the total bilirubin/);
});

test('vincristine, capecitabine, pemetrexed and dexrazoxane: one threshold each', () => {
  assert.deepEqual(got({ drug: 'vincristine', directBilirubin: 3.1 }), ['dose', ['50%']]);
  assert.equal(c({ drug: 'vincristine', directBilirubin: 3 }).flag, 'no-row');
  assert.deepEqual([got({ drug: 'capecitabine', crcl: 50 }), got({ drug: 'capecitabine', crcl: 30 })], [['dose', ['25%']], ['dose', ['25%']]]);
  assert.equal(c({ drug: 'capecitabine', crcl: 29 }).flag, 'no-recommendation-given');
  assert.equal(c({ drug: 'capecitabine', crcl: 51 }).flag, 'no-row');
  assert.deepEqual([c({ drug: 'pemetrexed', crcl: 44 }).flag, c({ drug: 'pemetrexed', crcl: 45 }).flag], ['no-recommendation-given', 'no-adjustment']);
  assert.deepEqual([got({ drug: 'dexrazoxane', crcl: 39 }), c({ drug: 'dexrazoxane', crcl: 40 }).flag], [['dose', ['50%']], 'no-row']);
});

test('paclitaxel Table 17: both infusions, their gaps, and the not-recommended rows', () => {
  const p3 = (transaminaseXuln, bilirubinXuln) => got({ drug: 'paclitaxel-3-hour', transaminaseXuln, bilirubinXuln });
  assert.deepEqual([p3(3, 1.25), p3(3, 1.5), p3(3, 5), p3(3, 5.1), p3(10, 1)], [['dose', ['175 mg/m²']], ['dose', ['135 mg/m²']], ['dose', ['90 mg/m²']], ['not-recommended', ['not recommended']], ['not-recommended', ['not recommended']]]);
  assert.deepEqual(p3(3, 1.255), ['label-does-not-settle', ['135 mg/m²', '175 mg/m²']]);
  const p24 = (transaminaseXuln, bilirubin) => got({ drug: 'paclitaxel-24-hour', transaminaseXuln, bilirubin });
  assert.deepEqual([p24(1, 1.5), p24(2, 1.5), p24(9.9, 1.5), p24(1, 1.6), p24(1, 7.5), p24(1, 7.6), p24(10, 1)], [['dose', ['135 mg/m²']], ['dose', ['100 mg/m²']], ['dose', ['100 mg/m²']], ['dose', ['50 mg/m²']], ['dose', ['50 mg/m²']], ['not-recommended', ['not recommended']], ['not-recommended', ['not recommended']]]);
  assert.deepEqual(p24(3, 1.55), ['label-does-not-settle', ['50 mg/m²', '100 mg/m²']]);
  assert.match(c({ drug: 'paclitaxel-3-hour', transaminaseXuln: 3 }).message, /^Enter the bilirubin as a multiple/);
});

test('docetaxel: avoid on either sentence; an isolated transaminase rise is "consider", with no figure', () => {
  const d = (bilirubinXuln, transaminaseXuln, alkPhosXuln) => c({ drug: 'docetaxel', bilirubinXuln, transaminaseXuln, alkPhosXuln }).flag;
  assert.deepEqual([d(1.1, 1, 1), d(1, 1.6, 2.6), d(1, 1.6, 2.5), d(1, 1.5, 3), d(1, 1, 1)], ['not-recommended', 'not-recommended', 'no-recommendation-given', 'no-row', 'no-row']);
});

test('bleomycin: the table, its shared edges, and no row under 5 mL/min', () => {
  const b = (crcl) => got({ drug: 'bleomycin', crcl });
  assert.deepEqual([b(80), b(50), b(45), b(35), b(25), b(15), b(7)].map((x) => x[1][0]), ['100%', '70%', '70%', '60%', '55%', '45%', '40%']);
  assert.deepEqual(b(50), ['label-does-not-settle', ['70%', '100%']]);
  assert.deepEqual(b(40), ['label-does-not-settle', ['60%', '70%']]);
  assert.equal(c({ drug: 'bleomycin', crcl: 3 }).rows.length, 0);
  assert.match(c({ drug: 'bleomycin', crcl: 3 }).notes.join(' '), /outside every band/);
  assert.match(c({ drug: 'bleomycin', crcl: 45 }).notes.join(' '), /mL\/min\/1\.73m²/);
});

test('carboplatin: one row when the counts agree, each count\'s row when they do not', () => {
  const k = (platelets, neutrophils) => got({ drug: 'carboplatin-retreatment', platelets, neutrophils });
  assert.deepEqual([k(120000, 2500), k(80000, 1000), k(40000, 400)], [['dose', ['125%']], ['no-adjustment', ['no adjustment']], ['dose', ['75%']]]);
  assert.deepEqual(k(120000, 400), ['label-does-not-settle', ['75%', '125%']]);
  assert.deepEqual(k(80000, 2500), ['label-does-not-settle', ['no adjustment', '125%']]);
});

test('nothing is defaulted', () => {
  assert.match(c({}).message, /^Choose the drug/);
  for (const d of DRUGS) assert.equal(c({ drug: d.value }).valid, false, d.value);
  assert.equal(chemoOrganLabelDose(null, now).valid, false);
});

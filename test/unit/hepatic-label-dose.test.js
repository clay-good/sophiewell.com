// spec-v1632 tool 18: what the label gives for a Child-Pugh class, on fourteen label rows.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hepaticLabelDose as d, DRUGS, CLASSES } from '../../lib/hepatic-label-dose-v1632.js';
import { LABEL_EDITIONS } from '../../lib/label-editions.js';
import { labelRow } from '../../lib/label-row.js';

const now = new Date('2026-10-11T12:00:00Z');
const at = (drug, childPugh) => d({ drug, childPugh }, now);
const flags = (drug) => ['A', 'B', 'C'].map((k) => at(drug, k).flag);

test('fourteen labels answering, three classes', () => {
  assert.equal(DRUGS.length, 14);
  for (const x of DRUGS) assert.equal(labelRow(x.setId, now).answers, true, x.brand);
  assert.deepEqual(CLASSES.map((c) => c.value), ['A', 'B', 'C']);
});

test('the rows the spec lists, by class', () => {
  assert.deepEqual(flags('voriconazole'), ['dose', 'dose', 'no-recommendation-given']);
  assert.match(at('voriconazole', 'A').band, /maintenance dose halved/);
  assert.deepEqual(flags('caspofungin'), ['no-adjustment', 'dose', 'no-recommendation-given']);
  assert.match(at('caspofungin', 'B').band, /35 mg once daily, with a 70 mg loading dose/);
  assert.deepEqual(flags('tigecycline'), ['no-adjustment', 'no-adjustment', 'dose']);
  assert.match(at('tigecycline', 'C').band, /100 mg, then a reduced maintenance dose of 25 mg every 12 hours/);
  assert.deepEqual(flags('atomoxetine'), ['no-adjustment', 'dose', 'dose']);
  assert.match(at('atomoxetine', 'B').band, /50%/);
  assert.match(at('atomoxetine', 'C').band, /25%/);
  assert.deepEqual(flags('sacubitril-valsartan'), ['no-adjustment', 'dose', 'not-recommended']);
  assert.deepEqual(flags('mirabegron'), ['dose', 'dose', 'not-recommended']);
  assert.match(at('mirabegron', 'B').band, /maximum of 25 mg/);
  assert.deepEqual(flags('nirmatrelvir-ritonavir'), ['no-adjustment', 'no-adjustment', 'not-recommended']);
  assert.deepEqual(flags('entecavir'), ['no-adjustment', 'no-adjustment', 'no-adjustment']);
  assert.deepEqual(flags('metoclopramide'), ['no-adjustment', 'dose', 'dose']);
});

test('a class the label has no sentence for is reported as that, never filled from a neighbor', () => {
  assert.deepEqual(flags('ondansetron'), ['no-recommendation-given', 'no-recommendation-given', 'dose']);
  assert.match(at('ondansetron', 'B').band, /has no hepatic sentence for this class/);
  assert.match(at('ondansetron', 'C').band, /not above 8 mg/);
  assert.deepEqual(flags('desvenlafaxine'), ['no-recommendation-given', 'dose', 'dose']);
  assert.deepEqual(flags('solifenacin'), ['no-recommendation-given', 'dose', 'not-recommended']);
  assert.deepEqual(flags('argatroban'), ['no-recommendation-given', 'dose', 'dose']);
});

test('lacosamide: the label does not use Child-Pugh, so no class is mapped', () => {
  for (const k of ['A', 'B', 'C']) {
    const r = at('lacosamide', k);
    assert.equal(r.flag, 'not-by-child-pugh');
    assert.match(r.band, /does not state its hepatic rows by Child-Pugh class.*25% of the maximum dosage.*not recommended in severe/);
  }
});

test('nothing is defaulted; a lower-case class is read; a superseded label withholds one drug', () => {
  assert.match(d({}, now).message, /Choose the drug/);
  assert.match(d({ drug: 'entecavir' }, now).message, /Child-Pugh class/);
  assert.equal(at('entecavir', 'c').childPugh, 'C');
  const id = DRUGS[0].setId;
  const table = { ...LABEL_EDITIONS, [id]: { ...LABEL_EDITIONS[id], supersededOn: '2026-10-10' } };
  assert.equal(d({ drug: 'voriconazole', childPugh: 'A' }, now, table).withheld, true);
  assert.equal(d({ drug: 'entecavir', childPugh: 'A' }, now, table).withheld, undefined);
});

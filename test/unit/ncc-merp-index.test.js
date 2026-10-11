// spec-v1634 tool 4: NCC MERP Index for Categorizing Medication Errors.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { nccMerpIndex as d, CATEGORIES, DEFINITIONS, NOTICE } from '../../lib/ncc-merp-index-v1634.js';

const base = { error: 'yes', reached: 'yes', death: 'no' };

test('every branch of the algorithm', () => {
  const cases = [
    [{ error: 'no' }, 'A'],
    [{ error: 'yes', reached: 'no' }, 'B'],
    [{ error: 'yes', reached: 'yes', death: 'yes' }, 'I'],
    [{ ...base, harmed: 'no', monitoring: 'no' }, 'C'],
    [{ ...base, harmed: 'no', monitoring: 'yes' }, 'D'],
    [{ ...base, harmed: 'yes', lifeSustaining: 'no', temporary: 'yes', hospitalization: 'no' }, 'E'],
    [{ ...base, harmed: 'yes', lifeSustaining: 'no', temporary: 'yes', hospitalization: 'yes' }, 'F'],
    [{ ...base, harmed: 'yes', lifeSustaining: 'no', temporary: 'no' }, 'G'],
    [{ ...base, harmed: 'yes', lifeSustaining: 'yes', permanent: 'yes' }, 'G'],
    [{ ...base, harmed: 'yes', lifeSustaining: 'yes', permanent: 'no' }, 'H'],
  ];
  for (const [input, cat] of cases) assert.equal(d(input).category, cat, JSON.stringify(input));
});

test('the four groups', () => {
  assert.deepEqual(Object.entries(CATEGORIES).map(([k, v]) => `${k}:${v.group}`), ['A:No Error', 'B:Error, No Harm', 'C:Error, No Harm', 'D:Error, No Harm', 'E:Error, Harm', 'F:Error, Harm', 'G:Error, Harm', 'H:Error, Harm', 'I:Error, Death']);
  assert.equal(d({ error: 'no' }).abnormal, false);
  assert.equal(d({ ...base, harmed: 'no', monitoring: 'yes' }).abnormal, false);
  assert.equal(d({ error: 'yes', reached: 'yes', death: 'yes' }).abnormal, true);
});

test('the definitions are the Index\'s words, unmodified, with its notice', () => {
  assert.equal(CATEGORIES.D.text, 'An error occurred that reached the patient and required monitoring to confirm that it resulted in no harm to the patient and/or required intervention to preclude harm');
  assert.equal(CATEGORIES.B.text, 'An error occurred but the error did not reach the patient (An "error of omission" does reach the patient)');
  assert.equal(DEFINITIONS[0], 'Harm: Impairment of the physical, emotional, or psychological function or structure of the body and/or pain resulting therefrom.');
  const r = d({ error: 'yes', reached: 'no' });
  assert.equal(r.band, `Category B: ${CATEGORIES.B.text}`);
  assert.ok(r.notes.includes(NOTICE));
  assert.match(NOTICE, /© 2022 National Coordinating Council for Medication Error Reporting and Prevention\. All Rights Reserved\./);
});

test('only the questions the path reaches are asked, and later answers are ignored', () => {
  assert.equal(d({ error: 'no', reached: 'yes', death: 'yes' }).category, 'A');
  assert.match(d({}).message, /^Choose an answer: Did an actual error occur\?/);
  assert.match(d({ error: 'yes', reached: 'yes' }).message, /patient death\?/);
  assert.match(d({ ...base, harmed: 'yes' }).message, /necessary to sustain life\?/);
  assert.match(d({ ...base, harmed: 'yes', lifeSustaining: 'no', temporary: 'yes' }).message, /hospitalization\?/);
  assert.equal(d({ error: 'maybe' }).valid, false);
  assert.equal(d(null).valid, false);
});

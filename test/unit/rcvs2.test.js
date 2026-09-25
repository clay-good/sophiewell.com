// spec-v1436: RCVS2 (Rocha 2019, Neurology; points as tabulated in de Sousa 2026, Headache).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { rcvs2 } from '../../lib/rcvs2-v1436.js';

const NONE = { tch: 'no', carotid: 'no', trigger: 'no', sex: 'male', sah: 'no' };

test('points and the -2 to 10 range', () => {
  assert.equal(rcvs2(NONE).score, 0);
  assert.equal(rcvs2({ tch: 'yes', carotid: 'no', trigger: 'yes', sex: 'female', sah: 'yes' }).score, 10);
  assert.equal(rcvs2({ ...NONE, carotid: 'yes' }).score, -2);
  assert.equal(rcvs2({ ...NONE, tch: 'yes' }).score, 5);
});

test('>=5 favors, <=2 against, 3-4 indeterminate', () => {
  assert.equal(rcvs2({ ...NONE, tch: 'yes' }).reading, 'favors RCVS');
  assert.equal(rcvs2({ ...NONE, trigger: 'yes', sex: 'female' }).reading, 'indeterminate'); // 4
  assert.equal(rcvs2({ ...NONE, trigger: 'yes' }).reading, 'indeterminate'); // 3
  assert.equal(rcvs2({ ...NONE, sex: 'female', sah: 'yes' }).reading, 'against RCVS'); // 2
  assert.equal(rcvs2({ tch: 'yes', carotid: 'yes', trigger: 'no', sex: 'male', sah: 'no' }).reading, 'indeterminate'); // 3
});

test('the indeterminate band carries the bedside approach; all carry the scope note', () => {
  assert.ok(rcvs2({ ...NONE, trigger: 'yes' }).notes.some((n) => /25 of 37/.test(n)));
  assert.ok(rcvs2(NONE).notes.some((n) => /does not screen headaches/.test(n)));
});

test('a blank item is asked for; the subtracting carotid item cannot default', () => {
  assert.match(rcvs2({ ...NONE, carotid: '' }).message, /intracranial carotid artery involvement is still needed/);
  assert.equal(rcvs2({}).valid, false);
});

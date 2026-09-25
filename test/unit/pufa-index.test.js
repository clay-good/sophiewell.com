// spec-v1491: the PUFA/pufa index.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ASKING, DISCLOSING } from '../lib/asking-language.js';
import { pufaIndex as pu } from '../../lib/pufa-index-v1491.js';

test('the worked example: permanent and primary counts are kept apart', () => {
  const r = pu({ P: '2', A: '1', p: '3', f: '1' });
  assert.equal(r.band, 'PUFA 3, pufa 4: 7 teeth with pulp involvement or its consequences, 2 of them with ulceration, a fistula or an abscess.');
  assert.deepEqual([r.PUFA, r.pufa, r.total], [3, 4, 7]);
});

test('a count not entered is disclosed, and all eight entered as zero reads clean', () => {
  assert.match(pu({ p: '1' }).notes[0], DISCLOSING);
  const zero = pu({ P: '0', U: '0', F: '0', A: '0', p: '0', u: '0', f: '0', a: '0' });
  assert.equal(zero.abnormal, false);
  assert.equal(zero.notes.length, 1);
});

test('nothing entered is asked for; fractions and impossible totals are refused', () => {
  const e = pu({});
  assert.equal(e.valid, false);
  assert.match(e.message, ASKING);
  assert.equal(pu({ P: '1.5' }).valid, false);
  assert.equal(pu({ P: '20', A: '20' }).valid, false);
  assert.equal(pu({ p: '12', a: '12' }).valid, false);
});

// spec-v1493: the Eichner index of occlusal support.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ASKING } from '../lib/asking-language.js';
import { eichnerIndex as ei } from '../../lib/eichner-index-v1493.js';

test('the worked example: two support zones is B2', () => {
  assert.equal(ei({ zones: '2' }).band, 'Eichner B2: two posterior support zones. Class B: occlusal support partly lost.');
});

test('every group from its findings', () => {
  const g = (i) => ei(i).group;
  assert.deepEqual([g({ zones: '4', missing: 'none' }), g({ zones: '4', missing: 'one' }), g({ zones: '4', missing: 'both' })], ['A1', 'A2', 'A3']);
  assert.deepEqual([g({ zones: '3' }), g({ zones: '1' }), g({ zones: '0', anterior: 'yes' })], ['B1', 'B3', 'B4']);
  assert.deepEqual(['both', 'one', 'none'].map((a) => g({ zones: '0', anterior: 'no', arches: a })), ['C1', 'C2', 'C3']);
  assert.equal(ei({ zones: '4', missing: 'none' }).abnormal, false);
});

test('a blank finding that decides the group is asked for', () => {
  for (const r of [ei({}), ei({ zones: '4' }), ei({ zones: '0' }), ei({ zones: '0', anterior: 'no' })]) {
    assert.equal(r.valid, false);
    assert.match(r.message, ASKING);
  }
});

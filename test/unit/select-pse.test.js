// spec-v198 2.4: selectPse worked examples and guards.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { selectPse } from '../../lib/subspecialty-v198.js';

test('score 6 with published risks', () => {
  const r = selectPse({nihss:'4-10',early:true,cortical:true});
  assert.equal(r.valid, true);
  assert.equal(r.score, 6);
  assert.equal(r.risk1, 18);
  assert.equal(r.risk5, 29);
});

test('score 0 low risk', () => {
  const r = selectPse({nihss:'0-3'});
  assert.equal(r.score, 0);
  assert.equal(r.risk1, 0.7);
  assert.equal(r.risk5, 1);
});

test('guards: NIHSS band required', () => {
  const r = selectPse({});
  assert.equal(r.valid, false);
});

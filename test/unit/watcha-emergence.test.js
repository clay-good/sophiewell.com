// spec-v1570: the Watcha emergence agitation scale.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ASKING } from '../lib/asking-language.js';
import { watchaEmergence as w } from '../../lib/watcha-emergence-v1570.js';

test('the worked example: inconsolable crying is agitation', () => {
  assert.equal(w({ behavior: 'inconsolable' }).band, 'Watcha level 3: crying, cannot be consoled. Emergence agitation (3 or more).');
});

test('the threshold, and a low level that does not rule out', () => {
  assert.equal(w({ behavior: 'thrashing' }).abnormal, true);
  assert.equal(w({ behavior: 'consolable' }).abnormal, false);
  assert.match(w({ behavior: 'calm' }).band, /does not rule delirium out/);
});

test('a blank is asked for', () => {
  assert.match(w({}).message, ASKING);
});

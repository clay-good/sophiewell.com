// spec-v1487: the Jemt papilla index.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ASKING } from '../lib/asking-language.js';
import { jemtPapilla as jemt } from '../../lib/jemt-papilla-v1487.js';

test('the worked example: an incomplete mesial papilla beside a full distal one', () => {
  const r = jemt({ mesial: '2', distal: '3' });
  assert.equal(r.band, 'Mesial 2, at least half of the papilla height, but the proximal space is not filled; distal 3, the papilla fills the whole proximal space. Incomplete fill on the mesial side.');
  assert.equal(r.bandLabel, 'Jemt mesial 2, distal 3');
});

test('full fill is normal, hyperplasia and deficiency are flagged', () => {
  assert.equal(jemt({ mesial: '3', distal: '3' }).abnormal, false);
  assert.match(jemt({ mesial: '4', distal: '3' }).band, /Hyperplastic tissue on the mesial side/);
  assert.match(jemt({ mesial: '0', distal: '1' }).band, /Incomplete fill on the mesial and distal side/);
});

test('a blank papilla is named as not entered, and nothing entered is asked for', () => {
  const r = jemt({ distal: '1' });
  assert.match(r.band, /mesial papilla not entered/i);
  assert.equal(r.bandLabel, 'Jemt mesial not entered, distal 1');
  const e = jemt({});
  assert.equal(e.valid, false);
  assert.match(e.message, ASKING);
});

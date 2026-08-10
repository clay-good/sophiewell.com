// spec-v695: Manning Criteria for IBS.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { manningIbs } from '../../lib/manning-ibs-v695.js';

test('no symptoms -> 0, IBS less likely', () => {
  const r = manningIbs({});
  assert.equal(r.valid, true);
  assert.equal(r.score, 0);
  assert.equal(r.tier, 'less-likely');
  assert.equal(r.abnormal, false);
});

test('all six -> 6', () => {
  const r = manningIbs({ painFrequentBm: true, painLooserStool: true, painRelievedByStool: true, bloating: true, incompleteEvac: true, mucus: true });
  assert.equal(r.score, 6);
  assert.equal(r.tier, 'likely');
});

test('cutoff is >= 3', () => {
  const two = manningIbs({ painFrequentBm: true, bloating: true });
  assert.equal(two.score, 2);
  assert.equal(two.abnormal, false);
  const three = manningIbs({ painFrequentBm: 'true', painLooserStool: 'true', painRelievedByStool: 'true' });
  assert.equal(three.score, 3);
  assert.equal(three.tier, 'likely');
  assert.equal(three.abnormal, true);
  assert.match(three.band, /Manning 3 of 6/);
});

// spec-v96 2.6: PTSD Checklist for DSM-5 (PCL-5, 20-item; Blevins 2015).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pcl5 } from '../../lib/psych-v96.js';

function items20(total) {
  const a = new Array(20).fill(0);
  let rem = total;
  for (let i = 0; i < 20 && rem > 0; i += 1) { const v = Math.min(4, rem); a[i] = v; rem -= v; }
  return a;
}

test('provisional cutoff is framed as the source range and flips at 31', () => {
  assert.equal(pcl5({ items: items20(30) }).atCutoff, false); // 30 below
  assert.equal(pcl5({ items: items20(31) }).atCutoff, true);  // 31 at/above
  assert.equal(pcl5({ items: items20(33) }).atCutoff, true);  // 33 at/above
});

test('cluster tallies count items rated >= 2 in each DSM-5 cluster', () => {
  // all 2s -> every item endorsed: B 5/5, C 2/2, D 7/7, E 6/6; total 40.
  const r = pcl5({ items: new Array(20).fill(2) });
  assert.equal(r.total, 40);
  assert.deepEqual(r.clusters, { B: 5, C: 2, D: 7, E: 6 });
  assert.equal(r.atCutoff, true);
});

test('a rating of 1 does not count toward a cluster tally', () => {
  const r = pcl5({ items: new Array(20).fill(1) });
  assert.equal(r.total, 20);
  assert.deepEqual(r.clusters, { B: 0, C: 0, D: 0, E: 0 });
  assert.equal(r.atCutoff, false);
});

test('a blank item withholds the result; out-of-range rejected', () => {
  const a = new Array(20).fill(0); a[10] = null;
  assert.equal(pcl5({ items: a }).band, '(complete all 20 items)');
  const b = new Array(20).fill(0); b[0] = 5;
  assert.equal(pcl5({ items: b }).valid, false);
});

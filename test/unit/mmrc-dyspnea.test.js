// spec-v91 §2.5: modified MRC dyspnea scale (Bestall 1999).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mmrcDyspnea } from '../../lib/pulm-v91.js';

test('each grade 0-4 returns its descriptor', () => {
  const descriptors = {
    0: /strenuous exercise/,
    1: /hurrying on the level|slight hill/,
    2: /slower than peers/,
    3: /100 m/,
    4: /too breathless to leave the house/,
  };
  for (const g of [0, 1, 2, 3, 4]) {
    const r = mmrcDyspnea({ grade: g });
    assert.equal(r.valid, true);
    assert.equal(r.grade, g);
    assert.match(r.descriptor, descriptors[g]);
  }
});

test('worked example: grade 2 descriptor', () => {
  const r = mmrcDyspnea({ grade: 2 });
  assert.match(r.band, /mMRC grade 2/);
  assert.match(r.descriptor, /walks slower than peers/);
});

test('out-of-range grade is refused with a surfaced fallback', () => {
  assert.equal(mmrcDyspnea({ grade: 5 }).valid, false);
  assert.equal(mmrcDyspnea({ grade: -1 }).valid, false);
  assert.equal(mmrcDyspnea({ grade: 2.5 }).valid, false);
  assert.equal(mmrcDyspnea({}).valid, false);
});

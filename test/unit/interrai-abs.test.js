// spec-v174 §2.4: interRAI Aggressive Behavior Scale. 4 items 0-3 (MDS 7-day
// frequency), total 0-12. Bands (secondary literature): 0 none, 1-2 mild,
// 3-5 moderate, 6-12 severe. (Draft 0-4 per-item range corrected to 0-3.)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { interraiAbs } from '../../lib/ltcga-v174.js';

const z = { verbalAbuse: 0, physicalAbuse: 0, sociallyInappropriate: 0, resistsCare: 0 };

test('ABS 0/12 (none) -> none band', () => {
  const r = interraiAbs(z);
  assert.equal(r.valid, true);
  assert.equal(r.total, 0);
  assert.match(r.band, /none/);
});

test('ABS 2 -> mild and 3 -> moderate (the mild/moderate boundary)', () => {
  const two = interraiAbs({ ...z, verbalAbuse: 2 });
  assert.equal(two.total, 2);
  assert.match(two.band, /mild/);
  const three = interraiAbs({ ...z, verbalAbuse: 1, physicalAbuse: 2 });
  assert.equal(three.total, 3);
  assert.match(three.band, /moderate/);
});

test('ABS 5 -> moderate and 6 -> severe (the moderate/severe boundary)', () => {
  const five = interraiAbs({ verbalAbuse: 2, physicalAbuse: 2, sociallyInappropriate: 1, resistsCare: 0 });
  assert.equal(five.total, 5);
  assert.match(five.band, /moderate/);
  const six = interraiAbs({ verbalAbuse: 2, physicalAbuse: 2, sociallyInappropriate: 2, resistsCare: 0 });
  assert.equal(six.total, 6);
  assert.match(six.band, /severe/);
});

test('ABS 12/12 (all daily) -> severe', () => {
  const r = interraiAbs({ verbalAbuse: 3, physicalAbuse: 3, sociallyInappropriate: 3, resistsCare: 3 });
  assert.equal(r.total, 12);
  assert.match(r.band, /severe/);
});

test('ABS rejects the corrected out-of-range 4 and blanks', () => {
  assert.equal(interraiAbs({ ...z, verbalAbuse: 4 }).valid, false); // per-item max is 3, not 4
  assert.equal(interraiAbs({ ...z, verbalAbuse: '' }).valid, false);
  assert.equal(interraiAbs({}).valid, false);
});

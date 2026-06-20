// spec-v131 2.2: R.E.N.A.L. nephrometry score (Kutikov & Uzzo 2009, J Urol
// 182:844). Radius + Exophytic + Nearness + Location, each 1-3 -> total 4-12.
// A is a non-scoring a/p/x suffix; h marks a hilar tumour. Tiers 4-6 low /
// 7-9 moderate / 10-12 high.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renalNephrometry } from '../../lib/uro-v131.js';

test('the 6 to 7 low/moderate boundary flips and the a/p/x suffix is carried', () => {
  const low = renalNephrometry({ radius: 2, exophytic: 2, nearness: 1, location: 1, ap: 'p' });
  assert.equal(low.total, 6);
  assert.equal(low.complexity, 'low');
  assert.equal(low.suffix, 'p');
  const mod = renalNephrometry({ radius: 2, exophytic: 2, nearness: 2, location: 1, ap: 'p' });
  assert.equal(mod.total, 7);
  assert.equal(mod.complexity, 'moderate');
  assert.equal(mod.abnormal, true);
});

test('the hilar h suffix appends after the a/p/x letter', () => {
  const r = renalNephrometry({ radius: 1, exophytic: 1, nearness: 1, location: 1, ap: 'a', hilar: true });
  assert.equal(r.total, 4);
  assert.equal(r.suffix, 'ah');
  assert.equal(r.complexity, 'low');
});

test('the maximum is 12 (high)', () => {
  const r = renalNephrometry({ radius: 3, exophytic: 3, nearness: 3, location: 3, ap: 'x' });
  assert.equal(r.total, 12);
  assert.equal(r.complexity, 'high');
  assert.equal(r.suffix, 'x');
});

test('a blank component or a missing a/p/x descriptor surfaces valid:false', () => {
  assert.equal(renalNephrometry({ radius: 0, exophytic: 2, nearness: 2, location: 1, ap: 'p' }).valid, false);
  assert.equal(renalNephrometry({ radius: 2, exophytic: 2, nearness: 2, location: 1, ap: '' }).valid, false);
  assert.equal(renalNephrometry({ radius: 4, exophytic: 2, nearness: 2, location: 1, ap: 'p' }).valid, false); // 4 not an allowed level
  assert.equal(renalNephrometry(5).valid, false);
});

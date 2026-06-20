// spec-v132 2.5: CISNE (Carmona-Bayonas 2015, J Clin Oncol 33:465). ECOG >= 2 = 2,
// stress hyperglycemia = 2, COPD = 1, chronic cardiovascular disease = 1, NCI
// mucositis grade >= 2 = 1, monocytes < 200 = 1. Total 0-8. Bands 0 low, 1-2
// intermediate, >= 3 high.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cisne } from '../../lib/heme-v132.js';

const base = { ecog: 0, hyperglycemia: 'no', copd: 'no', cardiovascular: 'no', mucositis: 0, monocytes: 300 };

test('the total crosses the >= 3 high-risk band', () => {
  const two = cisne({ ...base, ecog: 2 }); // ECOG >= 2 = 2
  assert.equal(two.total, 2);
  assert.equal(two.tier, 'Intermediate');
  const three = cisne({ ...base, ecog: 2, copd: 'yes' }); // + COPD = 3
  assert.equal(three.total, 3);
  assert.equal(three.tier, 'High');
  assert.equal(three.abnormal, true);
});

test('the 0 low vs 1 intermediate boundary', () => {
  const zero = cisne(base);
  assert.equal(zero.total, 0);
  assert.equal(zero.tier, 'Low');
  assert.equal(zero.abnormal, false);
  const one = cisne({ ...base, copd: 'yes' });
  assert.equal(one.total, 1);
  assert.equal(one.tier, 'Intermediate');
});

test('the weighted items (ECOG and hyperglycemia) each contribute 2', () => {
  assert.equal(cisne({ ...base, ecog: 2 }).total, 2);
  assert.equal(cisne({ ...base, ecog: 1 }).total, 0); // ECOG 1 does not score
  assert.equal(cisne({ ...base, hyperglycemia: 'yes' }).total, 2);
  assert.equal(cisne({ ...base, mucositis: 2 }).total, 1); // grade >= 2 = 1
  assert.equal(cisne({ ...base, mucositis: 1 }).total, 0);
  assert.equal(cisne({ ...base, monocytes: 199 }).total, 1);
});

test('the maximum score is 8 (high)', () => {
  const r = cisne({ ecog: 4, hyperglycemia: 'yes', copd: 'yes', cardiovascular: 'yes', mucositis: 3, monocytes: 100 });
  assert.equal(r.total, 8);
  assert.equal(r.tier, 'High');
});

test('blank or non-finite inputs surface valid:false', () => {
  assert.equal(cisne({ ...base, ecog: null }).valid, false);
  assert.equal(cisne({ ...base, monocytes: null }).valid, false);
  assert.equal(cisne({ ...base, copd: '' }).valid, false);
  assert.equal(cisne(5).valid, false);
});

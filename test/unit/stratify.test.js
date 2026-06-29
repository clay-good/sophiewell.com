// spec-v176 §2.1: STRATIFY inpatient falls tool. 5 factors 0-5; >= 2 high risk.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { stratify } from '../../lib/ltcga-v176.js';

const base = { recentFall: 'no', agitated: 'no', visualImpairment: 'no', frequentToileting: 'no', transfer: 3, mobility: 3 };

test('STRATIFY 0/5 (no factors, independent transfer/mobility) -> lower risk', () => {
  const r = stratify(base);
  assert.equal(r.valid, true);
  assert.equal(r.total, 0);
  assert.equal(r.highRisk, false);
});

test('STRATIFY 1 -> 2 high-risk classification flip', () => {
  const one = stratify({ ...base, recentFall: 'yes' });
  assert.equal(one.total, 1);
  assert.equal(one.highRisk, false);
  const two = stratify({ ...base, recentFall: 'yes', agitated: 'yes' });
  assert.equal(two.total, 2);
  assert.equal(two.highRisk, true);
  assert.match(two.band, /high fall risk/);
});

test('STRATIFY transfer+mobility = 3 or 4 scores the mobility point; 0-2 and 5-6 do not', () => {
  assert.equal(stratify({ ...base, transfer: 2, mobility: 1 }).total, 1); // tm=3
  assert.equal(stratify({ ...base, transfer: 2, mobility: 2 }).total, 1); // tm=4
  assert.equal(stratify({ ...base, transfer: 1, mobility: 1 }).total, 0); // tm=2
  assert.equal(stratify({ ...base, transfer: 3, mobility: 2 }).total, 0); // tm=5
});

test('STRATIFY all five factors -> 5/5 high', () => {
  const r = stratify({ recentFall: 'yes', agitated: 'yes', visualImpairment: 'yes', frequentToileting: 'yes', transfer: 2, mobility: 1 });
  assert.equal(r.total, 5);
  assert.equal(r.highRisk, true);
});

test('STRATIFY blank items -> complete-the-fields fallback', () => {
  assert.equal(stratify({ ...base, recentFall: '' }).valid, false);
  assert.equal(stratify({ ...base, transfer: 4 }).valid, false);
  assert.equal(stratify({}).valid, false);
});

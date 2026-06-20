// spec-v131 2.5: TWIST score (Barbosa 2013, J Urol 189:1859). Testicular
// swelling = 2, hard testis = 2, absent cremasteric reflex = 1, nausea/vomiting
// = 1, high-riding testis = 1. Total 0-7. Tiers 0-2 low / 3-4 intermediate /
// 5-7 high (Barbosa cutoffs at 2 and 5).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { twistScore } from '../../lib/uro-v131.js';

test('the 4 to 5 intermediate/high boundary flips', () => {
  const mid = twistScore({ swelling: true, absentCremasteric: true, nauseaVomiting: true });
  assert.equal(mid.total, 4); // 2 + 1 + 1
  assert.equal(mid.tier, 'Intermediate');
  const high = twistScore({ swelling: true, absentCremasteric: true, nauseaVomiting: true, highRiding: true });
  assert.equal(high.total, 5); // + 1
  assert.equal(high.tier, 'High');
  assert.equal(high.abnormal, true);
});

test('no findings is 0 (low) and every finding is 7 (high)', () => {
  const none = twistScore({});
  assert.equal(none.total, 0);
  assert.equal(none.tier, 'Low');
  assert.equal(none.abnormal, false);
  const all = twistScore({ swelling: true, hardTestis: true, absentCremasteric: true, nauseaVomiting: true, highRiding: true });
  assert.equal(all.total, 7);
  assert.equal(all.tier, 'High');
});

test('the two 2-point findings push 0 to 4 (intermediate)', () => {
  const r = twistScore({ swelling: true, hardTestis: true });
  assert.equal(r.total, 4);
  assert.equal(r.tier, 'Intermediate');
  assert.deepEqual(r.scored, ['testicular swelling', 'hard testis']);
});

test('string, numeric and boolean truthy encodings all count; absence does not', () => {
  assert.equal(twistScore({ swelling: '1', hardTestis: 1, absentCremasteric: 'yes' }).total, 5);
  assert.equal(twistScore({ swelling: '0', hardTestis: false, absentCremasteric: 'no' }).total, 0);
});

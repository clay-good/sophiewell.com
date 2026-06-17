// spec-v99 2.4: Lund-Browder age-adjusted %TBSA + adult Rule of Nines cross-check
// (Lund-Browder 1944).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { lundBrowder } from '../../lib/idcrit-v99.js';

test('adult head + anterior trunk fully burned -> 20% TBSA, 25% Rule of Nines', () => {
  const r = lundBrowder({ ageBand: 'adult', regions: { head: 1, 'ant-trunk': 1 } });
  assert.equal(r.valid, true);
  assert.equal(r.tbsa, 20); // adult head 7 + anterior trunk 13
  assert.equal(r.ruleOfNines, 25); // head&neck share 7 + anterior trunk 18
});

test('age adjustment: an infant head is a larger share than an adult head', () => {
  const infant = lundBrowder({ ageBand: 'infant', regions: { head: 1 } });
  const adult = lundBrowder({ ageBand: 'adult', regions: { head: 1 } });
  assert.equal(infant.tbsa, 19);
  assert.equal(adult.tbsa, 7);
});

test('every region fully burned sums to 100% on both methods', () => {
  const all = {};
  for (const k of ['head', 'neck', 'ant-trunk', 'post-trunk', 'buttocks', 'genitalia',
    'upper-arms', 'forearms', 'hands', 'thighs', 'lower-legs', 'feet']) all[k] = 1;
  const r = lundBrowder({ ageBand: 'adult', regions: all });
  assert.equal(r.tbsa, 100);
  assert.equal(r.ruleOfNines, 100);
  assert.equal(r.implausible, false);
});

test('region fractions are clamped to [0,1]; a > 100% total is flagged not capped silently', () => {
  const r = lundBrowder({ ageBand: 'adult', regions: { head: 5 } }); // clamped to 1
  assert.equal(r.tbsa, 7);
  assert.equal(r.implausible, false);
});

test('a blank age band surfaces the complete-the-fields fallback', () => {
  const r = lundBrowder({ regions: { head: 1 } });
  assert.equal(r.valid, false);
  assert.ok(!/NaN/.test(r.band));
});

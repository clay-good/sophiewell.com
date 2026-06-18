// spec-v104 2.6: OESIL risk score (Colivicchi 2003). 12-month total mortality
// lookup 0=0%, 1=0.8%, 2=19.6%, 3=34.7%, 4=57.1%.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { oesil } from '../../lib/cardio-v104.js';

test('no factors -> 0, 0% mortality, low risk', () => {
  const r = oesil({});
  assert.equal(r.total, 0);
  assert.equal(r.mortality, '0');
  assert.equal(r.risk, 'low');
});

test('one factor -> 1, 0.8%, low risk', () => {
  const r = oesil({ age65: true });
  assert.equal(r.total, 1);
  assert.equal(r.mortality, '0.8');
  assert.equal(r.risk, 'low');
});

test('1 -> 2 band flip: 2 factors -> 19.6%, high risk', () => {
  const r = oesil({ age65: true, cvHistory: true });
  assert.equal(r.total, 2);
  assert.equal(r.mortality, '19.6');
  assert.equal(r.risk, 'high');
});

test('all factors -> 4, 57.1%', () => {
  const r = oesil({ age65: true, cvHistory: true, noProdrome: true, abnormalEcg: true });
  assert.equal(r.total, 4);
  assert.equal(r.mortality, '57.1');
});

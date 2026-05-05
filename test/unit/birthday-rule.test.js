// spec-v4 §7 step v4.4: Birthday rule resolver, >=5 scenarios.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { birthdayRulePrimary } from '../../lib/birthday-rule.js';

test('court order overrides everything', () => {
  const r = birthdayRulePrimary({
    parentA: { dob: '1985-12-31' }, parentB: { dob: '1985-01-01' }, courtOrder: 'A',
  });
  assert.equal(r.primary, 'A');
  assert.equal(r.reason, 'court-order');
});

test('custodial parent (custodial-A) is primary when no court order', () => {
  const r = birthdayRulePrimary({
    parentA: { dob: '1985-06-01' }, parentB: { dob: '1985-01-01' }, custodyArrangement: 'custodial-A',
  });
  assert.equal(r.primary, 'A');
  assert.equal(r.reason, 'custodial-parent');
});

test('birthday rule: parent A born March is primary over parent B born June', () => {
  const r = birthdayRulePrimary({
    parentA: { dob: '1985-03-15' }, parentB: { dob: '1980-06-10' },
  });
  assert.equal(r.primary, 'A');
  assert.equal(r.reason, 'birthday-rule');
});

test('birthday rule: same month, earlier day wins', () => {
  const r = birthdayRulePrimary({
    parentA: { dob: '1985-04-20' }, parentB: { dob: '1985-04-05' },
  });
  assert.equal(r.primary, 'B');
  assert.equal(r.reason, 'birthday-rule');
});

test('birthday rule: year of birth is irrelevant (older parent born later in year)', () => {
  const r = birthdayRulePrimary({
    parentA: { dob: '1990-01-01' }, parentB: { dob: '1960-12-31' },
  });
  assert.equal(r.primary, 'A');
});

test('identical month/day: longer-tenured plan wins on planEffectiveDate', () => {
  const r = birthdayRulePrimary({
    parentA: { dob: '1985-07-04', planEffectiveDate: '2020-01-01' },
    parentB: { dob: '1990-07-04', planEffectiveDate: '2024-01-01' },
  });
  assert.equal(r.primary, 'A');
  assert.equal(r.reason, 'longer-tenured-plan');
});

test('identical birthdays and no plan tenure data: tie', () => {
  const r = birthdayRulePrimary({
    parentA: { dob: '1985-07-04' }, parentB: { dob: '1990-07-04' },
  });
  assert.equal(r.primary, 'tie');
});

test('throws on missing parent', () => {
  assert.throws(() => birthdayRulePrimary({ parentA: { dob: '1985-01-01' } }));
});

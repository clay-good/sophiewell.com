// spec-v1554 tool 2: advanced HIV disease. CD4 200 or less, the stage fallback, the under-5 rule, the package.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { whoAdvancedHiv as r } from '../../lib/who-advanced-hiv-v1554.js';

test('CD4 200 or less, including exactly 200', () => {
  assert.equal(r({ age: '35', cd4: '200' }).bandLabel, 'Advanced HIV disease');
  assert.ok(r({ age: '35', cd4: '200' }).notes.some((n) => /2021/.test(n)));
  assert.equal(r({ age: '35', cd4: '201' }).bandLabel, 'Not advanced');
  assert.equal(r({ age: '35', cd4: '450', stage: '4' }).bandLabel, 'Not advanced', 'CD4 overrides stage');
});

test('stage fallback without CD4', () => {
  assert.equal(r({ age: '35', stage: '3' }).bandLabel, 'Advanced HIV disease');
  assert.equal(r({ age: '35', stage: '2' }).bandLabel, 'Not on stage alone');
  assert.equal(r({ age: '35' }).valid, false);
});

test('under 5', () => {
  assert.equal(r({ age: '3', stable: 'no' }).bandLabel, 'Advanced HIV disease');
  assert.equal(r({ age: '3', stable: 'yes' }).bandLabel, 'Not advanced');
  assert.equal(r({ age: '3' }).valid, false);
  assert.ok(r({ age: '3', stable: 'no' }).notes.some((n) => /No routine cryptococcal/.test(n)));
});

test('package by CD4', () => {
  assert.ok(r({ age: '35', cd4: '80' }).notes.some((n) => /strongly recommended below 100/.test(n)));
  assert.ok(r({ age: '35', cd4: '150' }).notes.some((n) => /may be considered below 200/.test(n)));
  assert.ok(r({ age: '35', cd4: '150' }).notes.some((n) => /Give cotrimoxazole/.test(n)));
});

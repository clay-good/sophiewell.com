// spec-v1554 tool 1: WHO clinical staging. The highest stage wins, "at least" with an unassessed higher
// stage, stage 1 only when all are none, and age-group lists.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { whoHivStaging as r } from '../../lib/who-hiv-staging-v1554.js';

test('highest stage wins', () => {
  assert.equal(r({ ageGroup: 'adult', s4: 'pcp', s3: 'ptb', s2: 'zoster' }).bandLabel, 'Stage 4');
  assert.equal(r({ ageGroup: 'adult', s4: 'none', s3: 'ptb', s2: 'none' }).bandLabel, 'Stage 3');
  assert.equal(r({ ageGroup: 'child', s4: 'none', s3: 'none', s2: 'parotid' }).bandLabel, 'Stage 2');
});

test('unassessed stages', () => {
  assert.equal(r({ ageGroup: 'adult', s3: 'ptb' }).bandLabel, 'At least stage 3');
  assert.equal(r({ ageGroup: 'adult', s4: 'none', s3: 'none', s2: 'none' }).bandLabel, 'Stage 1');
  assert.equal(r({ ageGroup: 'adult', s4: 'none', s3: 'none' }).bandLabel, 'Not staged');
  assert.equal(r({ ageGroup: 'adult' }).bandLabel, 'Not staged');
});

test('age-group lists', () => {
  assert.equal(r({ ageGroup: 'child', s3: 'sbi' }).valid, false, 'adult severe bacterial infections are not on the child list');
  assert.equal(r({ ageGroup: 'adult', s4: 'sbi-rec' }).valid, false);
  assert.equal(r({ ageGroup: 'adult', s4: 'nonsense' }).valid, false);
  assert.equal(r({}).valid, false);
  assert.ok(r({ ageGroup: 'adult', s4: 'ks' }).notes.some((n) => /advanced HIV disease/.test(n)));
});

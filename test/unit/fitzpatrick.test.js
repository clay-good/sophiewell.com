// spec-v331: Fitzpatrick skin phototype (I-VI). Worked-example tests: each phototype and its
// sunburn/tan description, the higher-photosensitivity flag on types I-II, roman + numeric
// input, and the invalid-type guard. Descriptions transcribed from Fitzpatrick 1988 (Arch
// Dermatol), cross-verified against DermNet / StatPearls (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fitzpatrick } from '../../lib/fitzpatrick-v331.js';

test('type III: sometimes burns, tans gradually (the META example)', () => {
  const r = fitzpatrick({ type: 'III' });
  assert.equal(r.valid, true);
  assert.equal(r.type, 'III');
  assert.equal(r.highRisk, false);
  assert.match(r.band, /sometimes burns, then tans gradually/);
});

test('types I and II are flagged higher-photosensitivity', () => {
  assert.equal(fitzpatrick({ type: 'I' }).highRisk, true);
  assert.equal(fitzpatrick({ type: 'II' }).highRisk, true);
  assert.match(fitzpatrick({ type: 'I' }).band, /always burns, never tans/);
});

test('types III-VI are not flagged higher-photosensitivity', () => {
  for (const t of ['III', 'IV', 'V', 'VI']) {
    assert.equal(fitzpatrick({ type: t }).highRisk, false, t);
  }
});

test('type VI never burns and is deeply pigmented', () => {
  const r = fitzpatrick({ type: 'VI' });
  assert.equal(r.type, 'VI');
  assert.match(r.band, /never burns, deeply pigmented/);
});

test('numeric input 1-6 maps to the roman phototypes; input is case-insensitive', () => {
  assert.equal(fitzpatrick({ type: '1' }).type, 'I');
  assert.equal(fitzpatrick({ type: '6' }).type, 'VI');
  assert.equal(fitzpatrick({ type: 'iv' }).type, 'IV');
});

test('a missing or out-of-range type is invalid', () => {
  assert.equal(fitzpatrick({}).valid, false);
  assert.equal(fitzpatrick({ type: 'VII' }).valid, false);
  assert.equal(fitzpatrick({ type: '7' }).valid, false);
});

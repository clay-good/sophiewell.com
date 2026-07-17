// spec-v361: Tanner staging / Sexual Maturity Rating (three scales x stages 1-5). Worked-example tests:
// the breast/genital/pubic-hair descriptions, scale + stage aliases, and the invalid-scale / invalid-
// stage guards. Descriptions transcribed from Marshall & Tanner 1969/1970, cross-verified against
// StatPearls (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { tannerStaging } from '../../lib/tanner-staging-v361.js';

test('breast stage 2: breast bud stage (the META example)', () => {
  const r = tannerStaging({ scale: 'breast', stage: '2' });
  assert.equal(r.valid, true);
  assert.equal(r.scale, 'breast (female)');
  assert.equal(r.stage, 2);
  assert.equal(r.abnormal, false);
  assert.match(r.band, /breast bud stage/);
});

test('genital and pubic-hair scales resolve their own descriptions', () => {
  assert.match(tannerStaging({ scale: 'genital', stage: '2' }).band, /enlargement of the scrotum and testes/);
  assert.match(tannerStaging({ scale: 'pubic', stage: '2' }).band, /sparse growth of long, slightly pigmented/);
  assert.match(tannerStaging({ scale: 'genital', stage: '5' }).band, /adult genitalia/);
});

test('stage 1 is prepubertal and stage 5 is adult on each scale', () => {
  for (const s of ['breast', 'genital', 'pubic']) {
    assert.match(tannerStaging({ scale: s, stage: '1' }).band, /prepubertal/);
  }
  assert.match(tannerStaging({ scale: 'pubic', stage: '5' }).band, /adult in quantity and type/);
});

test('scale and stage aliases (b/g/ph, female/male, numbers) resolve', () => {
  assert.equal(tannerStaging({ scale: 'b', stage: 3 }).scale, 'breast (female)');
  assert.equal(tannerStaging({ scale: 'MALE', stage: '4' }).scale, 'genital (male)');
  assert.equal(tannerStaging({ scale: 'ph', stage: 5 }).scale, 'pubic hair');
});

test('a missing/invalid scale or stage is guarded', () => {
  assert.equal(tannerStaging({}).valid, false);
  assert.equal(tannerStaging({ scale: 'breast' }).valid, false);
  assert.equal(tannerStaging({ scale: 'nose', stage: '2' }).valid, false);
  assert.equal(tannerStaging({ scale: 'breast', stage: '6' }).valid, false);
});

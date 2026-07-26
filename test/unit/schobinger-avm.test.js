// spec-v497: Schobinger staging of a peripheral arteriovenous malformation (stages I-IV).
// Worked-example tests: each stage and its clinical description, the cumulative wording, alias input,
// invalid-stage guard. Stages transcribed from Kohout and colleagues 1998 (Plast Reconstr Surg) (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { schobingerAvm } from '../../lib/schobinger-avm-v497.js';

test('stage II: expansion (the META example)', () => {
  const r = schobingerAvm({ stage: 'II' });
  assert.equal(r.valid, true);
  assert.equal(r.stage, 'II');
  assert.match(r.band, /expansion: the stage I findings plus enlargement, pulsation, thrill, bruit/);
});

test('stage I: quiescence', () => {
  assert.match(schobingerAvm({ stage: 'I' }).band, /quiescence: a pink-bluish stain, warmth, and arteriovenous shunting/);
});

test('stage III: destruction', () => {
  assert.match(schobingerAvm({ stage: 'III' }).band, /destruction: the stage II findings plus dystrophic skin changes/);
});

test('stage IV: decompensation with high-output cardiac failure', () => {
  const r = schobingerAvm({ stage: 'IV' });
  assert.equal(r.stage, 'IV');
  assert.match(r.band, /decompensation: the stage III findings plus high-output cardiac failure/);
});

test('the staging is cumulative: II, III, and IV each name the stage below', () => {
  assert.match(schobingerAvm({ stage: 'II' }).band, /stage I findings/);
  assert.match(schobingerAvm({ stage: 'III' }).band, /stage II findings/);
  assert.match(schobingerAvm({ stage: 'IV' }).band, /stage III findings/);
});

test('lowercase and numeric aliases map to the canonical stages', () => {
  assert.equal(schobingerAvm({ stage: 'iii' }).stage, 'III');
  assert.equal(schobingerAvm({ stage: 4 }).stage, 'IV');
});

test('a missing or out-of-range stage is invalid', () => {
  assert.equal(schobingerAvm({}).valid, false);
  assert.equal(schobingerAvm({ stage: '0' }).valid, false);
  assert.equal(schobingerAvm({ stage: 'V' }).valid, false);
});

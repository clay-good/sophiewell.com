// spec-v321: Hinchey classification of acute (perforated) diverticulitis. Worked-example
// tests: each of the four stages and its definition, the I-II (abscess) vs III-IV
// (generalized peritonitis) severity split, roman + arabic input, and the invalid-stage
// guard. Criteria transcribed from Hinchey 1978 (Adv Surg), cross-verified across
// reproductions of the original four stages (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hinchey } from '../../lib/hinchey-v321.js';

test('stage III: generalized purulent peritonitis (the META example)', () => {
  const r = hinchey({ stage: 'III' });
  assert.equal(r.valid, true);
  assert.equal(r.stage, 'III');
  assert.equal(r.severe, true);
  assert.match(r.band, /generalized purulent peritonitis/);
});

test('stage I: localized pericolic abscess, not severe', () => {
  const r = hinchey({ stage: 'I' });
  assert.equal(r.stage, 'I');
  assert.equal(r.severe, false);
  assert.match(r.band, /localized pericolic/);
});

test('stage II: pelvic/distant abscess, not severe', () => {
  const r = hinchey({ stage: 'II' });
  assert.equal(r.severe, false);
  assert.match(r.band, /pelvic, distant intra-abdominal, or retroperitoneal abscess/);
});

test('stage IV: generalized fecal peritonitis, severe', () => {
  const r = hinchey({ stage: 'IV' });
  assert.equal(r.stage, 'IV');
  assert.equal(r.severe, true);
  assert.match(r.band, /generalized fecal \(feculent\) peritonitis/);
});

test('arabic numerals are accepted and mapped to roman stages', () => {
  assert.equal(hinchey({ stage: '1' }).stage, 'I');
  assert.equal(hinchey({ stage: '4' }).stage, 'IV');
});

test('input is case-insensitive', () => {
  assert.equal(hinchey({ stage: 'iii' }).stage, 'III');
});

test('a missing or unknown stage is invalid', () => {
  assert.equal(hinchey({}).valid, false);
  assert.equal(hinchey({ stage: 'V' }).valid, false);
  assert.equal(hinchey({ stage: '0' }).valid, false); // original Hinchey has no stage 0
});

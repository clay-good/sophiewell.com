// spec-v175 §2.1: Abbey Pain Scale. 6 items 0-3, total 0-18, bands 0-2 no pain,
// 3-7 mild, 8-13 moderate, 14+ severe.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { abbeyPain } from '../../lib/ltcga-v175.js';

const z = { vocalization: 0, facialExpression: 0, bodyLanguage: 0, behavioralChange: 0, physiologicalChange: 0, physicalChange: 0 };

test('Abbey 0/18 (all absent) -> no pain', () => {
  const r = abbeyPain(z);
  assert.equal(r.valid, true);
  assert.equal(r.total, 0);
  assert.match(r.band, /no pain/);
});

test('Abbey 7->8 mild->moderate boundary', () => {
  const seven = abbeyPain({ ...z, vocalization: 3, facialExpression: 3, bodyLanguage: 1 });
  assert.equal(seven.total, 7);
  assert.match(seven.band, /mild pain/);
  const eight = abbeyPain({ ...z, vocalization: 2, facialExpression: 2, bodyLanguage: 2, behavioralChange: 2 });
  assert.equal(eight.total, 8);
  assert.match(eight.band, /moderate pain/);
});

test('Abbey 13->14 moderate->severe boundary', () => {
  const thirteen = abbeyPain({ vocalization: 3, facialExpression: 3, bodyLanguage: 3, behavioralChange: 3, physiologicalChange: 1, physicalChange: 0 });
  assert.equal(thirteen.total, 13);
  assert.match(thirteen.band, /moderate pain/);
  const fourteen = abbeyPain({ vocalization: 3, facialExpression: 3, bodyLanguage: 3, behavioralChange: 3, physiologicalChange: 2, physicalChange: 0 });
  assert.equal(fourteen.total, 14);
  assert.match(fourteen.band, /severe pain/);
});

test('Abbey 18/18 (all severe) -> severe', () => {
  const r = abbeyPain({ vocalization: 3, facialExpression: 3, bodyLanguage: 3, behavioralChange: 3, physiologicalChange: 3, physicalChange: 3 });
  assert.equal(r.total, 18);
  assert.match(r.band, /severe pain/);
});

test('Abbey rejects out-of-range and blank items', () => {
  assert.equal(abbeyPain({ ...z, vocalization: 4 }).valid, false);
  assert.equal(abbeyPain({ ...z, vocalization: '' }).valid, false);
  assert.equal(abbeyPain({}).valid, false);
});

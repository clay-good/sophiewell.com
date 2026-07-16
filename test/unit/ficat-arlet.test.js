// spec-v344: Ficat-Arlet staging of femoral-head osteonecrosis (AVN) (stages 0-IV). Worked-example
// tests: each stage and its radiographic description, the post-collapse flag on stages III-IV, roman
// + numeric + case-insensitive input (including stage 0), and the invalid-stage guard. Definitions
// transcribed from Ficat 1985 (JBJS Br) and Ficat & Arlet 1980, cross-verified against hip-imaging
// references (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ficatArlet } from '../../lib/ficat-arlet-v344.js';

test('stage III: subchondral collapse, flagged post-collapse (the META example)', () => {
  const r = ficatArlet({ stage: 'III' });
  assert.equal(r.valid, true);
  assert.equal(r.stage, 'III');
  assert.equal(r.collapse, true);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /subchondral collapse \(crescent sign\)/);
});

test('stages 0-II are pre-collapse and not flagged', () => {
  assert.match(ficatArlet({ stage: '0' }).band, /silent hip/);
  assert.match(ficatArlet({ stage: 'II' }).band, /pre-collapse/);
  for (const s of ['0', 'I', 'II']) {
    assert.equal(ficatArlet({ stage: s }).collapse, false, s);
  }
});

test('stage IV is end-stage osteoarthritis and flagged', () => {
  const r = ficatArlet({ stage: 'IV' });
  assert.equal(r.collapse, true);
  assert.match(r.band, /secondary osteoarthritis/);
});

test('numeric 0-4 and case-insensitive roman input map to the stages', () => {
  assert.equal(ficatArlet({ stage: 0 }).stage, '0');
  assert.equal(ficatArlet({ stage: '2' }).stage, 'II');
  assert.equal(ficatArlet({ stage: 4 }).stage, 'IV');
  assert.equal(ficatArlet({ stage: 'iii' }).stage, 'III');
});

test('a missing or out-of-range stage is invalid', () => {
  assert.equal(ficatArlet({}).valid, false);
  assert.equal(ficatArlet({ stage: 'V' }).valid, false);
  assert.equal(ficatArlet({ stage: '5' }).valid, false);
});

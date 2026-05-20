import { test } from 'node:test';
import assert from 'node:assert/strict';
import { npiapStaging } from '../../lib/scoring-v4.js';

test('mucosal location -> Mucosal Membrane PI', () => {
  const r = npiapStaging({ mucosal: true });
  assert.equal(r.stage, 'Mucosal Membrane PI');
});

test('intact + blanchable -> No pressure injury (tile example)', () => {
  const r = npiapStaging({ skinIntact: true, blanching: 'blanchable' });
  assert.equal(r.stage, 'No pressure injury');
});

test('intact + non-blanchable erythema -> Stage 1', () => {
  const r = npiapStaging({ skinIntact: true, blanching: 'non-blanchable-erythema' });
  assert.equal(r.stage, 'Stage 1');
});

test('intact + non-blanchable deep discoloration -> DTPI', () => {
  const r = npiapStaging({ skinIntact: true, blanching: 'non-blanchable-deep-discoloration' });
  assert.equal(r.stage, 'Deep Tissue Pressure Injury');
});

test('not intact + obscured -> Unstageable', () => {
  const r = npiapStaging({ obscured: true });
  assert.equal(r.stage, 'Unstageable');
});

test('not intact + partial-thickness -> Stage 2', () => {
  const r = npiapStaging({ depth: 'partial-thickness' });
  assert.equal(r.stage, 'Stage 2');
});

test('not intact + subq-visible -> Stage 3', () => {
  const r = npiapStaging({ depth: 'subq-visible' });
  assert.equal(r.stage, 'Stage 3');
});

test('not intact + bone-tendon-muscle visible -> Stage 4', () => {
  const r = npiapStaging({ depth: 'bone-tendon-muscle' });
  assert.equal(r.stage, 'Stage 4');
});

test('mucosal trumps other inputs', () => {
  const r = npiapStaging({ mucosal: true, skinIntact: true, blanching: 'non-blanchable-erythema' });
  assert.equal(r.stage, 'Mucosal Membrane PI');
});

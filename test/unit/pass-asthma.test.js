import { test } from 'node:test';
import assert from 'node:assert/strict';
import { passAsthma } from '../../lib/scoring-v4.js';

test('pass 0 of 6 (tile example) -> mild', () => {
  const r = passAsthma({ wheezing: 0, workOfBreathing: 0, prolongedExpiration: 0 });
  assert.equal(r.score, 0);
  assert.match(r.band, /mild asthma per Gorelick 2004/);
});

test('pass 1 (upper edge of mild) -> mild', () => {
  const r = passAsthma({ wheezing: 1 });
  assert.equal(r.score, 1);
  assert.match(r.band, /mild/);
});

test('pass 2 (lower edge of moderate) -> moderate', () => {
  const r = passAsthma({ wheezing: 1, workOfBreathing: 1 });
  assert.equal(r.score, 2);
  assert.match(r.band, /moderate/);
});

test('pass 3 (upper edge of moderate) -> moderate', () => {
  const r = passAsthma({ wheezing: 1, workOfBreathing: 1, prolongedExpiration: 1 });
  assert.equal(r.score, 3);
  assert.match(r.band, /moderate/);
});

test('pass 4 (lower edge of severe) -> severe', () => {
  const r = passAsthma({ wheezing: 2, workOfBreathing: 2 });
  assert.equal(r.score, 4);
  assert.match(r.band, /severe asthma per Gorelick 2004/);
});

test('pass 6 (max) -> severe', () => {
  const r = passAsthma({ wheezing: 2, workOfBreathing: 2, prolongedExpiration: 2 });
  assert.equal(r.score, 6);
  assert.match(r.band, /severe/);
});

test('pass clamps per-item out-of-range to [0, 2]', () => {
  const r = passAsthma({ wheezing: 99, workOfBreathing: -1, prolongedExpiration: 1 });
  assert.equal(r.parts.wheezing, 2);
  assert.equal(r.parts.workOfBreathing, 0);
  assert.equal(r.score, 3);
});

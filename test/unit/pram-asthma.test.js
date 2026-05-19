import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pramAsthma } from '../../lib/scoring-v4.js';

test('pram 0 of 12 (tile example) -> mild', () => {
  const r = pramAsthma({});
  assert.equal(r.score, 0);
  assert.match(r.band, /mild asthma per Chalut 2000/);
});

test('pram 3 (upper edge of mild) -> mild', () => {
  // suprasternal 2 + air-entry 1 = 3
  const r = pramAsthma({ suprasternal: 2, airEntry: 1 });
  assert.equal(r.score, 3);
  assert.match(r.band, /mild/);
});

test('pram 4 (lower edge of moderate) -> moderate', () => {
  // suprasternal 2 + scalene 2 = 4
  const r = pramAsthma({ suprasternal: 2, scalene: 2 });
  assert.equal(r.score, 4);
  assert.match(r.band, /moderate/);
});

test('pram 7 (upper edge of moderate) -> moderate', () => {
  // 2 + 2 + 1 + 1 + 1 = 7
  const r = pramAsthma({ suprasternal: 2, scalene: 2, airEntry: 1, wheezing: 1, spo2: 1 });
  assert.equal(r.score, 7);
  assert.match(r.band, /moderate/);
});

test('pram 8 (lower edge of severe) -> severe', () => {
  // 2 + 2 + 2 + 2 + 0 = 8
  const r = pramAsthma({ suprasternal: 2, scalene: 2, airEntry: 2, wheezing: 2, spo2: 0 });
  assert.equal(r.score, 8);
  assert.match(r.band, /severe asthma per Chalut 2000/);
});

test('pram 12 (max) -> severe', () => {
  const r = pramAsthma({ suprasternal: 2, scalene: 2, airEntry: 3, wheezing: 3, spo2: 2 });
  assert.equal(r.score, 12);
  assert.match(r.band, /severe/);
});

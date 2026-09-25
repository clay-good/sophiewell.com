// spec-v1448: ABC classification of posterior shoulder instability (Moroder 2024; Paksoy 2024).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { abcPsi } from '../../lib/abc-psi-v1448.js';

test('each group splits by its own question', () => {
  assert.equal(abcPsi({ pattern: 'first', acute: 'subluxation' }).type, 'A1');
  assert.equal(abcPsi({ pattern: 'first', acute: 'dislocation' }).type, 'A2');
  assert.equal(abcPsi({ pattern: 'recurrent', dynamic: 'functional' }).type, 'B1');
  assert.equal(abcPsi({ pattern: 'recurrent', dynamic: 'structural' }).type, 'B2');
  assert.equal(abcPsi({ pattern: 'static', static: 'constitutional' }).type, 'C1');
  assert.equal(abcPsi({ pattern: 'static', static: 'acquired' }).type, 'C2');
});

test("answers to another group's question are ignored", () => {
  assert.equal(abcPsi({ pattern: 'recurrent', dynamic: 'structural', acute: 'subluxation' }).type, 'B2');
});

test('the missing question for the chosen group is asked for', () => {
  assert.match(abcPsi({ pattern: 'first' }).message, /subluxation that reduced itself/);
  assert.match(abcPsi({ pattern: 'static' }).message, /constitutional or acquired/);
  assert.equal(abcPsi({}).valid, false);
});

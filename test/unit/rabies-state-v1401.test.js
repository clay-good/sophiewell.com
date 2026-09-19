// spec-v1401 Part B: the Texas line on rabies-pep appears only when Texas is chosen.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { rabiesStateLine, RABIES_STATES } from '../../lib/rabies-state-lines-v1401.js';

test('rabies state line: Texas 10-day observation for dogs, cats, and ferrets; none by default', () => {
  assert.match(rabiesStateLine('TX'), /10-day observation/);
  assert.match(rabiesStateLine('TX'), /dog, cat, or domestic ferret/);
  assert.equal(rabiesStateLine(''), null);
  assert.equal(rabiesStateLine('NY'), null);
  assert.deepEqual(RABIES_STATES.map((s) => s.value), ['', 'TX']);
});

// spec-v1401 Part B: 25 TAC 169.30 -- an exposed pet: 45 days if vaccinated, 90 days if not.
test('rabies TX line: exposed pets -- 45 days vaccinated, 90 days not (169.30)', () => {
  const l = rabiesStateLine('TX');
  assert.match(l, /confined 45 days/);
  assert.match(l, /confined 90 days/);
});

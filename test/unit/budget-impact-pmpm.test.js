// spec-v1634 tool 30: PMPM = budget impact / (members x months), checked against two published analyses.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { budgetImpactPmpm as pmpm } from '../../lib/budget-impact-pmpm-v1634.js';

test('reproduces the PMPM figures Rojas-Roque 2024 and Proudman 2020 print', () => {
  assert.equal(Number(pmpm({ budgetImpact: '476390', members: '1000000', months: '12' }).pmpm.toFixed(4)), 0.0397);
  assert.equal(Number(pmpm({ budgetImpact: '3049165', members: '1000000', months: '12' }).pmpm.toFixed(4)), 0.2541);
  assert.equal(Number(pmpm({ budgetImpact: '115604', members: '1000000', months: '12' }).pmpm.toFixed(3)), 0.010);
  assert.equal(Number(pmpm({ budgetImpact: '45038', members: '1000000', months: '12' }).pmpm.toFixed(3)), 0.004);
});

test('a saving is negative; inputs are checked', () => {
  const s = pmpm({ budgetImpact: '-50000', members: '250000', months: '12' });
  assert.ok(s.pmpm < 0);
  assert.match(s.band, /-\$0\.0167/);
  assert.equal(pmpm({ budgetImpact: '1000', members: '0', months: '12' }).valid, false);
  assert.equal(pmpm({ budgetImpact: '1000', members: '100', months: '1.5' }).valid, false);
});

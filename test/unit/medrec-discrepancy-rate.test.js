// spec-v1634 tool 29: CBE 2456 rate, checked against the measure page's own worked example.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { medrecDiscrepancyRate as mr } from '../../lib/medrec-discrepancy-rate-v1634.js';

test('reproduces the worked example on the measure page: 75 / (110 + 40) = 0.5', () => {
  const r = mr({ discrepancies: '75', goldMeds: '110', extraMeds: '40', patients: '25' });
  assert.equal(r.valid, true);
  assert.equal(r.rate, 0.5);
  assert.equal(r.denominator, 150);
  assert.match(r.band, /^0\.50 unintentional discrepancies per medication \(75 of 150\)\.$/);
});

test('a small sample is noted; the patient count is optional', () => {
  assert.match(mr({ discrepancies: '3', goldMeds: '40', extraMeds: '0', patients: '10' }).notes.join(' '), /recommends 25 a month/);
  assert.equal(mr({ discrepancies: '3', goldMeds: '40', extraMeds: '0' }).valid, true);
});

test('blank, fractional and empty-denominator inputs refuse', () => {
  assert.equal(mr({ discrepancies: '', goldMeds: '40', extraMeds: '0' }).valid, false);
  assert.equal(mr({ discrepancies: '2.5', goldMeds: '40', extraMeds: '0' }).valid, false);
  assert.equal(mr({ discrepancies: '0', goldMeds: '0', extraMeds: '0' }).valid, false);
  assert.equal(mr({ discrepancies: '1', goldMeds: '10', extraMeds: '0', patients: '0' }).valid, false);
});

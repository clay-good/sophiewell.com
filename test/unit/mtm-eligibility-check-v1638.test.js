// spec-v1638 tool 1: Part D MTM targeting criteria.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mtmEligibilityCheck, THRESHOLDS, CORE_DISEASES } from '../../lib/mtm-eligibility-check-v1638.js';

const m = (o) => mtmEligibilityCheck({ planYear: 2026, planMinDiseases: 3, planMinDrugs: 8, memberDiseases: 3, memberDrugs: 8, annualCost: 1276, atRisk: 'not-at-risk', ...o });

test('the CMS thresholds for 2025, 2026 and 2027, and the ten core diseases', () => {
  assert.deepEqual(THRESHOLDS, { 2025: 1623, 2026: 1276, 2027: 1340 });
  assert.equal(CORE_DISEASES.length, 10);
});

test('group 1: diseases, drugs and cost each at or above the line', () => {
  assert.deepEqual([m({}).flag, m({}).targeted], ['targeted-group-1', true]);
  assert.equal(m({ annualCost: 1275.99 }).flag, 'not-targeted');
  assert.match(m({ annualCost: 1275.99 }).bandLabel, /Fails on projected annual cost/);
  assert.match(m({ memberDiseases: 2 }).bandLabel, /Fails on chronic diseases/);
  assert.match(m({ memberDrugs: 7 }).bandLabel, /Fails on Part D drugs/);
  // The same cost meets 2026 and fails 2027 and 2025.
  assert.equal(m({ planYear: 2027 }).targeted, false);
  assert.equal(m({ planYear: 2025 }).targeted, false);
});

test('group 2: an at-risk beneficiary is targeted whatever group 1 shows', () => {
  const r = m({ memberDiseases: 0, memberDrugs: 0, annualCost: 0, atRisk: 'at-risk-beneficiary' });
  assert.deepEqual([r.flag, r.group1, r.group2], ['targeted-group-2', false, true]);
  assert.equal(m({ atRisk: 'at-risk-beneficiary' }).flag, 'targeted-both-groups');
});

test('a plan setting above the federal maximum is reported', () => {
  const r = m({ planMinDiseases: 4, planMinDrugs: 9, memberDiseases: 5, memberDrugs: 10 });
  assert.equal(r.planSettingsNotPermitted, true);
  assert.match(r.note, /the most a sponsor may require is 3.*the most a sponsor may require is 8/);
});

test('a year without a published figure asks for it and borrows none', () => {
  assert.match(m({ planYear: 2028 }).message, /^Enter the MTM cost threshold CMS published for 2028/);
  assert.equal(m({ planYear: 2028, thresholdOverride: 1400, annualCost: 1400 }).targeted, true);
  assert.match(mtmEligibilityCheck({}).message, /^Enter the plan year/);
  assert.match(m({ atRisk: '' }).message, /^Choose whether the member is an at-risk beneficiary/);
  assert.match(m({ planYear: 2024 }).message, /plan year/);
});

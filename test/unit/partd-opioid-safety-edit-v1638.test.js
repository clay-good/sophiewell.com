// spec-v1638 tool 7: Part D opioid point-of-sale safety edits (CMS contract year 2027 memo).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { partdOpioidSafetyEdit } from '../../lib/partd-opioid-safety-edit-v1638.js';

const e = (o) => partdOpioidSafetyEdit({ exemption: 'no-exemption', cumulativeMme: 60, daysSupply: 30, recentOpioidFill: 'yes', hardEdit200: 'no', benzodiazepine: 'no', duplicateLongActing: 'no', ...o });

test('the care coordination edit fires at 90 MME, and not below it', () => {
  assert.deepEqual(e({ cumulativeMme: 89.9 }).edits, []);
  assert.deepEqual(e({ cumulativeMme: 90 }).edits, ['care-coordination-edit']);
});

test('the hard edit at 200 MME fires only where the plan uses it', () => {
  assert.deepEqual(e({ cumulativeMme: 200 }).edits, ['care-coordination-edit']);
  assert.deepEqual(e({ cumulativeMme: 200, hardEdit200: 'yes' }).edits, ['care-coordination-edit', 'hard-mme-edit-200']);
  assert.deepEqual(e({ cumulativeMme: 199, hardEdit200: 'yes' }).edits, ['care-coordination-edit']);
});

test('a plan count on the MME edits must be met, and the member\'s count must be entered', () => {
  assert.deepEqual(e({ cumulativeMme: 120, planPrescriberCount: 2, prescribers: 1 }).edits, []);
  assert.deepEqual(e({ cumulativeMme: 120, planPrescriberCount: 2, prescribers: 2 }).edits, ['care-coordination-edit']);
  assert.match(e({ cumulativeMme: 120, planPrescriberCount: 2 }).message, /^Enter the member's number of opioid prescribers/);
});

test('the opioid-naive edit: no fill in the lookback and more than 7 days', () => {
  assert.deepEqual(e({ recentOpioidFill: 'no', daysSupply: 8 }).edits, ['opioid-naive-7-day-edit']);
  assert.deepEqual(e({ recentOpioidFill: 'no', daysSupply: 7 }).edits, []);
  assert.match(e({ recentOpioidFill: 'no', daysSupply: 30 }).note, /daily cost-sharing rate/);
});

test('soft edits, exemptions and refusals', () => {
  assert.deepEqual(e({ benzodiazepine: 'yes', duplicateLongActing: 'yes' }).edits, ['opioid-benzodiazepine-soft-edit', 'duplicative-long-acting-soft-edit']);
  assert.match(e({ benzodiazepine: 'yes' }).note, /runs both ways/);
  assert.equal(partdOpioidSafetyEdit({ exemption: 'cancer-related-pain' }).flag, 'exempt');
  assert.match(partdOpioidSafetyEdit({}).message, /^Choose whether an exemption applies/);
  assert.match(e({ recentOpioidFill: '' }).message, /^Choose yes or no: has the member filled an opioid/);
  assert.match(e({ cumulativeMme: '' }).message, /^Enter the cumulative daily MME/);
  assert.match(e({}).note, /should not be implemented as prescribing limits/);
});

// spec-v1638 tool 8: Part D drug management program criteria (CMS guidance, Rev. 7).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { partdDmpCriteriaCheck } from '../../lib/partd-dmp-criteria-check-v1638.js';

const d = (o) => partdDmpCriteriaCheck({ exemption: 'no-exemption', averageDailyMme: 120, prescribers: 3, pharmacies: 3, opioidFill: 'yes', overdoseClaim: 'no', ...o });

test('criterion 1: MME greater than 90, with 3 and 3 or 5 prescribers', () => {
  assert.deepEqual([d({}).criterion1, d({}).flag], [true, 'meets-minimum-criteria']);
  // Exactly 90 is not greater than 90.
  assert.equal(d({ averageDailyMme: 90 }).criterion1, false);
  assert.equal(d({ averageDailyMme: 90.5 }).criterion1, true);
  assert.equal(d({ prescribers: 2 }).criterion1, false);
  assert.equal(d({ pharmacies: 2 }).criterion1, false);
  assert.equal(d({ prescribers: 5, pharmacies: 1 }).criterion1, true);
  assert.equal(d({ prescribers: 4, pharmacies: 2 }).criterion1, false);
});

test('criterion 2: an overdose claim and an opioid fill, whatever the MME', () => {
  const r = d({ averageDailyMme: 10, prescribers: 1, pharmacies: 1, overdoseClaim: 'yes' });
  assert.deepEqual([r.criterion1, r.criterion2, r.flag], [false, true, 'meets-minimum-criteria']);
  assert.equal(d({ averageDailyMme: 10, prescribers: 1, pharmacies: 1, overdoseClaim: 'yes', opioidFill: 'no' }).criterion2, false);
});

test('supplemental: 7 prescribers or 7 pharmacies at any MME', () => {
  const r = d({ averageDailyMme: 30, prescribers: 7, pharmacies: 1 });
  assert.deepEqual([r.criterion1, r.supplemental, r.flag], [false, true, 'meets-supplemental-criteria']);
  assert.equal(d({ averageDailyMme: 30, prescribers: 1, pharmacies: 7 }).supplemental, true);
  assert.equal(d({ averageDailyMme: 30, prescribers: 6, pharmacies: 6 }).flag, 'meets-none');
});

test('an exemption ends the check; nothing is defaulted', () => {
  assert.equal(partdDmpCriteriaCheck({ exemption: 'scd-diagnosis' }).flag, 'exempted-beneficiary');
  assert.match(partdDmpCriteriaCheck({}).message, /^Choose whether an exemption applies/);
  assert.match(d({ averageDailyMme: '' }).message, /^Enter the highest average daily MME/);
  assert.match(d({ overdoseClaim: '' }).message, /^Choose yes or no: is there a medical claim/);
  assert.match(d({ prescribers: 2.5 }).message, /whole number/);
});

// spec-v1502 tool 1: payer criteria checklist.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { paCriteriaChecklist as p } from '../../lib/pa-criteria-v1502.js';

const policy = `Initial approval requires all of the following:
1. Diagnosis of moderately to severely active rheumatoid arthritis [met] -- progress note 2026-08-14
2. Age 18 or older [met]
3. One of the following:
a. Trial and failure of methotrexate for at least 3 months [not documented]
b. Intolerance or contraindication to methotrexate [met] -- allergy list
4. Not used with another biologic [met]`;

test('a nested "one of" inside "all of" is satisfied by one met sub-item', () => {
  const r = p({ criteria: policy });
  assert.equal(r.satisfied, true);
  assert.match(r.notes.join(' '), /3\.b\. Intolerance or contraindication to methotrexate: Met \(evidence: allergy list\)/);
});

test('"Not documented" keeps the logic unsatisfied', () => {
  assert.equal(p({ criteria: policy.replace('[met] -- allergy list', '[not documented]') }).satisfied, false);
});

test('an unmarked item is open and never counts as met', () => {
  const r = p({ criteria: policy.replace(' [met] -- allergy list', '') });
  assert.equal(r.satisfied, false);
  assert.match(r.band, /1 item is not yet marked/);
});

test('text with no connectives evaluates nothing', () => {
  const r = p({ criteria: '1. Diagnosis [met]\n2. Age 18 or older [met]' });
  assert.equal(r.satisfied, null);
  assert.equal(r.bandLabel, 'Logic not stated');
});

test('roman sub-items nest under letters', () => {
  const r = p({ criteria: 'All of the following:\n1. A [met]\n2. One of the following:\na. B [not met]\nb. All of the following:\ni. C [met]\nii. D [met]' });
  assert.equal(r.satisfied, true);
});

test('empty or unnumbered text asks', () => {
  assert.equal(p({}).valid, false);
  assert.equal(p({ criteria: 'Diagnosis of RA [met]' }).valid, false);
});

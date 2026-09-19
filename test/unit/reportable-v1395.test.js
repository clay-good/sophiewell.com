// spec-v1395: reportable-condition urgency, California and Texas, from each state's PDF.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { reportableConditionUrgency as rc, CA_CONDITIONS, TX_CONDITIONS } from '../../lib/reportable-condition-urgency-v1395.js';

const FRI = '2026-09-18T15:00';

test('rc: Texas measles is call immediately; Vibrio is one work day (the two a summarizer got wrong)', () => {
  assert.equal(rc({ state: 'TX', txCondition: 'tx-measles-rubeola', identified: FRI }).urgency, 'immediate');
  const v = rc({ state: 'TX', txCondition: 'tx-vibrio-infection-including-cholera', identified: FRI });
  assert.equal(v.urgency, '1wd');
  assert.equal(v.dueAt, '2026-09-21T15:00');
});

test('rc: Texas Chagas and typhus are within one week, not one work day', () => {
  assert.equal(rc({ state: 'TX', txCondition: 'tx-chagas-disease', identified: FRI }).dueAt, '2026-09-25T15:00');
  assert.equal(rc({ state: 'TX', txCondition: 'tx-typhus', identified: FRI }).urgency, 'week');
});

test('rc: California classes -- measles immediate, pertussis one working day, cocci seven days', () => {
  assert.equal(rc({ state: 'CA', caCondition: 'ca-measles-rubeola', identified: FRI }).urgency, 'immediate-phone');
  assert.equal(rc({ state: 'CA', caCondition: 'ca-pertussis-whooping-cough', identified: FRI }).dueAt, '2026-09-21T15:00');
  assert.equal(rc({ state: 'CA', caCondition: 'ca-coccidioidomycosis', identified: FRI }).dueAt, '2026-09-25T15:00');
});

test('rc: the lists match their PDFs, and New York and New Jersey are not offered', () => {
  assert.equal(CA_CONDITIONS.length, 94);
  assert.equal(TX_CONDITIONS.length, 89);
  assert.equal(rc({ state: 'NY' }).valid, false);
  assert.equal(rc({ state: 'CA', caCondition: 'ca-measles-rubeola', identified: '' }).valid, false);
});

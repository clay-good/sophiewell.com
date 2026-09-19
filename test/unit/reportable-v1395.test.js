// spec-v1395: reportable-condition urgency, California and Texas, from each state's PDF.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { reportableConditionUrgency as rc, CA_CONDITIONS, TX_CONDITIONS, NY_CONDITIONS, NJ_CONDITIONS } from '../../lib/reportable-condition-urgency-v1395.js';

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

// spec-v1395: New York -- red bold is phoned in now; everything else within 24 hours (10 NYCRR 2.10).
test('reportable: NY measles is immediate by phone; Lyme is due 24 hours later', () => {
  const m = rc({ state: 'NY', nyCondition: 'ny-measles', identified: '2026-09-18T15:00' });
  assert.equal(m.bandLabel, 'Report now');
  assert.equal(m.dueAt, null);
  const l = rc({ state: 'NY', nyCondition: 'ny-lyme-disease', identified: '2026-09-18T15:00' });
  assert.equal(l.dueAt, '2026-09-19T15:00');
  assert.match(l.band, /NYC Health Department/);
  assert.equal(NY_CONDITIONS.filter((c) => c.cls === 'immediate-phone').length, 31);
});

test('reportable: NY footnotes -- rabies prophylaxis, syphilis by phone, HIV on DOH-4189', () => {
  assert.match(rc({ state: 'NY', nyCondition: 'ny-animal-bite-for-which-rabies-prophylaxis-is-given', identified: '2026-09-18T15:00' }).band, /before starting rabies prophylaxis/);
  const s = rc({ state: 'NY', nyCondition: 'ny-syphilis', identified: '2026-09-18T15:00' });
  assert.match(s.band, /any prenatal or delivery test is positive/);
  assert.equal(s.abnormal, true);
  const h = rc({ state: 'NY', nyCondition: 'ny-hiv-infection-hiv-related-illness-or-aids', identified: '2026-09-18T15:00' });
  assert.equal(h.bandLabel, 'Report on form DOH-4189');
  assert.equal(rc({ state: 'NY', caCondition: 'ca-anaplasmosis', identified: '2026-09-18T15:00' }).valid, false);
});

// spec-v1395: New Jersey -- immediate by phone, or by the next business day; pertussis is next business day.
test('reportable: NJ measles is immediate; pertussis is next business day; Lyme is eCR only', () => {
  assert.equal(rc({ state: 'NJ', njCondition: 'nj-measles', identified: '2026-09-18T15:00' }).bandLabel, 'Report now');
  const p = rc({ state: 'NJ', njCondition: 'nj-pertussis', identified: '2026-09-18T15:00' });
  assert.equal(p.dueAt, '2026-09-21T15:00');
  assert.match(p.readingNote, /By the next business day/);
  assert.equal(rc({ state: 'NJ', njCondition: 'nj-lyme-disease', identified: '2026-09-18T15:00' }).bandLabel, 'Report by eCR');
  assert.match(rc({ state: 'NJ', njCondition: 'nj-tuberculosis', identified: '2026-09-18T15:00' }).band, /New Jersey Department of Health/);
  assert.equal(NJ_CONDITIONS.filter((c) => c.cls === 'immediate-phone').length, 22);
});

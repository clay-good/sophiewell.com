// spec-v1396: hospital nurse-to-patient ratio check and the California workplace violence report clock.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { nurseStaffingRatioCheck as nsr } from '../../lib/nurse-staffing-ratio-check-v1396.js';
import { caWpvReportClock as wpv } from '../../lib/ca-wpv-report-clock-v1396.js';
import { mandatoryOvertimeCheck as ot } from '../../lib/mandatory-overtime-check-v1396.js';

test('nsr: CA ED, 12 patients and 3 nurses, one the triage RN -- 1 short', () => {
  const r = nsr({ state: 'CA', unit: 'ed', patients: '12', nurses: '3', notCounted: '1' });
  assert.equal(r.short, 1);
  assert.equal(r.bandLabel, '1 short');
});

test('nsr: CA med-surg at exactly 1:5 meets', () => {
  assert.equal(nsr({ state: 'CA', unit: 'medsurg', patients: '10', nurses: '2', notCounted: '0' }).short, 0);
  assert.equal(nsr({ state: 'CA', unit: 'medsurg', patients: '11', nurses: '2', notCounted: '0' }).short, 1);
});

test('nsr: CA acute psychiatric hospital -- 1:6 adults, 1:5 under 18, cited to 71215.1', () => {
  const adult = nsr({ state: 'CA', unit: 'aph-adult', patients: '13', nurses: '3', notCounted: '1' });
  assert.equal(adult.required, 3);
  assert.equal(adult.short, 1);
  assert.match(adult.band, /71215\.1\(h\)\(1\)/);
  assert.match(adult.notes.join(' '), /no more than half/);
  assert.match(adult.notes.join(' '), /180 days/);
  assert.match(adult.averagingNote, /71215\.1 forbids averaging/);
  const minor = nsr({ state: 'CA', unit: 'aph-minor', patients: '10', nurses: '2', notCounted: '0' });
  assert.equal(minor.required, 2);
  assert.equal(minor.short, 0);
  assert.equal(nsr({ state: 'CA', unit: 'aph-minor', patients: '11', nurses: '2', notCounted: '0' }).short, 1);
  assert.doesNotMatch(nsr({ state: 'CA', unit: 'psych', patients: '6', nurses: '1', notCounted: '0' }).notes.join(' '), /71215/);
});

test('nsr: New Jersey and Texas are not offered', () => {
  assert.equal(nsr({ state: 'NJ', patients: '4', nurses: '2', notCounted: '0' }).valid, false);
  assert.equal(nsr({ state: 'TX', patients: '4', nurses: '2', notCounted: '0' }).valid, false);
});

test('nsr: NY ICU is 1 RN per 2 by acuity; a blank not-in-ratio count is asked, never zero', () => {
  const r = nsr({ state: 'NY', patients: '5', nurses: '2', notCounted: '0' });
  assert.equal(r.required, 3);
  assert.match(r.notes.join(' '), /acuity, not location/);
  assert.equal(nsr({ state: 'CA', unit: 'ed', patients: '12', nurses: '3' }).valid, false);
});

const BASE = { force: 'yes', weapon: 'no', severe: 'no', urgent: 'no', knownAt: '2026-09-18T22:00' };

test('wpv: force by a patient is reportable within 72 hours; a weapon makes it 24', () => {
  assert.equal(wpv({ ...BASE, perpetrator: 'patient' }).dueAt, '2026-09-21T22:00');
  assert.equal(wpv({ ...BASE, perpetrator: 'stranger', weapon: 'yes' }).dueAt, '2026-09-19T22:00');
  assert.equal(wpv({ ...BASE, perpetrator: 'patient', severe: 'yes' }).bandLabel, 'Report to Cal/OSHA within 24 hours');
});

test('wpv: force by a coworker without a weapon is not a 3342(g) report; the type is named', () => {
  const r = wpv({ ...BASE, perpetrator: 'coworker' });
  assert.equal(r.reportable, false);
  assert.match(r.typeNote, /Type 3/);
  assert.equal(wpv({ ...BASE, perpetrator: 'patient', knownAt: '' }).valid, false);
});

test('overtime: chronic short staffing is not permitted in all three states', () => {
  for (const state of ['NY', 'NJ', 'TX']) assert.equal(ot({ state, situation: 'chronic' }).permitted, false);
});

test('overtime: NY needs a voluntary effort first for every exception; TX only for the unforeseen one', () => {
  assert.equal(ot({ state: 'NY', situation: 'declaration', voluntaryTried: 'no' }).permitted, false);
  assert.equal(ot({ state: 'TX', situation: 'declaration', voluntaryTried: 'no' }).permitted, true);
  assert.equal(ot({ state: 'TX', situation: 'unforeseen', voluntaryTried: 'no' }).permitted, false);
  assert.match(ot({ state: 'TX', situation: 'procedure', voluntaryTried: 'yes' }).conditions.join(' '), /On-call time/);
  assert.equal(ot({ state: 'NJ', situation: 'unforeseen', voluntaryTried: 'yes' }).permitted, true);
});

// spec-v1396: New Jersey's rule N.J.A.C. 8:43E-8 -- disasters waive the efforts; one hour for dependents.
test('overtime: NJ disaster waives reasonable efforts; dependent-care hour; four efforts named', () => {
  const d = ot({ state: 'NJ', situation: 'declaration', voluntaryTried: 'no' });
  assert.equal(d.permitted, true);
  assert.match(d.band, /need not first exhaust/);
  assert.match(d.conditions.join(' '), /up to one hour/);
  assert.match(ot({ state: 'NJ', situation: 'unforeseen', voluntaryTried: 'no' }).band, /Reasonable efforts are four/);
  assert.match(ot({ state: 'NJ', situation: 'chronic' }).band, /90 days or more/);
});

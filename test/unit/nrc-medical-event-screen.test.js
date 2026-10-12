// spec-v1635 tool 29: NRC medical event screen (10 CFR 35.3045).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { nrcMedicalEventScreen as d } from '../../lib/nrc-medical-event-screen-v1635.js';

const base = { patientIntervention: 'no', wrongAdministration: 'none' };
const met = (extra) => Object.fromEntries(d({ ...base, ...extra }).tests.map((t) => [t.test, t.met]));

test('(a)(1)(i): the threshold AND one of the percent limbs', () => {
  assert.deepEqual(met({ doseKind: 'effective', doseRem: 8, prescribed: 100, delivered: 125 }), { '(a)(1)(i)': true });
  assert.deepEqual(met({ doseKind: 'effective', doseRem: 8, prescribed: 100, delivered: 120 }), { '(a)(1)(i)': true }); // 20 percent or more
  assert.deepEqual(met({ doseKind: 'effective', doseRem: 8, prescribed: 100, delivered: 110 }), { '(a)(1)(i)': false });
  assert.deepEqual(met({ doseKind: 'effective', doseRem: 5, prescribed: 100, delivered: 150 }), { '(a)(1)(i)': false }); // "more than" 5 rem
  assert.deepEqual(met({ doseKind: 'organ', doseRem: 51, outsideRange: 'yes' }), { '(a)(1)(i)': true });
  assert.deepEqual(met({ doseKind: 'skin', doseRem: 60, prescribedFraction: 200, deliveredFraction: 300 }), { '(a)(1)(i)': true });
  assert.deepEqual(met({ doseKind: 'skin', doseRem: 60, prescribedFraction: 200, deliveredFraction: 290 }), { '(a)(1)(i)': false });
  // Underdose counts: the rule says "differs".
  assert.deepEqual(met({ doseKind: 'effective', doseRem: 8, prescribed: 100, delivered: 75 }), { '(a)(1)(i)': true });
});

test('over the threshold with no percent limb entered is incomplete, not negative', () => {
  const r = d({ ...base, doseKind: 'effective', doseRem: 8 });
  assert.deepEqual([r.flag, r.reportable, r.tests[0].met], ['incomplete', null, null]);
  assert.match(r.band, /not a negative screen/);
});

test('(a)(1)(ii): a wrong administration needs only the threshold', () => {
  assert.equal(met({ wrongAdministration: 'wrong-individual', doseKind: 'effective', doseRem: 6 })['(a)(1)(ii)'], true);
  assert.equal(met({ wrongAdministration: 'wrong-route', doseKind: 'organ', doseRem: 50 })['(a)(1)(ii)'], false); // "exceeds" 50
  assert.equal(met({ wrongAdministration: 'leaking-source', doseKind: 'organ', doseRem: 50.1 })['(a)(1)(ii)'], true);
});

test('(a)(1)(iii): 50 rem or more AND 50 percent or more over the expected dose', () => {
  assert.deepEqual(met({ otherSiteDoseRem: 120, otherSiteExpectedRem: 60 }), { '(a)(1)(iii)': true });
  assert.deepEqual(met({ otherSiteDoseRem: 150, otherSiteExpectedRem: 100 }), { '(a)(1)(iii)': true }); // exactly 50 and 50%
  assert.deepEqual(met({ otherSiteDoseRem: 140, otherSiteExpectedRem: 100 }), { '(a)(1)(iii)': false });
  assert.deepEqual(met({ otherSiteDoseRem: 260, otherSiteExpectedRem: 200 }), { '(a)(1)(iii)': false }); // 60 rem but 30%
  assert.deepEqual(met({ otherSiteDoseRem: 55, otherSiteExpectedRem: 0 }), { '(a)(1)(iii)': true });
});

test('patient intervention: out of (a), reportable under (b) only with permanent damage', () => {
  const yes = d({ patientIntervention: 'yes', permanentDamage: 'yes', discovered: '2026-12-31' });
  assert.deepEqual([yes.reportable, yes.telephoneBy, yes.writtenReportBy], [true, '2027-01-01', '2027-01-15']);
  const no = d({ patientIntervention: 'yes', permanentDamage: 'no', discovered: '2026-12-31' });
  assert.deepEqual([no.reportable, no.telephoneBy], [false, undefined]);
  assert.match(d({ patientIntervention: 'yes' }).message, /^Choose whether a physician/);
});

test('the clocks appear only when an event is met', () => {
  const r = d({ ...base, doseKind: 'effective', doseRem: 8, prescribed: 100, delivered: 125, discovered: '2026-10-09' });
  assert.deepEqual([r.telephoneBy, r.writtenReportBy], ['2026-10-10', '2026-10-24']);
  assert.match(r.notes.join(' '), /24 hours after discovery/);
  assert.equal(d({ ...base, doseKind: 'effective', doseRem: 8, prescribed: 100, delivered: 110, discovered: '2026-10-09' }).telephoneBy, undefined);
});

test('refusals', () => {
  assert.match(d({}).message, /^Choose whether the event resulted from intervention/);
  assert.match(d({ patientIntervention: 'no' }).message, /^Choose whether a wrong drug/);
  assert.match(d(base).message, /^Enter the dose difference/);
  assert.match(d({ ...base, doseRem: 8 }).message, /^Choose the kind of dose/);
  assert.match(d({ ...base, doseKind: 'effective', doseRem: 8, prescribed: 100 }).message, /^Enter the delivered total/);
  assert.match(d({ ...base, otherSiteDoseRem: 60 }).message, /^Enter the dose expected/);
  assert.match(d({ ...base, doseKind: 'effective', doseRem: 8, discovered: 'x' }).message, /^Enter the discovery date/);
  assert.equal(d(null).valid, false);
});

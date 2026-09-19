// spec-v1391: who decides -- surrogates, proxies, MOLST, and DNR.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { nyFhcdaSurrogate as ny } from '../../lib/ny-fhcda-surrogate-v1391.js';
import { caSurrogateDecisionmaker as ca } from '../../lib/ca-surrogate-decisionmaker-v1391.js';
import { txSurrogateConsentHierarchy as tx } from '../../lib/tx-surrogate-consent-hierarchy-v1391.js';
import { nyHealthCareProxyCheck as hcp } from '../../lib/ny-health-care-proxy-check-v1391.js';
import { nyMolstChecklistRouter as molst } from '../../lib/ny-molst-checklist-router-v1391.js';
import { txOohDnrValidity as ooh } from '../../lib/tx-ooh-dnr-validity-v1391.js';
import { txInHospitalDnrPathway as ihd } from '../../lib/tx-in-hospital-dnr-pathway-v1391.js';

test('ny: a domestic partner ranks with a spouse, above an adult child', () => {
  const r = ny({ proxy: 'no', article17a: 'no', guardian: 'no', spouse: 'yes', child: 'yes' });
  assert.equal(r.surrogate, 'spouse');
  assert.match(r.band, /domestic partner ranks with a spouse/);
});

test('ny: a proxy agent decides and the list stops; 17-A goes to SCPA 1750-b', () => {
  assert.equal(ny({ proxy: 'yes' }).surrogate, 'agent');
  assert.match(ny({ proxy: 'no', article17a: 'yes' }).band, /1750-b/);
});

test('ny: an unanswered higher class is asked, not skipped', () => {
  const r = ny({ proxy: 'no', article17a: 'no', spouse: 'yes' });
  assert.equal(r.valid, false);
  assert.match(r.message, /Article 81 guardian/);
});

test('ca: three eligible relatives are listed and never ranked', () => {
  const r = ca({ designated: 'no', agent: 'no', conservator: 'no', spouse: 'yes', adultChild: 'yes', sibling: 'yes' });
  assert.deepEqual(r.eligible, ['Spouse or domestic partner', 'Adult child', 'Adult sibling']);
  assert.match(r.band, /not ranked/);
  assert.doesNotMatch(`${r.band} ${r.bandLabel}`, /first|highest|priority|decides:/i);
  assert.match(r.duty, /special care and concern/);
});

test('ca: 4712(a) is ordered -- a named surrogate outranks the agent', () => {
  const r = ca({ designated: 'yes', agent: 'yes' });
  assert.equal(r.decider, 'designated');
  assert.match(r.note, /60 days/);
  assert.equal(ca({ designated: 'no', agent: 'yes' }).decider, 'agent');
});

test('tx: a surrogate may not consent to ECT, and 313.004 is named', () => {
  const r = tx({ treatment: 'ect', inmate: 'no', guardian: 'no', mpoa: 'no', spouse: 'yes' });
  assert.equal(r.mayConsent, false);
  assert.match(r.band, /313\.004\(d\)\(2\)/);
});

test('tx: inmate bars and the 120-day limit; spouse before adult children', () => {
  assert.equal(tx({ treatment: 'psychotropic', inmate: 'yes' }).mayConsent, false);
  assert.notEqual(tx({ treatment: 'psychotropic', inmate: 'no', guardian: 'no', mpoa: 'no', spouse: 'yes' }).mayConsent, false);
  const r = tx({ treatment: 'general', inmate: 'yes', guardian: 'no', mpoa: 'no', spouse: 'yes', children: 'yes' });
  assert.equal(r.decider, 'spouse');
  assert.match(r.inmateNote, /120th day/);
});

test('tx: no surrogate -- a second physician concurs; life-sustaining cites 166.039(e)', () => {
  const none = { inmate: 'no', guardian: 'no', mpoa: 'no', spouse: 'no', children: 'no', parents: 'no', relative: 'no' };
  assert.match(tx({ ...none, treatment: 'general' }).band, /313\.004\(a-1\)/);
  assert.match(tx({ ...none, treatment: 'life-sustaining' }).band, /166\.039\(e\)/);
});

test('hcp: the agent as a witness is a defect, and it is named', () => {
  const r = hcp({ facility: 'none', signedDated: 'yes', twoWitnesses: 'yes', agentWitnessed: 'yes' });
  assert.match(r.band, /^Defect: the agent signed as a witness/);
  assert.equal(r.defects.length, 1);
});

test('hcp: OMH hospital needs a psychiatric witness; a related employee may serve', () => {
  const base = { facility: 'omh-hospital', signedDated: 'yes', twoWitnesses: 'yes', agentWitnessed: 'no', unaffiliated: 'yes', psychWitness: 'yes' };
  assert.equal(hcp({ ...base, agentRole: 'staff', related: 'yes' }).defects.length, 0);
  assert.equal(hcp({ ...base, agentRole: 'staff', related: 'no' }).defects.length, 1);
  assert.equal(hcp({ ...base, agentRole: 'none', psychWitness: 'no' }).defects.length, 1);
  assert.equal(hcp({ ...base, agentRole: 'staff' }).valid, false);
});

test('molst: a person with I/DD, no capacity, no proxy gets the OPWDD checklist', () => {
  const r = molst({ age: 'adult', dd: 'yes', capacity: 'no', proxy: 'no' });
  assert.equal(r.checklist, 'opwdd');
  assert.match(r.formNote, /June 2025/);
  assert.equal(molst({ age: 'adult', dd: 'no', capacity: 'no', proxy: 'no', setting: 'facility', surrogate: 'yes' }).checklist, 3);
  assert.equal(molst({ age: 'adult', dd: 'no', capacity: 'no', proxy: 'no', setting: 'community' }).checklist, 5);
  assert.equal(molst({ age: 'minor', dd: 'no' }).checklist, 6);
  assert.equal(molst({ age: 'adult', dd: 'no', capacity: 'yes' }).checklist, 1);
});

test('ooh: a notary works only for the person signing; a minor needs a terminal diagnosis', () => {
  const ok = { witnessing: 'notary', physicianSigned: 'yes', revoked: 'no' };
  assert.equal(ooh({ ...ok, executor: 'self' }).honor, true);
  assert.match(ooh({ ...ok, executor: 'relative' }).band, /notary replaces the witnesses only/);
  assert.match(ooh({ executor: 'minor-parent', witnessing: 'two-qualified', physicianSigned: 'yes', revoked: 'no', terminalDx: 'no' }).band, /166\.085\(b\)/);
});

test('ooh: a valid order that the person revokes is not honored, whatever their competency', () => {
  const r = ooh({ executor: 'self', witnessing: 'two-qualified', physicianSigned: 'yes', revoked: 'yes' });
  assert.equal(r.honor, false);
  assert.match(r.band, /regardless of mental state or competency/);
});

test('ihd: imminent-death order is valid and owes notice; missed notice does not void it', () => {
  const r = ihd({ basis: 'imminent', dated: 'yes', notContrary: 'met', deathImminent: 'met', appropriate: 'met', patientCompetent: 'no' });
  assert.equal(r.verdict, 'valid');
  assert.match(r.notice, /reasonably diligent effort/);
  assert.match(r.notice, /does not make the order invalid \(166\.204\(b\)\)/);
});

test('ihd: undated is invalid; an unassessed concurrence is incomplete', () => {
  assert.equal(ihd({ basis: 'directive', dated: 'no' }).verdict, 'invalid');
  const r = ihd({ basis: 'concurred', dated: 'yes', incompetent: 'met', agreed: 'met' });
  assert.equal(r.verdict, null);
  assert.match(r.band, /Still needed: concurred in by another physician/);
});

// spec-v1391: the 90-day review from DOH-5003 Section I; a lapsed review does not void the form.
test('molst: review at least every 90 days; lapsed review still valid; I/DD review by a physician only', () => {
  const r = molst({ age: 'adult', dd: 'no', capacity: 'yes' });
  assert.match(r.reviewNote, /at least every 90 days/);
  assert.match(r.reviewNote, /still valid and must be followed/);
  assert.doesNotMatch(r.reviewNote, /only a physician/);
  assert.match(molst({ age: 'adult', dd: 'yes', capacity: 'no', proxy: 'no' }).reviewNote, /only a physician/);
});

// spec-v1396: staffing committee, Texas workplace violence plan audit, Texas Safe Harbor, nursing home staffing.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { staffingCommitteeCheck as sc } from '../../lib/staffing-committee-check-v1396.js';
import { txWorkplaceViolencePlanAudit as wv, ITEMS } from '../../lib/tx-workplace-violence-plan-audit-v1396.js';
import { txSafeHarborDecisionAid as sh } from '../../lib/tx-safe-harbor-decision-aid-v1396.js';
import { nursingHomeStaffingCheck as nh } from '../../lib/nursing-home-staffing-check-v1396.js';

const TX_OK = { state: 'TX', peerSelected: 'yes', cnoVoting: 'yes', quarterly: 'yes', semiannual: 'yes' };

test('committee: Texas needs 60% direct-care RNs; New York half frontline', () => {
  assert.equal(sc({ ...TX_OK, members: '10', frontline: '6' }).meets, true);
  assert.equal(sc({ ...TX_OK, members: '10', frontline: '5' }).meets, false);
  assert.equal(sc({ state: 'NY', members: '10', frontline: '5', peerSelected: 'yes', planByJuly: 'yes' }).meets, true);
  assert.equal(sc({ state: 'NY', members: '10', frontline: '4', peerSelected: 'yes', planByJuly: 'yes' }).meets, false);
});

test('committee: Texas cadence and the CNO vote; blanks are asked', () => {
  assert.match(sc({ ...TX_OK, members: '10', frontline: '6', quarterly: 'no' }).band, /quarterly/);
  assert.equal(sc({ state: 'TX', members: '10', frontline: '6' }).valid, false);
  assert.equal(sc({ ...TX_OK, members: '', frontline: '6' }).valid, false);
});

test('wv audit: all blank is incomplete; a missing element is named', () => {
  assert.equal(wv({}).complete, false);
  const all = Object.fromEntries(ITEMS.map(([k]) => [k, 'yes']));
  assert.equal(wv(all).complete, true);
  assert.match(wv({ ...all, reassign: 'no' }).band, /331\.004\(b\)\(8\)/);
});

test('safe harbor: oral request lists the seven items; declining pending review is not binding protection', () => {
  const r = sh({ canWrite: 'no', plan: 'refuse' });
  assert.equal(r.oralItems.length, 7);
  assert.match(r.protections.join(' '), /not binding/);
  assert.match(sh({ canWrite: 'yes', plan: 'proceed', physicianOrder: 'yes' }).orderNote, /medical staff or medical director/);
  assert.equal(sh({ plan: 'proceed' }).valid, false);
});

test('nursing home: NY 3.5/2.2/1.1 and CA 3.5/2.4 per resident per day; distinct-part SNFs excepted', () => {
  assert.equal(nh({ state: 'NY', census: '100', totalHours: '350', aideHours: '220', licensedHours: '110' }).meets, true);
  assert.equal(nh({ state: 'NY', census: '100', totalHours: '340', aideHours: '230', licensedHours: '110' }).meets, false);
  assert.equal(nh({ state: 'CA', census: '100', distinctPart: 'no', totalHours: '360', aideHours: '230' }).meets, false);
  assert.equal(nh({ state: 'CA', census: '100', distinctPart: 'yes' }).meets, null);
});

test('nursing home: NJ shift ratios, half the evening staff CNAs', () => {
  assert.equal(nh({ state: 'NJ', census: '40', shift: 'day', cnas: '4', licensed: '0' }).meets, false);
  assert.equal(nh({ state: 'NJ', census: '40', shift: 'day', cnas: '5', licensed: '0' }).meets, true);
  assert.equal(nh({ state: 'NJ', census: '40', shift: 'evening', cnas: '1', licensed: '3' }).meets, false);
  assert.equal(nh({ state: 'NJ', census: '40', shift: 'night', cnas: '3', licensed: '0' }).meets, true);
  assert.equal(nh({ state: 'NJ', census: '', shift: 'night', cnas: '3', licensed: '0' }).valid, false);
});

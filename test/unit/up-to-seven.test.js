// spec-v586: the up-to-seven (Metroticket) criteria.
//
// The load-bearing tests are that only the largest tumor's size enters the sum, and that Milan is fully
// contained within up-to-seven -- asserted by enumeration, not by assertion.

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  upToSeven, milanStatus, UP_TO_SEVEN_LIMIT, FIVE_YEAR_SURVIVAL_WITHIN,
  MILAN_SINGLE_MAX_CM, MILAN_MULTI_MAX_CM, MILAN_MAX_NODULES,
} from '../../lib/up-to-seven-v586.js';

const at = (tumorCount, largestTumorCm, over = {}) => upToSeven({
  tumorCount, largestTumorCm, grossVascularInvasion: 'no', extrahepaticSpread: 'no', ...over,
});

test('the sum is the largest diameter plus the tumor count', () => {
  assert.equal(at(1, 6).sum, 7);
  assert.equal(at(4, 3).sum, 7);
  assert.equal(at(3, 4.9).sum, 7.9);
});

test('the limit is inclusive', () => {
  assert.equal(at(1, 6).withinUpToSeven, true, `${UP_TO_SEVEN_LIMIT} exactly is within`);
  assert.equal(at(1, 6.1).withinUpToSeven, false);
});

// THE exchange rate.
test('size and number trade against each other at the same boundary', () => {
  const oneBig = at(1, 6);
  const fourSmall = at(4, 3);
  assert.equal(oneBig.sum, fourSmall.sum);
  assert.equal(oneBig.withinUpToSeven, fourSmall.withinUpToSeven);
  assert.match(oneBig.bandText, /exchange rate between size and number/);
});

// THE largest-only rule.
test('only the largest tumor size is an input at all', () => {
  // The API cannot accept the other diameters, which is the point: two patients with very different
  // total burden but the same largest tumor and count are indistinguishable to this criterion.
  const r = at(3, 4.9);
  assert.equal(r.sum, 7.9);
  assert.match(r.bandText, /Total tumor burden is not what this measures/);
});

// THE containment, by enumeration.
test('every Milan-eligible patient is also within up-to-seven', () => {
  let checked = 0;
  for (let count = 1; count <= MILAN_MAX_NODULES; count += 1) {
    for (let tenths = 1; tenths <= MILAN_SINGLE_MAX_CM * 10; tenths += 1) {
      const cm = tenths / 10;
      if (!milanStatus(count, cm)) continue;
      checked += 1;
      const r = at(count, cm);
      assert.equal(r.withinMilan, true, `Milan ${count} x ${cm}`);
      assert.equal(r.withinUpToSeven, true, `Milan-eligible ${count} x ${cm} must be within up-to-seven`);
    }
  }
  assert.ok(checked > 50, `enumerated ${checked} Milan-eligible combinations`);
});

test('the reverse containment does not hold, which is the point of the extended criteria', () => {
  const r = at(1, 6);
  assert.equal(r.withinMilan, false);
  assert.equal(r.withinUpToSeven, true);
  assert.match(r.bandText, /exactly the group these extended criteria were built to describe/);
});

test('the Milan thresholds used for the comparison are the published ones', () => {
  assert.equal(milanStatus(1, MILAN_SINGLE_MAX_CM), true);
  assert.equal(milanStatus(1, MILAN_SINGLE_MAX_CM + 0.1), false);
  assert.equal(milanStatus(MILAN_MAX_NODULES, MILAN_MULTI_MAX_CM), true);
  assert.equal(milanStatus(MILAN_MAX_NODULES + 1, MILAN_MULTI_MAX_CM), false);
  assert.equal(milanStatus(2, MILAN_MULTI_MAX_CM + 0.1), false);
});

// Disqualifiers.
test('gross vascular invasion or extrahepatic spread overrides the sum', () => {
  const gvi = at(1, 2, { grossVascularInvasion: 'yes' });
  assert.equal(gvi.sumWithinLimit, true);
  assert.equal(gvi.withinUpToSeven, false);
  assert.equal(gvi.withinMilan, false);
  assert.equal(gvi.disqualifiedByInvasionOrSpread, true);
  assert.equal(at(1, 2, { extrahepaticSpread: 'yes' }).withinUpToSeven, false);
});

// THE unmeasurable condition.
test('the microvascular-invasion gap is stated in every result', () => {
  const r = at(1, 3);
  assert.match(r.bandText, /CANNOT BE ASSESSED BEFORE TRANSPLANT/);
  assert.match(r.bandText, /turned out on the explant/i);
  assert.match(r.note, /sampling bias/);
});

// The withheld criteria.
test('UCSF is named and explicitly not computed', () => {
  const r = at(1, 3);
  assert.match(r.bandText, /NOT computed here/);
  assert.match(r.bandText, /diverge/);
  assert.equal('withinUcsf' in r, false);
});

// Outcome reporting.
test('the survival figure is reported only for the group it describes', () => {
  assert.equal(at(1, 3).fiveYearSurvivalPercent, FIVE_YEAR_SURVIVAL_WITHIN);
  assert.equal(at(1, 9).fiveYearSurvivalPercent, null);
});

// Input handling.
test('the inputs are validated', () => {
  assert.equal(upToSeven({}).valid, false);
  assert.match(upToSeven({ tumorCount: '1.5', largestTumorCm: '3', grossVascularInvasion: 'no', extrahepaticSpread: 'no' }).message, /whole number/);
  assert.match(upToSeven({ tumorCount: '0', largestTumorCm: '3', grossVascularInvasion: 'no', extrahepaticSpread: 'no' }).message, /greater than 0/);
});

test('the scope note refuses the listing decision and the treatment choice', () => {
  const r = at(1, 3);
  assert.match(r.note, /not a listing decision/);
  assert.match(r.note, /MELD allocation and exception points/);
  assert.match(r.note, /does not decide between transplantation, resection, ablation/);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { noiseExposure as n, NIOSH_LIMIT_DBA, NIOSH_EXCHANGE_DB, OSHA_LIMIT_DBA, OSHA_EXCHANGE_DB, OSHA_ACTION_LEVEL_DBA } from '../../lib/noise-exposure-v886.js';

test('noise-exposure: the published limits and exchange rates', () => {
  assert.equal(NIOSH_LIMIT_DBA, 85);
  assert.equal(NIOSH_EXCHANGE_DB, 3);
  assert.equal(OSHA_LIMIT_DBA, 90);
  assert.equal(OSHA_EXCHANGE_DB, 5);
  assert.equal(OSHA_ACTION_LEVEL_DBA, 85);
});

test('noise-exposure: published allowable times reproduce', () => {
  // Each limit gives eight hours at its own level.
  assert.equal(n({ levelDba: 85 }).nioshMinutes, 480);
  assert.equal(n({ levelDba: 90 }).oshaMinutes, 480);
  // NIOSH halves every 3 dB; OSHA every 5.
  assert.equal(n({ levelDba: 88 }).nioshMinutes, 240);
  assert.equal(n({ levelDba: 95 }).oshaMinutes, 240);
  // The published pair everyone quotes.
  assert.equal(n({ levelDba: 100 }).nioshText, '15 min');
  assert.equal(n({ levelDba: 100 }).oshaText, '2 h');
  assert.equal(n({ levelDba: 95 }).nioshText, '47.6 min');
});

test('noise-exposure: both allowances are returned and neither is picked', () => {
  // The reason the tile exists.
  for (const level of [80, 95, 110]) {
    const r = n({ levelDba: level });
    assert.match(r.exchangeRateNote, /different exchange rates/);
    assert.match(r.exchangeRateNote, /neither is offered here as the answer/);
    assert.match(r.ceilingNote, /legal ceiling, not a safety threshold/);
    assert.match(r.cumulativeNote, /cumulative across every exposure/);
  }
});

test('noise-exposure: the gap between the two standards is named', () => {
  // Four hours at 95 dBA clears OSHA and not NIOSH.
  const r = n({ levelDba: 95, exposureHours: 4 });
  assert.equal(r.status, 'over-niosh-only');
  assert.match(r.band, /two standards disagreeing, not a rounding difference/);
  assert.equal(n({ levelDba: 95, exposureHours: 8 }).status, 'over-both');
  assert.equal(n({ levelDba: 80, exposureHours: 8 }).status, 'within-both');
  assert.equal(n({ levelDba: 80 }).status, 'no-duration');
});

test('noise-exposure: a protector rating is derated before it is credited', () => {
  const r = n({ levelDba: 100, protectorNrr: 33 });
  assert.equal(r.deratedBy, 13);
  assert.equal(r.effectiveDba, 87);
  assert.match(r.derateNote, /credited with 13 dB/);
  assert.match(r.derateNote, /laboratory number/);
  // The sentence prints even with no protector entered, because that is where the misread starts.
  assert.match(n({ levelDba: 100 }).derateNote, /worth 13 dB and not 33/);
  // A rating at or below 7 credits nothing.
  assert.equal(n({ levelDba: 100, protectorNrr: 7 }).deratedBy, 0);
});

test('noise-exposure: the action level is raised at or above 85 dBA', () => {
  assert.match(n({ levelDba: 85 }).actionLevelNote, /hearing conservation program is required/);
  assert.match(n({ levelDba: 85 }).actionLevelNote, /depends on the whole day/);
  assert.equal(n({ levelDba: 84 }).actionLevelNote, null);
  // Derating can take an exposure below the action level.
  assert.equal(n({ levelDba: 95, protectorNrr: 33 }).actionLevelNote, null);
});

test('noise-exposure: a missing or out-of-range level is refused', () => {
  assert.equal(n({}).valid, false);
  assert.match(n({}).message, /Enter the measured sound level/);
  assert.equal(n({ levelDba: 39 }).valid, false);
  assert.equal(n({ levelDba: 141 }).valid, false);
  assert.equal(n({ levelDba: 90, exposureHours: 25 }).valid, false);
  assert.equal(n({ levelDba: 90, protectorNrr: 41 }).valid, false);
});

test('noise-exposure: the documented example', () => {
  const r = n({ levelDba: '100' });
  assert.equal(r.nioshText, '15 min');
  assert.equal(r.oshaText, '2 h');
  assert.equal(r.abnormal, false);
});

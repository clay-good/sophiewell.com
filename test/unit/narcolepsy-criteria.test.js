import test from 'node:test';
import assert from 'node:assert/strict';
import { narcolepsyCriteria as nar } from '../../lib/narcolepsy-criteria-v855.js';

const SLEEPY = { dailySleepiness: true };

test('nar: the two routes into type 1', () => {
  assert.equal(nar({ ...SLEEPY, cataplexy: true, meanSleepLatency: 4, msltSoremps: 2 }).type, 1);
  assert.equal(nar({ ...SLEEPY, hypocretin: 70 }).type, 1);
  assert.equal(nar({ ...SLEEPY, hypocretin: 110 }).type, 1, '110 is at the line, not above it');
  assert.equal(nar({ ...SLEEPY, hypocretin: 111 }).type, null);
});

test('nar: cataplexy alone is not the diagnosis', () => {
  // The error the tile exists to prevent.
  const r = nar({ ...SLEEPY, cataplexy: true });
  assert.equal(r.type, null);
  assert.equal(r.criteriaMet, false);
  assert.ok(r.missing.includes('only half of one route'));
  assert.ok(r.cataplexyNote.includes('named the disease after it'));
  // Nor with a latency test that misses the threshold.
  assert.equal(nar({ ...SLEEPY, cataplexy: true, meanSleepLatency: 9, msltSoremps: 3 }).type, null);
  assert.equal(nar({ ...SLEEPY, cataplexy: true, meanSleepLatency: 4, msltSoremps: 1 }).type, null);
  // Once the hypocretin settles it, the note stands down.
  assert.equal(nar({ ...SLEEPY, cataplexy: true, hypocretin: 50 }).cataplexyNote, null);
});

test('nar: an overnight REM period may complete the pair', () => {
  const r = nar({ ...SLEEPY, meanSleepLatency: 5, msltSoremps: 1, psgSoremp: true, othersExcluded: true });
  assert.equal(r.effectiveSoremps, 2);
  assert.equal(r.type, 2);
  assert.ok(r.substitutionNote.includes('what makes this test positive'));
  // Without it, one is one short, and the tile says where the other might be.
  const short = nar({ ...SLEEPY, meanSleepLatency: 5, msltSoremps: 1, othersExcluded: true });
  assert.equal(short.type, null);
  assert.ok(short.missedSubstitutionNote.includes('worth checking'));
  // Two on the test already: the substitution is reported but claims nothing.
  const two = nar({ ...SLEEPY, meanSleepLatency: 5, msltSoremps: 2, psgSoremp: true, othersExcluded: true });
  assert.equal(two.effectiveSoremps, 3);
  assert.ok(!two.substitutionNote.includes('what makes this test positive'));
  assert.equal(two.missedSubstitutionNote, null);
});

test('nar: a low hypocretin is type 1 with no cataplexy', () => {
  const r = nar({ ...SLEEPY, hypocretin: 40 });
  assert.equal(r.type, 1);
  assert.ok(r.hypocretinNote.includes('even with no cataplexy'));
  assert.ok(r.route.includes('settles the type on its own'));
  assert.equal(nar({ ...SLEEPY, cataplexy: true, hypocretin: 40 }).hypocretinNote, null);
});

test('nar: type 2 will not be returned until other causes are excluded', () => {
  const pending = nar({ ...SLEEPY, meanSleepLatency: 4, msltSoremps: 2 });
  assert.equal(pending.type, null);
  assert.ok(pending.missing.includes('excluded'));
  assert.ok(pending.exclusionNote.includes('obstructive apnea'));
  assert.equal(nar({ ...SLEEPY, meanSleepLatency: 4, msltSoremps: 2, othersExcluded: true }).type, 2);
  // A hypocretin above the line does not block type 2; at or below it makes type 1.
  assert.equal(nar({ ...SLEEPY, meanSleepLatency: 4, msltSoremps: 2, othersExcluded: true, hypocretin: 300 }).type, 2);
  assert.equal(nar({ ...SLEEPY, meanSleepLatency: 4, msltSoremps: 2, othersExcluded: true, hypocretin: 60 }).type, 1);
});

test('nar: the three-month history gates both routes', () => {
  assert.equal(nar({ cataplexy: true, meanSleepLatency: 4, msltSoremps: 2 }).type, null);
  assert.equal(nar({ hypocretin: 50 }).type, null);
  assert.ok(nar({ hypocretin: 50 }).missing.includes('required for both types'));
});

test('nar: what is missing is named rather than returned as a bare no', () => {
  assert.ok(nar({ ...SLEEPY, meanSleepLatency: 12, msltSoremps: 3, othersExcluded: true }).missing.includes('8 minutes or less'));
  assert.ok(nar({ ...SLEEPY }).missing.includes('Neither the latency test nor the hypocretin'));
});

test('nar: validation', () => {
  assert.equal(nar({}).valid, false);
  assert.equal(nar(null).valid, false);
  assert.equal(nar({ ...SLEEPY, meanSleepLatency: 99 }).valid, false);
  assert.equal(nar({ ...SLEEPY, msltSoremps: 1.5 }).valid, false);
  assert.equal(nar({ ...SLEEPY, msltSoremps: 9 }).valid, false);
  assert.equal(nar({ ...SLEEPY, hypocretin: 9999 }).valid, false);
  assert.equal(nar({ ...SLEEPY }).valid, true);
});

test('nar: the documented example round-trips', () => {
  const r = nar({ dailySleepiness: 'true', meanSleepLatency: '5', msltSoremps: '1', psgSoremp: 'true', othersExcluded: 'true' });
  assert.equal(r.valid, true);
  assert.equal(r.type, 2);
  assert.ok(r.band.includes('type 2'));
  assert.ok(r.substitutionNote);
});

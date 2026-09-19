// spec-v1393: the PMP check rule and the acute-pain opioid day limit, by state.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pmpCheckRequired as pmp, PMP_STATES } from '../../lib/pmp-check-required-v1393.js';
import { acuteOpioidRxLimit as lim, RX_LIMIT_STATES } from '../../lib/acute-opioid-rx-limit-v1393.js';

const RX = { drugClass: 'opioid', schedule: 'II', setting: 'outpatient', first: 'first', days: '10', refills: 'no', forPain: 'yes' };

test('pmp: each state requires a check for a first Schedule II opioid for pain', () => {
  for (const state of ['NY', 'NJ', 'CA', 'TX']) assert.equal(pmp({ ...RX, state }).verdict, 'required', state);
  assert.deepEqual(PMP_STATES.map((s) => s.value), ['NY', 'NJ', 'CA', 'TX']);
});

test('pmp: carisoprodol is required in Texas by class and in New York by schedule; New Jersey does not list it', () => {
  const c = { ...RX, drugClass: 'carisoprodol', schedule: 'IV', forPain: '' };
  assert.equal(pmp({ ...c, state: 'TX' }).verdict, 'required');
  assert.equal(pmp({ ...c, state: 'NY' }).verdict, 'required');
  assert.equal(pmp({ ...c, state: 'NJ' }).verdict, 'not-required');
});

test('pmp: one exemption per state', () => {
  assert.equal(pmp({ ...RX, state: 'NY', setting: 'ed', days: '5' }).verdict, 'exempt');
  assert.equal(pmp({ ...RX, state: 'NY', setting: 'ed', days: '6' }).verdict, 'required');
  assert.equal(pmp({ ...RX, state: 'NJ', setting: 'procedure', days: '5', within24: 'yes' }).verdict, 'exempt');
  assert.equal(pmp({ ...RX, state: 'NJ', setting: 'procedure', days: '5', within24: 'no' }).verdict, 'required');
  assert.equal(pmp({ ...RX, state: 'CA', setting: 'ed', days: '7', refills: 'no' }).verdict, 'exempt');
  assert.equal(pmp({ ...RX, state: 'CA', setting: 'ed', days: '7', refills: 'yes', buprenorphine: 'no' }).verdict, 'required');
  assert.equal(pmp({ ...RX, state: 'CA', setting: 'ed', days: '30', buprenorphine: 'yes' }).verdict, 'exempt');
  const tx = pmp({ ...RX, state: 'TX', setting: 'cancer-sickle' });
  assert.equal(tx.verdict, 'exempt');
  assert.match(tx.record, /prescription record/);
});

// A blank buprenorphine answer is asked where it alone decides the California ED exemption, and not
// where a nonrefillable supply of seven days or less is exempt either way.
test('pmp: California emergency department asks a blank buprenorphine answer instead of reading it as no', () => {
  const blank = pmp({ ...RX, state: 'CA', setting: 'ed', days: '7', refills: 'yes' });
  assert.equal(blank.valid, false);
  assert.match(blank.message, /buprenorphine/);
  assert.equal(pmp({ ...RX, state: 'CA', setting: 'ed', days: '30' }).valid, false);
  assert.equal(pmp({ ...RX, state: 'CA', setting: 'ed', days: '7', refills: 'no' }).verdict, 'exempt');
});

test('pmp: New Jersey checks every emergency-department Schedule II for pain, and every three months while continuing', () => {
  assert.equal(pmp({ ...RX, state: 'NJ', setting: 'ed', first: 'continuing', days: '3' }).verdict, 'required');
  const cont = pmp({ ...RX, state: 'NJ', first: 'continuing', days: '30', lastCheck: '2026-07-31' });
  assert.equal(cont.nextCheck, '2026-10-31');
  assert.equal(pmp({ ...RX, state: 'CA', first: 'continuing', days: '30', lastCheck: '2026-03-31' }).nextCheck, '2026-09-30');
});

test('pmp: Schedule V is outside New York and California; a stimulant is outside Texas', () => {
  assert.equal(pmp({ ...RX, state: 'NY', schedule: 'V', drugClass: 'other' }).verdict, 'not-required');
  assert.equal(pmp({ ...RX, state: 'CA', schedule: 'V', drugClass: 'other' }).verdict, 'not-required');
  assert.equal(pmp({ ...RX, state: 'TX', drugClass: 'stimulant' }).verdict, 'not-required');
});

test('pmp: no state, no class, or no days is refused', () => {
  assert.equal(pmp({ ...RX }).valid, false);
  assert.equal(pmp({ ...RX, state: 'NY', drugClass: '' }).valid, false);
  assert.equal(pmp({ ...RX, state: 'NY', days: '' }).valid, false);
  assert.equal(pmp({ ...RX, state: 'NJ', forPain: '' }).valid, false);
});

test('limit: only New York, New Jersey, and Texas are offered', () => {
  assert.deepEqual(RX_LIMIT_STATES.map((s) => s.value), ['NY', 'NJ', 'TX']);
  assert.equal(lim({ state: 'CA', category: 'acute', days: '3', initial: 'yes' }).valid, false);
});

test('limit: 7, 5, and 10 days, and Texas bars refills on every acute-pain prescription', () => {
  assert.equal(lim({ state: 'NY', category: 'acute', days: '7', initial: 'yes' }).verdict, 'within');
  assert.match(lim({ state: 'NY', category: 'acute', days: '10', initial: 'yes' }).band, /3 over the 7-day limit/);
  assert.equal(lim({ state: 'NJ', category: 'acute', days: '6', initial: 'yes' }).verdict, 'over');
  assert.equal(lim({ state: 'TX', category: 'acute', days: '10', initial: 'no', refills: 'no' }).verdict, 'within');
  assert.equal(lim({ state: 'TX', category: 'acute', days: '5', initial: 'no', refills: 'yes' }).verdict, 'over');
});

test('limit: New Jersey immediate-release and the four-day subsequent rule', () => {
  assert.equal(lim({ state: 'NJ', category: 'acute', days: '3', initial: 'yes', extendedRelease: 'yes' }).verdict, 'over');
  assert.equal(lim({ state: 'NJ', category: 'acute', days: '5', initial: 'no', previous: '2026-09-15', today: '2026-09-18' }).verdict, 'over');
  assert.equal(lim({ state: 'NJ', category: 'acute', days: '5', initial: 'no', previous: '2026-09-14', today: '2026-09-18' }).verdict, 'within');
});

test('limit: each state names its own exceptions', () => {
  assert.equal(lim({ state: 'NJ', category: 'long-term-care', days: '30', initial: 'yes' }).verdict, 'exempt');
  assert.equal(lim({ state: 'NY', category: 'long-term-care', days: '30', initial: 'yes' }).verdict, 'over');
  assert.equal(lim({ state: 'TX', category: 'sud', days: '30', initial: 'yes' }).verdict, 'exempt');
  assert.equal(lim({ state: 'NY', category: 'cancer', days: '30', initial: 'yes' }).verdict, 'exempt');
});

// --- Texas delegation (Occ. Code 157.0511) ----------------------------------
import { txAprnPaControlledDelegation as del } from '../../lib/tx-aprn-pa-controlled-delegation-v1393.js';

const D = { days: '30', refill: 'no', under2: 'no' };

test('delegation: Schedule II is setting-limited', () => {
  assert.equal(del({ ...D, schedule: 'II', setting: 'clinic' }).verdict, 'no');
  assert.equal(del({ ...D, schedule: 'II', setting: 'hospital-short', hospitalPolicy: 'yes' }).verdict, 'no');
  assert.equal(del({ ...D, schedule: 'II', setting: 'hospital-ed', hospitalPolicy: 'yes' }).verdict, 'yes');
  assert.equal(del({ ...D, schedule: 'II', setting: 'hospital-inpatient' }).verdict, 'unassessed');
  assert.equal(del({ ...D, schedule: 'II', setting: 'hospice' }).verdict, 'yes');
});

test('delegation: Schedules III to V, 90 days including refills, consultations charted', () => {
  assert.equal(del({ ...D, schedule: 'IV', setting: 'clinic', days: '90' }).verdict, 'yes');
  assert.equal(del({ ...D, schedule: 'IV', setting: 'clinic', days: '91' }).verdict, 'no');
  assert.equal(del({ ...D, schedule: 'III', setting: 'clinic', refill: 'yes' }).verdict, 'unassessed');
  assert.equal(del({ ...D, schedule: 'III', setting: 'clinic', refill: 'yes', refillConsulted: 'no' }).verdict, 'no');
  assert.equal(del({ ...D, schedule: 'V', setting: 'clinic', under2: 'yes', under2Consulted: 'yes' }).verdict, 'yes');
});

// A blank refills or extended-release answer is asked when it would change the answer, never read as "no".
test('limit and PMP: blank refills / extended-release are asked, not assumed', () => {
  assert.equal(lim({ state: 'TX', category: 'acute', days: '10', initial: 'no' }).valid, false);
  assert.equal(lim({ state: 'TX', category: 'acute', days: '12', initial: 'no' }).verdict, 'over');
  assert.equal(lim({ state: 'NJ', category: 'acute', days: '3', initial: 'yes' }).valid, false);
  assert.equal(lim({ state: 'NJ', category: 'acute', days: '3', initial: 'yes', extendedRelease: 'no' }).verdict, 'within');
  assert.equal(lim({ state: 'NJ', category: 'acute', days: '6', initial: 'yes' }).verdict, 'over');
  const { refills, ...noRefills } = RX;
  assert.equal(pmp({ ...noRefills, state: 'CA', setting: 'ed', days: '7' }).valid, false);
  assert.equal(pmp({ ...noRefills, state: 'CA', setting: 'ed', days: '14', buprenorphine: 'no' }).verdict, 'required');
});

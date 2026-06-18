// spec-v106 2.4: Hestia criteria (Zondag 2011). 11 yes/no items; any positive
// excludes outpatient PE treatment.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hestia } from '../../lib/vte-v106.js';

test('all 11 negative -> eligible for outpatient treatment', () => {
  const r = hestia({});
  assert.equal(r.eligible, true);
  assert.equal(r.positive, 0);
  assert.match(r.band, /eligible/);
});

test('band flip: one positive item flips eligible -> ineligible', () => {
  const r = hestia({ pregnant: true });
  assert.equal(r.eligible, false);
  assert.equal(r.positive, 1);
  assert.match(r.band, /Pregnant/);
  assert.match(r.band, /criterion/); // singular
});

test('multiple positive items reported with plural grammar', () => {
  const r = hestia({ pregnant: true, hit: true, renal: true });
  assert.equal(r.positive, 3);
  assert.equal(r.eligible, false);
  assert.match(r.band, /criteria/); // plural
  assert.equal(r.flagged.length, 3);
});

test('any single exclusion (hemodynamic instability) gates eligibility', () => {
  assert.equal(hestia({ unstable: true }).eligible, false);
  assert.equal(hestia({ onAnticoag: true }).eligible, false);
});

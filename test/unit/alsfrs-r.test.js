// spec-v537: the ALSFRS-R.
// Worked-example tests: twelve scored items and the 0-48 range, the direction (higher is better), the
// alternative cutting scales of which exactly ONE is scored, the respiratory subscore the revision added,
// and the guards. Items and all option wordings transcribed from Cedarbaum and colleagues 1999 (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { alsfrsR, ALSFRS_ITEMS, itemsFor } from '../../lib/alsfrs-r-v537.js';

function fill(hasGastrostomy, value, over = {}) {
  const args = { hasGastrostomy };
  for (const item of itemsFor(hasGastrostomy === 'yes')) args[item.key] = value;
  return alsfrsR({ ...args, ...over });
}

test('thirteen defined items, but exactly twelve are ever scored', () => {
  assert.equal(ALSFRS_ITEMS.length, 13);          // both cutting scales are defined
  assert.equal(itemsFor(true).length, 12);
  assert.equal(itemsFor(false).length, 12);
});

test('every item offers five options scored 4 down to 0', () => {
  for (const item of ALSFRS_ITEMS) {
    assert.equal(item.options.length, 5, item.key);
    assert.deepEqual(item.options.map((o) => o.value), ['4', '3', '2', '1', '0'], item.key);
  }
});

test('higher is better: 48 is normal and 0 is complete loss', () => {
  const best = fill('no', '4');
  assert.equal(best.total, 48);
  assert.equal(best.max, 48);
  const worst = fill('no', '0');
  assert.equal(worst.total, 0);
  assert.match(best.band, /48 is normal function and 0 is complete loss/);
});

test('exactly ONE cutting scale is scored, so the ceiling stays 48 rather than 52', () => {
  const withG = fill('yes', '4');
  const withoutG = fill('no', '4');
  assert.equal(withG.total, 48);
  assert.equal(withoutG.total, 48);
  assert.equal(withG.cuttingItem, 'cuttingWithGastrostomy');
  assert.equal(withoutG.cuttingItem, 'cuttingNoGastrostomy');
  // The inapplicable scale is not among the scored items.
  assert.ok(!itemsFor(true).some((i) => i.key === 'cuttingNoGastrostomy'));
  assert.ok(!itemsFor(false).some((i) => i.key === 'cuttingWithGastrostomy'));
});

test('the two cutting scales have different wording for the same score', () => {
  const noG = ALSFRS_ITEMS.find((i) => i.key === 'cuttingNoGastrostomy');
  const withG = ALSFRS_ITEMS.find((i) => i.key === 'cuttingWithGastrostomy');
  assert.match(noG.options[4].text, /Needs to be fed/);
  assert.match(withG.options[4].text, /Unable to perform any aspect of task/);
  assert.match(withG.options[2].text, /closures and fasteners/);
});

test('the revision added three respiratory items, reported as a subscore out of 12', () => {
  const respiratory = ALSFRS_ITEMS.filter((i) => i.respiratory);
  assert.deepEqual(respiratory.map((i) => i.key), ['dyspnea', 'orthopnea', 'respiratoryInsufficiency']);
  const r = fill('no', '4', { dyspnea: '2', orthopnea: '1', respiratoryInsufficiency: '0' });
  assert.equal(r.respiratorySubscore, 3);
  assert.equal(r.total, 48 - 12 + 3);
  assert.match(r.band, /Respiratory subscore 3 of 12/);
});

test('a worked example (the META example)', () => {
  const r = fill('no', '4', { speech: '3', swallowing: '3', walking: '2', stairs: '2', dyspnea: '3' });
  assert.equal(r.valid, true);
  assert.equal(r.total, 48 - (1 + 1 + 2 + 2 + 1));
  assert.equal(r.total, 41);
  assert.match(r.bandLabel, /ALSFRS-R 41 of 48/);
});

test('the copy warns that a bare total from an older record is not comparable', () => {
  const r = fill('no', '4');
  assert.match(r.band, /the original ALSFRS ran to 40/);
  assert.match(r.note, /maximum of 40 to twelve items with a maximum of 48/);
});

test('the copy refuses the diagnosis, prognosis, and respiratory-capacity readings', () => {
  const n = fill('no', '4').note;
  assert.match(n, /does not diagnose ALS/);
  assert.match(n, /does not measure respiratory function/);
  assert.match(n, /reduced forced vital capacity/);
  assert.match(n, /cognition or behavior/);
  assert.match(n, /does not compute a slope/);
});

test('the gastrostomy answer is required, and it selects the scale', () => {
  assert.equal(alsfrsR({}).valid, false);
  const r = alsfrsR({});
  assert.match(r.message, /selects which of the two alternative scales/);
  assert.equal(alsfrsR({ hasGastrostomy: 'maybe' }).valid, false);
});

test('a missing or out-of-range item is invalid', () => {
  const partial = alsfrsR({ hasGastrostomy: 'no', speech: '4' });
  assert.equal(partial.valid, false);
  assert.match(partial.message, /salivation/);
  assert.equal(fill('no', '4', { speech: '5' }).valid, false);
  assert.equal(fill('no', '4', { speech: '-1' }).valid, false);
  assert.equal(fill('no', '4', { speech: '2.5' }).valid, false);
});

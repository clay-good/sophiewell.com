// spec-v174 §2.5: CMAI (Cohen-Mansfield Agitation Inventory), 29-item long
// form. Each behavior 1-7 by frequency; total 29-203 (floor 29, not 0). No
// total severity band; three factor subscales reported.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cmai } from '../../lib/ltcga-v174.js';

const KEYS = ['pacing', 'dressing', 'spitting', 'cursing', 'requests', 'repetitive', 'hitting', 'kicking', 'grabbing', 'pushing', 'throwing', 'noises', 'screaming', 'biting', 'scratching', 'tryingToGet', 'falling', 'complaining', 'negativism', 'eatingSubstances', 'hurting', 'handlingThings', 'hiding', 'hoarding', 'tearing', 'mannerisms', 'verbalSexual', 'physicalSexual', 'restlessness'];
function all(v) { const o = {}; for (const k of KEYS) o[k] = v; return o; }

test('CMAI floor = 29 (all behaviors rated never)', () => {
  const r = cmai(all(1));
  assert.equal(r.valid, true);
  assert.equal(r.total, 29);
  assert.match(r.band, /CMAI 29\/203/);
  assert.match(r.band, /floor 29/);
});

test('CMAI ceiling = 203 (all several-times-an-hour)', () => {
  const r = cmai(all(7));
  assert.equal(r.total, 203);
  assert.match(r.band, /CMAI 203\/203/);
});

test('CMAI factor subscale floors sum from their member items', () => {
  const r = cmai(all(1));
  // Aggressive (9 items), physically non-aggressive (6), verbally agitated (5).
  assert.equal(r.factors.aggressive, 9);
  assert.equal(r.factors.physicalNonaggressive, 6);
  assert.equal(r.factors.verballyAgitated, 5);
});

test('CMAI mid total reflects the bounded sum', () => {
  const o = all(1);
  o.hitting = 7; // +6 over the all-1 floor of 29
  const r = cmai(o);
  assert.equal(r.total, 35);
  assert.equal(r.factors.aggressive, 15); // 8 other aggressive items at 1 + hitting 7
});

test('CMAI rejects out-of-range (0 or 8) and blank items', () => {
  assert.equal(cmai({ ...all(1), pacing: 0 }).valid, false); // min frequency is 1
  assert.equal(cmai({ ...all(1), pacing: 8 }).valid, false);
  assert.equal(cmai({ ...all(1), pacing: '' }).valid, false);
  assert.equal(cmai({}).valid, false);
});

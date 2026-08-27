import test from 'node:test';
import assert from 'node:assert/strict';
import { phHemodynamics2022 as ph, MPAP_THRESHOLD, PVR_THRESHOLD } from '../../lib/ph-hemodynamics-2022-v826.js';

test('ph: the four haemodynamic categories', () => {
  assert.equal(ph({ mpap: 35, pawp: 10, cardiacOutput: 5 }).category, 'Pre-capillary PH');
  assert.equal(ph({ mpap: 35, pawp: 20, cardiacOutput: 6 }).category, 'Combined pre- and post-capillary PH');
  assert.equal(ph({ mpap: 25, pawp: 20, cardiacOutput: 5 }).category, 'Isolated post-capillary PH');
  assert.equal(ph({ mpap: 22, pawp: 10, cardiacOutput: 10 }).category, 'Unclassified PH');
});

test('ph: the mPAP threshold is STRICTLY above 20', () => {
  assert.equal(MPAP_THRESHOLD, 20);
  assert.equal(ph({ mpap: 20, pawp: 10, cardiacOutput: 5 }).ph, false);
  assert.equal(ph({ mpap: 21, pawp: 10, cardiacOutput: 5 }).ph, true);
  // Exactly 20 is called out, because it is the boundary people round through.
  assert.ok(ph({ mpap: 20 }).versionNotes.some((n) => n.includes('strictly above')));
});

test('ph: a mean pressure of 22 is PH now and was not in 2015', () => {
  const r = ph({ mpap: 22, pawp: 10, cardiacOutput: 5 });
  assert.equal(r.ph, true);
  assert.ok(r.versionNotes.some((n) => n.includes('would have called this normal')));
  // At 25 or above, both definitions agree and no note is raised about it.
  assert.ok(!ph({ mpap: 30, pawp: 10, cardiacOutput: 5 }).versionNotes.some((n) => n.includes('would have called this normal')));
});

test('ph: a PVR between 2 and 3 flips post-capillary PH to COMBINED', () => {
  // The second threshold change, and the one that changes what disease is being described.
  const r = ph({ mpap: 35, pawp: 20, cardiacOutput: 6 });
  assert.equal(r.pvr, 2.5);
  assert.equal(r.category, 'Combined pre- and post-capillary PH');
  assert.ok(r.versionNotes.some((n) => n.includes('isolated post-capillary')));
  // Above 3 both cuts agree, so no note.
  assert.ok(!ph({ mpap: 50, pawp: 20, cardiacOutput: 5 }).versionNotes.some((n) => n.includes('would have called the same numbers')));
});

test('ph: the PVR threshold is strictly above 2 Wood units', () => {
  assert.equal(PVR_THRESHOLD, 2);
  // mPAP 30, PAWP 10, CO 10 gives exactly 2.0 WU with a normal wedge: unclassified.
  assert.equal(ph({ mpap: 30, pawp: 10, cardiacOutput: 10 }).pvr, 2);
  assert.equal(ph({ mpap: 30, pawp: 10, cardiacOutput: 10 }).category, 'Unclassified PH');
  assert.equal(ph({ mpap: 30, pawp: 10, cardiacOutput: 9 }).category, 'Pre-capillary PH');
});

test('ph: PVR is computed from cardiac output, and an entered value wins', () => {
  const computed = ph({ mpap: 40, pawp: 10, cardiacOutput: 5 });
  assert.equal(computed.pvr, 6);
  assert.equal(computed.pvrSource, 'computed');
  const entered = ph({ mpap: 40, pawp: 10, cardiacOutput: 5, pvr: 1.5 });
  assert.equal(entered.pvr, 1.5);
  assert.equal(entered.pvrSource, 'entered');
  assert.equal(entered.category, 'Unclassified PH');
});

test('ph: PH is reported even when it cannot yet be classified', () => {
  const r = ph({ mpap: 35 });
  assert.equal(r.ph, true);
  assert.equal(r.category, null);
  assert.equal(r.missing.length, 2);
  assert.ok(r.band.includes('not classifiable'));
});

test('ph: invalid and out-of-range input', () => {
  assert.equal(ph({}).valid, false);
  assert.equal(ph({ mpap: 1e308 }).valid, false);
  assert.equal(ph({ mpap: 30, cardiacOutput: 0 }).valid, false);
  assert.equal(ph({ mpap: -1 }).valid, false);
  assert.doesNotMatch(JSON.stringify(ph({ mpap: 35, pawp: 10, cardiacOutput: 5 })), /NaN|Infinity/);
});

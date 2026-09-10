// spec-v1103: a guard in a renderer is a guard for one surface.
//
// `views/group-v12.js` has refused a toxic-alcohol call without a glucose and a
// BUN since spec-v1065, with the reasoning written out above the `needValues`
// call. `lib/tox-v86.js` did not -- so the browser asked for the two labs and
// every API caller got the answer the browser would not give.
//
// The two are additive terms in the calculated osmolality, so a blank one read
// as 0 makes the calculated value too LOW and the osmolar gap -- a subtraction
// -- too WIDE. The AACT fomepizole limbs turn on "gap over 10", and an ordinary
// glucose and BUN are about 20 mOsm/kg between them:
//
//   measured 300, Na 140, glucose 180, BUN 28, recent ingestion
//     with the panel     -> gap  0 -> "No AACT fomepizole indication met"
//     without the panel  -> gap 20 -> "Fomepizole indicated per the AACT criteria"
//
// This test drives the AGENT surface, because that is the one that was wrong.

import test from 'node:test';
import assert from 'node:assert/strict';
import { computeCalculator } from '../../mcp/tools.js';

const FULL = {
  'ta-osm': 300, 'ta-na': 140, 'ta-glu': 180, 'ta-bun': 28, 'ta-recent': true,
};

test('spec-v1103: the complete call still answers, and answers "no indication"', () => {
  const r = computeCalculator({ id: 'toxic-alcohol', inputs: FULL });
  assert.equal(r.valid, true, r.message);
  const text = JSON.stringify(r);
  assert.match(text, /No AACT fomepizole indication met/);
});

test('spec-v1103: omitting the glucose or the BUN refuses instead of indicating', () => {
  for (const dom of ['ta-glu', 'ta-bun']) {
    const inputs = { ...FULL };
    delete inputs[dom];
    const r = computeCalculator({ id: 'toxic-alcohol', inputs });
    assert.equal(r.valid, false, `toxic-alcohol still answered without ${dom}`);
    assert.doesNotMatch(JSON.stringify(r), /Fomepizole indicated/,
      `toxic-alcohol indicated fomepizole without ${dom}`);
  }
});

test('spec-v1103: neither lab is enough to compute an osmolar gap', () => {
  const r = computeCalculator({
    id: 'toxic-alcohol',
    inputs: { 'ta-osm': 300, 'ta-na': 140, 'ta-recent': true },
  });
  assert.equal(r.valid, false);
  // The reader must not be handed a calculated osmolality nobody's labs support.
  assert.doesNotMatch(JSON.stringify(r), /280/);
});

test('spec-v1103: a typed zero is still a measurement, not a gap', () => {
  // spec-v1211: a glucose of 0 and a BUN of 0 now fall outside the envelopes
  // lib/bounds.js declares (glucose 5-2000, BUN 1-300), so this no longer
  // computes. The property is unchanged and now asserted directly: a typed 0 is
  // judged as a value the reader ENTERED, never treated as a field left blank --
  // the two produce different sentences on the agent surface too.
  const zero = computeCalculator({ id: 'toxic-alcohol', inputs: { ...FULL, 'ta-glu': 0, 'ta-bun': 0 } });
  assert.equal(zero.valid, false);
  assert.match(JSON.stringify(zero), /must be between 5 and 2000/);
  const blank = computeCalculator({ id: 'toxic-alcohol', inputs: { ...FULL, 'ta-glu': '' } });
  assert.equal(blank.valid, false);
  assert.notEqual(JSON.stringify(zero), JSON.stringify(blank));
});

test('spec-v1211: the smallest survivable glucose and BUN still indicate', () => {
  const r = computeCalculator({ id: 'toxic-alcohol', inputs: { ...FULL, 'ta-glu': 5, 'ta-bun': 1 } });
  assert.equal(r.valid, true, r.message);
  assert.match(JSON.stringify(r), /Fomepizole indicated/);
});

test('spec-v1103: the ethanol stays optional', () => {
  const r = computeCalculator({ id: 'toxic-alcohol', inputs: FULL });
  assert.equal(r.valid, true, r.message);
});

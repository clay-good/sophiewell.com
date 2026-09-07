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
  const r = computeCalculator({
    id: 'toxic-alcohol',
    inputs: { ...FULL, 'ta-glu': 0, 'ta-bun': 0 },
  });
  assert.equal(r.valid, true, r.message);
  assert.match(JSON.stringify(r), /Fomepizole indicated/);
});

test('spec-v1103: the ethanol stays optional', () => {
  const r = computeCalculator({ id: 'toxic-alcohol', inputs: FULL });
  assert.equal(r.valid, true, r.message);
});

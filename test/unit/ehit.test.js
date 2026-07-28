// spec-v531: the EHIT (endothermal heat-induced thrombosis) classification.
// Worked-example tests: the five class values, the 50-percent boundary between II and III, the deliberate
// rejection of a bare class I as ambiguous, the Ib-equals-old-class-I continuity note, the Lawrence
// non-conflation, and the guards. Classes and recommendations transcribed from the AVF/SVS 2021 consensus
// revising Kabnick 2006 (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ehit, EHIT_CLASSES } from '../../lib/ehit-v531.js';

test('five class values, with class I subdivided', () => {
  assert.deepEqual(EHIT_CLASSES.map((c) => c.value), ['Ia', 'Ib', 'II', 'III', 'IV']);
});

test('a bare class I is rejected as ambiguous, and the message says which is which', () => {
  for (const raw of ['I', 'i', '1', ' 1 ']) {
    const r = ehit({ ehitClass: raw });
    assert.equal(r.valid, false, `${raw} should be rejected`);
    assert.match(r.message, /ambiguous/);
    assert.match(r.message, /Ib is the original 2006 class I/);
  }
});

test('Ib is exactly the original 2006 class I, and the result says so', () => {
  const r = ehit({ ehitClass: 'Ib' });
  assert.equal(r.valid, true);
  assert.equal(r.ehitClass, 'Ib');
  assert.match(r.legacy, /exactly the original 2006 class I/);
  assert.match(r.band, /before 2021 saying "EHIT 1" means this/);
});

test('Ia is the newly carved-out subdivision', () => {
  const r = ehit({ ehitClass: 'Ia' });
  assert.match(r.legacy, /Newly carved out in 2021/);
  assert.match(r.band, /peripheral to the superficial epigastric vein/);
});

test('the II/III boundary is the 50 percent lumen threshold (the META example)', () => {
  const two = ehit({ ehitClass: 'II' });
  assert.match(two.band, /less than 50 percent/);
  assert.equal(two.anticoagulationDiscussed, false);

  const three = ehit({ ehitClass: 'III' });
  assert.match(three.band, /more than 50 percent of the lumen, but not occlusive/);
  assert.equal(three.anticoagulationDiscussed, true);
  assert.match(three.recommendation, /Therapeutic anticoagulation/);
  assert.match(three.bandLabel, /EHIT Class III/);
});

test('IV is occlusive and is explicitly individualized rather than protocolized', () => {
  const r = ehit({ ehitClass: 'IV' });
  assert.match(r.band, /Occlusive deep vein thrombus/);
  assert.equal(r.anticoagulationDiscussed, true);
  assert.match(r.recommendation, /individualized/);
  assert.match(r.recommendation, /not a protocol/);
});

test('classes II, III and IV are marked unchanged from 2006', () => {
  for (const v of ['II', 'III', 'IV']) {
    assert.match(ehit({ ehitClass: v }).legacy, /Unchanged from the 2006 classification/);
  }
});

test('every class states that the recommendation is a suggestion, not an order', () => {
  for (const c of EHIT_CLASSES) {
    assert.match(ehit({ ehitClass: c.value }).band, /not an order/);
  }
});

test('the copy refuses the Lawrence conflation and names the two non-EHIT findings', () => {
  const n = ehit({ ehitClass: 'II' }).note;
  assert.match(n, /Lawrence level 3 is not a class III/);
  assert.match(n, /non-EHIT DVT/);
  assert.match(n, /post-ablation superficial venous thrombosis/);
  assert.match(n, /four weeks/);
});

test('the copy separates this from the chronic venous instruments', () => {
  assert.match(ehit({ ehitClass: 'Ia' }).note, /CEAP classification and the venous clinical severity score/);
});

test('arabic and lowercase aliases resolve, except the ambiguous bare one', () => {
  assert.equal(ehit({ ehitClass: '2' }).ehitClass, 'II');
  assert.equal(ehit({ ehitClass: '3' }).ehitClass, 'III');
  assert.equal(ehit({ ehitClass: '4' }).ehitClass, 'IV');
  assert.equal(ehit({ ehitClass: '1a' }).ehitClass, 'Ia');
  assert.equal(ehit({ ehitClass: 'ib' }).ehitClass, 'Ib');
});

test('a missing or unknown class is invalid', () => {
  assert.equal(ehit({}).valid, false);
  assert.equal(ehit({ ehitClass: '' }).valid, false);
  assert.equal(ehit({ ehitClass: 'V' }).valid, false);
  assert.equal(ehit({ ehitClass: '5' }).valid, false);
  assert.equal(ehit({ ehitClass: 'IIb' }).valid, false);
});

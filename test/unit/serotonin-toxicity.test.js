// spec-v86 §2.1: Hunter Serotonin Toxicity Criteria boundary examples per
// Dunkley EJC, et al. QJM. 2003;96(9):635-642.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { serotoninToxicity } from '../../lib/tox-v86.js';

test('no serotonergic agent -> not applicable (never a silent negative)', () => {
  const r = serotoninToxicity({ serotonergicAgent: false, spontaneousClonus: true });
  assert.equal(r.applicable, false);
  assert.equal(r.meets, false);
  assert.match(r.band, /not applicable/i);
});

test('branch 1: spontaneous clonus alone meets criteria', () => {
  const r = serotoninToxicity({ serotonergicAgent: true, spontaneousClonus: true });
  assert.equal(r.meets, true);
  assert.match(r.branch, /spontaneous clonus/);
  assert.match(r.band, /Meets Hunter criteria/);
});

test('branch 4: tremor + hyperreflexia meets criteria', () => {
  const r = serotoninToxicity({ serotonergicAgent: true, tremor: true, hyperreflexia: true });
  assert.equal(r.meets, true);
  assert.match(r.branch, /tremor with hyperreflexia/);
});

test('branch 2: inducible clonus needs agitation or diaphoresis', () => {
  const without = serotoninToxicity({ serotonergicAgent: true, inducibleClonus: true });
  assert.equal(without.meets, false);
  const withAgit = serotoninToxicity({ serotonergicAgent: true, inducibleClonus: true, agitation: true });
  assert.equal(withAgit.meets, true);
  assert.match(withAgit.branch, /inducible clonus/);
});

test('branch 5: hypertonia + temp over 38 + clonus meets criteria', () => {
  const r = serotoninToxicity({ serotonergicAgent: true, hypertonia: true, tempOver38: true, ocularClonus: true });
  assert.equal(r.meets, true);
  assert.match(r.branch, /hypertonia/);
});

test('single non-qualifying finding does not meet criteria', () => {
  const r = serotoninToxicity({ serotonergicAgent: true, agitation: true });
  assert.equal(r.meets, false);
  assert.match(r.band, /Does not meet/);
});

test('note quotes the published operating characteristics (84 / 97)', () => {
  const r = serotoninToxicity({ serotonergicAgent: true, spontaneousClonus: true });
  assert.match(r.note, /84/);
  assert.match(r.note, /97/);
});

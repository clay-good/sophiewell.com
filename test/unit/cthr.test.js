// spec-v12 §3.5.1 wave 12-5: Canadian CT Head Rule boundary examples
// per Stiell IG, et al. Lancet. 2001;357(9266):1391-1396 Figure 2.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cthr } from '../../lib/scoring-v4.js';

test('cthr low edge: no criteria -> CT not required', () => {
  const r = cthr({ highRisk: false, mediumRisk: false });
  assert.equal(r.ctRecommended, false);
  assert.match(r.band, /not required/);
});

test('cthr medium-only: amnesia >= 30 min -> CT recommended', () => {
  const r = cthr({ highRisk: false, mediumRisk: true });
  assert.equal(r.ctRecommended, true);
  assert.match(r.band, /medium-risk/);
});

test('cthr high-risk: age >= 65 -> CT recommended (neurosurgical concern)', () => {
  const r = cthr({ highRisk: true, mediumRisk: false });
  assert.equal(r.ctRecommended, true);
  assert.match(r.band, /high-risk/);
});

test('cthr both flags: high-risk band takes precedence', () => {
  const r = cthr({ highRisk: true, mediumRisk: true });
  assert.equal(r.ctRecommended, true);
  assert.match(r.band, /high-risk/);
});

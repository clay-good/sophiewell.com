// spec-v301: diabetic retinopathy severity (ICDR scale). Worked-example tests:
// each grade (no findings -> 1, microaneurysms -> 2, beyond MA -> 3, each 4-2-1
// criterion -> 4, PDR signs -> 5), the highest-severity-wins precedence, and the
// boolean coercions. Criteria cross-verified against Wilkinson 2003 and the ICDR
// reference table (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { drSeverityIcdr } from '../../lib/dr-severity-v301.js';

test('no findings is grade 1 (no apparent retinopathy)', () => {
  const r = drSeverityIcdr({});
  assert.equal(r.grade, 1);
  assert.match(r.name, /No apparent retinopathy/);
  assert.equal(r.abnormal, false);
});

test('microaneurysms only is grade 2 (mild NPDR)', () => {
  const r = drSeverityIcdr({ microaneurysms: true });
  assert.equal(r.grade, 2);
  assert.match(r.name, /Mild NPDR/);
});

test('findings beyond microaneurysms is grade 3 (moderate NPDR)', () => {
  const r = drSeverityIcdr({ microaneurysms: true, beyondMicroaneurysms: true });
  assert.equal(r.grade, 3);
  assert.match(r.name, /Moderate NPDR/);
});

test('any 4-2-1 criterion is grade 4 (severe NPDR)', () => {
  assert.equal(drSeverityIcdr({ hem4quadrants: true }).grade, 4);
  assert.equal(drSeverityIcdr({ venousBeading2: true }).grade, 4);
  assert.equal(drSeverityIcdr({ irma1: true }).grade, 4);
  const r = drSeverityIcdr({ venousBeading2: true });
  assert.equal(r.abnormal, true);
  assert.match(r.band, /4-2-1 rule is met/);
});

test('neovascularization or vitreous hemorrhage is grade 5 (PDR)', () => {
  assert.equal(drSeverityIcdr({ neovascularization: true }).grade, 5);
  const r = drSeverityIcdr({ vitreousHemorrhage: true });
  assert.equal(r.grade, 5);
  assert.equal(r.proliferative, true);
  assert.match(r.name, /Proliferative DR/);
});

test('highest severity wins when several findings coexist', () => {
  // PDR signs override severe criteria and microaneurysms.
  const r = drSeverityIcdr({ microaneurysms: true, venousBeading2: true, neovascularization: true });
  assert.equal(r.grade, 5);
  // Severe overrides moderate/mild.
  assert.equal(drSeverityIcdr({ microaneurysms: true, beyondMicroaneurysms: true, irma1: true }).grade, 4);
});

test('boolean coercion accepts checkbox-style values', () => {
  assert.equal(drSeverityIcdr({ venousBeading2: '1' }).grade, 4);
  assert.equal(drSeverityIcdr({ neovascularization: 'on' }).grade, 5);
  assert.equal(drSeverityIcdr({ microaneurysms: 'true' }).grade, 2);
});

test('the worked example (venous beading) matches the documented META expected output', () => {
  const r = drSeverityIcdr({ venousBeading2: true });
  assert.equal(r.grade, 4);
  assert.match(r.band, /ICDR grade 4/);
  assert.match(r.name, /Severe NPDR/);
});

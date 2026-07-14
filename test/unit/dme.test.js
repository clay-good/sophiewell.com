// spec-v307: diabetic macular edema (DME) severity scale. Worked-example tests:
// the absent case, each present-location level (distant=mild, approaching=moderate,
// involving=severe/center-involving), the center-involving flag, the boolean
// coercion, and the missing-location guard. Criteria cross-verified against
// Wilkinson 2003 and the ICDR/DME reference table (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dmeSeverity } from '../../lib/dme-v307.js';

test('no thickening/exudates is DME apparently absent', () => {
  const r = dmeSeverity({ present: false });
  assert.equal(r.level, 'absent');
  assert.equal(r.centerInvolving, false);
  assert.equal(r.abnormal, false);
  assert.match(r.band, /DME apparently absent/);
});

test('present + distant is mild DME', () => {
  const r = dmeSeverity({ present: true, location: 'distant' });
  assert.equal(r.name, 'Mild DME');
  assert.equal(r.centerInvolving, false);
});

test('present + approaching is moderate DME', () => {
  const r = dmeSeverity({ present: true, location: 'approaching' });
  assert.equal(r.name, 'Moderate DME');
  assert.equal(r.centerInvolving, false);
});

test('present + involving is severe, center-involving DME', () => {
  const r = dmeSeverity({ present: true, location: 'involving' });
  assert.equal(r.name, 'Severe DME');
  assert.equal(r.centerInvolving, true);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /center-involving/i);
});

test('boolean coercion accepts checkbox-style present values', () => {
  assert.equal(dmeSeverity({ present: '1', location: 'involving' }).name, 'Severe DME');
  assert.equal(dmeSeverity({ present: 'on', location: 'distant' }).name, 'Mild DME');
});

test('present without a location is a guarded message', () => {
  const r = dmeSeverity({ present: true });
  assert.equal(r.valid, false);
  assert.match(r.message, /Select where/);
});

test('the worked example (present, involving) is severe center-involving DME', () => {
  const r = dmeSeverity({ present: true, location: 'involving' });
  assert.equal(r.level, 'involving');
  assert.equal(r.centerInvolving, true);
  assert.match(r.band, /Severe DME/);
});

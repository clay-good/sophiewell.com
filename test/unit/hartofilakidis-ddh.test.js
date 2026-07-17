// spec-v370: Hartofilakidis classification of adult DDH (types A/B/C). Worked-example tests: each type
// and its description, the dislocation flag on B-C, type + numeric + case-insensitive input, and the
// invalid-type guard. Types transcribed from Hartofilakidis 1988 (JBJS Br), cross-verified against CORR
// "Classifications in Brief" (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hartofilakidisDdh } from '../../lib/hartofilakidis-ddh-v370.js';

test('type B (low dislocation), flagged (the META example)', () => {
  const r = hartofilakidisDdh({ type: 'B' });
  assert.equal(r.valid, true);
  assert.equal(r.type, 'B');
  assert.equal(r.dislocation, true);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /low dislocation/);
});

test('type A is dysplasia (not a dislocation) and not flagged', () => {
  const r = hartofilakidisDdh({ type: 'A' });
  assert.equal(r.dislocation, false);
  assert.match(r.band, /dysplasia/);
  assert.match(r.band, /within the true acetabulum/);
});

test('type C is high dislocation and flagged', () => {
  const r = hartofilakidisDdh({ type: 'C' });
  assert.equal(r.dislocation, true);
  assert.equal(r.type, 'C');
  assert.match(r.band, /high dislocation/);
  assert.match(r.band, /no connection with the true acetabulum/);
});

test('numeric and case-insensitive input map to the types', () => {
  assert.equal(hartofilakidisDdh({ type: 2 }).type, 'B');
  assert.equal(hartofilakidisDdh({ type: '3' }).type, 'C');
  assert.equal(hartofilakidisDdh({ type: 'a' }).type, 'A');
});

test('a missing or out-of-range type is invalid', () => {
  assert.equal(hartofilakidisDdh({}).valid, false);
  assert.equal(hartofilakidisDdh({ type: 'D' }).valid, false);
  assert.equal(hartofilakidisDdh({ type: '0' }).valid, false);
});

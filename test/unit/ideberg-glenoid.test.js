// spec-v409: Ideberg classification of glenoid-fossa fractures (types I/II/III/IV/V/VI).
// Worked-example tests: representative types and their exit-border descriptions, roman + numeric + subtype
// input, and the invalid-type guard. Types transcribed from Ideberg 1984 (+ Goss 1992 type VI) (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { idebergGlenoid } from '../../lib/ideberg-glenoid-v409.js';

test('type II: exits the lateral scapular border (the META example)', () => {
  const r = idebergGlenoid({ type: 'II' });
  assert.equal(r.valid, true);
  assert.equal(r.type, 'II');
  assert.match(r.band, /lateral \(axillary\) scapular border/);
  assert.match(r.band, /inferior triangular fragment/);
});

test('type I: glenoid rim (anterior / posterior)', () => {
  const r = idebergGlenoid({ type: 'I' });
  assert.equal(r.type, 'I');
  assert.match(r.band, /glenoid rim fracture/);
  assert.match(r.band, /Ia anterior rim, Ib posterior rim/);
});

test('types III / IV: superior vs medial border exit', () => {
  assert.match(idebergGlenoid({ type: 'III' }).band, /superior scapular border/);
  assert.match(idebergGlenoid({ type: 'IV' }).band, /medial \(vertebral\) scapular border/);
});

test('type VI: severely comminuted (Goss)', () => {
  const r = idebergGlenoid({ type: 'VI' });
  assert.equal(r.type, 'VI');
  assert.match(r.band, /severely comminuted/);
});

test('numeric and subtype input map to the base types', () => {
  assert.equal(idebergGlenoid({ type: 2 }).type, 'II');
  assert.equal(idebergGlenoid({ type: 'Ib' }).type, 'I');
  assert.equal(idebergGlenoid({ type: 'Vc' }).type, 'V');
});

test('a missing or out-of-range type is invalid', () => {
  assert.equal(idebergGlenoid({}).valid, false);
  assert.equal(idebergGlenoid({ type: 'VII' }).valid, false);
  assert.equal(idebergGlenoid({ type: '0' }).valid, false);
});

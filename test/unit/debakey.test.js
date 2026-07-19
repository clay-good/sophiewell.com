// spec-v461: DeBakey aortic dissection classification (types I / II / IIIa / IIIb).
// Worked-example tests: each type and its origin/extent description, alias input, and the invalid-type guard.
// Types transcribed from DeBakey 1965 (J Thorac Cardiovasc Surg) (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { debakey } from '../../lib/debakey-v461.js';

test('type I: ascending + arch + descending (the META example)', () => {
  const r = debakey({ type: 'I' });
  assert.equal(r.valid, true);
  assert.equal(r.type, 'I');
  assert.match(r.band, /originates in the ascending aorta and extends through the arch/);
});

test('type II: confined to the ascending aorta', () => {
  const r = debakey({ type: 'II' });
  assert.equal(r.type, 'II');
  assert.match(r.band, /confined to the ascending aorta/);
});

test('type IIIa: descending, above the diaphragm', () => {
  const r = debakey({ type: 'IIIa' });
  assert.equal(r.type, 'IIIa');
  assert.match(r.band, /limited above the diaphragm/);
});

test('type IIIb: descending, below the diaphragm', () => {
  assert.match(debakey({ type: 'IIIb' }).band, /extends below the diaphragm/);
});

test('alias input maps to the types', () => {
  assert.equal(debakey({ type: 1 }).type, 'I');
  assert.equal(debakey({ type: '3a' }).type, 'IIIa');
  assert.equal(debakey({ type: '3B' }).type, 'IIIb');
});

test('a missing or unknown type is invalid', () => {
  assert.equal(debakey({}).valid, false);
  assert.equal(debakey({ type: 'IV' }).valid, false);
  assert.equal(debakey({ type: 'III' }).valid, false);
});

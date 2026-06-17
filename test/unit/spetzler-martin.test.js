// spec-v95 2.4: Spetzler-Martin AVM grade + Lawton-Young supplement (1986/2010).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spetzlerMartin } from '../../lib/neuro-v95.js';

test('large eloquent deep AVM is grade V with the supplemented total', () => {
  const r = spetzlerMartin({ size: '3', eloquent: 'yes', deepVenous: 'yes', ageBand: '3', unruptured: 'no', diffuse: 'no' });
  assert.equal(r.valid, true);
  assert.equal(r.core, 5);
  assert.equal(r.grade, 'V');
  assert.equal(r.supplementedTotal, 8);
  assert.match(r.band, /grade V/);
});

test('small non-eloquent superficial AVM is grade I', () => {
  const r = spetzlerMartin({ size: '1', eloquent: 'no', deepVenous: 'no' });
  assert.equal(r.core, 1);
  assert.equal(r.grade, 'I');
  assert.equal(r.supplementedTotal, null);
});

test('supplemented total adds age, unruptured, diffuse to the core', () => {
  const r = spetzlerMartin({ size: '2', eloquent: 'no', deepVenous: 'yes', ageBand: '2', unruptured: 'yes', diffuse: 'yes' });
  assert.equal(r.core, 3);
  assert.equal(r.supplementedTotal, 7);
});

test('omitting the age band reports the core grade only', () => {
  const r = spetzlerMartin({ size: '2', eloquent: 'yes', deepVenous: 'no', ageBand: '' });
  assert.equal(r.core, 3);
  assert.equal(r.supplementedTotal, null);
});

test('missing nidus size returns a surfaced guard', () => {
  assert.equal(spetzlerMartin({}).valid, false);
  assert.equal(spetzlerMartin({ size: '9' }).valid, false);
});

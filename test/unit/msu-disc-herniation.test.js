// spec-v1468: MSU classification of lumbar disc herniation (Mysliwiec 2010, Eur Spine J).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { msuDiscHerniation as m } from '../../lib/msu-disc-herniation-v1468.js';
import { ASKING } from '../lib/asking-language.js';

test('each size by the select, and the type string is size-zone', () => {
  assert.equal(m({ size: '1', zone: 'A' }).type, '1-A');
  assert.equal(m({ size: '2', zone: 'B' }).type, '2-B');
  assert.equal(m({ size: '3', zone: 'C' }).type, '3-C');
  assert.equal(m({ size: '1', zone: 'A' }).abnormal, false);
  assert.equal(m({ size: '3', zone: 'A' }).abnormal, true);
  assert.equal(m({ size: '2', zone: 'B' }).bandLabel, 'Type 2-B');
});

test('the worked example band is fixed', () => {
  assert.equal(m({ size: '2', zone: 'B' }).band,
    'MSU type 2-B: the herniation reaches more than half-way to the intra-facet line but not beyond it, and intrudes furthest into a lateral quadrant (zone B).');
});

test('AB is accepted and carries its figure note', () => {
  const r = m({ size: '2', zone: 'AB' });
  assert.equal(r.type, '2-AB');
  assert.ok(r.notes.some((x) => x.includes('quite common')));
});

test('measured size at the boundaries: 50% is 1, 100% is 2, just over is 3', () => {
  assert.equal(m({ dist: 10, extent: 5, zone: 'A' }).size, 1);
  assert.equal(m({ dist: 10, extent: 5.1, zone: 'A' }).size, 2);
  assert.equal(m({ dist: 10, extent: 10, zone: 'A' }).size, 2);
  assert.equal(m({ dist: 10, extent: 10.1, zone: 'A' }).size, 3);
  assert.equal(m({ dist: '12', extent: '0', zone: 'B' }).size, 1);
});

test('measurements override a disagreeing select and say so', () => {
  const r = m({ size: '1', dist: 10, extent: 8, zone: 'B' });
  assert.equal(r.type, '2-B');
  assert.ok(r.notes.includes('The measurements give size 2; the chosen size 1 was not used.'));
  assert.ok(!m({ size: '2', dist: 10, extent: 8, zone: 'B' }).notes.some((x) => x.includes('was not used')));
});

test('a blank size or zone asks, never defaults', () => {
  for (const r of [m({ zone: 'B' }), m({ size: '2' }), m({ size: '', zone: '' }), m({}), m(null)]) {
    assert.equal(r.valid, false);
    assert.match(r.message, ASKING);
    assert.match(r.message, /^Choose /);
  }
});

test('one measurement alone asks for the other', () => {
  const a = m({ dist: 10, zone: 'B' });
  assert.equal(a.valid, false);
  assert.match(a.message, /^Enter /);
  const b = m({ extent: 6, size: '2', zone: 'B' });
  assert.equal(b.valid, false);
  assert.match(b.message, /^Enter /);
});

test('out-of-range measurements are refused', () => {
  for (const r of [m({ dist: 0, extent: 3, zone: 'A' }), m({ dist: 10, extent: -1, zone: 'A' }), m({ dist: 90, extent: 3, zone: 'A' }), m({ dist: 10, extent: 61, zone: 'A' })]) {
    assert.equal(r.valid, false);
    assert.match(r.message, ASKING);
  }
  assert.equal(m({ size: '4', zone: 'A' }).valid, false);
  assert.equal(m({ size: '2', zone: 'D' }).valid, false);
});

// spec-v1479: Robinson (Edinburgh) classification of adult clavicle fractures.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ASKING } from '../lib/asking-language.js';
import { robinsonClavicle as rb } from '../../lib/robinson-clavicle-v1479.js';

test('the worked example: a displaced segmental shaft fracture is 2B2', () => {
  const r = rb({ region: '2', displacement: 'B', shaftDisplaced: '2' });
  assert.equal(r.band, 'Robinson type 2B2: midshaft, displaced, isolated or comminuted segmental.');
  assert.equal(r.abnormal, true);
  assert.ok(r.notes.some((n) => /comminution was a risk factor for delayed union and nonunion/.test(n)));
});

test('all twelve subtypes', () => {
  const codes = [];
  for (const region of ['1', '3']) for (const d of ['A', 'B']) for (const a of ['1', '2']) codes.push(rb({ region, displacement: d, articular: a }).type);
  for (const a of ['1', '2']) codes.push(rb({ region: '2', displacement: 'A', shaftAligned: a }).type);
  for (const b of ['1', '2']) codes.push(rb({ region: '2', displacement: 'B', shaftDisplaced: b }).type);
  assert.deepEqual(codes.sort(), ['1A1', '1A2', '1B1', '1B2', '2A1', '2A2', '2B1', '2B2', '3A1', '3A2', '3B1', '3B2']);
});

test('the derivation prognosis: types 1, 2A and 3A benign; 2B and 3B not', () => {
  assert.equal(rb({ region: '1', displacement: 'B', articular: '1' }).abnormal, false);
  assert.equal(rb({ region: '2', displacement: 'A', shaftAligned: '2' }).abnormal, false);
  assert.equal(rb({ region: '3', displacement: 'A', articular: '1' }).abnormal, false);
  assert.equal(rb({ region: '3', displacement: 'B', articular: '1' }).abnormal, true);
  assert.match(rb({ region: '3', displacement: 'B', articular: '2' }).notes.join(' '), /modified Neer/);
});

test('every choice is asked for, never assumed', () => {
  for (const r of [rb({}), rb({ region: '2' }), rb({ region: '2', displacement: 'B' }), rb({ region: '1', displacement: 'A' }), rb({ region: '2', displacement: 'A', shaftDisplaced: '1' })]) {
    assert.equal(r.valid, false);
    assert.match(r.message, ASKING);
  }
});

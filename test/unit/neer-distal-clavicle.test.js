// spec-v1428: modified Neer distal-third clavicle fractures (Stenson & Baker 2021).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { neerDistalClavicle as ndc } from '../../lib/neer-distal-clavicle-v1428.js';

test('every type derives from its described findings', () => {
  const rows = [
    ['I', { pattern: 'single', location: 'lateral', ac: 'spared' }],
    ['III', { pattern: 'single', location: 'lateral', ac: 'extends' }],
    ['IIA', { pattern: 'single', location: 'medial' }],
    ['IIB', { pattern: 'single', location: 'between' }],
    ['IV', { pattern: 'physeal', skeleton: 'immature' }],
    ['V', { pattern: 'comminuted' }],
  ];
  for (const [type, input] of rows) {
    const r = ndc(input);
    assert.equal(r.type, type, type);
    assert.equal(r.bandLabel, `Type ${type}`);
  }
});

test('only the types described as stable are left unflagged', () => {
  assert.equal(ndc({ pattern: 'single', location: 'lateral', ac: 'spared' }).abnormal, false);
  assert.equal(ndc({ pattern: 'single', location: 'lateral', ac: 'extends' }).abnormal, false);
  assert.equal(ndc({ pattern: 'single', location: 'medial' }).abnormal, true);
  assert.equal(ndc({ pattern: 'single', location: 'between' }).abnormal, true);
  assert.equal(ndc({ pattern: 'comminuted' }).abnormal, true);
});

test('the worked example band', () => {
  assert.equal(ndc({ pattern: 'single', location: 'between' }).band,
    'Modified Neer type IIB: between the conoid and trapezoid ligaments, with the conoid torn and the trapezoid still on the lateral fragment; described as inherently unstable.');
});

test('type II carries the IIA/IIB and nonunion notes; an AC extension is recorded, not used', () => {
  const r = ndc({ pattern: 'single', location: 'medial', ac: 'extends' });
  assert.equal(r.type, 'IIA');
  assert.ok(r.notes.some((n) => /not clinically relevant/.test(n)));
  assert.ok(r.notes.some((n) => /21% to 33%/.test(n)));
  assert.ok(r.notes.some((n) => /recorded here as a finding/.test(n)));
  assert.ok(!ndc({ pattern: 'single', location: 'lateral', ac: 'spared' }).notes.some((n) => /21% to 33%/.test(n)));
});

test('a physeal injury in a mature skeleton is flagged, not hidden', () => {
  const r = ndc({ pattern: 'physeal', skeleton: 'mature' });
  assert.equal(r.type, 'IV');
  assert.match(r.notes[0], /Not a clean fit/);
  assert.ok(!ndc({ pattern: 'physeal' }).notes.some((n) => /Not a clean fit/.test(n)));
});

test('every answer carries the reliability and the missing fragment size', () => {
  const r = ndc({ pattern: 'comminuted' });
  assert.ok(r.notes.some((n) => /0\.11 to 0\.35/.test(n)));
  assert.ok(r.notes.some((n) => /size of the lateral fragment/.test(n)));
});

test('missing findings are asked for', () => {
  assert.match(ndc({}).message, /fracture pattern/);
  assert.match(ndc({ pattern: 'single' }).message, /coracoclavicular/);
  assert.match(ndc({ pattern: 'single', location: 'lateral' }).message, /acromioclavicular/);
  assert.equal(ndc({ pattern: 'single', location: 'between' }).valid, true);
  assert.equal(ndc(null).valid, false);
});

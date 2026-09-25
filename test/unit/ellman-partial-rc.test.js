// spec-v1425: Ellman partial-thickness rotator cuff tear, grade from depth, type from side.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ellmanPartialRc as ell } from '../../lib/ellman-partial-rc-v1425.js';

test('each side sets its type', () => {
  assert.equal(ell({ location: 'articular', depthMm: 2 }).type, 'A');
  assert.equal(ell({ location: 'bursal', depthMm: 2 }).type, 'B');
  assert.equal(ell({ location: 'intratendinous', depthMm: 2 }).type, 'C');
});

test('depth sets the grade, with 3 and 6 mm both grade 2', () => {
  const rows = [[0.5, 1], [2.9, 1], [3, 2], [4.5, 2], [6, 2], [6.1, 3], [10, 3]];
  for (const [depthMm, grade] of rows) assert.equal(ell({ location: 'articular', depthMm }).grade, grade, String(depthMm));
  assert.equal(ell({ location: 'bursal', depthMm: '4' }).grade, 2);
});

test('the band reads the grade out in words', () => {
  assert.equal(ell({ location: 'articular', depthMm: 4 }).band, 'Ellman grade 2, type A: a partial-thickness articular-side tear 3 to 6 mm deep.');
  assert.equal(ell({ location: 'bursal', depthMm: 7 }).bandLabel, 'Grade 3, type B');
});

test('a full-thickness tear needs no depth and is not graded', () => {
  const r = ell({ location: 'full' });
  assert.equal(r.valid, true);
  assert.equal(r.grade, undefined);
  assert.match(r.band, /partial-thickness grades do not apply/);
});

test('a depth beyond the assumed tendon thickness is flagged; every answer carries the reliability note', () => {
  assert.ok(ell({ location: 'articular', depthMm: 14 }).notes.some((n) => /check that the tear is not full thickness/.test(n)));
  assert.ok(!ell({ location: 'articular', depthMm: 12 }).notes.some((n) => /not full thickness/.test(n)));
  assert.ok(ell({ location: 'articular', depthMm: 2 }).notes.some((n) => /0\.19/.test(n)));
  assert.ok(ell({ location: 'full' }).notes.some((n) => /0\.19/.test(n)));
});

test('missing or impossible input is refused', () => {
  assert.match(ell({}).message, /where the tear is/);
  assert.match(ell({ location: 'articular' }).message, /Enter tear depth in mm/);
  assert.match(ell({ location: 'articular', depthMm: '  ' }).message, /Enter tear depth/);
  assert.match(ell({ location: 'articular', depthMm: 0 }).message, /greater than 0/);
  assert.match(ell({ location: 'articular', depthMm: -2 }).message, /greater than 0/);
  assert.match(ell({ location: 'articular', depthMm: 40 }).message, /at most 30/);
  assert.equal(ell(null).valid, false);
});

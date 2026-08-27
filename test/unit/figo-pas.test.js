import test from 'node:test';
import assert from 'node:assert/strict';
import { figoPas as pas } from '../../lib/figo-pas-v833.js';

test('figo pas: the five grades derive from operative findings', () => {
  assert.equal(pas({ failsToSeparate: true }).grade, '1');
  assert.equal(pas({ failsToSeparate: true, placentalBulge: true }).grade, '2');
  assert.equal(pas({ invadesThroughSerosa: true }).grade, '3a');
  assert.equal(pas({ invadesThroughSerosa: true, bladderInvasion: true }).grade, '3b');
  assert.equal(pas({ invadesThroughSerosa: true, otherPelvicOrgan: true }).grade, '3c');
});

test('figo pas: 3c OUTRANKS 3b - bladder invasion does not settle the grade', () => {
  const both = pas({ invadesThroughSerosa: true, bladderInvasion: true, otherPelvicOrgan: true });
  assert.equal(both.grade, '3c');
  assert.ok(both.outrankNote.includes('WITH OR WITHOUT'));
  // With bladder alone it is 3b and no outrank note is raised.
  assert.equal(pas({ invadesThroughSerosa: true, bladderInvasion: true }).outrankNote, null);
});

test('figo pas: the 3a / 3b discriminator is the surgical plane, not proximity', () => {
  const a = pas({ invadesThroughSerosa: true, clearSurgicalPlane: true });
  assert.equal(a.grade, '3a');
  assert.ok(a.planeNote.includes('clear surgical plane'));
  const b = pas({ invadesThroughSerosa: true, bladderInvasion: true });
  assert.ok(b.planeNote.includes('discriminator is the surgical plane'));
});

test('figo pas: grade 2 requires no serosal breach', () => {
  // A bulge with a serosal breach is grade 3, not grade 2.
  assert.equal(pas({ placentalBulge: true, dimpleSign: true, invadesThroughSerosa: true }).grade, '3a');
  // Any one of the three macroscopic findings reaches grade 2.
  assert.equal(pas({ dimpleSign: true }).grade, '2');
  assert.equal(pas({ neovascularity: true }).grade, '2');
  assert.equal(pas({ placentalBulge: true }).grade, '2');
});

test('figo pas: grade 1 is adherence WITHOUT the grade-2 findings', () => {
  assert.equal(pas({ failsToSeparate: true }).grade, '1');
  assert.equal(pas({ heavyBleedingOnRemoval: true }).grade, '1');
  // Add any grade-2 finding and it is no longer grade 1.
  assert.equal(pas({ failsToSeparate: true, neovascularity: true }).grade, '2');
});

test('figo pas: the result says it is a CLINICAL grading, not a histological one', () => {
  const r = pas({ invadesThroughSerosa: true });
  assert.ok(r.clinicalNote.includes('not a histological one'));
  assert.ok(r.clinicalNote.includes('may not match'));
  // Not raised when no grade is assigned.
  assert.equal(pas({}).clinicalNote, null);
});

test('figo pas: empty input assigns no grade', () => {
  const empty = pas({});
  assert.equal(empty.valid, true);
  assert.equal(empty.grade, null);
  assert.equal(empty.outrankNote, null);
  assert.equal(pas().valid, true);
  assert.equal(pas().grade, null);
  assert.doesNotMatch(JSON.stringify(pas({ invadesThroughSerosa: true })), /NaN|Infinity/);
});

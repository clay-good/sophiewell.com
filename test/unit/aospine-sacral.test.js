// spec-v1424: AOSpine sacral classification, type from the fracture's course, subtype from its pattern.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { aospineSacral as sac } from '../../lib/aospine-sacral-v1424.js';

test('every subtype derives from its type and pattern', () => {
  const rows = [
    ['A1', { region: 'below', aPattern: 'coccygeal' }],
    ['A2', { region: 'below', aPattern: 'nondisplaced' }],
    ['A3', { region: 'below', aPattern: 'displaced' }],
    ['B1', { region: 'unilateral', bLine: 'canal' }],
    ['B2', { region: 'unilateral', bLine: 'alar' }],
    ['B3', { region: 'unilateral', bLine: 'foraminal' }],
    ['C0', { region: 'spinopelvic', cPattern: 'u-nondisplaced' }],
    ['C1', { region: 'spinopelvic', cPattern: 'u-stable' }],
    ['C2', { region: 'spinopelvic', cPattern: 'bilateral-b' }],
    ['C3', { region: 'spinopelvic', cPattern: 'u-displaced' }],
  ];
  for (const [subtype, input] of rows) {
    const r = sac(input);
    assert.equal(r.subtype, subtype, subtype);
    assert.equal(r.type, subtype[0], subtype);
  }
});

test('a pattern belonging to another type is ignored, and the type stands alone', () => {
  const r = sac({ region: 'unilateral', aPattern: 'displaced', cPattern: 'u-displaced' });
  assert.equal(r.valid, true);
  assert.equal(r.type, 'B');
  assert.equal(r.subtype, null);
  assert.equal(r.bandLabel, 'Type B');
  assert.match(r.band, /No subtype entered/);
});

test('modifiers build the code in order', () => {
  const r = sac({ region: 'unilateral', bLine: 'foraminal', neuro: 'N2', m3: true, m1: 'true' });
  assert.equal(r.code, 'B3 N2 M1 M3');
  assert.equal(r.band, 'AOSpine sacral B3 N2 M1 M3: posterior pelvic injury, a transforaminal fracture involving the foramina but not the spinal canal.');
  assert.ok(r.notes.some((n) => /not been tested for reliability/.test(n)));
});

test('a blank neurologic status is said, not read as N0', () => {
  const r = sac({ region: 'below', aPattern: 'coccygeal' });
  assert.equal(r.code, 'A1');
  assert.ok(r.notes.some((n) => /Neurologic status not entered/.test(n)));
  assert.ok(!sac({ region: 'below', aPattern: 'coccygeal', neuro: 'N0' }).notes.some((n) => /not entered/.test(n)));
});

test('displacement subtypes and B/C carry their caveats; every answer carries the subtype warning', () => {
  assert.ok(sac({ region: 'below', aPattern: 'displaced' }).notes.some((n) => /no threshold for displacement/.test(n)));
  assert.ok(sac({ region: 'spinopelvic', cPattern: 'u-nondisplaced' }).notes.some((n) => /no threshold for displacement/.test(n)));
  assert.ok(!sac({ region: 'unilateral', bLine: 'alar' }).notes.some((n) => /no threshold/.test(n)));
  assert.ok(sac({ region: 'unilateral', bLine: 'alar' }).notes.some((n) => /potentially unstable/.test(n)));
  assert.ok(!sac({ region: 'below' }).notes.some((n) => /potentially unstable/.test(n)));
  assert.ok(sac({ region: 'below' }).notes.some((n) => /0\.68 to 0\.75/.test(n)));
});

test('a missing type is asked for', () => {
  assert.equal(sac({}).valid, false);
  assert.match(sac({ bLine: 'alar' }).message, /where the fracture runs/);
  assert.equal(sac(null).valid, false);
});

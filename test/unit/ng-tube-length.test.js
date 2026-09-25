// spec-v1445: CoNEX = NEX x 0.38696 + 30.37 + 6 cm (Boeykens 2023, Crit Care, PMC10439641).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ngTubeLength } from '../../lib/ng-tube-length-v1445.js';

// Table 1 of the source, every row: NEX -> CoNEX.
const TABLE = {
  40: 52, 41: 52, 42: 53, 43: 53, 44: 53, 45: 54, 46: 54, 47: 55, 48: 55, 49: 55,
  50: 56, 51: 56, 52: 56, 53: 57, 54: 57, 55: 58, 56: 58, 57: 58, 58: 59, 59: 59,
  60: 60, 61: 60, 62: 60, 63: 61, 64: 61, 65: 62, 66: 62, 67: 62, 68: 63, 69: 63,
};

test('the formula reproduces every row of the published conversion table', () => {
  for (const [nex, conex] of Object.entries(TABLE)) {
    assert.equal(ngTubeLength({ nexCm: Number(nex) }).conexCm, conex, `NEX ${nex}`);
  }
});

test('Hanson and NEX are shown for comparison; verification is always required', () => {
  const r = ngTubeLength({ nexCm: 50 });
  assert.equal(r.hansonCm, 50);
  assert.ok(r.notes.some((n) => /does not confirm where the tip is/.test(n)));
});

test('outside the table range the answer says so', () => {
  assert.ok(ngTubeLength({ nexCm: 75 }).notes[0].includes('outside the published conversion table'));
  assert.ok(!ngTubeLength({ nexCm: 55 }).notes.some((n) => /outside the published/.test(n)));
});

test('missing and implausible measurements are refused', () => {
  assert.match(ngTubeLength({}).message, /Enter the NEX distance/);
  assert.equal(ngTubeLength({ nexCm: 5 }).valid, false);
  assert.equal(ngTubeLength({ nexCm: 'long' }).valid, false);
});

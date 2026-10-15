// spec-v1637 tool 1: the DEA number format and check digit (owner decision 2, October 15, 2026).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { deaNumberCheck as d } from '../../lib/dea-number-check-v1637.js';

test('DEA\'s own example passes; one changed digit fails', () => {
  const r = d({ deaNumber: 'MJ3614511' });
  assert.deepEqual([r.wellFormed, r.checkTotal, r.flag], [true, 31, 'well-formed']);
  assert.match(r.notes[0], /\(3 \+ 1 \+ 5\) \+ 2 × \(6 \+ 4 \+ 1\) = 9 \+ 22 = 31/);
  assert.match(r.band, /does not show the registration is real or active/);
  assert.equal(d({ deaNumber: 'MJ3614512' }).flag, 'check-digit-mismatch');
  assert.equal(d({ deaNumber: 'mj-3614511' }).wellFormed, true);
});

test('form, letters and the name: a mismatch is a note; an unlisted first letter is a note', () => {
  assert.equal(d({ deaNumber: 'M3614511' }).flag, 'not-well-formed');
  assert.match(d({ deaNumber: 'MJ3614511', lastName: 'Smith' }).notes.join(' '), /differs from the initial.*a note, not a failure/);
  assert.match(d({ deaNumber: 'MJ3614511', lastName: 'jones' }).notes.join(' '), /matches the initial/);
  assert.match(d({ deaNumber: 'XJ3614511' }).notes.join(' '), /not one of the practitioner letters/);
  assert.match(d({}).message, /^Enter the DEA number/);
  assert.match(d({ deaNumber: 5 }).message, /^Enter the DEA number/);
});

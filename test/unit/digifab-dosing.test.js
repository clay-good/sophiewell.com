// spec-v110 2.1: Digoxin immune Fab (DigiFab) dosing (Smith 1982; product
// label). By amount ingested, by steady-state level, or empiric. Vials rounded
// up to the next whole vial.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { digifabDosing } from '../../lib/tox-v110.js';

test('level mode: 4.5 ng/mL x 70 kg / 100 -> 4 vials (rounded up)', () => {
  const r = digifabDosing({ mode: 'level', level: 4.5, weight: 70 });
  assert.equal(r.valid, true);
  assert.equal(r.vials, 4); // 3.15 -> 4
  assert.match(r.band, /DigiFab 4 vials by steady-state serum level/);
});

test('amount mode: 5 mg x 0.8 / 0.5 -> 8 vials', () => {
  const r = digifabDosing({ mode: 'amount', amount: 5 });
  assert.equal(r.vials, 8);
  assert.match(r.band, /by amount ingested/);
});

test('band flip: same body burden gives different vials by mode', () => {
  // 5 mg ingested -> 8 vials; a 2 ng/mL level at 70 kg -> ceil(1.4) = 2 vials.
  const byAmount = digifabDosing({ mode: 'amount', amount: 5 });
  const byLevel = digifabDosing({ mode: 'level', level: 2, weight: 70 });
  assert.equal(byAmount.vials, 8);
  assert.equal(byLevel.vials, 2);
  assert.notEqual(byAmount.vials, byLevel.vials);
});

test('empiric acute is 10-20, chronic is 3-6', () => {
  const acute = digifabDosing({ mode: 'empiric', timing: 'acute' });
  assert.equal(acute.vialsLow, 10); assert.equal(acute.vialsHigh, 20);
  const chronic = digifabDosing({ mode: 'empiric', timing: 'chronic' });
  assert.equal(chronic.vialsLow, 3); assert.equal(chronic.vialsHigh, 6);
});

test('rounds up at the boundary (any fractional vial -> next whole)', () => {
  // 1.0 ng/mL x 60 kg / 100 = 0.6 -> 1 vial.
  assert.equal(digifabDosing({ mode: 'level', level: 1, weight: 60 }).vials, 1);
  // exactly 2.0 vials worth: 2 ng/mL x 100 kg / 100 = 2.0 -> 2.
  assert.equal(digifabDosing({ mode: 'level', level: 2, weight: 100 }).vials, 2);
});

test('guards zero / blank / negative inputs', () => {
  assert.equal(digifabDosing({ mode: 'level', level: 4, weight: 0 }).valid, false);
  assert.equal(digifabDosing({ mode: 'level', weight: 70 }).valid, false);
  assert.equal(digifabDosing({ mode: 'amount', amount: -5 }).valid, false);
});

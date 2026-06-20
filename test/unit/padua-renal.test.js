// spec-v131 2.3: PADUA renal score (Ficarra 2009, Eur Urol 56:786). Longitudinal
// (1-2) + exophytic (1-3) + rim (1-2) + sinus (1-2) + UCS (1-2) + size (1-3) ->
// total 6-14. Anterior/posterior face is a non-scoring descriptor. Tiers 6-7
// low / 8-9 intermediate / >=10 high. Distinct from the VTE Padua score.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { paduaRenal } from '../../lib/uro-v131.js';

test('the 7 to 8 low/intermediate boundary flips', () => {
  const low = paduaRenal({ longitudinal: 1, exophytic: 2, rim: 1, sinus: 1, ucs: 1, size: 1, face: 'a' });
  assert.equal(low.total, 7);
  assert.equal(low.complexity, 'low');
  const mid = paduaRenal({ longitudinal: 2, exophytic: 2, rim: 1, sinus: 1, ucs: 1, size: 1, face: 'a' });
  assert.equal(mid.total, 8);
  assert.equal(mid.complexity, 'intermediate');
  assert.equal(mid.abnormal, true);
  assert.equal(mid.face, 'a');
});

test('the minimum is 6 (low) and the maximum is 14 (high)', () => {
  const min = paduaRenal({ longitudinal: 1, exophytic: 1, rim: 1, sinus: 1, ucs: 1, size: 1, face: 'p' });
  assert.equal(min.total, 6);
  assert.equal(min.complexity, 'low');
  const max = paduaRenal({ longitudinal: 2, exophytic: 3, rim: 2, sinus: 2, ucs: 2, size: 3, face: 'p' });
  assert.equal(max.total, 14);
  assert.equal(max.complexity, 'high');
});

test('the >=10 high band', () => {
  const r = paduaRenal({ longitudinal: 2, exophytic: 3, rim: 2, sinus: 1, ucs: 1, size: 1, face: 'a' });
  assert.equal(r.total, 10);
  assert.equal(r.complexity, 'high');
});

test('a blank component or a missing face surfaces valid:false', () => {
  assert.equal(paduaRenal({ longitudinal: 0, exophytic: 2, rim: 1, sinus: 1, ucs: 1, size: 1, face: 'a' }).valid, false);
  assert.equal(paduaRenal({ longitudinal: 1, exophytic: 2, rim: 1, sinus: 1, ucs: 1, size: 1, face: 'x' }).valid, false); // face must be a or p
  assert.equal(paduaRenal({ longitudinal: 3, exophytic: 2, rim: 1, sinus: 1, ucs: 1, size: 1, face: 'a' }).valid, false); // longitudinal has no level 3
  assert.equal(paduaRenal(8).valid, false);
});

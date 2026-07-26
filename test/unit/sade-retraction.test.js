// spec-v451: Sade tympanic-membrane retraction grade (I-IV).
// Worked-example tests: each grade and its otoscopy description, numeric input, and the invalid-grade guard.
// Grades transcribed from Sade & Berco 1976 (Ann Otol Rhinol Laryngol) (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sadeRetraction } from '../../lib/sade-retraction-v451.js';

test('grade III: touching the promontory (the META example)', () => {
  const r = sadeRetraction({ grade: 'III' });
  assert.equal(r.valid, true);
  assert.equal(r.grade, 'III');
  assert.match(r.band, /touching the promontory \(atelectasis\)/);
});

test('grade I: mild, not touching the incus', () => {
  const r = sadeRetraction({ grade: 'I' });
  assert.equal(r.grade, 'I');
  assert.match(r.band, /mild \(slight\) retraction/);
});

test('grade II: touching the incus or stapes', () => {
  assert.match(sadeRetraction({ grade: 'II' }).band, /touching the incus or stapes/);
});

test('grade IV: adherent, adhesive otitis media', () => {
  const r = sadeRetraction({ grade: 'IV' });
  assert.equal(r.grade, 'IV');
  assert.match(r.band, /adhesive otitis media/);
});

test('numeric input maps to the grades', () => {
  assert.equal(sadeRetraction({ grade: 1 }).grade, 'I');
  assert.equal(sadeRetraction({ grade: 4 }).grade, 'IV');
});

test('a missing or out-of-range grade is invalid', () => {
  assert.equal(sadeRetraction({}).valid, false);
  assert.equal(sadeRetraction({ grade: 'V' }).valid, false);
  assert.equal(sadeRetraction({ grade: '0' }).valid, false);
});

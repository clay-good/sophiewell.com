// spec-v320: Clavien-Dindo classification of surgical complications. Worked-example tests:
// each grade and its definition, the IIIa vs IIIb (general anesthesia) split, the IVa/IVb
// organ-dysfunction split, grade V (death), case-insensitive input with sub-grade
// normalization, and the invalid-grade guard (including bare "III"). Criteria transcribed
// from Dindo 2004 (Ann Surg), cross-verified against the 2009 five-year experience (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { clavienDindo } from '../../lib/clavien-dindo-v320.js';

test('grade IIIa: intervention not under general anesthesia (the META example)', () => {
  const r = clavienDindo({ grade: 'IIIa' });
  assert.equal(r.valid, true);
  assert.equal(r.grade, 'IIIa');
  assert.equal(r.severe, false);
  assert.match(r.band, /intervention, not under general anesthesia/);
});

test('grade IIIb is the same intervention under general anesthesia, severe', () => {
  const r = clavienDindo({ grade: 'IIIb' });
  assert.equal(r.grade, 'IIIb');
  assert.equal(r.severe, true);
  assert.match(r.band, /under general anesthesia/);
});

test('grades I and II are treated without an intervention, not severe', () => {
  assert.equal(clavienDindo({ grade: 'I' }).severe, false);
  const ii = clavienDindo({ grade: 'II' });
  assert.equal(ii.severe, false);
  assert.match(ii.band, /blood transfusions and total parenteral nutrition/);
});

test('IVa is single-organ and IVb is multiorgan dysfunction, both severe', () => {
  const a = clavienDindo({ grade: 'IVa' });
  const b = clavienDindo({ grade: 'IVb' });
  assert.equal(a.severe, true);
  assert.equal(b.severe, true);
  assert.match(a.band, /single-organ dysfunction/);
  assert.match(b.band, /multiorgan dysfunction/);
});

test('grade V is death', () => {
  const r = clavienDindo({ grade: 'V' });
  assert.equal(r.grade, 'V');
  assert.equal(r.severe, true);
  assert.match(r.band, /death of the patient/);
});

test('input is case-insensitive and normalizes the sub-grade suffix', () => {
  assert.equal(clavienDindo({ grade: 'iiia' }).grade, 'IIIa');
  assert.equal(clavienDindo({ grade: 'IVA' }).grade, 'IVa');
});

test('a missing, bare-III, or unknown grade is invalid', () => {
  assert.equal(clavienDindo({}).valid, false);
  assert.equal(clavienDindo({ grade: 'III' }).valid, false); // must specify a or b
  assert.equal(clavienDindo({ grade: 'X' }).valid, false);
});

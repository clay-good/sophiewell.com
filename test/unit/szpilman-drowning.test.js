// spec-v111 2.2: Szpilman drowning classification (Szpilman 1997). A bedside
// decision tree on cough / auscultation / pulmonary edema / hypotension /
// arrest -> Rescue, grade 1-6, or Dead, with the original-series mortality.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { szpilmanDrowning } from '../../lib/enviro-v111.js';

test('breathing, normal auscultation, no cough -> Rescue (~0%)', () => {
  const r = szpilmanDrowning({ status: 'breathing', auscultation: 'normal', cough: false });
  assert.equal(r.valid, true);
  assert.equal(r.grade, 0);
  assert.equal(r.label, 'Rescue');
  assert.equal(r.mortality, '~0%');
});

test('band flip: adding a cough moves Rescue -> grade 1', () => {
  const rescue = szpilmanDrowning({ status: 'breathing', auscultation: 'normal', cough: false });
  const grade1 = szpilmanDrowning({ status: 'breathing', auscultation: 'normal', cough: true });
  assert.equal(rescue.grade, 0);
  assert.equal(grade1.grade, 1);
});

test('band flip: rales in some fields -> grade 2 (mortality up from grade 1)', () => {
  const r = szpilmanDrowning({ status: 'breathing', auscultation: 'rales-some' });
  assert.equal(r.grade, 2);
  assert.equal(r.mortality, '~0.6%');
  assert.match(r.band, /rales in some lung fields/);
});

test('pulmonary edema: hypotension flips grade 3 -> grade 4', () => {
  const g3 = szpilmanDrowning({ status: 'breathing', auscultation: 'pulmonary-edema', hypotension: false });
  const g4 = szpilmanDrowning({ status: 'breathing', auscultation: 'pulmonary-edema', hypotension: true });
  assert.equal(g3.grade, 3); assert.equal(g3.mortality, '~5.2%');
  assert.equal(g4.grade, 4); assert.equal(g4.mortality, '~19.4%');
});

test('arrest limbs: respiratory arrest -> grade 5, cardiac arrest -> grade 6, dead -> Dead', () => {
  assert.equal(szpilmanDrowning({ status: 'respiratory-arrest' }).grade, 5);
  assert.equal(szpilmanDrowning({ status: 'cardiac-arrest' }).grade, 6);
  assert.equal(szpilmanDrowning({ status: 'cardiac-arrest' }).mortality, '~93%');
  assert.equal(szpilmanDrowning({ status: 'dead' }).label, 'Dead');
});

test('missing status / auscultation returns a complete-the-fields fallback', () => {
  assert.equal(szpilmanDrowning({}).valid, false);
  assert.equal(szpilmanDrowning({ status: 'breathing' }).valid, false);
});

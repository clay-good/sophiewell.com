// spec-v119 2.3: Boston Criteria v2.0 (Charidimou 2022). Diagnostic-certainty
// classification: definite / probable with supporting pathology / probable /
// possible. In-vivo categories need age >= 50, a compatible presentation, and no
// deep hemorrhagic lesion; v2.0 adds the non-hemorrhagic white-matter feature.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { bostonCaa } from '../../lib/neuro-v119.js';

test('full postmortem -> Definite CAA (pathology outranks MRI)', () => {
  const r = bostonCaa({ pathology: 'postmortem' });
  assert.equal(r.valid, true);
  assert.equal(r.category, 'Definite CAA');
  assert.equal(r.abnormal, true);
});

test('biopsy / evacuated-hematoma specimen -> Probable CAA with supporting pathology', () => {
  const r = bostonCaa({ pathology: 'specimen' });
  assert.equal(r.category, 'Probable CAA with supporting pathology');
});

test('two lobar hemorrhagic lesions in vivo -> Probable CAA', () => {
  const r = bostonCaa({ age50: true, presentation: true, lobar: '2' });
  assert.equal(r.category, 'Probable CAA');
  assert.equal(r.abnormal, true);
  assert.match(r.band, />= 2 strictly lobar/);
});

test('one lobar lesion plus a white-matter feature -> Probable CAA', () => {
  const r = bostonCaa({ age50: true, presentation: true, lobar: '1', wm: true });
  assert.equal(r.category, 'Probable CAA');
});

test('one lobar lesion alone -> Possible CAA (the probable-vs-possible band-flip)', () => {
  const r = bostonCaa({ age50: true, presentation: true, lobar: '1' });
  assert.equal(r.category, 'Possible CAA');
});

test('a white-matter feature alone -> Possible CAA (v2.0 non-hemorrhagic path)', () => {
  const r = bostonCaa({ age50: true, presentation: true, wm: true });
  assert.equal(r.category, 'Possible CAA');
});

test('a deep hemorrhagic lesion excludes the lobar-restricted categories', () => {
  const r = bostonCaa({ age50: true, presentation: true, lobar: '2', deep: true });
  assert.equal(r.category, 'Criteria not met');
  assert.equal(r.abnormal, false);
});

test('age under 50 or missing presentation cannot be classified in vivo', () => {
  assert.equal(bostonCaa({ presentation: true, lobar: '2' }).category, 'Criteria not met');
  assert.equal(bostonCaa({ age50: true, lobar: '2' }).category, 'Criteria not met');
});

test('no qualifying lobar lesion and no white-matter feature -> Criteria not met', () => {
  const r = bostonCaa({ age50: true, presentation: true });
  assert.equal(r.category, 'Criteria not met');
});

test('scalar / non-object fuzz arg yields a valid result, never throws', () => {
  const r = bostonCaa(3);
  assert.equal(r.valid, true);
  assert.equal(typeof r.category, 'string');
});

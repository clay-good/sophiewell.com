// spec-v911: NIH 2014 global severity for chronic graft-versus-host disease. The tests that
// matter are the lung override and the refusal to read a blank as a zero.

import test from 'node:test';
import assert from 'node:assert/strict';
import { cgvhdSeverity, CGVHD_NOTE, ORGANS, ORGAN_SCORE_OPTIONS } from '../../lib/cgvhd-severity-v911.js';

test('cgvhd-severity: nothing assessed is not a severity', () => {
  assert.equal(cgvhdSeverity({}).valid, false);
  assert.match(cgvhdSeverity({}).message, /Score at least one organ/);
  assert.equal(cgvhdSeverity({ skin: 'na' }).valid, false);
});

test('cgvhd-severity: one or two organs at 1 with the lung at 0 is mild', () => {
  const r = cgvhdSeverity({ skin: '1', mouth: '1', lungs: '0' });
  assert.equal(r.severity, 'mild');
  assert.equal(r.abnormal, false);
});

test('cgvhd-severity: three organs at 1 is moderate', () => {
  const r = cgvhdSeverity({ skin: '1', mouth: '1', eyes: '1', lungs: '0' });
  assert.equal(r.severity, 'moderate');
  assert.match(r.band, /three or more at 1 is moderate/);
});

test('cgvhd-severity: any organ at 2 is moderate', () => {
  assert.equal(cgvhdSeverity({ skin: '2', lungs: '0' }).severity, 'moderate');
});

test('cgvhd-severity: any organ at 3 is severe', () => {
  const r = cgvhdSeverity({ skin: '3', lungs: '0' });
  assert.equal(r.severity, 'severe');
  assert.equal(r.abnormal, true);
});

test('cgvhd-severity: a lung score of 1 makes it moderate on its own', () => {
  const r = cgvhdSeverity({ skin: '0', mouth: '0', lungs: '1' });
  assert.equal(r.severity, 'moderate');
  assert.match(r.band, /that alone makes the disease at least moderate/);
});

test('cgvhd-severity: a lung score of 2 is severe, though 2 in any other organ is moderate', () => {
  assert.equal(cgvhdSeverity({ lungs: '2' }).severity, 'severe');
  assert.equal(cgvhdSeverity({ liver: '2' }).severity, 'moderate');
  assert.equal(cgvhdSeverity({ lungs: '3' }).severity, 'severe');
  assert.match(cgvhdSeverity({ skin: '1', lungs: '2' }).band, /whatever the other organs show/);
});

test('cgvhd-severity: an organ not assessed is not scored 0', () => {
  const r = cgvhdSeverity({ skin: '1' });
  assert.equal(r.notAssessedCount, 7);
  assert.equal(r.assessedCount, 1);
  assert.equal(r.lungScore, null);
  assert.match(r.notAssessedNote, /Not assessed is not the same as scored 0/);
  assert.match(r.band, /the lung was not assessed/);
});

test('cgvhd-severity: every organ scored 0 is no involvement, not mild', () => {
  const all = {};
  for (const organ of ORGANS) all[organ.key] = '0';
  const r = cgvhdSeverity(all);
  assert.equal(r.severity, 'none');
  assert.equal(r.abnormal, false);
  assert.equal(r.notAssessedCount, 0);
  assert.match(r.notAssessedNote, /All eight organs were assessed/);
});

test('cgvhd-severity: an unrecognized score is treated as not assessed, not as a number', () => {
  const r = cgvhdSeverity({ skin: '4', mouth: 'yes', eyes: '1' });
  assert.equal(r.assessedCount, 1);
  assert.equal(r.severity, 'mild');
});

test('cgvhd-severity: the lung override, the diagnosis gate and the acute contrast always print', () => {
  const r = cgvhdSeverity({ skin: '1' });
  assert.match(r.lungNote, /scores on its own/);
  assert.match(r.diagnosisNote, /diagnosis is already made/);
  assert.match(r.acuteNote, /Chronic is not acute/);
  assert.match(r.treatmentNote, /not itself a treatment decision/);
  assert.match(r.scopeNote, /does not choose therapy/);
  assert.match(CGVHD_NOTE, /most often missed/);
  assert.equal(ORGANS.length, 8);
  assert.deepEqual(ORGAN_SCORE_OPTIONS.map((o) => o.value), ['na', '0', '1', '2', '3']);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { hfStagesAbcd as hfs } from '../../lib/hf-stages-abcd-v842.js';

test('hf stages: the four stages', () => {
  assert.equal(hfs({ riskFactors: true }).stage, 'A');
  assert.equal(hfs({ structuralHeartDisease: true }).stage, 'B');
  assert.equal(hfs({ structuralHeartDisease: true, currentSymptoms: true }).stage, 'C');
  assert.equal(hfs({ structuralHeartDisease: true, currentSymptoms: true, advancedFeatures: true }).stage, 'D');
});

test('hf stages: stage C includes PREVIOUS symptoms, so resolution does not go back to B', () => {
  // The directional point, and the contrast with the atrial fibrillation stages.
  const resolved = hfs({ structuralHeartDisease: true, previousSymptoms: true });
  assert.equal(resolved.stage, 'C');
  assert.ok(resolved.directionNote.includes('does not move a patient back to stage B'));
  assert.ok(resolved.directionNote.includes('atrial fibrillation stages'));
  // With current symptoms the note is not raised - nothing has resolved.
  assert.equal(hfs({ structuralHeartDisease: true, currentSymptoms: true }).directionNote, null);
});

test('hf stages: the 2022 biomarker route into stage B', () => {
  // Risk factors PLUS a raised biomarker, with a structurally normal heart.
  const r = hfs({ riskFactors: true, raisedBiomarkers: true });
  assert.equal(r.stage, 'B');
  assert.ok(r.biomarkerNote.includes('would call this stage A'));
  // Without the risk factors that route does not open.
  const orphan = hfs({ raisedBiomarkers: true });
  assert.equal(orphan.stage, null);
  assert.ok(orphan.orphanBiomarkerNote.includes('requires the risk factors'));
});

test('hf stages: stage A requires the absence of everything else', () => {
  assert.equal(hfs({ riskFactors: true }).stage, 'A');
  assert.equal(hfs({ riskFactors: true, structuralHeartDisease: true }).stage, 'B');
  assert.equal(hfs({ riskFactors: true, raisedFillingPressures: true }).stage, 'B');
  assert.equal(hfs({ riskFactors: true, raisedBiomarkers: true }).stage, 'B');
});

test('hf stages: stage C needs structural disease as well as symptoms', () => {
  const r = hfs({ riskFactors: true, currentSymptoms: true });
  assert.notEqual(r.stage, 'C');
  assert.ok(r.symptomsWithoutStructureNote.includes('requires both'));
});

test('hf stages: stage D needs symptoms as well as the advanced features', () => {
  assert.equal(hfs({ structuralHeartDisease: true, advancedFeatures: true }).stage, 'B');
  assert.equal(hfs({ structuralHeartDisease: true, previousSymptoms: true, advancedFeatures: true }).stage, 'D');
});

test('hf stages: empty input', () => {
  const empty = hfs({});
  assert.equal(empty.valid, true);
  assert.equal(empty.stage, null);
  assert.equal(empty.directionNote, null);
  assert.equal(hfs().stage, null);
  assert.doesNotMatch(JSON.stringify(hfs({ structuralHeartDisease: true, currentSymptoms: true })), /NaN|Infinity/);
});

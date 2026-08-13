// spec-v720: Angle classification of malocclusion.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { angleMalocclusion } from '../../lib/angle-malocclusion-v720.js';

test('neutroclusion -> Class I (normal)', () => {
  const r = angleMalocclusion({ molarRelationship: 'neutroclusion' });
  assert.equal(r.valid, true);
  assert.equal(r.angleClass, 'I');
  assert.equal(r.division, null);
  assert.equal(r.abnormal, false);
  assert.match(r.band, /Angle Class I/);
});

test('distoclusion + proclined -> Class II Division 1', () => {
  const r = angleMalocclusion({ molarRelationship: 'distoclusion', incisors: 'proclined' });
  assert.equal(r.angleClass, 'II');
  assert.equal(r.division, 1);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /Angle Class II Division 1/);
});

test('distoclusion + retroclined -> Class II Division 2', () => {
  const r = angleMalocclusion({ molarRelationship: 'distoclusion', incisors: 'retroclined' });
  assert.equal(r.angleClass, 'II');
  assert.equal(r.division, 2);
});

test('mesioclusion -> Class III', () => {
  const r = angleMalocclusion({ molarRelationship: 'mesioclusion' });
  assert.equal(r.angleClass, 'III');
  assert.equal(r.abnormal, true);
});

test('Class II requires the incisor pattern; molar relationship required', () => {
  assert.equal(angleMalocclusion({}).valid, false);
  assert.equal(angleMalocclusion({}).field, 'molarRelationship');
  const noDiv = angleMalocclusion({ molarRelationship: 'distoclusion' });
  assert.equal(noDiv.valid, false);
  assert.equal(noDiv.field, 'incisors');
  assert.equal(angleMalocclusion({ molarRelationship: 'other' }).valid, false);
});

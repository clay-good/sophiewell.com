// spec-v789: acute pericarditis diagnostic criteria.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { pericarditis } from '../../lib/pericarditis-v789.js';

test('nothing selected -> 0 of 4, criteria not met', () => {
  const r = pericarditis({});
  assert.equal(r.valid, true);
  assert.equal(r.criteriaMet, 0);
  assert.equal(r.diagnostic, false);
  assert.equal(r.abnormal, false);
});

test('one criterion is not enough; two is', () => {
  assert.equal(pericarditis({ chestPain: true }).diagnostic, false);
  assert.equal(pericarditis({ chestPain: true, ecgChanges: true }).diagnostic, true);
});

test('supporting findings do NOT count toward the two', () => {
  const both = pericarditis({ inflammatoryMarkers: true, imagingInflammation: true });
  assert.equal(both.criteriaMet, 0);
  assert.equal(both.diagnostic, false);
  // One real criterion plus both supporting findings is still one criterion.
  const one = pericarditis({ chestPain: true, inflammatoryMarkers: true, imagingInflammation: true });
  assert.equal(one.criteriaMet, 1);
  assert.equal(one.diagnostic, false);
  assert.equal(one.supporting.length, 2);
});

test('all four criteria -> 4 of 4', () => {
  const r = pericarditis({ chestPain: true, frictionRub: true, ecgChanges: true, effusion: true });
  assert.equal(r.criteriaMet, 4);
  assert.equal(r.diagnostic, true);
});

test('the course is classified separately and does not change the count', () => {
  const acute = pericarditis({ chestPain: true, effusion: true });
  const recurrent = pericarditis({ chestPain: true, effusion: true, course: 'recurrent' });
  assert.equal(acute.criteriaMet, recurrent.criteriaMet);
  assert.equal(acute.course, 'acute');
  assert.equal(recurrent.course, 'recurrent');
  assert.match(recurrent.courseLabel, /symptom-free interval/);
});

test('every published course is accepted and an unknown one is rejected', () => {
  for (const c of ['acute', 'incessant', 'recurrent', 'chronic']) {
    assert.equal(pericarditis({ course: c }).valid, true, c);
  }
  const bad = pericarditis({ course: 'subacute' });
  assert.equal(bad.valid, false);
  assert.equal(bad.field, 'course');
});

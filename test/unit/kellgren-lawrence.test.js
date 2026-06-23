// spec-v145 2.3: Kellgren-Lawrence osteoarthritis grade (Kellgren & Lawrence
// 1957). Grade 0-4; grade >= 2 is the threshold for definite radiographic OA.
// Includes the 2->3 grade boundary.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { kellgrenLawrence } from '../../lib/ortho-v145.js';

test('grade 0 -> none, not abnormal, not definite OA', () => {
  const r = kellgrenLawrence({ grade: '0' });
  assert.equal(r.valid, true);
  assert.equal(r.grade, 0);
  assert.equal(r.abnormal, false);
  assert.equal(r.definiteOA, false);
});

test('grade 1 -> doubtful, below the definite-OA threshold', () => {
  const r = kellgrenLawrence({ grade: 1 });
  assert.equal(r.abnormal, false);
  assert.equal(r.definiteOA, false);
});

test('grade 2 -> minimal, definite radiographic OA threshold', () => {
  const r = kellgrenLawrence({ grade: '2' });
  assert.equal(r.abnormal, true);
  assert.equal(r.definiteOA, true);
  assert.match(r.band, /threshold for definite radiographic OA/);
});

test('grade 3 boundary -> moderate, definite OA', () => {
  const r = kellgrenLawrence({ grade: 3 });
  assert.equal(r.classification, '3');
  assert.equal(r.definiteOA, true);
  assert.match(r.band, /moderate/);
});

test('grade 4 -> severe', () => {
  const r = kellgrenLawrence({ grade: '4' });
  assert.equal(r.grade, 4);
  assert.match(r.band, /severe|large osteophytes/);
});

test('out-of-range / missing grade -> invalid', () => {
  assert.equal(kellgrenLawrence({ grade: '5' }).valid, false);
  assert.equal(kellgrenLawrence({}).valid, false);
});

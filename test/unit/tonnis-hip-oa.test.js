// spec-v354: Tonnis classification (grade) of hip osteoarthritis (grades 0-3). Worked-example tests:
// each grade and its radiographic description, the radiographic-OA flag on grades 2-3, string/number
// input, and the invalid-grade guard. Bands transcribed from Tonnis 1987, cross-verified against CORR
// "Classifications in Brief" 2018 and Radiopaedia (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { tonnisHipOa } from '../../lib/tonnis-hip-oa-v354.js';

test('grade 2: small cysts / moderate narrowing, radiographic OA, flagged (the META example)', () => {
  const r = tonnisHipOa({ grade: '2' });
  assert.equal(r.valid, true);
  assert.equal(r.grade, '2');
  assert.equal(r.osteoarthritis, true);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /small subchondral cysts/);
});

test('grades 0-1 are below the radiographic-OA threshold and not flagged', () => {
  assert.match(tonnisHipOa({ grade: '0' }).band, /no radiographic signs/);
  assert.match(tonnisHipOa({ grade: '1' }).band, /increased sclerosis/);
  for (const g of ['0', '1']) {
    assert.equal(tonnisHipOa({ grade: g }).osteoarthritis, false, g);
  }
});

test('grade 3 is end-stage (large cysts / severe narrowing / AVN) and flagged', () => {
  const r = tonnisHipOa({ grade: '3' });
  assert.equal(r.osteoarthritis, true);
  assert.equal(r.grade, '3');
  assert.match(r.band, /end-stage/);
});

test('string and number input both resolve', () => {
  assert.equal(tonnisHipOa({ grade: 2 }).grade, '2');
  assert.equal(tonnisHipOa({ grade: '3' }).grade, '3');
  assert.equal(tonnisHipOa({ grade: 0 }).osteoarthritis, false);
});

test('a missing or out-of-range grade is invalid', () => {
  assert.equal(tonnisHipOa({}).valid, false);
  assert.equal(tonnisHipOa({ grade: '4' }).valid, false);
  assert.equal(tonnisHipOa({ grade: 'I' }).valid, false);
});

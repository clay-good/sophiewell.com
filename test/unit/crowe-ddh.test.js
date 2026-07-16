// spec-v353: Crowe classification of adult developmental dysplasia of the hip (grades I-IV). Worked-
// example tests: each grade and its subluxation band, the higher-grade flag on III-IV, roman + numeric
// + case-insensitive input, and the invalid-grade guard. Bands transcribed from Crowe, Mani & Ranawat
// 1979 (JBJS), cross-verified against orthopedic references (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { croweDdh } from '../../lib/crowe-ddh-v353.js';

test('grade III: 75-100% subluxation, flagged higher grade (the META example)', () => {
  const r = croweDdh({ grade: 'III' });
  assert.equal(r.valid, true);
  assert.equal(r.grade, 'III');
  assert.equal(r.severe, true);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /75 to 100%/);
});

test('grades I-II are lower grades and not flagged', () => {
  assert.match(croweDdh({ grade: 'I' }).band, /less than 50%/);
  assert.match(croweDdh({ grade: 'II' }).band, /50 to 75%/);
  for (const g of ['I', 'II']) {
    assert.equal(croweDdh({ grade: g }).severe, false, g);
  }
});

test('grade IV is >100% (high / complete dislocation) and flagged', () => {
  const r = croweDdh({ grade: 'IV' });
  assert.equal(r.severe, true);
  assert.equal(r.grade, 'IV');
  assert.match(r.band, /greater than 100%/);
});

test('numeric and case-insensitive input map to the grades', () => {
  assert.equal(croweDdh({ grade: 3 }).grade, 'III');
  assert.equal(croweDdh({ grade: '4' }).grade, 'IV');
  assert.equal(croweDdh({ grade: 'ii' }).grade, 'II');
  assert.equal(croweDdh({ grade: 'iv' }).grade, 'IV');
});

test('a missing or out-of-range grade is invalid', () => {
  assert.equal(croweDdh({}).valid, false);
  assert.equal(croweDdh({ grade: 'V' }).valid, false);
  assert.equal(croweDdh({ grade: '0' }).valid, false);
});

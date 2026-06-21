// spec-v135 2.4: Hasenclever International Prognostic Score for advanced Hodgkin
// lymphoma (Hasenclever D, Diehl V, N Engl J Med 1998;339:1506-1514). Seven
// adverse factors, one point each. The boundary tests pin each threshold
// (albumin 4, Hgb 10.5, age 45, WBC 15) and the lymphocytopenia OR-rule.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hodgkinIps } from '../../lib/lymphoma-v135.js';

const noneFactors = { albumin: 4.5, hgb: 12, male: 'no', age: 30, stage4: 'no', wbc: 10, lymphCount: 1500, lymphPct: 20 };

test('no adverse factors is count 0', () => {
  const r = hodgkinIps(noneFactors);
  assert.equal(r.count, 0);
  assert.equal(r.abnormal, false);
});

test('albumin < 4 and Hgb < 10.5 boundaries', () => {
  assert.equal(hodgkinIps({ ...noneFactors, albumin: 4 }).count, 0);
  assert.equal(hodgkinIps({ ...noneFactors, albumin: 3.99 }).count, 1);
  assert.equal(hodgkinIps({ ...noneFactors, hgb: 10.5 }).count, 0);
  assert.equal(hodgkinIps({ ...noneFactors, hgb: 10.4 }).count, 1);
});

test('age >= 45 and WBC >= 15 are inclusive edges', () => {
  assert.equal(hodgkinIps({ ...noneFactors, age: 44 }).count, 0);
  assert.equal(hodgkinIps({ ...noneFactors, age: 45 }).count, 1);
  assert.equal(hodgkinIps({ ...noneFactors, wbc: 14.9 }).count, 0);
  assert.equal(hodgkinIps({ ...noneFactors, wbc: 15 }).count, 1);
});

test('lymphocytopenia fires on < 600/uL OR < 8% of WBC', () => {
  assert.equal(hodgkinIps({ ...noneFactors, lymphCount: 599, lymphPct: 20 }).count, 1);
  assert.equal(hodgkinIps({ ...noneFactors, lymphCount: 1500, lymphPct: 7 }).count, 1);
  assert.equal(hodgkinIps({ ...noneFactors, lymphCount: 600, lymphPct: 8 }).count, 0);
});

test('worked example: 4 factors -> FFP framing', () => {
  const r = hodgkinIps({ albumin: 3.5, hgb: 10, male: 'yes', age: 48, stage4: 'no', wbc: 12, lymphCount: 700, lymphPct: 10 });
  assert.equal(r.count, 4);
  assert.match(r.band, /4 of 7 adverse factors/);
});

test('all seven factors is count 7', () => {
  const r = hodgkinIps({ albumin: 3, hgb: 9, male: 'yes', age: 60, stage4: 'yes', wbc: 20, lymphCount: 400, lymphPct: 5 });
  assert.equal(r.count, 7);
});

test('blank inputs surface the fallback', () => {
  assert.equal(hodgkinIps({}).valid, false);
  assert.equal(hodgkinIps({ albumin: 3 }).valid, false);
});

// spec-v239: worked examples for the hepatology / GI-surgery scores. Point systems
// / formulas spec-v97 verified (Bonacini 1997; Islam 2005; Linder & Wacha 1987;
// Boey 1987).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { bonaciniCds, guci, mannheimPeritonitisIndex, boeyScore } from '../../lib/gisurg-v239.js';

test('bonacini-cds: >= 8 cirrhosis likely', () => {
  const r = bonaciniCds({ platelet: 90, altAstRatio: 0.5, inr: 1.5 }); // 5+3+2 = 10
  assert.equal(r.score, 10);
  assert.equal(r.abnormal, true);
});
test('bonacini-cds: low score unlikely', () => {
  const r = bonaciniCds({ platelet: 400, altAstRatio: 2, inr: 1 }); // 0+0+0
  assert.equal(r.score, 0);
  assert.equal(r.abnormal, false);
});

test('guci: > 1.0 suggests cirrhosis', () => {
  const r = guci({ ast: 60, astUln: 40, inr: 1.2, platelet: 150 }); // 1.5*1.2*100/150 = 1.2
  assert.equal(r.score, 1.2);
  assert.equal(r.abnormal, true);
});

test('mannheim: >= 26 high mortality', () => {
  const r = mannheimPeritonitisIndex({ ageOver50: true, female: true, organFailure: true, diffuse: true, exudate: 6 });
  assert.equal(r.score, 29);
  assert.equal(r.abnormal, true);
});
test('mannheim: low score', () => {
  const r = mannheimPeritonitisIndex({ female: true, exudate: 0 });
  assert.equal(r.score, 5);
  assert.equal(r.abnormal, false);
});

test('boey: 2 factors', () => {
  const r = boeyScore({ shock: true, delayed: true });
  assert.equal(r.score, 2);
  assert.equal(r.abnormal, true);
});
test('boey: zero factors', () => {
  const r = boeyScore({});
  assert.equal(r.score, 0);
  assert.equal(r.abnormal, false);
});

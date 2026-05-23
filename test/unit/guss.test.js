import { test } from 'node:test';
import assert from 'node:assert/strict';
import { guss } from '../../lib/scoring-v4.js';

const sub = (sw, cg = 1, dr = 1, vc = 1) => ({ Swallow: sw, NoCough: cg, NoDrool: dr, NoVoiceChange: vc });
function make(stage1, semi, liq, sol) {
  const expand = (prefix, sub) => ({
    [`${prefix}Swallow`]: sub.Swallow,
    [`${prefix}NoCough`]: sub.NoCough,
    [`${prefix}NoDrool`]: sub.NoDrool,
    [`${prefix}NoVoiceChange`]: sub.NoVoiceChange,
  });
  return {
    vigilance: stage1[0], coughClear: stage1[1], salivaSwallow: stage1[2],
    salivaNoDrool: stage1[3], salivaNoVoiceChange: stage1[4],
    ...expand('semisolid', semi),
    ...expand('liquid', liq),
    ...expand('solid', sol),
  };
}
const pass5 = sub(2, 1, 1, 1); // 5 points
const fail = sub(0, 0, 0, 0);  // 0 points

test('guss perfect (tile example) -> 20, slight/no dysphagia', () => {
  const r = guss(make([1, 1, 1, 1, 1], pass5, pass5, pass5));
  assert.equal(r.score, 20);
  assert.equal(r.band, 'slight / no dysphagia');
  assert.deepEqual(r.gated, []);
  assert.match(r.text, /Normal diet/);
});

test('guss stage 1 = 4 -> gated, total 4, severe dysphagia', () => {
  const r = guss(make([1, 1, 1, 1, 0], pass5, pass5, pass5));
  assert.equal(r.stage1, 4);
  assert.equal(r.score, 4);
  assert.equal(r.band, 'severe dysphagia');
  assert.equal(r.semisolid, 0);
  assert.equal(r.liquid, 0);
  assert.equal(r.solid, 0);
  assert.deepEqual(r.gated, ['semisolid', 'liquid', 'solid']);
});

test('guss stage 1 = 5, semisolid = 4 -> total 9, severe (lower edge)', () => {
  const r = guss(make([1, 1, 1, 1, 1], sub(2, 1, 1, 0), pass5, pass5));
  assert.equal(r.stage1, 5);
  assert.equal(r.semisolid, 4);
  assert.equal(r.score, 9);
  assert.equal(r.band, 'severe dysphagia');
  assert.deepEqual(r.gated, ['liquid', 'solid']);
});

test('guss stage 1 = 5, semisolid = 5, liquid = 4 -> total 14, moderate (upper edge)', () => {
  const r = guss(make([1, 1, 1, 1, 1], pass5, sub(2, 1, 1, 0), pass5));
  assert.equal(r.score, 14);
  assert.equal(r.band, 'moderate dysphagia');
  assert.deepEqual(r.gated, ['solid']);
});

test('guss stage 1 = 5, semisolid = 5, liquid = 5, solid = 4 -> total 19, slight (upper edge)', () => {
  const r = guss(make([1, 1, 1, 1, 1], pass5, pass5, sub(2, 1, 1, 0)));
  assert.equal(r.score, 19);
  assert.equal(r.band, 'slight dysphagia');
  assert.deepEqual(r.gated, []);
});

test('guss boundary: 10 -> moderate (lower edge)', () => {
  // stage1=5, semisolid=5 (=10 so far), liquid=0 (gates out solid)
  const r = guss(make([1, 1, 1, 1, 1], pass5, fail, pass5));
  assert.equal(r.score, 10);
  assert.equal(r.band, 'moderate dysphagia');
  assert.deepEqual(r.gated, ['solid']);
});

test('guss boundary: 15 -> slight (lower edge)', () => {
  // stage1=5, semisolid=5, liquid=5, solid=0 -> 15
  const r = guss(make([1, 1, 1, 1, 1], pass5, pass5, fail));
  assert.equal(r.score, 15);
  assert.equal(r.band, 'slight dysphagia');
  assert.deepEqual(r.gated, []);
});

test('guss all-zero -> total 0, severe, all gated', () => {
  const r = guss(make([0, 0, 0, 0, 0], fail, fail, fail));
  assert.equal(r.score, 0);
  assert.equal(r.band, 'severe dysphagia');
  assert.deepEqual(r.gated, ['semisolid', 'liquid', 'solid']);
});

test('guss text mentions Trapl 2007', () => {
  assert.match(guss(make([1, 1, 1, 1, 1], pass5, pass5, pass5)).text, /Trapl 2007/);
  assert.match(guss(make([0, 0, 0, 0, 0], fail, fail, fail)).text, /Trapl 2007/);
});

test('guss rejects bad inputs', () => {
  assert.throws(() => guss(make([2, 1, 1, 1, 1], pass5, pass5, pass5))); // vigilance > 1
  assert.throws(() => guss(make([1, 1, 1, 1, 1], sub(3, 1, 1, 1), pass5, pass5))); // swallow > 2
  assert.throws(() => guss(make([1, 1, 1, 1, 1], sub(1, 2, 1, 1), pass5, pass5))); // cough > 1
  assert.throws(() => guss(make([1.5, 1, 1, 1, 1], pass5, pass5, pass5))); // non-integer
});

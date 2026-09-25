// spec-v1452: posterior circulation ASPECTS (Puetz 2008; weights as tabulated by Lu 2021, Garg & Biller 2017).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pcAspects as pc, PCAS_REGIONS } from '../../lib/pc-aspects-v1452.js';

const all = (v) => Object.fromEntries(PCAS_REGIONS.map(([k]) => [k, v]));
const clean = () => all('unaffected');

test('a scan with no early ischemic change scores 10', () => {
  const r = pc(clean());
  assert.equal(r.valid, true);
  assert.equal(r.score, 10);
  assert.equal(r.abnormal, false);
  assert.match(r.band, /no early ischemic change in any region/);
});

test('every region carries its published weight, and all together reach 0', () => {
  const weights = { leftThalamus: 1, rightThalamus: 1, leftCerebellum: 1, rightCerebellum: 1, leftPca: 1, rightPca: 1, midbrain: 2, pons: 2 };
  for (const [key, w] of Object.entries(weights)) {
    assert.equal(pc({ ...clean(), [key]: 'affected' }).score, 10 - w, key);
  }
  assert.equal(PCAS_REGIONS.reduce((s, r) => s + r[2], 0), 10);
  assert.equal(pc(all('affected')).score, 0);
});

test('bilateral thalami cost 2, as the source states', () => {
  assert.equal(pc({ ...clean(), leftThalamus: 'affected', rightThalamus: 'affected' }).score, 8);
});

test('the 8 to 10 versus 0 to 7 dichotomy sits between 8 and 7', () => {
  const eight = pc({ ...clean(), pons: 'affected' });
  assert.equal(eight.score, 8);
  assert.equal(eight.abnormal, false);
  assert.match(eight.band, /8 to 10 group/);
  const seven = pc({ ...clean(), pons: 'affected', leftThalamus: 'affected' });
  assert.equal(seven.score, 7);
  assert.equal(seven.abnormal, true);
  assert.equal(seven.band, 'pc-ASPECTS 7/10, early ischemic change in the left thalamus, pons: in the 0 to 7 group, which the original study on CT angiography source images linked to a lower chance of a good outcome.');
});

test('a blank region is asked for, never read as normal, and no partial score is given', () => {
  assert.equal(pc({}).valid, false);
  assert.match(pc({}).message, /^Choose /);
  const one = { ...clean() };
  delete one.pons;
  const r = pc(one);
  assert.equal(r.valid, false);
  assert.equal(r.score, undefined);
  assert.match(r.message, /still needed: pons\./);
  assert.equal(pc({ ...clean(), midbrain: '' }).valid, false);
  assert.equal(pc({ ...clean(), midbrain: true }).valid, false);
});

test('notes carry the modality caveat, the source dichotomy and the meta-analysis cutoff', () => {
  const n = pc(clean()).notes.join(' ');
  assert.match(n, /relative risk 12\.1/);
  assert.match(n, /r 0\.29/);
  assert.match(n, /below 7/);
  assert.match(pc(clean()).note, /does not by itself decide reperfusion/);
});

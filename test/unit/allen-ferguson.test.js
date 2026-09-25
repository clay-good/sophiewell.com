// spec-v1419: Allen and Ferguson subaxial cervical classification (Bunzel & Gendelberg 2024, Figs. 1-6).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { allenFerguson as af, AF_STAGE } from '../../lib/allen-ferguson-v1419.js';

test('21 stages across six phylogenies, each with its own definition', () => {
  assert.equal(AF_STAGE.length, 21);
  const counts = {};
  for (const { value } of AF_STAGE) counts[value.slice(0, 2)] = (counts[value.slice(0, 2)] || 0) + 1;
  assert.deepEqual(counts, { CF: 5, VC: 3, DF: 4, CE: 5, DE: 2, LF: 2 });
  const bands = new Set(AF_STAGE.map(({ value }) => af({ stage: value }).band));
  assert.equal(bands.size, 21);
  for (const { value } of AF_STAGE) assert.equal(af({ stage: value }).valid, true, value);
});

test('the published definitions are what come back', () => {
  assert.equal(af({ stage: 'DF2' }).band, 'Allen and Ferguson distractive flexion stage 2 (of 4): a unilateral facet dislocation.');
  assert.match(af({ stage: 'DF3' }).band, /bilateral facet dislocation with 50% anterior displacement/);
  assert.match(af({ stage: 'DF4' }).band, /100% anterior displacement/);
  assert.match(af({ stage: 'CF4' }).band, /less than 3 mm of posterior translation/);
  assert.equal(af({ stage: 'VC3' }).phylogeny, 'vertical compression');
  assert.equal(af({ stage: 'VC3' }).stage, 3);
  assert.equal(af({ stage: 'LF1' }).bandLabel, 'LF1 (lateral flexion 1)');
});

test('the neurologic findings of the 1982 series ride with the stages that had them', () => {
  assert.ok(af({ stage: 'CF5' }).notes.some((n) => /10 of 11/.test(n)));
  assert.ok(af({ stage: 'VC3' }).notes.some((n) => /all five/.test(n)));
  assert.ok(af({ stage: 'DE2' }).notes.some((n) => /six of seven/.test(n)));
  assert.ok(!af({ stage: 'CF1' }).notes.some((n) => /1982 series/.test(n)));
});

test('unobserved stages and the unreliable phylogeny are flagged', () => {
  assert.ok(af({ stage: 'CE3' }).notes.some((n) => /no injuries in compressive extension stages 3 and 4/.test(n)));
  assert.ok(!af({ stage: 'CE5' }).notes.some((n) => /no injuries/.test(n)));
  assert.ok(af({ stage: 'LF2' }).notes.some((n) => /-0\.16/.test(n)));
});

test('every answer carries the reliability data and the recommendation against use', () => {
  const r = af({ stage: 'DF1' });
  assert.ok(r.notes.some((n) => /0\.34/.test(n) && /0\.50/.test(n)));
  assert.ok(r.notes.some((n) => /recommends against/.test(n)));
  assert.match(r.note, /does not choose the treatment/);
});

test('a missing or unknown stage is asked for', () => {
  assert.equal(af({}).valid, false);
  assert.equal(af({ stage: 'CF6' }).valid, false);
  assert.equal(af({ stage: 'DE3' }).valid, false);
  assert.match(af().message, /phylogeny and stage/);
});

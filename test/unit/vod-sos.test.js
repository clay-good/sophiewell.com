// spec-v907: the three published definitions of hepatic veno-occlusive disease / sinusoidal
// obstruction syndrome disagree, and the tests that matter are the ones where they part.

import test from 'node:test';
import assert from 'node:assert/strict';
import { vodSos, VOD_SOS_NOTE, WEIGHT_GAIN_OPTIONS } from '../../lib/vod-sos-v907.js';

test('vod-sos: the day count is required, because every definition is written around it', () => {
  assert.equal(vodSos({}).valid, false);
  assert.equal(vodSos({ daysSinceTransplant: -1 }).valid, false);
  assert.match(vodSos({ daysSinceTransplant: 'x' }).message, /days since the transplant/i);
});

test('vod-sos: a normal bilirubin splits modified Seattle from the other two', () => {
  const r = vodSos({
    daysSinceTransplant: 12, bilirubinAtLeastTwo: false,
    hepatomegalyOrRuqPain: true, weightGain: 'over2',
  });
  assert.equal(r.verdict, 'split');
  assert.deepEqual(r.metNames, ['Modified Seattle']);
  assert.deepEqual(r.unmetNames, ['Baltimore', 'EBMT 2016 (adult)']);
  assert.match(r.band, /does not pick one/);
});

test('vod-sos: a raised bilirubin with two classical items meets all three inside 21 days', () => {
  const r = vodSos({
    daysSinceTransplant: 14, bilirubinAtLeastTwo: true,
    painfulHepatomegaly: true, ascites: true, weightGain: 'over5',
  });
  assert.equal(r.verdict, 'all');
  assert.equal(r.metNames.length, 3);
  assert.match(r.definitions.find((d) => d.key === 'ebmt2016').why, /Classical disease/);
});

test('vod-sos: painful hepatomegaly also satisfies the broader Seattle wording', () => {
  const r = vodSos({
    daysSinceTransplant: 10, bilirubinAtLeastTwo: true, painfulHepatomegaly: true,
    hepatomegalyOrRuqPain: false, weightGain: 'none',
  });
  assert.equal(r.definitions.find((d) => d.key === 'seattle').met, true);
});

test('vod-sos: beyond day 21 only the 2016 criteria can still be met', () => {
  const r = vodSos({
    daysSinceTransplant: 30, painfulHepatomegaly: true, ascites: true,
    weightGain: 'over5', hemodynamicOrUltrasoundEvidence: true,
  });
  assert.deepEqual(r.metNames, ['EBMT 2016 (adult)']);
  assert.match(r.definitions.find((d) => d.key === 'seattle').why, /past the 20-day window/);
  assert.match(r.definitions.find((d) => d.key === 'baltimore').why, /past the 21-day window/);
  assert.match(r.lateOnsetNote, /says only that their window closed/);
});

test('vod-sos: histological proof alone opens the late-onset route', () => {
  const r = vodSos({ daysSinceTransplant: 40, histologicallyProven: true });
  assert.equal(r.definitions.find((d) => d.key === 'ebmt2016').met, true);
  assert.match(r.definitions.find((d) => d.key === 'ebmt2016').why, /histologically proven/);
});

test('vod-sos: two classical items past day 21 without imaging or histology meet nothing', () => {
  const r = vodSos({ daysSinceTransplant: 25, painfulHepatomegaly: true, ascites: true });
  assert.equal(r.verdict, 'none');
  assert.match(r.definitions.find((d) => d.key === 'ebmt2016').why, /None of those three routes is met/);
});

test('vod-sos: a weight gain above 5% also counts as above 2%', () => {
  const r = vodSos({ daysSinceTransplant: 5, bilirubinAtLeastTwo: true, weightGain: 'over5' });
  assert.equal(r.definitions.find((d) => d.key === 'seattle').met, true);
});

test('vod-sos: the day-21 boundary belongs to the classical window, day 22 does not', () => {
  const args = { bilirubinAtLeastTwo: true, painfulHepatomegaly: true, ascites: true };
  assert.equal(vodSos({ ...args, daysSinceTransplant: 21 }).metNames.includes('Baltimore'), true);
  assert.equal(vodSos({ ...args, daysSinceTransplant: 22 }).metNames.includes('Baltimore'), false);
  assert.equal(vodSos({ ...args, daysSinceTransplant: 20 }).metNames.includes('Modified Seattle'), true);
  assert.equal(vodSos({ ...args, daysSinceTransplant: 21 }).metNames.includes('Modified Seattle'), false);
});

test('vod-sos: severity, the pediatric criteria and scope are stated on every result', () => {
  const r = vodSos({ daysSinceTransplant: 3 });
  assert.match(r.severityNote, /separate exercise/);
  assert.match(r.pediatricNote, /pediatric criteria in 2018/);
  assert.match(r.scopeNote, /does not diagnose/);
  assert.match(r.bilirubinNote, /counts it as one of three/);
  assert.equal(r.verdict, 'none');
  assert.equal(r.abnormal, false);
});

test('vod-sos: the note and the option list are stable', () => {
  assert.match(VOD_SOS_NOTE, /sinusoidal obstruction syndrome/);
  assert.equal(WEIGHT_GAIN_OPTIONS.length, 3);
  assert.deepEqual(WEIGHT_GAIN_OPTIONS.map((o) => o.value), ['none', 'over2', 'over5']);
});

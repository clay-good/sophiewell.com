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

// spec-v1192: the weight gain is a three-level grading whose miss-value was the
// zero level, so a field nobody had answered read as "no weight gain above 2%
// of baseline" -- a recorded negative finding -- and the tile published "No
// definition met" from it.
test('vod-sos: a blank weight gain is not a weight recorded as normal', () => {
  const args = { daysSinceTransplant: 12, bilirubinAtLeastTwo: true };
  const blank = vodSos(args);
  const recorded = vodSos({ ...args, weightGain: 'none' });

  // The two readings must not be the same reading.
  assert.equal(recorded.verdict, 'none');
  assert.equal(recorded.bandLabel, 'No definition met');
  assert.equal(blank.verdict, 'undecided');
  assert.equal(blank.bandLabel, 'Not yet decidable');
  assert.match(blank.band, /weight gain from baseline was not entered/);
  assert.match(blank.band, /Modified Seattle/);
  assert.match(blank.band, /not a not-met/);
  assert.deepEqual(blank.openOnWeightGain, ['Modified Seattle']);
  assert.equal(blank.weightGainStated, false);

  // And the definition's own line says it, where the reader is told "not met".
  assert.match(blank.definitions.find((d) => d.key === 'seattle').why, /was not entered, and this definition turns on it/);
  assert.doesNotMatch(recorded.definitions.find((d) => d.key === 'seattle').why, /was not entered/);
});

test('vod-sos: the gap is only raised where the weight gain could still decide it', () => {
  // Nothing else recorded: the highest weight gain is one Seattle item of the
  // two needed, so it cannot change anything and the tile says "none" plainly.
  const bare = vodSos({ daysSinceTransplant: 3 });
  assert.equal(bare.verdict, 'none');
  assert.deepEqual(bare.openOnWeightGain, []);

  // Past every window, the weight gain cannot reopen a closed definition.
  const late = vodSos({ daysSinceTransplant: 25, painfulHepatomegaly: true, ascites: true });
  assert.equal(late.verdict, 'none');
  assert.deepEqual(late.openOnWeightGain, []);

  // Already met: rule 13. The verdict holds whatever the weight gain turns out
  // to be, so it is answered rather than withheld.
  const met = vodSos({ daysSinceTransplant: 12, bilirubinAtLeastTwo: true, hepatomegalyOrRuqPain: true });
  assert.equal(met.verdict, 'split');
  assert.equal(met.metNames.includes('Modified Seattle'), true);
});

test('vod-sos: a split still names a definition left open by the blank weight', () => {
  const r = vodSos({
    daysSinceTransplant: 12, bilirubinAtLeastTwo: true, hepatomegalyOrRuqPain: true, painfulHepatomegaly: true,
  });
  assert.equal(r.verdict, 'split');
  assert.match(r.band, /still turn on it/);
  assert.deepEqual(r.openOnWeightGain, ['Baltimore', 'EBMT 2016 (adult)']);
});

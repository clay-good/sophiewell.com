// spec-v546: the revised ASRM endometriosis stage, interpreted from a total.
// Worked-example tests: all four stage ranges, the III/IV boundary at EXACTLY 40, a total of 0 yielding no
// stage rather than stage I, the refusal to compute a score, and the guards. Ranges transcribed from the
// revised ASRM classification (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { rasrmStage, RASRM_STAGES, RASRM_MAX, RASRM_ANCHORS } from '../../lib/rasrm-stage-v546.js';

test('four stages with the revised ranges', () => {
  assert.deepEqual(RASRM_STAGES.map((s) => s.stage), ['I', 'II', 'III', 'IV']);
  assert.deepEqual(RASRM_STAGES.map((s) => s.name), ['minimal', 'mild', 'moderate', 'severe']);
  assert.deepEqual(RASRM_STAGES.map((s) => [s.min, s.max]), [[1, 5], [6, 15], [16, 40], [41, 150]]);
  assert.equal(RASRM_MAX, 150);
});

test('every stage boundary', () => {
  const cases = [[1, 'I'], [5, 'I'], [6, 'II'], [15, 'II'], [16, 'III'], [40, 'III'], [41, 'IV'], [150, 'IV']];
  for (const [total, stage] of cases) {
    assert.equal(rasrmStage({ total }).stage, stage, `total ${total}`);
  }
});

test('THE III/IV BOUNDARY IS AT EXACTLY 40, and both sides say so', () => {
  const forty = rasrmStage({ total: 40 });
  assert.equal(forty.stage, 'III');
  assert.equal(forty.stageName, 'moderate');
  assert.match(forty.band, /boundary sits at exactly 40/);

  const fortyOne = rasrmStage({ total: 41 });
  assert.equal(fortyOne.stage, 'IV');
  assert.match(fortyOne.band, /41 is the first stage IV/);
});

test('a total of 0 yields NO stage rather than stage I', () => {
  const r = rasrmStage({ total: 0 });
  assert.equal(r.valid, true);
  assert.equal(r.stage, null);
  assert.match(r.band, /falls below stage I, which begins at 1/);
});

test('the tile interprets a total and refuses to compute one', () => {
  const missing = rasrmStage({});
  assert.equal(missing.valid, false);
  assert.match(missing.message, /interprets a total; it does not compute one/);
  assert.match(rasrmStage({ total: 20 }).note, /deliberately does not compute one/);
  assert.match(rasrmStage({ total: 20 }).note, /could not be verified against two independent sources/);
});

test('the confirmed anchor values are exposed as sanity checks', () => {
  assert.equal(RASRM_ANCHORS.length, 4);
  const byPoints = RASRM_ANCHORS.map((a) => a.points);
  assert.deepEqual(byPoints, [40, 20, 16, 16]);
  assert.match(RASRM_ANCHORS[0].text, /cul-de-sac obliteration/);
  assert.match(RASRM_ANCHORS[3].text, /changed to 16/);
});

test('the copy separates the revised ranges from the 1979 AFS ones', () => {
  const r = rasrmStage({ total: 25 });
  assert.match(r.band, /not the 1979 American Fertility Society ones/);
  assert.match(r.note, /stage III at 16 to 30 and stage IV at 31 to 54/);
});

test('every staged result leads with the poor correlation with pain and fertility', () => {
  for (const total of [3, 10, 25, 60]) {
    const r = rasrmStage({ total });
    assert.match(r.band, /correlates poorly with pain and with fertility outcome/);
    assert.match(r.band, /does not predict conception/);
  }
});

test('the copy names the deep-infiltrating blind spot and the ENZIAN alternative', () => {
  const n = rasrmStage({ total: 10 }).note;
  assert.match(n, /deep infiltrating disease of the bowel, ureter or bladder is poorly captured/);
  assert.match(n, /ENZIAN/);
  assert.match(n, /cannot be assigned without a laparoscopy/);
  assert.match(n, /does not diagnose endometriosis/);
});

test('the guards', () => {
  assert.equal(rasrmStage({}).valid, false);
  assert.equal(rasrmStage({ total: -1 }).valid, false);
  assert.equal(rasrmStage({ total: 151 }).valid, false);
  assert.equal(rasrmStage({ total: 12.5 }).valid, false);
  assert.equal(rasrmStage({ total: 'twenty' }).valid, false);
  assert.equal(rasrmStage({ total: '25' }).stage, 'III');
});

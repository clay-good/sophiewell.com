// spec-v345: Lichtman staging of Kienbock disease (lunate osteonecrosis) - stages I, II, IIIA, IIIB,
// IV. Worked-example tests: each stage and its radiographic description, the collapse flag on stages
// IIIA-IV, roman + numeric + case-insensitive input (including the IIIA/IIIB split and bare III ->
// IIIA), and the invalid-stage guard. Definitions transcribed from Lichtman 1977 (JBJS Am),
// cross-verified against wrist-imaging references (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { lichtmanKienbock } from '../../lib/lichtman-kienbock-v345.js';

test('stage IIIB: lunate collapse with fixed carpal collapse, flagged (the META example)', () => {
  const r = lichtmanKienbock({ stage: 'IIIB' });
  assert.equal(r.valid, true);
  assert.equal(r.stage, 'IIIB');
  assert.equal(r.collapse, true);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /fixed carpal collapse/);
  assert.match(r.band, /radioscaphoid angle > 60 degrees/);
});

test('stages I-II are pre-collapse and not flagged', () => {
  assert.match(lichtmanKienbock({ stage: 'I' }).band, /normal radiograph/);
  assert.match(lichtmanKienbock({ stage: 'II' }).band, /lunate sclerosis/);
  for (const s of ['I', 'II']) {
    assert.equal(lichtmanKienbock({ stage: s }).collapse, false, s);
  }
});

test('stages IIIA and IV are collapse stages and flagged', () => {
  assert.equal(lichtmanKienbock({ stage: 'IIIA' }).collapse, true);
  assert.match(lichtmanKienbock({ stage: 'IIIA' }).band, /carpal alignment is maintained/);
  assert.equal(lichtmanKienbock({ stage: 'IV' }).collapse, true);
  assert.match(lichtmanKienbock({ stage: 'IV' }).band, /degenerative arthrosis/);
});

test('case-insensitive input, bare III -> IIIA, and 1/2/4 + 3A/3B aliases map to the stages', () => {
  assert.equal(lichtmanKienbock({ stage: 'iiib' }).stage, 'IIIB');
  assert.equal(lichtmanKienbock({ stage: 'III' }).stage, 'IIIA');
  assert.equal(lichtmanKienbock({ stage: 1 }).stage, 'I');
  assert.equal(lichtmanKienbock({ stage: '3b' }).stage, 'IIIB');
  assert.equal(lichtmanKienbock({ stage: 4 }).stage, 'IV');
});

test('a missing or out-of-range stage is invalid', () => {
  assert.equal(lichtmanKienbock({}).valid, false);
  assert.equal(lichtmanKienbock({ stage: 'V' }).valid, false);
  assert.equal(lichtmanKienbock({ stage: '5' }).valid, false);
});

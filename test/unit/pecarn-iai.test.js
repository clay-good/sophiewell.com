import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pecarnIai } from '../../lib/scoring-v4.js';

test('pecarn-iai 0/7 findings (tile example) -> very low risk', () => {
  const r = pecarnIai({});
  assert.equal(r.presentCount, 0);
  assert.equal(r.veryLowRisk, true);
  assert.match(r.band, /very low risk of clinically important IAI per Holmes 2013/);
});

test('pecarn-iai 1/7 (vomiting) -> not very low risk', () => {
  const r = pecarnIai({ vomiting: true });
  assert.equal(r.presentCount, 1);
  assert.equal(r.veryLowRisk, false);
  assert.deepEqual(r.findingsPresent, ['vomiting']);
});

test('pecarn-iai 2/7 (tenderness + pain) -> not very low risk', () => {
  const r = pecarnIai({ abdominalTenderness: true, abdominalPain: true });
  assert.equal(r.presentCount, 2);
  assert.equal(r.veryLowRisk, false);
  assert.deepEqual(r.findingsPresent, ['abdominalTenderness', 'abdominalPain']);
});

test('pecarn-iai 7/7 (all present) -> not very low risk', () => {
  const r = pecarnIai({
    abdominalWallTraumaOrSeatBeltSign: true, gcsLt14: true,
    abdominalTenderness: true, vomiting: true, thoracicWallTrauma: true,
    abdominalPain: true, decreasedBreathSounds: true,
  });
  assert.equal(r.presentCount, 7);
  assert.equal(r.veryLowRisk, false);
});

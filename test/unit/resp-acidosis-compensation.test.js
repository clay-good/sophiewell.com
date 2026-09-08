// spec-v129 2.3: expected HCO3 in respiratory acidosis (Brackett 1965 acute;
// Schwartz 1965 chronic). expected HCO3 = 24 + k*(PaCO2-40)/10; k = 1 acute,
// 4 chronic. Measured outside +/-2 flags an added metabolic disorder.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { respAcidosisCompensation } from '../../lib/acidbase-v129.js';

test('acute, PaCO2 60 -> expected HCO3 26, measured 26 matches', () => {
  const r = respAcidosisCompensation({ paco2: 60, bicarbonate: 26, chronic: false });
  assert.equal(r.valid, true);
  assert.equal(r.expected, 26); // 24 + 1*(20)/10
  assert.equal(r.abnormal, false);
  assert.match(r.band, /appropriate compensation/);
});

test('chronic, PaCO2 60 -> expected HCO3 32 (boundary acute vs chronic)', () => {
  const r = respAcidosisCompensation({ paco2: 60, bicarbonate: 32, chronic: true });
  assert.equal(r.expected, 32); // 24 + 4*(20)/10
  assert.equal(r.abnormal, false);
});

test('measured HCO3 above expected -> added metabolic alkalosis flag', () => {
  const r = respAcidosisCompensation({ paco2: 60, bicarbonate: 36, chronic: false });
  assert.equal(r.expected, 26);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /metabolic alkalosis/);
});

test('measured HCO3 below expected -> added metabolic acidosis flag', () => {
  const r = respAcidosisCompensation({ paco2: 60, bicarbonate: 20, chronic: true });
  assert.equal(r.expected, 32);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /metabolic acidosis/);
});

test('any blank field -> valid:false', () => {
  assert.equal(respAcidosisCompensation({ paco2: 60 }).valid, false);
  assert.equal(respAcidosisCompensation('x').valid, false);
});

test('spec-v1137: an unstated chronicity is not "acute"', () => {
  // `o.chronic === true || o.chronic === 'true'` made every other value -- an
  // unstated one included -- acute, and the band printed the word: "Expected HCO3
  // 26 mEq/L (acute, +1 per 10 mmHg)". That is a statement about how long this
  // patient's acidosis has been going on, made by the tool. Both notes on these
  // tiles promise "the acute-versus-chronic choice is yours, not inferred".
  const undecided = respAcidosisCompensation({ paco2: 60, bicarbonate: 26 });
  assert.equal(undecided.valid, false);
  assert.match(undecided.message, /Choose acute or chronic/);
  assert.match(undecided.message, /Acute expects 26 mEq\/L and chronic expects 32 mEq\/L/);
  assert.equal(undecided.expectedAcute, 26);
  assert.equal(undecided.expectedChronic, 32);

  // Stated either way, the reading is what it always was.
  assert.equal(respAcidosisCompensation({ paco2: 60, bicarbonate: 26, chronic: 'acute' }).expected, 26);
  assert.equal(respAcidosisCompensation({ paco2: 60, bicarbonate: 26, chronic: true }).expected, 32);
});

test('spec-v1137: where acute and chronic agree, the tile answers', () => {
  // Rule 25: the guard is scoped to the readings the choice can move. A
  // bicarbonate of 12 is below both expectations, so the superimposed metabolic
  // acidosis stands whichever the chronicity is.
  const r = respAcidosisCompensation({ paco2: 60, bicarbonate: 12 });
  assert.equal(r.valid, true);
  assert.equal(r.chronicityStated, false);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /26 mEq\/L acute or 32 mEq\/L chronic/);
  assert.match(r.band, /reads the same either way/);
  assert.match(r.band, /metabolic acidosis/);
});

test('spec-v1137: the guard message lists only what is missing', () => {
  // Rule 23. It used to name the acute/chronic choice whether or not that was
  // what was absent -- and did not require it either.
  const noPaco2 = respAcidosisCompensation({ bicarbonate: 26, chronic: 'acute' });
  assert.match(noPaco2.message, /Enter the measured PaCO2/);
  assert.doesNotMatch(noPaco2.message, /acute or chronic/);

  const noHco3 = respAcidosisCompensation({ paco2: 60 });
  assert.match(noHco3.message, /Enter the measured HCO3/);
  assert.match(noHco3.message, /choose acute or chronic/);
});

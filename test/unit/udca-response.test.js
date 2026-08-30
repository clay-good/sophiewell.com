// spec-v909: four threshold definitions of biochemical response to ursodeoxycholic acid that do
// not agree. The tests that matter are the ones where they part, and the ones about the clock.

import test from 'node:test';
import assert from 'node:assert/strict';
import { udcaResponse, UDCA_RESPONSE_NOTE } from '../../lib/udca-response-v909.js';

const AT_TWELVE = { alp: 240, alpUln: 120, baselineAlp: 500, ast: 60, astUln: 40, bilirubin: 0.8, monthsOnUdca: 12 };

test('udca-response: the alkaline phosphatase and the months are both required', () => {
  assert.match(udcaResponse({ monthsOnUdca: 12 }).message, /alkaline phosphatase/);
  assert.match(udcaResponse({ alp: 240, alpUln: 120 }).message, /months on ursodeoxycholic acid/i);
  assert.equal(udcaResponse({ alp: 240, alpUln: 0, monthsOnUdca: 12 }).valid, false);
});

test('udca-response: the sets can disagree on one blood draw, and none is picked', () => {
  const r = udcaResponse(AT_TWELVE);
  assert.equal(r.verdict, 'split');
  assert.deepEqual(r.responders, ['Barcelona', 'Paris I']);
  assert.deepEqual(r.nonResponders, ['Paris II']);
  assert.match(r.band, /nothing here picks between them/);
});

test('udca-response: Toronto is not readable at 12 months, and is at 24', () => {
  const twelve = udcaResponse(AT_TWELVE);
  assert.equal(twelve.sets.find((s) => s.key === 'toronto').onTime, false);
  assert.match(twelve.sets.find((s) => s.key === 'toronto').timeNote, /is not this set/);
  const twentyFour = udcaResponse({ ...AT_TWELVE, monthsOnUdca: 24 });
  assert.equal(twentyFour.sets.find((s) => s.key === 'toronto').onTime, true);
  assert.equal(twentyFour.responders.includes('Toronto'), false);
});

test('udca-response: nothing is readable before the first time point', () => {
  const r = udcaResponse({ alp: 150, alpUln: 120, monthsOnUdca: 3 });
  assert.equal(r.verdict, 'none-assessable');
  assert.deepEqual(r.responders, []);
  assert.deepEqual(r.nonResponders, []);
});

test('udca-response: Barcelona needs the baseline, the Paris sets need the AST and bilirubin', () => {
  const r = udcaResponse({ alp: 240, alpUln: 120, monthsOnUdca: 12 });
  assert.equal(r.sets.find((s) => s.key === 'barcelona').met, null);
  assert.match(r.sets.find((s) => s.key === 'barcelona').why, /baseline alkaline phosphatase is missing/);
  assert.equal(r.sets.find((s) => s.key === 'paris-i').met, null);
  assert.match(r.sets.find((s) => s.key === 'paris-i').why, /AST with its upper limit of normal, or the bilirubin/);
});

test('udca-response: Barcelona is met by normalization even without a 40% fall', () => {
  const r = udcaResponse({ alp: 118, alpUln: 120, baselineAlp: 150, monthsOnUdca: 12 });
  assert.equal(r.sets.find((s) => s.key === 'barcelona').met, true);
  assert.equal(r.alpDropPercent, 21.33);
});

test('udca-response: the Barcelona fall is strictly more than 40%', () => {
  const at40 = udcaResponse({ alp: 300, alpUln: 120, baselineAlp: 500, monthsOnUdca: 12 });
  assert.equal(at40.sets.find((s) => s.key === 'barcelona').met, false);
  const past40 = udcaResponse({ alp: 299, alpUln: 120, baselineAlp: 500, monthsOnUdca: 12 });
  assert.equal(past40.sets.find((s) => s.key === 'barcelona').met, true);
});

test('udca-response: the Paris and Toronto thresholds are inclusive at their boundary', () => {
  const paris = udcaResponse({ alp: 360, alpUln: 120, ast: 80, astUln: 40, bilirubin: 1, monthsOnUdca: 12 });
  assert.equal(paris.sets.find((s) => s.key === 'paris-i').met, true);
  const overParis = udcaResponse({ alp: 361, alpUln: 120, ast: 80, astUln: 40, bilirubin: 1, monthsOnUdca: 12 });
  assert.equal(overParis.sets.find((s) => s.key === 'paris-i').met, false);
  // 200.4/120 is 1.67 in decimal but 1.6699999999999999 in binary, so the boundary is probed
  // either side of it rather than on it.
  assert.equal(udcaResponse({ alp: 200, alpUln: 120, monthsOnUdca: 24 }).sets.find((s) => s.key === 'toronto').met, true);
  assert.equal(udcaResponse({ alp: 201, alpUln: 120, monthsOnUdca: 24 }).sets.find((s) => s.key === 'toronto').met, false);
});

test('udca-response: every set met returns a plain response, and it is not flagged abnormal', () => {
  const r = udcaResponse({ alp: 150, alpUln: 120, baselineAlp: 500, ast: 50, astUln: 40, bilirubin: 0.6, monthsOnUdca: 30 });
  assert.equal(r.verdict, 'response');
  assert.equal(r.abnormal, false);
  assert.match(r.band, /Barcelona, Paris I, Paris II and Toronto/);
});

test('udca-response: non-response across every readable set is flagged', () => {
  const r = udcaResponse({ alp: 600, alpUln: 120, baselineAlp: 620, ast: 200, astUln: 40, bilirubin: 3, monthsOnUdca: 24 });
  assert.equal(r.verdict, 'non-response');
  assert.equal(r.abnormal, true);
});

test('udca-response: disagreement, timing, purpose and scope are stated on every result', () => {
  const r = udcaResponse(AT_TWELVE);
  assert.match(r.disagreeNote, /different cohort against a different endpoint/);
  assert.match(r.timingNote, /time point is part of the criterion/);
  assert.match(r.purposeNote, /not a reason to stop ursodeoxycholic acid/);
  assert.match(r.continuousNote, /scale rather than a threshold/);
  assert.match(r.scopeNote, /does not choose therapy/);
  assert.match(UDCA_RESPONSE_NOTE, /primary biliary cholangitis/);
});

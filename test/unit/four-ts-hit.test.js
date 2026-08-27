import test from 'node:test';
import assert from 'node:assert/strict';
import { fourTsHit as fts, HIGH_MIN, INTERMEDIATE_MIN } from '../../lib/four-ts-hit-v836.js';

test('4Ts: the domains sum to 0 through 8', () => {
  assert.equal(fts({ thrombocytopenia: 2, timing: 2, thrombosis: 2, otherCauses: 2 }).score, 8);
  assert.equal(fts({ thrombocytopenia: 0, timing: 0, thrombosis: 0, otherCauses: 0 }).score, 0);
  assert.equal(fts({ thrombocytopenia: 2, timing: 1, thrombosis: 0, otherCauses: 1 }).score, 4);
});

test('4Ts: the three probability bands', () => {
  assert.equal(HIGH_MIN, 6);
  assert.equal(INTERMEDIATE_MIN, 4);
  assert.equal(fts({ thrombocytopenia: 2, timing: 2, thrombosis: 2, otherCauses: 0 }).probability, 'high');
  assert.equal(fts({ thrombocytopenia: 2, timing: 2, thrombosis: 1, otherCauses: 0 }).probability, 'intermediate');
  assert.equal(fts({ thrombocytopenia: 2, timing: 1, thrombosis: 0, otherCauses: 0 }).probability, 'low');
  // The boundaries themselves.
  assert.equal(fts({ thrombocytopenia: 2, timing: 2, thrombosis: 2 }).score, 6);
  assert.equal(fts({ thrombocytopenia: 2, timing: 2, thrombosis: 2 }).probability, 'high');
  // 2 + 1 + 0 + 0 = 3, the top of the low band.
  assert.equal(fts({ thrombocytopenia: 2, timing: 1, thrombosis: 0, otherCauses: 0 }).probability, 'low');
  // ...and one more point tips it into intermediate.
  assert.equal(fts({ thrombocytopenia: 2, timing: 1, thrombosis: 0, otherCauses: 1 }).probability, 'intermediate');
});

test('4Ts: a LOW score is advice against testing, not merely a low number', () => {
  // The part that inverts usual practice.
  const low = fts({ thrombocytopenia: 1, timing: 0, thrombosis: 0, otherCauses: 1 });
  assert.equal(low.probability, 'low');
  assert.ok(low.testingAdvice.includes('AGAINST laboratory testing'));
  assert.ok(low.testingAdvice.includes('rules out far better than it rules in'));

  const high = fts({ thrombocytopenia: 2, timing: 2, thrombosis: 2, otherCauses: 2 });
  assert.ok(high.testingAdvice.includes('immunoassay'));
  assert.ok(high.testingAdvice.includes('not a diagnosis on its own'));
});

test('4Ts: missing information should push the score UP, not be scored as zero', () => {
  const r = fts({ thrombocytopenia: 1, timing: 1, thrombosis: 0, otherCauses: 1, keyInformationMissing: true });
  assert.ok(r.missingNote.includes('HIGHER'));
  assert.ok(r.missingNote.includes('floor'));
  assert.equal(fts({ thrombocytopenia: 1, timing: 1, thrombosis: 0, otherCauses: 1 }).missingNote, null);
});

test('4Ts: a low score WITH missing data is the documented exception to not testing', () => {
  const r = fts({ thrombocytopenia: 1, timing: 0, thrombosis: 0, otherCauses: 1, keyInformationMissing: true });
  assert.equal(r.probability, 'low');
  assert.ok(r.lowWithMissing.includes('may still be appropriate'));
  // Not raised at intermediate or high, where testing is recommended anyway.
  assert.equal(fts({ thrombocytopenia: 2, timing: 2, thrombosis: 2, keyInformationMissing: true }).lowWithMissing, null);
});

test('4Ts: the timing wording is days 5 to 14, not 5 to 10', () => {
  const r = fts({ timing: 2 });
  assert.ok(r.contributions.some((c) => c.includes('days 5 and 14')));
  assert.ok(r.detail.includes('not the narrower 5 to 10'));
});

test('4Ts: absent domains default to zero, and out-of-range values are refused', () => {
  assert.equal(fts({}).score, 0);
  assert.equal(fts({}).probability, 'low');
  assert.equal(fts({ thrombocytopenia: 3 }).valid, false);
  assert.equal(fts({ timing: -1 }).valid, false);
  assert.equal(fts({ thrombosis: 1e308 }).valid, false);
  assert.equal(fts().valid, true);
  assert.doesNotMatch(JSON.stringify(fts({ thrombocytopenia: 2, timing: 2, thrombosis: 2, otherCauses: 2 })), /NaN|Infinity/);
});

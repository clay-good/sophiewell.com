// spec-v1794: the shared list of sentence shapes that mean "that value is outside the range I accept".
//
// Two finders read it to tell a range refusal from any other kind, so the list IS their reach: a shape it
// stops recognising makes rows vanish from a report without anything failing, which is the quiet kind of
// gate failure docs/spec-v1785.md was written about. Each sentence below is a real one, taken from the
// library that produces it, and each NON-range sentence is one that has been mistaken for a range.
import test from 'node:test';
import assert from 'node:assert/strict';
import { saysOutOfRange } from '../../scripts/lib/range-sentence.mjs';

// One per shape the rule carries, each from the call site named.
const OUT_OF_RANGE = [
  // lib/bounds.js, through boundsAdvisory()
  'Input above the plausible range for weight (0.2 to 500 kg); verify the units.',
  'Input below the plausible range for serum sodium (90 to 208 mEq/L); verify the units.',
  // inputFault() / gradeFault() in lib/num.js
  'The weight must be between 0.4 and 500 kg. Check the value entered.',
  'The days between administrations must be greater than 0 and at most 3650. Check the value entered.',
  // num(), plain and computed
  'Age must be at most 120. Check the value entered.',
  'The rounding threshold must be no more than 25 percent.',
  'flow lpm must be a number.',
  'the percent platelet recovery works out to 4837.5, which is outside the range this tool reports (0 to 400). Check the values entered.',
  // a library's own wording
  'Each margin must be a number of microvolts from 0 to 200.',
  'A hearing threshold is outside a plausible range of -10 to 130 dB.',
  'Enter a pre-test probability between 0 and 100% (exclusive).',
  'Enter the arterial oxygen tension in mmHg between 10 and 200.',
];

// Refusals that are NOT about range. Reading one as a cap invents a bound the tool does not have.
const SOMETHING_ELSE = [
  // spec-v1794: "between" here names the quantity, and the sentence is about whole numbers. This was read
  // as a cap and printed a DISAGREES row against a correct declaration.
  'Enter the days between administrations as a whole number.',
  'Enter the days between steps as a whole number (7 for weekly, 14 for every 2 weeks, 28 for every 4 weeks).',
  // missing, inconsistent, or the wrong shape
  'Enter the air-conduction thresholds (500 Hz, 1000 Hz).',
  'Enter the age in months (older children: enter years).',
  'The maximal extent (M) must be at least as long as the circumferential extent (C).',
  'Choose the analyte.',
  'A reduction of 100% is a stop, not a taper. Enter a percent below 100.',
  'Enter the start date as YYYY-MM-DD.',
  '',
];

test('every shape a library uses to refuse an out-of-range value is recognised', () => {
  for (const m of OUT_OF_RANGE) assert.equal(saysOutOfRange(m), true, `should read as out of range: ${m}`);
});

test('a refusal that is not about range is not read as a cap', () => {
  for (const m of SOMETHING_ELSE) assert.equal(saysOutOfRange(m), false, `should NOT read as out of range: ${m}`);
});

test('a missing or non-string message is not a range refusal', () => {
  for (const m of [null, undefined, 0, false, {}, []]) assert.equal(saysOutOfRange(m), false, `${String(m)}`);
});

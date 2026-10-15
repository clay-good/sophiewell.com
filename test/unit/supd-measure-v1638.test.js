// spec-v1638 tool 12: SUPD by the Star Ratings method.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { supdMeasure as supd } from '../../lib/supd-measure-v1638.js';

const members = ['A, 60, yes', 'B, 60, yes', 'C, 39, yes', 'D, 60, no', 'E, 60, yes, hospice', 'F, 60, yes', 'G, 76, yes', 'H, 60, yes'].join('\n');
const fills = ['A, 2025-01-10, diabetes', 'A, 2025-04-10, diabetes', 'A, 2025-05-01, statin',
  'B, 2025-02-01, diabetes', 'B, 2025-03-01, diabetes',
  'C, 2025-02-01, diabetes', 'C, 2025-03-01, diabetes', 'D, 2025-02-01, diabetes', 'D, 2025-03-01, diabetes',
  'E, 2025-02-01, diabetes', 'E, 2025-03-01, diabetes',
  'F, 2025-02-01, diabetes', 'F, 2025-02-01, diabetes', 'G, 2025-02-01, diabetes', 'G, 2025-03-01, diabetes',
  'H, 2025-10-03, diabetes', 'H, 2025-11-01, diabetes', 'H, 2024-12-01, statin'].join('\n');

test('denominator, numerator and each reason for being out', () => {
  const r = supd({ measurementYear: 2025, members, fills });
  assert.deepEqual([r.denominator, r.numerator, r.ratePercent, r.gapList], [2, 1, 50, ['B']]);
  const why = Object.fromEntries(r.rows.map((x) => [x.member, x.reason]));
  assert.equal(why.A, null);
  assert.match(why.C, /age 39 is outside 40 to 75/);
  assert.equal(why.D, 'not continuously enrolled');
  assert.equal(why.E, 'excluded: hospice');
  assert.match(why.F, /1 diabetes fill date in the year/);
  assert.match(why.G, /age 76/);
  // October 3 is 89 days before December 31; October 2 is 90.
  assert.match(why.H, /is 89 days before the end of the year/);
  assert.match(r.notes.join(' '), /1 fill dated outside 2025 was not counted/);
  assert.match(r.notes.join(' '), /29 or fewer members in the denominator/);
});

test('the 90-day line: October 2 is in, October 3 is out', () => {
  const m = 'X, 50, yes';
  assert.equal(supd({ measurementYear: 2025, members: m, fills: 'X, 2025-10-02, diabetes\nX, 2025-11-01, diabetes' }).denominator, 1);
  assert.equal(supd({ measurementYear: 2025, members: m, fills: 'X, 2025-10-03, diabetes\nX, 2025-11-01, diabetes' }).denominator, 0);
  assert.equal(supd({ measurementYear: 2025, members: 'X, 40, yes\nY, 75, yes', fills: 'X, 2025-01-02, diabetes\nX, 2025-02-01, diabetes\nY, 2025-01-02, diabetes\nY, 2025-02-01, diabetes\nY, 2025-02-01, statin' }).denominator, 2);
});

test('nothing is dropped silently', () => {
  assert.match(supd({}).message, /measurement year/);
  assert.match(supd({ measurementYear: 2025 }).message, /^Enter the members/);
  assert.match(supd({ measurementYear: 2025, members: 'A, 60, yes' }).message, /^Enter the fills/);
  assert.match(supd({ measurementYear: 2025, members: 'A, 60, yes', fills: 'Z, 2025-01-01, statin' }).message, /not listed/);
  assert.match(supd({ measurementYear: 2025, members: 'A, 60, maybe', fills: 'A, 2025-01-01, statin' }).message, /yes or no/);
  assert.match(supd({ measurementYear: 2025, members: 'A, 60, yes, gout', fills: 'A, 2025-01-01, statin' }).message, /exclusion from the list/);
  assert.match(supd({ measurementYear: 2025, members: 'A, 60, yes', fills: 'A, 2025-01-01, insulin' }).message, /diabetes, statin, pcsk9 or bempedoic/);
  assert.match(supd({ measurementYear: 2025, members: 'A, 60, yes\nA, 61, yes', fills: 'A, 2025-01-01, statin' }).message, /appears twice/);
  assert.equal(supd({ measurementYear: 2025, members: 'A, 60, no', fills: 'A, 2025-01-01, statin' }).flag, 'no-denominator');
});

// CMS Patient Safety memo, April 22, 2026: the SUPD denominator exception from measurement year 2026.
test('from 2026 a PCSK9 inhibitor or bempedoic acid fill with no statin fill is excepted; before 2026 it is not', () => {
  const members = 'A, 60, yes\nB, 60, yes\nC, 60, yes';
  const fills = (y) => `A, ${y}-01-10, diabetes\nA, ${y}-02-10, diabetes\nA, ${y}-03-01, pcsk9\nB, ${y}-01-10, diabetes\nB, ${y}-02-10, diabetes\nB, ${y}-03-01, bempedoic\nB, ${y}-03-05, statin\nC, ${y}-01-10, diabetes\nC, ${y}-02-10, diabetes`;
  const r26 = supd({ measurementYear: 2026, members, fills: fills(2026) });
  assert.deepEqual([r26.denominator, r26.numerator, r26.gapList], [2, 1, ['C']]);
  assert.match(r26.rows.find((x) => x.member === 'A').reason, /denominator exception/);
  const r25 = supd({ measurementYear: 2025, members, fills: fills(2025) });
  assert.deepEqual([r25.denominator, r25.numerator, r25.gapList], [3, 1, ['A', 'C']]);
  assert.match(r25.notes.join(' '), /2 members have a PCSK9 inhibitor or bempedoic acid fill; the exception for those starts with measurement year 2026/);
});

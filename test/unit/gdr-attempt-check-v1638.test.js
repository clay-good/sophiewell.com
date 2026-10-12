// spec-v1638 tool 22: the CMS first-year gradual dose reduction example.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { gdrAttemptCheck } from '../../lib/gdr-attempt-check-v1638.js';

const g = (attempts, extra = {}) => gdrAttemptCheck({ started: '2026-01-10', contraindication: 'no-contraindication-documented', attempts, ...extra });

test('two attempts in separate quarters, at least a month apart, meet the example', () => {
  assert.equal(g('2026-03-01, 2026-05-01').flag, 'example-met');
  assert.equal(g('2026-03-01').firstYearEnds, '2027-01-09');
});

test('separate quarters but under a month apart do not; the same quarter does not', () => {
  // Quarter 1 ends April 9; April 5 and April 20 are in quarters 1 and 2, 15 days apart.
  assert.equal(g('2026-04-05, 2026-04-20').flag, 'still-reachable');
  // Both in quarter 1, six weeks apart.
  assert.equal(g('2026-01-15, 2026-03-01').flag, 'still-reachable');
});

test('the window for a second attempt: a different quarter and a month later', () => {
  const r = g('2026-04-05');
  // Next quarter starts April 10; a month after April 5 is May 5: the later of the two.
  assert.deepEqual([r.secondAttemptFrom, r.secondAttemptThrough], ['2026-05-05', '2027-01-09']);
  // An early quarter-1 attempt: the bound is the start of quarter 2.
  assert.equal(g('2026-01-12').secondAttemptFrom, '2026-04-10');
});

test('a lone attempt in the last quarter cannot be paired', () => {
  assert.equal(g('2026-11-01').flag, 'not-met-in-first-year');
  assert.equal(g('').flag, 'no-attempt-in-first-year');
  assert.match(g('2027-06-01').note, /outside the first year/);
});

test('a documented contraindication is reported, not assessed', () => {
  const r = g('', { contraindication: 'contraindication-documented' });
  assert.equal(r.flag, 'contraindication-documented');
  assert.equal(g('2026-03-01, 2026-05-01', { contraindication: 'contraindication-documented' }).flag, 'example-met');
});

test('refusals', () => {
  assert.match(gdrAttemptCheck({}).message, /^Enter the date the resident was admitted/);
  assert.match(gdrAttemptCheck({ started: '2026-01-10' }).message, /^Choose whether a clinical contraindication/);
  assert.match(g('soon').message, /^Enter each attempt date/);
});

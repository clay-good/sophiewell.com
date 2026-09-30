// spec-v1603 tool 2: payer-policy-diff.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { payerPolicyDiff as d, diffCsv } from '../../lib/payer-policy-diff.js';

const A = 'All of the following:\n1. Diagnosis of rheumatoid arthritis\n2. Step through 2 prior drugs\n3. Prescribed by a rheumatologist\n4. Age 18 years or older';
const B = 'All of the following:\n1. Diagnosis of rheumatoid arthritis\n2. Step through 3 prior drugs\n3. Prescribed by or in consultation with a rheumatologist\n4. Age 18 years or older\n5. Negative TB test within 12 months';

test('the spec case: 2 prior drugs becoming 3 is listed first, as tightened', () => {
  const r = d({ before: A, after: B });
  assert.equal(r.verdict, 'tightened');
  assert.equal(r.rows[0].kind, 'tightened');
  assert.equal(r.rows[0].detail, '2 to 3');
  assert.equal(r.unchanged, 2);
});

test('the spec case: a reworded criterion is reworded, not added and removed', () => {
  const r = d({ before: A, after: B });
  const kinds = r.rows.map((x) => x.kind);
  assert.deepEqual(kinds, ['tightened', 'added', 'reworded']);
  assert.match(r.rows[2].after, /in consultation with/);
});

test('direction is read from the wording, and left to the reader when it is not stated', () => {
  const one = (a, b) => d({ before: `1. ${a}`, after: `1. ${b}` }).rows[0];
  assert.equal(one('No more than 4 units per month', 'No more than 2 units per month').kind, 'tightened');
  assert.equal(one('Negative TB test within 12 months', 'Negative TB test within 6 months').kind, 'tightened');
  assert.equal(one('HbA1c at least 7.0%', 'HbA1c at least 6.5%').kind, 'loosened');
  assert.equal(one('HbA1c at least 7.0%', 'HbA1c at least 6.5%').detail, '7.0 to 6.5');
  const s = one('Score of 7 on the scale', 'Score of 9 on the scale');
  assert.equal(s.kind, 'changed');
  assert.match(s.detail, /depends on the criterion/);
});

test('a criterion that moved is matched by its words, not reported as removed and added', () => {
  const r = d({ before: '1. Alpha criterion here\n2. Beta criterion here', after: '1. Beta criterion here\n2. Alpha criterion here' });
  assert.equal(r.verdict, 'no-change');
  assert.equal(r.unchanged, 2);
});

test('one of becoming all of is a tightened logic change', () => {
  const r = d({ before: 'One of the following:\n1. Failed drug A\n2. Failed drug B', after: 'All of the following:\n1. Failed drug A\n2. Failed drug B' });
  assert.equal(r.rows[0].kind, 'logic-tightened');
  assert.equal(r.verdict, 'tightened');
});

test('removed criteria are listed; effective dates are stated and checked', () => {
  const r = d({ before: B, after: A, beforeDate: '2026-01-01', afterDate: '2026-10-01' });
  assert.ok(r.rows.some((x) => x.kind === 'removed' && /TB test/.test(x.before)));
  assert.match(r.band, /effective 2026-10-01; the earlier one was effective 2026-01-01/);
  assert.equal(d({ before: A, after: B, beforeDate: '2026-10-01', afterDate: '2026-01-01' }).valid, false);
  assert.equal(d({ before: A, after: B, afterDate: '10/01/2026' }).valid, false);
});

test('the CSV export has one row per change and quotes its cells', () => {
  const csv = diffCsv(d({ before: A, after: B }));
  const lines = csv.trim().split('\n');
  assert.equal(lines[0], 'change,item,before,after,detail');
  assert.equal(lines.length, 4);
  assert.match(lines[1], /^"Tightened","2","Step through 2 prior drugs","Step through 3 prior drugs","2 to 3"$/);
});

test('refusals: a version with no numbered criteria is asked for', () => {
  assert.equal(d({}).valid, false);
  assert.equal(d({ before: A, after: 'just prose, no numbering' }).valid, false);
});

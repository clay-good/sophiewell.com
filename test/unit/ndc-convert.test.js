// spec-v5 T15: NDC 10 <-> 11 digit converter (lib/coding-v5.js). FDA drug
// labels carry a 10-digit NDC in one of three segment shapes (4-4-2, 5-3-2,
// 5-4-1); CMS billing requires the 11-digit 5-4-2 form, produced by padding the
// under-length segment with a leading zero. These tests pin the padding rules
// and the round-trip, including the ambiguous bare-11-digit case where the
// original 10-digit shape cannot be recovered without the labeler's listing.
// Billing-critical and previously covered only by the spec-v59 fuzz harness.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ndcConvert, parseNdc } from '../../lib/coding-v5.js';

test('4-4-2 pads the labeler: 0002-7597-01 -> 00002-7597-01', () => {
  const r = ndcConvert('0002-7597-01');
  assert.equal(r.source, '4-4-2');
  assert.equal(r.billing11, '00002-7597-01');
  // The inserted zero is dropped to recover the labeled 10-digit form.
  assert.equal(r.fda10, '0002-7597-01');
  assert.equal(r.fda10Candidates, null);
});

test('5-3-2 pads the product: 12345-678-90 -> 12345-0678-90', () => {
  const r = ndcConvert('12345-678-90');
  assert.equal(r.source, '5-3-2');
  assert.equal(r.billing11, '12345-0678-90');
  assert.equal(r.fda10, '12345-678-90');
});

test('5-4-1 pads the package: 12345-6789-0 -> 12345-6789-00', () => {
  const r = ndcConvert('12345-6789-0');
  assert.equal(r.source, '5-4-1');
  assert.equal(r.billing11, '12345-6789-00');
  assert.equal(r.fda10, '12345-6789-0');
});

test('5-4-2 dashed input is already billing format', () => {
  const r = ndcConvert('12345-6789-01');
  assert.equal(r.source, '5-4-2');
  assert.equal(r.billing11, '12345-6789-01');
  // Only the package leads with 0, so a single 5-4-1 origin is inferable.
  assert.deepEqual(r.fda10Candidates, [{ form: '5-4-1', value: '12345-6789-1' }]);
  assert.equal(r.fda10, '12345-6789-1');
});

test('bare 11-digit string is parsed as 5-4-2', () => {
  const r = ndcConvert('00027597011');
  assert.equal(r.source, '5-4-2');
  assert.equal(r.billing11, '00027-5970-11');
  // Labeler leads with 0 -> a 4-4-2 origin is the single inferable candidate.
  assert.deepEqual(r.fda10Candidates, [{ form: '4-4-2', value: '0027-5970-11' }]);
});

test('ambiguous 5-4-2 with leading zeros in every segment yields all candidates, no single fda10', () => {
  const r = ndcConvert('01234-0678-09');
  assert.equal(r.fda10, null);
  assert.deepEqual(r.fda10Candidates.map((c) => c.form), ['4-4-2', '5-3-2', '5-4-1']);
});

test('5-4-2 with no leading zeros has no recoverable 10-digit form', () => {
  const r = ndcConvert('12345-6789-12');
  assert.equal(r.fda10, null);
  assert.deepEqual(r.fda10Candidates, []);
});

test('parseNdc classifies each segment shape', () => {
  assert.equal(parseNdc('0002-7597-01').source, '4-4-2');
  assert.equal(parseNdc('12345-678-90').source, '5-3-2');
  assert.equal(parseNdc('12345-6789-0').source, '5-4-1');
  assert.equal(parseNdc('12345-6789-01').source, '5-4-2');
  // Bare 11-digit splits 5-4-2.
  assert.deepEqual(
    parseNdc('00027597011'),
    { labeler: '00027', product: '5970', package: '11', source: '5-4-2' },
  );
});

test('rejects malformed input', () => {
  assert.throws(() => ndcConvert(''), /required/);
  assert.throws(() => ndcConvert('1234567890'), /Bare 10-digit NDC is ambiguous/);
  assert.throws(() => ndcConvert('12-34'), /three dash-separated segments/);
  assert.throws(() => ndcConvert('ab-cd-ef'), /segments must be digits/);
  assert.throws(() => ndcConvert('123456789012'), /must be 10 or 11 digits/);
  assert.throws(() => ndcConvert('1-2-3'), /Unrecognized NDC segment lengths/);
});

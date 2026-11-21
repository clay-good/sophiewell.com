// spec-v1769: sample-size-proportion and sample-size-two-groups against the worked examples and tables of
// Lwanga and Lemeshow, Sample size determination in health studies (WHO, 1991).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sampleSizeProportion as one, sampleSizeTwoGroups as two, zQuantile } from '../../lib/sample-size-v1769.js';

const abs = (proportion, precision, confidence = '95', extra = {}) => one({ mode: 'absolute', proportion, precision, confidence, ...extra });
const rel = (proportion, relativePrecision, confidence = '95') => one({ mode: 'relative', proportion, relativePrecision, confidence });
const hyp = (p1, p2, sides, power, alpha = 5) => two({ mode: 'test', p1, p2, sides, power, alpha });
const dif = (p1, p2, precision, confidence = '95') => two({ mode: 'difference', p1, p2, precision, confidence });

test('z values for 90, 95 and 99% confidence and for 80 and 90% power', () => {
  assert.equal(zQuantile(0.95).toFixed(6), '1.644854');
  assert.equal(zQuantile(0.975).toFixed(6), '1.959964');
  assert.equal(zQuantile(0.995).toFixed(6), '2.575829');
  assert.equal(zQuantile(0.9).toFixed(6), '1.281552');
  assert.equal(zQuantile(0.8).toFixed(6), '0.841621');
  assert.equal(zQuantile(0.5), 0);
  assert.equal(zQuantile(1), null);
});

test('Example 1 (Table 1): P 20%, d 5 points: 246 at 95%, 173 at 90%', () => {
  assert.equal(abs(20, 5).n, 246);
  assert.equal(abs(20, 5, '90').n, 173);
  assert.equal(abs(20, 5).band, 'Sample size 246: to estimate the proportion within 5 percentage points of an anticipated 20%, with 95% confidence.');
});

test('Example 2: P 50%, d 10 points, 95%: 96.04 prints 96; a design effect of 2 makes 192', () => {
  const r = abs(50, 10);
  assert.equal(r.n, 96);
  assert.ok(Math.abs(r.raw - 96.04) < 0.01);
  assert.match(r.notes[0], /nearest whole number/);
  assert.equal(abs(50, 10, '95', { designEffect: 2 }).n, 192);
  assert.equal(abs(50, 10, '95', { designEffect: '' }).n, 96, 'blank design effect is simple random sampling');
  assert.equal(abs(5, 2).n, 456, 'Table 1: 456.2 prints 456');
});

test('Example 3 (Table 2): relative precision 10% of P 50%: 384 at 95%, 271 at 90%', () => {
  assert.equal(rel(50, 10).n, 384);
  assert.equal(rel(50, 10, '90').n, 271);
});

test('Example 4: relative precision 5%, 95%: P 25% gives 4,610 and P 40% gives 2,305', () => {
  assert.equal(rel(25, 5).n, 4610);
  assert.equal(rel(40, 5).n, 2305);
});

test('Example 11 (Table 5a): 5% vs 15%, one-sided, 5% significance, 90% power: 152.27 rounds up to 153', () => {
  const r = hyp(5, 15, 'one', 90);
  assert.equal(r.nPerGroup, 153);
  assert.equal(r.total, 306);
  assert.ok(Math.abs(r.raw - 152.27) < 0.01);
  assert.match(r.notes.join(' '), /pooled, 2P̄\(1 − P̄\).*under the hypothesis of no difference; unpooled/);
});

test('Example 12 (Table 5c): 60% vs 50%, two-sided, 90% power: 518.04 rounds up to 519', () => {
  assert.equal(hyp(60, 50, 'two', 90).nPerGroup, 519);
});

test('Table 5b check: 5% vs 10%, one-sided, 80% power: 343', () => {
  assert.equal(hyp(5, 10, 'one', 80).nPerGroup, 343);
});

test('Example 9 (Table 4b): the difference within 5 points at 95%, both 50%: 768.3 rounds up to 769', () => {
  assert.equal(dif(50, 50, 5).nPerGroup, 769);
});

test('Example 10: 40% vs 32% within 5 points: exact V 0.4576 gives 704 (the manual prints 707 from V rounded to 0.46)', () => {
  assert.equal(dif(40, 32, 5).nPerGroup, 704);
});

test('a design effect multiplies the per-group size, rounded up', () => {
  const r = two({ mode: 'test', p1: 5, p2: 15, sides: 'one', power: 90, alpha: 5, designEffect: 1.5 });
  assert.equal(r.nPerGroup, 230);
  assert.equal(r.total, 460);
  assert.equal(abs(50, 10, '95', { designEffect: 1.1 }).n, 106, '96 x 1.1 = 105.6');
});

test('a proportion under 5% carries the arcsine note; 5% or more does not', () => {
  assert.match(hyp(2, 10, 'one', 90).notes.join(' '), /arcsine/);
  assert.doesNotMatch(hyp(5, 15, 'one', 90).notes.join(' '), /arcsine/);
});

test('refusals: 0% or 100%, equal proportions in a test, power out of range, blanks, a design effect under 1', () => {
  assert.match(abs(0, 5).message, /greater than 0/);
  assert.match(abs(100, 5).message, /less than 100/);
  assert.match(abs('', 5).message, /^Enter the anticipated proportion/);
  assert.match(abs(20, '').message, /^Enter the absolute precision/);
  assert.equal(one({ mode: '', proportion: 20, precision: 5, confidence: '95' }).valid, false);
  assert.equal(abs(20, 5, '80').valid, false);
  assert.match(hyp(10, 10, 'one', 90).message, /the same/);
  assert.equal(hyp(5, 15, 'one', 40).valid, false);
  assert.equal(hyp(5, 15, 'one', 100).valid, false);
  assert.match(two({ mode: 'test', p1: 5, p2: 15, sides: 'one', power: 90, alpha: '' }).message, /^Enter the significance level/);
  assert.equal(hyp(5, 15, '', 90).valid, false);
  assert.match(abs(50, 10, '95', { designEffect: 0.5 }).message, /design effect must be between 1 and 100/);
  assert.match(dif(50, 50, '').message, /^Enter the absolute precision/);
});

// spec-v1601 tool 2: preventive-cost-share-check. The spec's tests, plus the
// office-visit rule's three branches and the refusals.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { preventiveCostShareCheck as p } from '../../lib/preventive-cost-share-check.js';

const base = { plan: 'private', network: 'in' };

test('a follow-up colonoscopy after a positive FIT is not allowed, citing FAQs Part 51', () => {
  const r = p({ ...base, service: 'followup-colonoscopy' });
  assert.equal(r.verdict, 'service-only');
  assert.match(r.band, /Cost sharing is not allowed for the follow-up colonoscopy/);
  assert.match(r.band, /Part 51 \(Jan\. 10, 2022\), Q7 and Q8/);
  assert.match(r.band, /plan years beginning on or after May 31, 2022/);
});

test('each colonoscopy-related item cites the FAQ that settled it', () => {
  assert.match(p({ ...base, service: 'polyp-removal' }).band, /Part XII \(Feb\. 20, 2013\), Q5/);
  assert.match(p({ ...base, service: 'anesthesia' }).band, /Part XXVI \(May 11, 2015\), Q7/);
  assert.match(p({ ...base, service: 'specialist-consult' }).band, /Part XXIX \(Oct\. 23, 2015\), Q7/);
  assert.match(p({ ...base, service: 'polyp-pathology' }).band, /Part XXIX \(Oct\. 23, 2015\), Q8/);
  assert.match(p({ ...base, service: 'bowel-prep' }).band, /Part 31 \(Apr\. 20, 2016\), Q1/);
  assert.match(p({ ...base, service: 'prep' }).band, /Part 47 \(July 19, 2021\)/);
});

test('office visits: billed separately, primary purpose, and the question left open', () => {
  assert.match(p({ ...base, service: 'screening', visitSeparate: 'yes' }).band, /billed separately may carry cost sharing \(147\.130\(a\)\(2\)\(i\)\)/);
  assert.match(p({ ...base, service: 'screening', visitSeparate: 'no', primaryPurpose: 'yes' }).band, /may not either.*\(147\.130\(a\)\(2\)\(ii\)\)/);
  const other = p({ ...base, service: 'screening', visitSeparate: 'no', primaryPurpose: 'no' });
  assert.equal(other.verdict, 'visit-allowed');
  assert.match(other.band, /\(147\.130\(a\)\(2\)\(iii\)\)/);
  assert.ok(p({ ...base, service: 'screening', visitSeparate: 'no' }).notes.some((n) => /depends on its primary purpose/.test(n)));
  // A blank is never read as an answer: each unanswered state has its own verdict.
  const verdicts = ['', 'yes', 'no'].flatMap((v) => ['', 'yes', 'no'].map((q) => p({ ...base, service: 'screening', visitSeparate: v, primaryPurpose: q }).verdict));
  assert.deepEqual([...new Set(verdicts)].sort(), ['not-allowed', 'service-only', 'visit-allowed', 'visit-depends']);
});

test('out of network, grandfathered and public plans: the rule does not apply, and nobody is told they owe', () => {
  for (const r of [p({ ...base, network: 'out', service: 'anesthesia' }), p({ ...base, plan: 'grandfathered', service: 'anesthesia' }), p({ ...base, plan: 'public', service: 'anesthesia' })]) {
    assert.equal(r.verdict, 'does-not-apply');
    assert.match(r.band, /not a finding that you owe this/);
    assert.doesNotMatch(`${r.band} ${r.notes.join(' ')}`, /you owe (this|it)[.,]? (?!:)/i);
  }
  const none = p({ ...base, network: 'out-none', service: 'anesthesia' });
  assert.equal(none.verdict, 'service-only');
  assert.ok(none.notes.some((n) => /147\.130\(a\)\(3\)\(ii\)/.test(n)));
});

test('an amount charged is named; blanks and nonsense are refused', () => {
  assert.ok(p({ ...base, service: 'bowel-prep', charged: '42.5' }).notes.some((n) => /\$42\.50 was charged/.test(n)));
  assert.match(p({}).message, /kind of plan/);
  assert.match(p({ plan: 'private' }).message, /service/);
  assert.match(p({ plan: 'private', service: 'prep' }).message, /in network/);
  assert.match(p({ ...base, service: 'prep', charged: '-1' }).message, /amount charged/);
});

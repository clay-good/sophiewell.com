// spec-v235: worked examples for the pain / disability screens. Point systems
// spec-v97 verified (Bouhassira 2005; Bennett 2001; Roland & Morris 1983;
// Vernon & Mior 1991).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dn4, lanss, rolandMorris, neckDisabilityIndex } from '../../lib/painscore-v235.js';

test('dn4: >= 4 neuropathic likely', () => {
  const r = dn4({ burning: true, cold: true, shocks: true, tingling: true, pins: true });
  assert.equal(r.score, 5);
  assert.equal(r.abnormal, true);
});
test('dn4: below 4 unlikely', () => {
  const r = dn4({ burning: true, cold: true });
  assert.equal(r.score, 2);
  assert.equal(r.abnormal, false);
});

test('lanss: weighted >= 12 neuropathic', () => {
  const r = lanss({ dysesthesia: true, autonomic: true, brushAllodynia: true }); // 5+5+5
  assert.equal(r.score, 15);
  assert.equal(r.abnormal, true);
});
test('lanss: below 12', () => {
  const r = lanss({ dysesthesia: true, thermal: true }); // 5+1
  assert.equal(r.score, 6);
  assert.equal(r.abnormal, false);
});

test('roland-morris: count of applicable statements', () => {
  const r = rolandMorris({ count: 14 });
  assert.equal(r.score, 14);
});
// spec-v1722: 30 statements of 24 used to read as 0 ("no disability"); refused now.
test('roland-morris: a count above 24, or a fraction, is refused', () => {
  assert.equal(rolandMorris({ count: 30 }).valid, false);
  assert.match(rolandMorris({ count: 30 }).message, /between 0 and 24/);
  assert.match(rolandMorris({ count: 3.5 }).message, /whole number/);
  assert.equal(rolandMorris({ count: 24 }).score, 24);
});

test('neck-disability-index: moderate band', () => {
  const r = neckDisabilityIndex({ pain: 2, care: 2, lifting: 2, reading: 2, headaches: 2, concentration: 2, work: 2, driving: 2, sleeping: 2, recreation: 2 });
  assert.equal(r.score, 40);
  assert.match(r.band, /moderate/);
});
test('neck-disability-index: no disability', () => {
  const r = neckDisabilityIndex({ pain: 1, care: 1 });
  assert.equal(r.score, 4);
  assert.equal(r.abnormal, false);
});

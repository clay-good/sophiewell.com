// spec-v50 §3.6: the AI-vendor guard bites on an SDK name in source, and its
// one citation exception (issue #20) covers that exact URL and nothing else.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { aiVendorHits } from '../../scripts/check-commitments.mjs';

const BULLETIN = 'https://www.southcarolinablues.com/en/home/providers/news-and-events/news-bulletins/importance-of-submitting-continued-stay-reviews-in-cohere-health.html';

test('the guard flags an AI SDK import and a quoted vendor name', () => {
  assert.deepEqual(aiVendorHits("import { CohereClient } from 'cohere-ai';"), ['cohere']);
  assert.deepEqual(aiVendorHits("const x = 'openai';"), ['openai']);
});

test('the excepted BCBSSC bulletin URL passes inside a citation string', () => {
  assert.deepEqual(aiVendorHits(`    citation: 'BCBSSC bulletin. <${BULLETIN}>',`), []);
});

test('the exception is the exact URL, not the word or the domain', () => {
  assert.deepEqual(aiVendorHits(`    citation: 'See <${BULLETIN.replace('.html', '-2.html')}>',`), ['cohere']);
  assert.deepEqual(aiVendorHits(`    citation: '<${BULLETIN}> and the cohere SDK',`), ['cohere']);
});

test('prose outside quotes is not scanned', () => {
  assert.deepEqual(aiVendorHits('// cohere is mentioned in a comment'), []);
});

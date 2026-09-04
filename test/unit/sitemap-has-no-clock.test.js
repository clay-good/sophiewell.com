// spec-v1030: the sitemap must not carry a date the build stamped.
//
// It used to give every URL a `<lastmod>` of `new Date()`. The commit before
// this one was made on 2026-09-03 and its CI build ran at 00:09 UTC on the 4th,
// so `npm run build` rewrote all 1,704 lines and the "build must be idempotent"
// job failed on a change that had touched no page. The generator, not the gate,
// was wrong -- but nothing said so, and the next contributor to add a helpful
// timestamp here would rediscover it the same way, on a red main branch.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('sitemap.xml contains no build-stamped date', () => {
  const xml = readFileSync(new URL('../../sitemap.xml', import.meta.url), 'utf8');
  assert.doesNotMatch(xml, /<lastmod>/, 'lastmod is stamped from the clock; see docs/spec-v1030.md');
  assert.doesNotMatch(xml, /\b20\d\d-\d\d-\d\d\b/, 'a date in the sitemap makes the build non-idempotent across midnight');
});

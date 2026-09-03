// spec-v1003: `manifest.sourceUrl` becomes an href in app.js, so it has to be a
// URL. Eleven manifests carried a sentence there and seven live tiles linked it.
// These pin the detector on synthetic input, including the two shapes that
// actually shipped: prose, and a real URL with a note appended.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { findBadSourceUrls } from '../../scripts/check-source-urls.mjs';

test('a real https url passes', () => {
  assert.deepEqual(findBadSourceUrls({ a: { sourceUrl: 'https://dailymed.nlm.nih.gov/dailymed/' } }), []);
});

test('null passes: a dataset with no canonical page renders plain text', () => {
  assert.deepEqual(findBadSourceUrls({ a: { sourceUrl: null } }), []);
});

test('an absent field passes', () => {
  assert.deepEqual(findBadSourceUrls({ a: { label: 'x' } }), []);
});

test('prose fails, and the message says why', () => {
  const v = findBadSourceUrls({ a: { sourceUrl: 'FDA labels via DailyMed' } });
  assert.equal(v.length, 1);
  assert.match(v[0], /whitespace/);
});

test('a url with a note appended fails', () => {
  // The shape that shipped: mci-triage rendered
  // href="https://www.start-triage.com/%20;%20JumpSTART%20(CHOC%20Children's)".
  const v = findBadSourceUrls({ a: { sourceUrl: "https://www.start-triage.com/ ; JumpSTART (CHOC Children's)" } });
  assert.equal(v.length, 1);
  assert.match(v[0], /whitespace/);
});

test('a non-http scheme fails', () => {
  for (const bad of ['javascript:alert(1)', 'data:text/html,x', 'ftp://example.com/x']) {
    const v = findBadSourceUrls({ a: { sourceUrl: bad } });
    assert.equal(v.length, 1, bad);
    assert.match(v[0], /not http\(s\)/, bad);
  }
});

test('a bare word that is not a URL at all fails', () => {
  const v = findBadSourceUrls({ a: { sourceUrl: 'project-author-original-content' } });
  assert.equal(v.length, 1);
  assert.match(v[0], /does not parse/);
});

test('a non-string, non-null value fails', () => {
  const v = findBadSourceUrls({ a: { sourceUrl: 42 } });
  assert.equal(v.length, 1);
  assert.match(v[0], /not a string or null/);
});

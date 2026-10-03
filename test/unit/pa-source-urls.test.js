// spec-v980: the link checker's own verdicts.
//
// Its one job is to say whether a source page is there. Three ways that goes
// wrong, and this pins all three:
//
//   a 403 is a BOT WALL, not a dead page. asahq.org and medicaid.gov refuse
//   scripted requests and are fine in a browser; calling those dead trains the
//   maintainer to ignore the report.
//
//   a redirect is not a failure, but the ledger should carry the destination so
//   a reader lands in one hop.
//
//   a 200 is not proof. Several payer sites serve their not-found page with a
//   200, and a checker that can be lied to about the one thing it checks is not
//   a checker.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { classify, looksNotFound, sameAddress } from '../../scripts/check-pa-source-urls.mjs';
import { secondLook } from '../../scripts/lib/second-look.mjs';

const at = (url) => ({ finalUrl: url, declaredUrl: url });

test('a clean 200 at the declared url is OK', () => {
  assert.equal(classify({ status: 200, ...at('https://example.gov/a') }), 'OK');
  // A trailing slash is not a move.
  assert.equal(classify({ status: 200, finalUrl: 'https://example.gov/a/', declaredUrl: 'https://example.gov/a' }), 'OK');
});

test('a redirect is MOVED, not a failure', () => {
  assert.equal(classify({ status: 200, finalUrl: 'https://example.gov/b', declaredUrl: 'https://example.gov/a' }), 'MOVED');
});

test('403 and 429 are BLOCKED, because a bot wall is not a dead page', () => {
  assert.equal(classify({ status: 403, ...at('https://example.gov/a') }), 'BLOCKED');
  assert.equal(classify({ status: 429, ...at('https://example.gov/a') }), 'BLOCKED');
});

test('404, 410 and a failed request are DEAD', () => {
  assert.equal(classify({ status: 404, ...at('https://example.gov/a') }), 'DEAD');
  assert.equal(classify({ status: 410, ...at('https://example.gov/a') }), 'DEAD');
  assert.equal(classify({ status: 0, error: 'fetch failed', ...at('https://example.gov/a') }), 'DEAD');
});

test('a 200 that says it is not found is DEAD', () => {
  assert.equal(classify({ status: 200, softNotFound: true, ...at('https://example.gov/a') }), 'DEAD');
  // And it outranks the redirect reading: a moved page that is not there is dead.
  assert.equal(classify({ status: 200, softNotFound: true, finalUrl: 'https://example.gov/b', declaredUrl: 'https://example.gov/a' }), 'DEAD');
});

test('looksNotFound reads the title and the first h1, and nothing else', () => {
  assert.equal(looksNotFound('<title>404 page - Horizon Blue Cross Blue Shield of New Jersey</title>'), true);
  assert.equal(looksNotFound("<title>x</title><h1>Sorry, we couldn't find that page</h1>"), true);
  assert.equal(looksNotFound('<title>Error: Page Not Found | Medicaid.gov</title>'), true);
  assert.equal(looksNotFound('<title>Policies | Providers | Independence Blue Cross (IBX)</title><h1>Policies and guidelines</h1>'), false);
  // The narrow reading is the point: a real policy page may discuss error codes.
  assert.equal(looksNotFound('<title>Claim adjustment reason codes</title><h1>Denials</h1><p>A 404 response means the page not found.</p>'), false);
  assert.equal(looksNotFound(''), false);
});

// Issue #19: the redirects in the first monthly report that were not news.
test('a portal appending its session state is not a move', () => {
  const declared = 'https://provider.bluecrossma.com/ProviderHome/portal/home/clinical-resources/prior-authorization/cancer-care/';
  const final = `${declared}!ut/p/z1/nZDLDoIwFES_hS/dz/d5/L2dBISEvZ0FBIS9nQSEh/`;
  assert.equal(sameAddress(declared, final), true);
  assert.equal(classify({ status: 200, finalUrl: final, declaredUrl: declared }), 'OK');
  // A different page under the same portal is still a move.
  assert.equal(classify({ status: 200, finalUrl: 'https://provider.bluecrossma.com/ProviderHome/portal/home/!ut/p/z1/x/', declaredUrl: declared }), 'MOVED');
});

test('a signed one-time link is not a move; the declared url is the stable one', () => {
  const declared = 'https://mcweb.apps.prd.cammis.medi-cal.ca.gov/file/manual?fn=tar.pdf';
  const final = 'https://mcweb.apps.prd.cammis.medi-cal.ca.gov/assets/2BBF/tar.pdf?access_token=abc';
  assert.equal(classify({ status: 200, finalUrl: final, declaredUrl: declared }), 'OK');
});

test('a redirect to a sign-in page is DEAD, not MOVED', () => {
  // providers.bluekc.com/Authorizations began answering with its login page.
  assert.equal(classify({ status: 200, finalUrl: 'https://providers.bluekc.com/login', declaredUrl: 'https://providers.bluekc.com/Authorizations' }), 'DEAD');
  // Matched on path segments, so /Authorizations itself is not a wall.
  assert.equal(classify({ status: 200, finalUrl: 'https://providers.bluekc.com/Authorizations/', declaredUrl: 'https://providers.bluekc.com/Authorizations' }), 'OK');
  assert.equal(classify({ status: 200, finalUrl: 'https://example.gov/prior-authorization', declaredUrl: 'https://example.gov/pa' }), 'MOVED');
});

test('secondLook re-fetches only the dead rows and keeps the later answer', async () => {
  const rows = [
    { url: 'a', verdict: 'OK' },
    { url: 'b', verdict: 'DEAD' }, // a phantom: alive on the second look
    { url: 'c', verdict: 'DEAD' }, // really dead
  ];
  const asked = [];
  const out = await secondLook(rows, (r) => r.verdict === 'DEAD', async (r) => {
    asked.push(r.url);
    return { url: r.url, verdict: r.url === 'b' ? 'OK' : 'DEAD' };
  });
  assert.deepEqual(asked, ['b', 'c']);
  assert.deepEqual(out.map((r) => `${r.url}:${r.verdict}`), ['a:OK', 'b:OK', 'c:DEAD']);
  // Nothing dead, nothing re-fetched.
  const clean = [{ url: 'a', verdict: 'OK' }];
  assert.equal(await secondLook(clean, (r) => r.verdict === 'DEAD', () => { throw new Error('fetched'); }), clean);
});

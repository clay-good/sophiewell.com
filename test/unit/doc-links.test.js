// spec-v1004: the pure half of the living-doc link checker. The network half is
// warn-only and monthly; these pin the classification rules, which are where the
// judgment lives -- a report that calls a bot wall or a trailing slash a dead
// link is a report nobody reads, and spec-v1002 showed what happens when nobody
// reads it (twelve authorities dead for months).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { classify, sameDestination, urlsIn, skipReason, livingDocs } from '../../scripts/check-doc-links.mjs';

test('404, 410, 5xx and a failed request are DEAD', () => {
  for (const s of [404, 410, 500, 503, 0]) {
    assert.equal(classify('https://a.example/x', s, 'https://a.example/x'), 'DEAD', String(s));
  }
});

test('403 and 429 are a bot wall, not a dead page', () => {
  // cdc.gov and medicaid.gov both answer a script this way and serve a browser fine.
  for (const s of [403, 429]) {
    assert.equal(classify('https://www.cdc.gov/x', s, 'https://www.cdc.gov/x'), 'BLOCKED', String(s));
  }
});

test('a real relocation is MOVED', () => {
  assert.equal(
    classify('https://observatory.mozilla.org/analyze/x', 200, 'https://developer.mozilla.org/en-US/observatory/analyze?host=x'),
    'MOVED',
  );
});

test('a trailing slash the server adds is not a relocation', () => {
  assert.equal(classify('https://hstspreload.org', 200, 'https://hstspreload.org/'), 'OK');
  assert.ok(sameDestination('https://a.example', 'https://a.example/'));
});

test('a fragment the server never sees is not a relocation', () => {
  assert.equal(classify('https://sophiewell.com/#wells-pe', 200, 'https://sophiewell.com/'), 'OK');
});

test('github bouncing an anonymous fetch through /login is not a relocation', () => {
  const url = 'https://github.com/o/r/issues/new?template=x.yml';
  const to = `https://github.com/login?return_to=${encodeURIComponent(url)}`;
  assert.equal(classify(url, 200, to), 'OK');
  // ...but a login redirect back to somewhere else still counts as moved.
  assert.equal(classify(url, 200, 'https://github.com/login?return_to=https%3A%2F%2Fgithub.com%2Fother'), 'MOVED');
});

test('urlsIn finds bare and markdown links and trims trailing punctuation', () => {
  const found = urlsIn('See [x](https://a.example/one) and https://b.example/two, plus <https://c.example/three>.');
  assert.deepEqual(found.sort(), [
    'https://a.example/one',
    'https://b.example/two',
    'https://c.example/three',
  ]);
});

test('urlsIn does not report the same address twice', () => {
  assert.deepEqual(urlsIn('https://a.example/x and again https://a.example/x'), ['https://a.example/x']);
});

test('placeholders and the local dev server are skipped, with a reason', () => {
  assert.ok(skipReason('http://localhost:4173'));
  assert.ok(skipReason('https://doi.org/…'));
  assert.ok(skipReason('https://sophiewell.com/api/reports'));
  assert.equal(skipReason('https://www.cms.gov/real/page'), null);
});

test('frozen spec documents are never scanned', () => {
  // Rewriting a link inside docs/spec-v123.md would falsify a historical record.
  const docs = livingDocs(['architecture.md', 'spec-v1.md', 'spec-v1004.md', 'legal.md', 'notes.txt']);
  return docs.then((list) => {
    assert.ok(list.includes('docs/architecture.md'));
    assert.ok(list.includes('docs/legal.md'));
    assert.ok(!list.some((f) => /spec-v\d/.test(f)), list.join(','));
    assert.ok(!list.some((f) => f.endsWith('.txt')));
    assert.ok(list.includes('README.md') && list.includes('CONTRIBUTING.md'));
  });
});

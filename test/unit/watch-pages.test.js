// spec-v1517 route B watcher 2: the page watcher's source list, fingerprint and comparison (no fetching).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { sources, fingerprint, compare, markdown, STATE } from '../../scripts/data/watch-pages.mjs';

test('the sources are the pages behind route-B dated values, each with its modules; every one has a recorded reading', () => {
  const s = sources();
  assert.ok(s.size >= 10);
  assert.deepEqual(s.get('https://www.cms.gov/newsroom/fact-sheets/fiscal-year-2027-hospice-wage-index-payment-rate-update-hospice-quality-reporting-program'), ['lib/hospice-cap-v1514.js']);
  const state = JSON.parse(readFileSync(STATE, 'utf8'));
  assert.deepEqual([...s.keys()].filter((u) => !state[u]), []);
});

test('an HTML page is fingerprinted by the text of its main, without scripts or markup; a PDF by its bytes', () => {
  const a = '<html><head><script>var t=Date.now()</script></head><body><nav>Menu</nav><main><h1>Premiums</h1><p>$202.90</p></main></body></html>';
  const b = '<html><head><script>var t=1</script></head><body><nav>Other</nav><main><h1>Premiums</h1>\n <p>$202.90</p></main></body></html>';
  assert.equal(fingerprint(Buffer.from(a)), fingerprint(Buffer.from(b)));
  assert.notEqual(fingerprint(Buffer.from(a)), fingerprint(Buffer.from(a.replace('202.90', '206.50'))));
  assert.notEqual(fingerprint(Buffer.from('%PDF-1.7 a')), fingerprint(Buffer.from('%PDF-1.7 b')));
});

test('a changed page is listed with its modules and the command to record it', () => {
  const srcs = new Map([['https://x.example/a', ['lib/a.js']], ['https://x.example/b', ['lib/b.js']], ['https://x.example/c', ['lib/c.js']]]);
  const rows = compare(srcs, { 'https://x.example/a': { sha256: '1', recorded: '2026-10-03' }, 'https://x.example/b': { sha256: '2', recorded: '2026-10-03' } }, new Map([['https://x.example/a', '9'], ['https://x.example/b', '2']]));
  assert.deepEqual(rows.map((r) => r.status), ['changed', 'unchanged', 'unreachable']);
  const md = markdown(rows);
  assert.match(md, /- https:\/\/x\.example\/a changed since it was read on 2026-10-03\. Re-check the values in `lib\/a\.js`, then record it/);
  assert.match(md, /Could not fetch 1 page: https:\/\/x\.example\/c\./);
});

#!/usr/bin/env node
// spec-v1004: the external links in the documents a contributor reads.
//
// The tile citations are checked (scripts/check-citation-links.mjs) and the
// prior-auth ledger is checked (scripts/check-pa-source-urls.mjs). The living
// documentation was not, and it had a 404 in it: docs/legal.md cited NADAC at a
// data.medicaid.gov dataset path that has since moved.
//
// Living documents only. `docs/spec-v*.md` are frozen records of what was true
// when they were written, and rewriting a link inside one would be falsifying the
// record; the same goes for docs/audits/**.
//
// NETWORK and warn-only by default, for the same reason as its two siblings: a
// publisher outage must not fail CI for a reason unrelated to the change.
//
//   node scripts/check-doc-links.mjs            # report, exit 0
//   node scripts/check-doc-links.mjs --strict   # exit 1 on any DEAD link
//   node scripts/check-doc-links.mjs --json     # machine-readable
//
// The same four verdicts the PA checker uses, because they need four different
// responses: OK, MOVED (update the doc so the reader lands in one hop), BLOCKED
// (a bot wall answering a script with 403/429 - cdc.gov and medicaid.gov both do
// this and are fine in a browser), DEAD (404/410/5xx or the request failed).

import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';

const ROOT = process.cwd();
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Links a check cannot meaningfully resolve. Each needs a reason.
export const SKIP = [
  [/^https?:\/\/localhost[:/]/, 'a local dev server, documented as an instruction'],
  [/…|\.\.\./, 'an elided placeholder in an example, not a real address'],
  [/^https:\/\/sophiewell\.com\/api\//, 'the report endpoint; it answers 405 to anything but POST by design'],
];

// livingDocs() -> [path]. Everything a contributor is meant to read as current.
export async function livingDocs(entries) {
  const docs = entries || await readdir(join(ROOT, 'docs'));
  return ['README.md', 'CONTRIBUTING.md', 'SECURITY.md', 'CHANGELOG.md']
    .concat(docs.filter((f) => f.endsWith('.md') && !/^spec-v\d+/.test(f)).map((f) => `docs/${f}`));
}

// urlsIn(text) -> [string]. Bare and markdown links alike, trailing punctuation trimmed.
export function urlsIn(text) {
  const out = new Set();
  for (const m of text.matchAll(/https?:\/\/[^\s<>()[\]"'`]+/g)) out.add(m[0].replace(/[.,;:>]+$/, ''));
  return [...out];
}

// skipReason(url) -> string | null.
export function skipReason(url) {
  for (const [re, why] of SKIP) if (re.test(url)) return why;
  return null;
}

// sameDestination(a, b) -> bool. A redirect is only worth reporting when it
// tells the reader to write the address differently. Two do not:
//   - a trailing slash the server adds ("hstspreload.org" -> ".../")
//   - github.com bouncing an anonymous fetch through /login?return_to=<original>,
//     which is what a signed-out visitor sees and not a moved page
//   - a fragment the server never sees ("sophiewell.com/#wells-pe" comes back as
//     "sophiewell.com/", which is the same page)
// Reporting those as MOVED is how a link report becomes noise nobody reads.
export function sameDestination(a, b) {
  if (!b || a === b) return true;
  const strip = (u) => u.replace(/#.*$/, '').replace(/\/+$/, '');
  if (strip(a) === strip(b)) return true;
  try {
    const to = new URL(b);
    if (to.hostname === 'github.com' && to.pathname === '/login') {
      const back = to.searchParams.get('return_to');
      return Boolean(back) && strip(back) === strip(a);
    }
  } catch { /* not a URL we can reason about */ }
  return false;
}

// classify(url, status, finalUrl) -> 'OK' | 'MOVED' | 'BLOCKED' | 'DEAD'. Pure.
export function classify(url, status, finalUrl) {
  if (status === 403 || status === 429) return 'BLOCKED';
  if (status === 0 || status === 404 || status === 410 || status >= 500) return 'DEAD';
  if (status >= 200 && status < 400) return sameDestination(url, finalUrl) ? 'OK' : 'MOVED';
  return 'OK';
}

async function probe(url) {
  // 404 and 410 are believed at once; anything else transient is retried, the
  // same rule spec-v999 put into the citation checker after three consecutive
  // runs produced three different phantom failures.
  let last = { status: 0, finalUrl: url };
  for (let a = 0; a < 3; a++) {
    try {
      const res = await fetch(url, { redirect: 'follow', headers: { 'User-Agent': UA } });
      last = { status: res.status, finalUrl: res.url };
      if (res.status === 404 || res.status === 410 || res.status < 500) return last;
    } catch { last = { status: 0, finalUrl: url }; }
    await sleep(1200 * (a + 1));
  }
  return last;
}

async function main() {
  const strict = process.argv.includes('--strict');
  const asJson = process.argv.includes('--json');
  const files = await livingDocs();
  const where = new Map();
  for (const f of files) {
    let text;
    try { text = await readFile(join(ROOT, f), 'utf8'); } catch { continue; }
    for (const u of urlsIn(text)) {
      if (skipReason(u)) continue;
      if (!where.has(u)) where.set(u, new Set());
      where.get(u).add(f);
    }
  }
  const rows = [];
  for (const url of where.keys()) {
    const { status, finalUrl } = await probe(url);
    rows.push({ url, status, finalUrl, verdict: classify(url, status, finalUrl), docs: [...where.get(url)].sort() });
    await sleep(200);
  }
  if (asJson) { console.log(JSON.stringify(rows, null, 2)); return; }

  const by = (v) => rows.filter((r) => r.verdict === v);
  for (const v of ['DEAD', 'MOVED', 'BLOCKED']) {
    const set = by(v);
    if (!set.length) continue;
    console.log(`\n${v} (${set.length}):`);
    for (const r of set) {
      console.log(`  ${r.docs.join(', ')}  ${r.status}  ${r.url}`);
      if (v === 'MOVED') console.log(`      -> ${r.finalUrl}`);
    }
  }
  const dead = by('DEAD').length;
  console.log(`\ncheck-doc-links: ${by('OK').length} ok, ${by('MOVED').length} moved, ${by('BLOCKED').length} blocked by a bot wall, ${dead} dead of ${rows.length}.`);
  if (dead && strict) process.exit(1);
}

if (process.argv[1] && process.argv[1].endsWith('check-doc-links.mjs')) {
  main().catch((err) => { console.error(err); process.exit(2); });
}

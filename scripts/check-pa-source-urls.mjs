#!/usr/bin/env node
// spec-v979: the staleness ledger tracked DATES and never checked the LINKS.
//
// docs/pa-maintenance.md describes a monthly pass whose first step is "open each
// sources[].url and confirm it still resolves". Nothing did the resolving. The
// ledger's 84 rows are the canonical URL for every authority the prior-auth linter
// anchors a rule to, and a rule whose source moved "is worse than no rule, because
// it reads as authoritative while being wrong" -- the ledger's own words.
//
// This does the half a machine can do. It cannot read a policy page and decide the
// rules still reflect it; that stays a maintainer's judgment and a `lastVerified`
// bump. It CAN tell you the page is gone.
//
// NETWORK. Deliberately NOT in `npm run lint`: no-network is a hard commitment for
// the shipped site (spec-v50 3.1), and lint must stay offline and deterministic.
// This runs on the monthly cadence workflow and on demand:
//
//   node scripts/check-pa-source-urls.mjs            # report, always exit 0
//   node scripts/check-pa-source-urls.mjs --strict   # exit 1 on any DEAD row
//   node scripts/check-pa-source-urls.mjs --json     # machine-readable
//
// Four outcomes, because they need four different responses:
//
//   OK       200, and the final URL is the declared one.
//   MOVED    200 after a redirect. Not a failure -- but the ledger should carry
//            the destination, so the reader following it lands in one hop.
//   BLOCKED  403 / 429. A bot wall, not a dead page. medicaid.gov and asahq.org
//            refuse scripted requests and are fine in a browser, so reporting
//            these as dead would train the maintainer to ignore the report.
//   DEAD     404 / 410, the request failed, or the page answered 200 and then said
//            it was not found. A SOFT 404 is the failure mode a status-code-only
//            checker exists to be wrong about: the checker's one job is to say
//            whether the page is there, and several payer sites are happy to
//            serve their not-found page with a 200. It finds none today; it is
//            here because a link checker that can be lied to is not a checker.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const LEDGER = `${ROOT}pa-staleness-ledger.json`;
const args = new Set(process.argv.slice(2));
const STRICT = args.has('--strict');
const AS_JSON = args.has('--json');

// A plain fetch is refused by several of these hosts. This is the same request a
// reader's browser makes, minus the browser.
const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
};
const TIMEOUT_MS = 25000;
const CONCURRENCY = 8;

// Not-found wording in a page's own <title> or first <h1>. Deliberately narrow:
// these two elements name what the page IS, so matching there does not fire on a
// policy page that happens to discuss error codes further down.
const NOT_FOUND_WORDING = /\b404\b|page not found|can(?:no|')?t find (?:that|the) page|couldn'?t find that page|page (?:you requested|is no longer|has moved|does ?n'?t exist)/i;

const tagText = (html, tag) => {
  const m = html.match(new RegExp(`<${tag}[^>]*>([\\s\\S]{0,300}?)</${tag}>`, 'i'));
  return m ? m[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() : '';
};

export function looksNotFound(html) {
  if (!html) return false;
  return NOT_FOUND_WORDING.test(tagText(html, 'title')) || NOT_FOUND_WORDING.test(tagText(html, 'h1'));
}

export function classify({ status, finalUrl, declaredUrl, error, softNotFound }) {
  if (error) return 'DEAD';
  if (status === 403 || status === 429) return 'BLOCKED';
  if (status >= 400) return 'DEAD';
  if (status >= 200 && status < 400) {
    if (softNotFound) return 'DEAD';
    const same = (a, b) => a.replace(/\/+$/, '') === b.replace(/\/+$/, '');
    return finalUrl && !same(finalUrl, declaredUrl) ? 'MOVED' : 'OK';
  }
  return 'DEAD';
}

async function probe(source) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    // GET rather than HEAD: several of these hosts answer HEAD with a 405 or a
    // 404 they would not give a real reader.
    const res = await fetch(source.url, { headers: HEADERS, redirect: 'follow', signal: ctrl.signal });
    // Only an HTML 200 can lie about being there. A PDF cannot soft-404, and the
    // body of a real error status tells us nothing we do not already know.
    let softNotFound = false;
    if (res.status === 200 && /html/i.test(res.headers.get('content-type') || '')) {
      softNotFound = looksNotFound((await res.text()).slice(0, 200000));
    }
    return { ...source, status: res.status, finalUrl: res.url, softNotFound };
  } catch (err) {
    return { ...source, status: 0, finalUrl: null, error: String(err && err.message ? err.message : err) };
  } finally {
    clearTimeout(timer);
  }
}

async function mapLimit(items, limit, fn) {
  const out = new Array(items.length);
  let next = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    for (;;) {
      const i = next++;
      if (i >= items.length) return;
      out[i] = await fn(items[i]);
    }
  });
  await Promise.all(workers);
  return out;
}

async function main() {
  const ledger = JSON.parse(readFileSync(LEDGER, 'utf8'));
  const acked = new Set((ledger.acknowledgments || []).map((a) => a.id));
  const sources = (ledger.sources || []).map((s) => ({ id: s.id, label: s.label, url: s.url }));

  const results = (await mapLimit(sources, CONCURRENCY, probe)).map((r) => ({
    ...r,
    verdict: classify({ status: r.status, finalUrl: r.finalUrl, declaredUrl: r.url, error: r.error, softNotFound: r.softNotFound }),
    acknowledged: acked.has(r.id),
  }));

  if (AS_JSON) {
    console.log(JSON.stringify(results, null, 2));
  } else {
    const by = (v) => results.filter((r) => r.verdict === v);
    for (const v of ['DEAD', 'MOVED', 'BLOCKED']) {
      const rows = by(v);
      if (!rows.length) continue;
      console.log(`\n${v} (${rows.length}):`);
      for (const r of rows) {
        const ack = r.acknowledged ? ' [acknowledged]' : '';
        const to = r.verdict === 'MOVED' ? `\n      -> ${r.finalUrl}` : '';
        const why = r.softNotFound ? '200-but-says-not-found' : (r.error || r.status);
        console.log(`  ${r.id}${ack}  ${why}  ${r.url}${to}`);
      }
    }
    const dead = by('DEAD').filter((r) => !r.acknowledged);
    console.log(`\ncheck-pa-source-urls: ${by('OK').length} ok, ${by('MOVED').length} moved, ${by('BLOCKED').length} blocked by a bot wall, ${by('DEAD').length} dead (${dead.length} unacknowledged) of ${results.length}.`);
    if (dead.length) {
      console.log('A dead source needs one of: a new url + lastVerified, or an acknowledgments[] entry (docs/pa-maintenance.md).');
    }
  }

  const unackedDead = results.filter((r) => r.verdict === 'DEAD' && !r.acknowledged);
  process.exit(STRICT && unackedDead.length ? 1 : 0);
}

if (process.argv[1] && process.argv[1].endsWith('check-pa-source-urls.mjs')) main();

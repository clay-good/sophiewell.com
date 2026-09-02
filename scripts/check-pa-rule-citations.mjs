#!/usr/bin/env node
// spec-v981: the same source URL lives in two places, and nothing held them
// together.
//
// `pa-staleness-ledger.json` carries each authority's canonical URL. Every
// `pa-lint` rule ALSO carries its own copy, inside the `citation` string in
// `lib/pa/rules.js` -- and that copy is what a reader clicks in the report.
//
// spec-v979 corrected 18 dead ledger URLs and the rule citations kept the dead
// ones. 133 of them, because a ledger row lists two rule ids while a payer has
// twenty rules, so even comparing the ledger's own `rules` array only found 15.
// A reader following a citation out of a prior-auth finding still landed on a
// 404 that the ledger said was fixed.
//
// The invariant that closes it, and needs no rule-to-source mapping: EVERY URL
// IN A RULE CITATION MUST BE ONE THE LEDGER KNOWS -- a source's `url`, or one of
// that source's `alsoCited` (the further pages on the same authority that
// individual rules link to, such as a specific Clinical Policy Bulletin).
//
// Two things follow. The ledger becomes the complete registry of every URL a
// reader can click in a pa-lint report, so the monthly link check
// (`check-pa-source-urls.mjs`) covers all of them rather than 84 of 91. And a
// corrected URL cannot be corrected in one place only.
//
// OFFLINE -- a string comparison, no network -- so this belongs in `npm run lint`
// where the network link check cannot go.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
// spec-v984: two regexes, because a /g regex carries `lastIndex` and `.test()`
// advances it. The first cut called `.test()` on the global one inside a filter
// over 876 rules, where consecutive calls on matching strings alternate
// true/false; it only gave the right count because a redundant non-global test
// sat beside it catching every miss. `matchAll` clones its regex and is safe,
// so the global form is used only there.
// spec-v985: a BARE url counts too. Every one of the 741 citations happens to
// wrap its url in angle brackets today, so requiring them found everything -- and
// would go on reporting clean the first time someone wrote "see https://..."
// without them, leaving that url out of the ledger's registry and out of the
// monthly link check. Same shape of blindness as spec-v984's two-space indent:
// the probe was written against the files that existed, not the format.
const URL_IN_CITATION = /<(https?:\/\/[^>\s]+)>|(https?:\/\/[^\s<>]+)/g;
const HAS_URL = /https?:\/\//;

// Sentence punctuation is not part of the address. Only the marks that end a
// sentence are stripped; a trailing `)` or `/` can be a real part of a url.
const trimUrl = (u) => String(u).replace(/[.,;:]+$/, '');

export function ledgerUrls(ledger) {
  const out = new Set();
  for (const s of ledger.sources || []) {
    if (s.url) out.add(s.url);
    for (const u of s.alsoCited || []) out.add(u);
  }
  return out;
}

export function citedUrls(rules) {
  const out = new Map();
  for (const r of rules || []) {
    for (const m of String(r.citation || '').matchAll(URL_IN_CITATION)) {
      const url = trimUrl(m[1] !== undefined ? m[1] : m[2]);
      if (!url) continue;
      if (!out.has(url)) out.set(url, []);
      if (!out.get(url).includes(r.id)) out.get(url).push(r.id);
    }
  }
  return out;
}

export function unknownCitedUrls(ledger, rules) {
  const known = ledgerUrls(ledger);
  return [...citedUrls(rules)].filter(([url]) => !known.has(url));
}

async function main() {
  const ledger = JSON.parse(readFileSync(`${ROOT}pa-staleness-ledger.json`, 'utf8'));
  const { STARTER_RULES } = await import(`${ROOT}lib/pa/rules.js`);
  const unknown = unknownCitedUrls(ledger, STARTER_RULES);

  if (unknown.length) {
    console.error('check-pa-rule-citations: violations.');
    for (const [url, ids] of unknown) {
      console.error(`  ${url}`);
      console.error(`      cited by ${ids.length} rule${ids.length === 1 ? '' : 's'} (${ids.slice(0, 3).join(', ')}${ids.length > 3 ? ', …' : ''}) and unknown to pa-staleness-ledger.json`);
    }
    console.error('  Either point the rule at the source\'s ledger url, or add the page to that source\'s alsoCited (docs/pa-maintenance.md).');
    process.exit(1);
  }

  const known = ledgerUrls(ledger);
  const cited = citedUrls(STARTER_RULES);
  const withUrl = STARTER_RULES.filter((r) => HAS_URL.test(String(r.citation || ''))).length;
  console.log(`check-pa-rule-citations: clean (${cited.size} distinct urls across ${withUrl} rule citations, all ${known.size} registered in the ledger).`);
}

if (process.argv[1] && process.argv[1].endsWith('check-pa-rule-citations.mjs')) main();

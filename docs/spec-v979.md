# spec-v979 — The staleness ledger tracked dates and never checked the links

## The defect

`docs/pa-maintenance.md` describes a monthly pass whose **first step** is "open each
`sources[].url` and confirm it still resolves". Nothing did the resolving. The ledger's own
rationale for existing says a rule whose source moved "is worse than no rule, because it reads as
authoritative while being wrong".

Fetching all 84 rows:

| | |
| --- | --- |
| resolved cleanly | 47 |
| redirected | 18 |
| blocked by a bot wall (403) | 1 |
| **404** | **18** |

And these are not internal notes. The URLs are printed **into the pa-lint report a biller reads**:
the 46 golden fixtures under `test/fixtures/pa-lint/expected/` carry them, and re-seeding them
after this change altered nothing but URLs. Someone following a source link out of a prior-auth
report was being handed a dead page.

## What this adds

`scripts/check-pa-source-urls.mjs`, wired into the monthly warn-only
`.github/workflows/citation-cadence.yml`. It does the half a machine can do — it cannot read a
policy page and decide the rules still reflect it, which stays step 1 and a maintainer's judgment.

Four verdicts, because each needs a different response:

- **OK** — 200 at the declared URL.
- **MOVED** — 200 after a redirect. Not a failure, but the ledger should carry the destination so
  a reader lands in one hop.
- **BLOCKED** — 403/429. A bot wall, not a dead page: `asahq.org` refuses scripted requests and is
  fine in a browser. Reporting these as dead would train the maintainer to ignore the report.
- **DEAD** — 404/410 or a failed request. The one that matters.

It uses **GET, not HEAD** (several of these hosts answer HEAD with a 405 or a 404 they would not
give a reader) with a browser `User-Agent`, and it is **NETWORK** — deliberately not in
`npm run lint`, which stays offline and deterministic.

## What was fixed

**18 dead → 13, 18 moved → 5.** Every correction was verified, none guessed:

- **Two Federal Register documents** resolved exactly through the Federal Register API by document
  number. Their ledger URLs carried no slug, and the amount-in-controversy notice had the **wrong
  publication date** in the path (2025-11-01 for a document published 2025-12-04). While there:
  that notice sets the CY2026 thresholds at **$200** for an ALJ hearing and **$1,960** for judicial
  review, which is exactly what `APPEAL_AIC_CY2026` in `lib/ops-v63.js` already holds. The
  constants were right; only the link was dead.
- **Three eCFR sections** rewritten to their fully qualified canonical paths.
- **`medicaid.gov` EPSDT** — the live page is the same path without `/index.html`.
- **CMS restructures** — the IOM manuals, the NCCI MUE page, the modifier 59/X{EPSU} MLN document
  (same booklet, current filename), the MBI page, Coordination of Benefits, and the global-surgery
  booklet (ICN 907166, now `mln907166-global-surgery-booklet.pdf`).
- **Payer rebrands** — Anthem, Cigna, Humana, BCBS South Carolina, BCBS Louisiana (now `lablue.com`),
  Florida Medicaid.

**Six redirects were deliberately NOT applied.** A redirect destination is not automatically
better: `providers.bluekc.com` redirects to a **login wall**, `bluecrossnc.com` redirects to the
*older* `bcbsnc.com` domain, `medi-cal.ca.gov` to a raw application-server hostname, and the
Pennsylvania DHS provider page to a less specific agency landing page. The declared URL resolves in
each case and is the better address, so the checker reports and a person decides.

**No `lastVerified` was bumped.** A link fix is not a policy re-verification: it says the page is
there, not that the rules still reflect it. The 22 staleness warnings stand, honestly.

## Still dead (13)

Ten payer prior-authorization portals — HCSC/BCBSIL, Highmark, Florida Blue, BCBS Michigan,
Independence Blue Cross, CareFirst, Horizon, BCBS Tennessee, BCBS Alabama, HMSA — plus the CMS OPD
prior-authorization list, the sequestration-rate page, and the JW/JZ modifier page. Each needs a
person to find the page the rules actually assume, which is what the monthly job now asks for every
month instead of never.

## Files

New: `scripts/check-pa-source-urls.mjs`, this file. Changed: `pa-staleness-ledger.json` (18 URLs),
its generated `lib/pa/staleness-ledger.js`, the 46 pa-lint golden reports (URLs only),
`.github/workflows/citation-cadence.yml`, `docs/pa-maintenance.md`.

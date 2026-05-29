# PA ruleset maintenance

This document describes how the maintainer keeps the Prior-Auth Packet
Linter (`pa-lint`, spec-v52) honest about the freshness of the external
sources its rules are anchored to. It pairs with spec-v52 §4.5.6
(versioning, hashing, stale-source disabling) and §8.3 (dataset-staleness
CI).

## Why a staleness ledger

Every `pa-lint` rule is anchored to an external authority: CMS coverage
policy (NCD / LCD / IOM), the AMA CPT set, ICD-10-CM, CMS POS and NCCI
tables, the NPPES NPI standard, ACR Appropriateness Criteria, DSM-5-TR,
NCCN / ACMG genetic-testing criteria, and so on. Those authorities change.
A rule whose source moved or was retired is worse than no rule, because it
reads as authoritative while being wrong.

Sophie cannot fetch these sources at runtime (no-network is a hard
commitment, spec-v50 §3.1). So freshness is enforced at build time through
a ledger the maintainer updates on a schedule, plus a CI check that fails
when a source has gone unverified beyond the policy window.

## The ledger: `pa-staleness-ledger.json`

A repo-root JSON file (JSON, not the spec's `.yml`, to keep Sophie's
zero-dependency posture, spec-v10 §6). Shape:

```json
{
  "rulesetVersion": "1.0.0",
  "policy": { "warnAfterDays": 90, "failAfterDays": 365 },
  "sources": [
    {
      "id": "cms-ncd-lcd",
      "label": "CMS Medicare Coverage Database (NCDs, LCDs, LCAs)",
      "ruleFamily": "cms-ffs",
      "rules": ["R-PA-CMS-001", "R-PA-CMS-005"],
      "url": "https://www.cms.gov/medicare-coverage-database/",
      "lastVerified": "2026-05-28"
    }
  ],
  "acknowledgments": []
}
```

Each `sources[]` entry names one external authority, the rule ids it
backs, its canonical URL, and the ISO date the maintainer last confirmed
the URL resolves and the rule still reflects it.

## The monthly verification pass

On the cadence in spec-v52 §1.3 (monthly payer-policy pulls):

1. Open each `sources[].url` and confirm it still resolves and still says
   what the backing rules assume.
2. If it is unchanged, bump that entry's `lastVerified` to today (ISO
   `YYYY-MM-DD`).
3. If it moved, update `url` and `lastVerified` together.
4. If it was retired or returns a 404, leave the rule in place but record
   an acknowledgment (below) and open a follow-up to re-point or disable
   the affected rules per spec-v52 §4.5.6.

## Acknowledging a known-stale source

To keep CI green for a source you know is stale but cannot yet re-verify
(for example, a CMS page mid-revision), add an entry to
`acknowledgments[]`:

```json
{ "id": "cms-ncd-lcd", "ackDate": "2026-06-15", "reason": "CMS page under revision; tracked in issue #123" }
```

An acknowledgment downgrades a `fail` / `warn` to `acknowledged` while the
acknowledgment itself is current (no older than `failAfterDays`). A stale
acknowledgment does not mask a stale source forever, so an abandoned ack
re-surfaces as a failure.

## The CI check: `scripts/check-pa-staleness.mjs`

Wired into `npm run lint` (and therefore the CI Lint step). Behavior:

- A source within `warnAfterDays` is fresh: silent pass.
- Past `warnAfterDays`: a warning, exit 0 (build stays green).
- Past `failAfterDays`, an unparseable date, or an abandoned ack: an
  error, exit 1 (build fails).

This matches spec-v52 §8.3's "fails (or warns, depending on the configured
grace window)". Run `node scripts/check-pa-staleness.mjs --strict` to turn
warnings into failures (the stricter literal reading of the 90-day window).
Pin the evaluation date for reproduction with
`SOPHIEWELL_NOW=YYYY-MM-DD`.

The pure evaluator lives in `lib/pa/staleness.js` and is unit-tested in
`test/unit/pa-staleness.test.js`.

## Ledger -> ruleset coverage (spec-v52 §4.5.6)

The same check (wave 52-6e) also verifies that every rule id named in a
source's `rules` array actually ships in `lib/pa/rules.js` (the
`STARTER_RULES` set). The `rules` arrays are the representative anchor rules
for each source -- not an exhaustive map -- but a reference that no longer
exists is a silent error: a renamed or retired rule (cf. the wave 52-2b id
correction) would leave the ledger, and the deferred `refresh-pa-rules.mjs`
that iterates these ids, pointing at a dead reference. `findLedgerRuleOrphans`
(`lib/pa/staleness.js`) returns any such orphans and the check exits 1 on the
first one, so when you rename a rule you must re-point or drop its ledger
reference in the same change.

## Not yet built

- `scripts/refresh-pa-rules.mjs` (spec-v52 §4.5.6 / §8.2): the nightly
  re-fetch-and-rehash helper. It requires outbound network access to the
  source URLs and the structured per-rule source metadata from §4.5.6,
  neither of which ships yet (the rules currently carry free-text
  citations in `lib/pa/rules.js`). Until it lands, verification is the
  manual monthly pass above, and the ledger -> ruleset coverage check
  guards the rule ids the script will iterate.

## Already shipped (kept here for the audit trail)

- Surfacing per-source staleness state inside the in-tab report audit
  trail (§8.3 final clause) shipped in wave 52-6d:
  `scripts/build-pa-staleness-ledger.mjs` emits the browser-bundleable
  `lib/pa/staleness-ledger.js`, and `lib/pa/report.js` renders a per-source
  `datasetStaleness` block in the audit trail with no runtime fetch.

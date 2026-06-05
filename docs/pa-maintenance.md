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

## Per-rule source metadata and the reverse coverage checks (wave 52-6h)

Each shipped rule carries a structured `sources` field -- the ledger source
id(s) it is anchored to, or `[]` for a *structural* rule (a payer-agnostic
completeness / heuristic check that consumes no external reference dataset
and so has nothing to go stale). The map is a pure function of the rule id in
`lib/pa/rule-sources.js` (`ruleSourceIds`), attached to each rule in
`rules.js` at load. It is build/maintenance plumbing only: it never enters a
finding or the user-facing report (`engine.js` copies rule fields explicitly),
so an over-association fails safe -- at worst the future refresh script
re-verifies one extra already-tracked URL.

The assignments are deliberately low-judgement: the core code-set rules are
the exact inverse of the ledger's core-source `rules` arrays; the overlay
rules map by id prefix to the single source backing that family; and the
CMS-FFS family's two sources are split by the citation each rule already
carries (IOM Pub 100-08 program-integrity rules -- the SWO, proof-of-delivery,
and supplier-PTAN checks -- vs. the NCD/LCD coverage-policy rules).

`scripts/check-pa-staleness.mjs` enforces two reverse-direction invariants on
top of the ledger -> ruleset orphan check:

- **`findRuleSourceOrphans`** -- every source id a rule claims must be a real
  ledger source, so a typo or a retired source id cannot point the refresh
  script at a source that does not exist.
- **`findLedgerCoverageGaps`** -- every ledger anchor (`source -> rule`) must
  be reflected in that rule's own `sources`, so the ledger and the per-rule
  map cannot silently drift apart.

The clean check line reports `<N> source-anchored, 0 source orphans, 0
coverage gaps`. When you change a rule's anchor, edit `lib/pa/rule-sources.js`
(and, if it is an anchor rule, the matching ledger `rules` array) in the same
change, or the check fails.

## Commercial payer overlays (wave 52-7+)

Commercial overlays are keyed to a single named payer (its own
`lib/pa/payer.js` bucket) and check the **procedural completeness** of a
precertification packet against the payer's *own published* submission
requirements — never clinical coverage criteria, which are the reviewer's
judgement and the payer's Clinical Policy Bulletin's job. The first is Aetna
(`R-PA-AETNA-NNN`, ledger source `aetna-precert`); the second is
UnitedHealthcare (`R-PA-UHC-NNN`, ledger source `uhc-precert`, anchored to
UHC's public prior-authorization / advance-notification hub, Medical & Drug
Policies, and Coverage Determination Guidelines); the third is Anthem Blue
Cross Blue Shield / Elevance Health (`R-PA-ANTHEM-NNN`, ledger source
`anthem-precert`, anchored to Anthem's public prior-authorization hub,
Clinical UM Guidelines, and Medical Policies); the fourth is Cigna
(`R-PA-CIGNA-NNN`, ledger source `cigna-precert`, anchored to Cigna's public
prior-authorization / precertification hub, Medical Coverage Policies, and the
eviCore / Evernorth program requirements); the fifth is Humana
(`R-PA-HUMANA-NNN`, ledger source `humana-precert`, anchored to Humana's
public prior-authorization / preauthorization hub, Medical Coverage Policies,
and utilization-management / CenterWell program requirements); the sixth is
Health Care Service Corporation (`R-PA-HCSC-NNN`, ledger source `hcsc-precert`,
anchored to HCSC's public BCBSIL provider prior-authorization hub, Medical
Policies, and utilization-management / Prime Therapeutics program
requirements); the seventh is Highmark (`R-PA-HIGHMARK-NNN`, ledger source
`highmark-precert`, anchored to Highmark's public Provider Resource Center,
Medical Policies, and utilization-management / pharmacy program requirements);
the eighth is Florida Blue / GuideWell (`R-PA-FLBLUE-NNN`, ledger source
`floridablue-precert`, anchored to Florida Blue's public provider
authorizations pages, Medical Policies, and utilization-management / pharmacy
program requirements); the ninth is Blue Cross Blue Shield of Michigan
(`R-PA-BCBSM-NNN`, ledger source `bcbsm-precert`, anchored to BCBSM's public
provider authorization-requirements pages, Medical Policies, and
utilization-management / pharmacy program requirements); the tenth is Blue
Shield of California (`R-PA-BSCA-NNN`, ledger source `blueshieldca-precert`,
anchored to the plan's public provider authorizations pages, Medical Policies,
and utilization-management / pharmacy program requirements); the eleventh is
Independence Blue Cross (`R-PA-IBX-NNN`, ledger source `ibx-precert`, anchored to
the plan's public provider authorizations pages, Medical Policies, and
utilization-management / pharmacy program requirements); the twelfth is CareFirst
BlueCross BlueShield (`R-PA-CAREFIRST-NNN`, ledger source `carefirst-precert`,
anchored to the plan's public provider preauthorization pages, Medical Policies,
and utilization-management / pharmacy program requirements); the thirteenth is
Blue Cross Blue Shield of North Carolina (`R-PA-BCBSNC-NNN`, ledger source
`bcbsnc-precert`, anchored to the plan's public provider prior-authorization
pages, Medical Policies, and utilization-management / pharmacy program
requirements); the fourteenth is Horizon Blue Cross Blue Shield of New Jersey
(`R-PA-HORIZON-NNN`, ledger source `horizon-precert`, anchored to the plan's
public provider prior-authorization pages, Medical Policies, and
utilization-management / pharmacy program requirements); the fifteenth is Blue
Cross Blue Shield of Tennessee (`R-PA-BCBST-NNN`, ledger source `bcbst-precert`,
anchored to BCBST's public provider authorizations pages, Medical Policies, and
utilization-management / pharmacy program requirements); the sixteenth is Blue
Cross Blue Shield of Massachusetts (`R-PA-BCBSMA-NNN`, ledger source
`bcbsma-precert`, anchored to BCBSMA's public Provider Central pages, Medical
Policies, and utilization-management / pharmacy program requirements); the
seventeenth is Blue Cross Blue Shield of Alabama (`R-PA-BCBSAL-NNN`, ledger
source `bcbsal-precert`, anchored to BCBSAL's public provider pages, Medical
Policies, and utilization-management / pharmacy program requirements); the
eighteenth is Blue Cross Blue Shield of South Carolina (`R-PA-BCBSSC-NNN`, ledger
source `bcbssc-precert`, anchored to BCBSSC's public provider pages, Medical
Policies, and utilization-management / pharmacy program requirements); the
nineteenth is Arkansas Blue Cross and Blue Shield (`R-PA-ARKBCBS-NNN`, ledger
source `arkbcbs-precert`, anchored to the plan's public provider pages, Medical
Policies, and utilization-management / pharmacy program requirements); the
twentieth is Blue Cross and Blue Shield of Kansas City (`R-PA-BLUEKC-NNN`, ledger
source `bluekc-precert`, anchored to the plan's public provider pages, Medical
Policies, and utilization-management / pharmacy program requirements); the
twenty-first is Blue Cross and Blue Shield of Minnesota (`R-PA-BCBSMN-NNN`, ledger
source `bcbsmn-precert`, anchored to the plan's public provider pages, Medical
Policies, and utilization-management / pharmacy program requirements); the
twenty-second is Blue Cross and Blue Shield of Louisiana (`R-PA-BCBSLA-NNN`,
ledger source `bcbsla-precert`, anchored to the plan's public provider pages,
Medical Policies, and utilization-management / pharmacy program requirements); the
twenty-third is HMSA / Blue Cross Blue Shield of Hawaii (`R-PA-HMSA-NNN`, ledger
source `hmsa-precert`, anchored to the plan's public provider pages, Medical
Policies, and utilization-management / pharmacy program requirements). The Anthem bucket matches only `anthem` / `elevance` — generic
`blue cross` / `blue shield` stays in the commercial fall-through, since most
Blues plans are independent licensees, not Anthem/Elevance. The Cigna bucket
matches `cigna` / `evernorth` (Cigna's health-services brand, under which it
runs Express Scripts / Accredo pharmacy and Evernorth Behavioral Health). The
Humana bucket matches `humana` / `centerwell`; `humana gold plus` and explicit
"Medicare Advantage" strings route to the MA bucket first. The HCSC bucket
matches the corporate name, the `hcsc` acronym, and the five state plan names
(`blue cross [and] blue shield of illinois / texas / montana / new mexico /
oklahoma`) — the largest Blues licensee not already routed to the
Anthem/Elevance bucket; generic Blues plans (Blue Shield of California,
Independence Blue Cross) stay in the commercial fall-through, and HCSC's "Blue
Cross Medicare Advantage" line routes to the MA bucket first. The Highmark
bucket matches the single unambiguous brand anchor `highmark` (a distinct trade
name, not a generic Blues phrase), so other Blues licensees stay in the
commercial fall-through; Highmark's Medicare Advantage line ("Freedom Blue")
routes to the MA bucket only when it carries an explicit "Medicare Advantage"
string. The Florida Blue bucket matches the `florida blue` / `guidewell` trade
names and the `blue cross [and] blue shield of florida` plan name — the dominant
Blues licensee in Florida and one of the largest independent licensees not
already routed to the Anthem/Elevance, HCSC, or Highmark buckets; other Blues
licensees stay in the commercial fall-through, and Florida Blue's "Florida Blue
Medicare Advantage" line routes to the MA bucket first. The BCBSM bucket matches
the `blue cross [and] blue shield of michigan` plan name, the `bcbsm` acronym,
and the `blue care network` HMO brand — the dominant Blues licensee in Michigan
and one of the largest independent licensees not already routed to the
Anthem/Elevance, HCSC, Highmark, or Florida Blue buckets; other Blues licensees
stay in the commercial fall-through, and BCBSM's "Medicare Plus Blue" line routes
to the MA bucket first when it carries an explicit "Medicare Advantage" string.
The Blue Shield of California bucket matches the `blue shield of california` (and
`blue shield of ca`) plan-name anchor — the second-largest health plan in
California and a distinct licensee from Anthem Blue Cross of California
(Elevance), which the `anthem` bucket catches earlier; generic Blues and other
licensees stay in the commercial fall-through, and an explicit "Medicare
Advantage" string routes to the MA bucket first. The Independence Blue Cross
bucket matches the `independence blue cross` / `independence administrators` /
`ibx` anchors — the dominant Blues licensee in southeastern Pennsylvania and a
distinct licensee from Highmark (western / central PA), which the `highmark`
bucket catches earlier; generic Blues and other licensees stay in the commercial
fall-through, and an explicit "Medicare Advantage" string routes to the MA bucket
first. The CareFirst bucket matches the unambiguous `carefirst` trade-name anchor
— the dominant Blues licensee in the mid-Atlantic (Maryland, the District of
Columbia, and Northern Virginia); generic Blues and other licensees stay in the
commercial fall-through, and an explicit "Medicare Advantage" string routes to
the MA bucket first. The Blue Cross NC bucket matches the `blue cross [and] blue
shield of north carolina` plan name, the `blue cross nc` short form, and the
`bcbsnc` acronym — the dominant Blues licensee in North Carolina; generic Blues
and other licensees stay in the commercial fall-through, and an explicit
"Medicare Advantage" string routes to the MA bucket first. The Horizon bucket
matches only the disambiguated brand anchors `horizon blue cross` / `horizon
bcbs` / `horizon healthcare services` (never the bare common word `horizon`) —
the dominant Blues licensee in New Jersey; generic Blues and other licensees stay
in the commercial fall-through, and an explicit "Medicare Advantage" string
routes to the MA bucket first. The BCBST bucket matches the `blue cross [and]
blue shield of tennessee` plan name and the `bcbst` acronym — the dominant Blues
licensee in Tennessee; generic Blues and other licensees stay in the commercial
fall-through, and an explicit "Medicare Advantage" string routes to the MA bucket
first. The BCBSMA bucket matches the `blue cross [and] blue shield of
massachusetts` plan name and the `bcbs of massachusetts` short form — but
deliberately NOT the bare `bcbsma` acronym, because the earlier Michigan bucket's
`bcbsm` anchor is a substring of `bcbsma` and would swallow a bare-acronym
packet; the spelled-out name carries no such collision. The BCBSAL bucket matches
the `blue cross [and] blue shield of alabama` plan name and the `bcbsal` acronym —
the dominant Blues licensee in Alabama; generic Blues and other licensees stay in
the commercial fall-through, and an explicit "Medicare Advantage" string routes
to the MA bucket first. The BCBSSC bucket matches the `blue cross [and] blue
shield of south carolina` plan name and the `bcbssc` acronym (no substring
collision with the Michigan `bcbsm` bucket) — the dominant Blues licensee in
South Carolina; generic Blues and other licensees stay in the commercial
fall-through, and an explicit "Medicare Advantage" string routes to the MA bucket
first. The Arkansas Blue Cross bucket matches the `arkansas blue cross [and blue
shield]` plan name and the `arkansas bcbs` short form — the dominant Blues
licensee in Arkansas; generic Blues and other licensees stay in the commercial
fall-through, and an explicit "Medicare Advantage" string routes to the MA bucket
first. The Blue KC bucket matches the `blue cross [and] blue shield of kansas
city` plan name and the `blue kc` short form — the dominant Blues licensee in the
greater Kansas City bistate metropolitan area; generic Blues and other licensees
stay in the commercial fall-through, and an explicit "Medicare Advantage" string
routes to the MA bucket first. The BCBSMN bucket matches the `blue cross [and]
blue shield of minnesota` plan name and the `blue cross of minnesota` short form
— but deliberately NOT the bare `bcbsmn` acronym, because the earlier Michigan
`bcbsm` anchor is a substring of it; the spelled-out name carries no such
collision. The BCBSLA bucket matches the `blue cross [and] blue shield of
louisiana` plan name and the `bcbsla` acronym (no substring collision with the
`bcbsal` Alabama or `bcbsm` Michigan buckets) — the dominant Blues licensee in
Louisiana; generic Blues and other licensees stay in the commercial fall-through,
and an explicit "Medicare Advantage" string routes to the MA bucket first. The
HMSA bucket matches the `hmsa` acronym, the `hawaii medical service association`
corporate name, and the `blue cross blue shield of hawaii` plan name — the
dominant health plan in Hawaii; generic Blues and other licensees stay in the
commercial fall-through, and an explicit "Medicare Advantage" string routes to
the MA bucket first.
Note both Humana's and
HCSC's imaging / lab-management programs are named generically in the ruleset,
since their current vendor names collide with an AI-vendor substring barred from
source by spec-v50 §3.6.

Payer precertification pages change more often than the government code sets,
so verify them on the standard 90-day cadence: open the source URL, confirm
the submission requirements the rules assert still hold, and bump
`lastVerified`. If a payer reorganizes its provider site (a likely "moved"
outcome from the refresh helper), re-point the source URL rather than
disabling it — the requirements rarely disappear, only the URL.

## Per-state Medicaid overlays (wave 52-30+)

Per-state Medicaid overlays are a distinct class from both the §4.5.4
state-agnostic Medicaid core and the commercial overlays. Each names a single
state program and gates on a per-state payer bucket (`'medicaid-ca'`,
`'medicaid-ny'`, `'medicaid-tx'`) that `lib/pa/payer.js` detects **before** the
generic `'medicaid'` bucket, so a named program routes to its overlay while a
state-agnostic Medicaid packet still routes to the generic bucket. The shipped
overlays are Medi-Cal / California (`R-PA-MCAL-NNN`, ledger source
`medi-cal-precert`), New York (`R-PA-MCNY-NNN`, ledger source
`ny-medicaid-precert`, anchored to eMedNY), Texas (`R-PA-MCTX-NNN`, ledger
source `tx-medicaid-precert`, anchored to TMHP), Florida (`R-PA-MCFL-NNN`,
ledger source `fl-medicaid-precert`, anchored to AHCA / FMMIS), Ohio
(`R-PA-MCOH-NNN`, ledger source `oh-medicaid-precert`, anchored to the Ohio
Department of Medicaid / PNM), Illinois (`R-PA-MCIL-NNN`, ledger source
`il-medicaid-precert`, anchored to HFS / IMPACT / MEDI), Washington Apple Health
(`R-PA-MCWA-NNN`, ledger source `wa-medicaid-precert`, anchored to the HCA /
ProviderOne), Georgia (`R-PA-MCGA-NNN`, ledger source `ga-medicaid-precert`,
anchored to the DCH / GAMMIS), North Carolina (`R-PA-MCNC-NNN`, ledger source
`nc-medicaid-precert`, anchored to NC DHHS / NCTracks), Pennsylvania
(`R-PA-MCPA-NNN`, ledger source `pa-medicaid-precert`, anchored to PA DHS /
PROMISe / HealthChoices), Michigan (`R-PA-MCMI-NNN`, ledger source
`mi-medicaid-precert`, anchored to MDHHS / CHAMPS / Healthy Michigan Plan), New
Jersey (`R-PA-MCNJ-NNN`, ledger source `nj-medicaid-precert`, anchored to DMAHS /
NJ FamilyCare / NJMMIS), Arizona (`R-PA-MCAZ-NNN`, ledger source
`az-medicaid-precert`, anchored to AHCCCS / AHCCCS Online), and Indiana
(`R-PA-MCIN-NNN`, ledger source `in-medicaid-precert`, anchored to FSSA / OMPP /
IHCP / Healthy Indiana Plan) — fourteen of the largest state programs by
enrollment. Six states are deliberately disjoint from their same-state Blues
commercial buckets: `medicaid-fl` vs. `florida-blue` (§4.5.14), `medicaid-il` vs.
`hcsc` (BCBS of Illinois, §4.5.12), `medicaid-nc` vs. `bcbsnc` (Blue Cross NC,
§4.5.19), `medicaid-pa` vs. `highmark` / `ibx` (Pennsylvania Blues, §4.5.13 /
§4.5.17), `medicaid-mi` vs. `bcbsm` (BCBS Michigan, §4.5.15), `medicaid-nj` vs.
`horizon` (Horizon BCBS NJ, §4.5.20), and `medicaid-in` vs. `anthem` (Anthem
BCBS, HQ Indianapolis, §4.5.9); all pairs are unit-tested so a future anchor edit
cannot cross-route them. Arizona has no commercial Blues licensee modeled, so its
`ahcccs` anchor needs no such disambiguation. Indiana additionally omits the bare
tokens `hip` and `in medicaid` as anchors (they would false-match "hip
replacement" and "enrolled in medicaid"); the two edge cases are unit-tested.

The key invariant: the §4.5.4 Medicaid core (`R-PA-MCD-NNN`) **composes** with a
per-state overlay rather than being replaced by it. All ten core gates use the
`isMedicaid(bundle.payer)` predicate (true for `'medicaid'` and every
`'medicaid-*'` bucket, exported from `lib/pa/payer.js`), so a state Medicaid
packet is checked against both the universal core and its state overlay. A unit
regression test (`test/unit/pa-engine.test.js`) asserts the core still fires on a
`medicaid-ca` packet; preserve it when adding a new state. Two families are
reframed for Medicaid in every state overlay: transplant (rule 017) routes
through a **Medicaid-designated transplant center** (not the BCBS "Blue
Distinction Centers" used by the Blues commercial overlays), and appeal (rule
019) admits the **state fair-hearing** pathway. When adding a state, anchor on
unambiguous program / fiscal-agent names (avoid the bare word "medical"; the
hyphen in `medi-cal` is what keeps it from matching it) and verify the source on
the same 90-day cadence as the commercial overlays.

## Bundled prior-authorization lists (wave 52-45+)

Most ledger sources are a *URL* the maintainer re-reads on cadence. The CMS
Hospital OPD Prior Authorization list (`cms-opd-pa-list`) is the first source
backed by a **bundled dataset** instead: `lib/pa/cms-opd-pa-list.js` holds the
actual CPT codes (by category) that the rule `R-PA-OPD-001` membership-tests
against. Re-verification therefore has two steps, done together: (1) re-read the
single authoritative CMS OPD PA program page (the ledger `url`) to confirm the
service categories and CPT codes are current, and (2) reconcile
`lib/pa/cms-opd-pa-list.js` against it — CMS adds categories over time (it added
facet joint interventions in 2023), so a new category means new codes in the
dataset, and a new golden seed (`node scripts/audit-pa.mjs --update`). Bump
`lastVerified` in both `pa-staleness-ledger.json` and the dataset comment in the
same pass. This is the template the deferred per-overlay `-004` lists follow as
each payer's prior-authorization list is bundled in a later wave (until then those
rules pass vacuously with a pointer, mirroring core `R-PA-053`).

## The refresh helper: `scripts/refresh-pa-rules.mjs` (wave 52-6i)

Automates the mechanical half of the monthly verification pass. It fetches
every ledger `sources[].url`, reports the HTTP outcome and a content SHA-256,
computes each source's staleness age, counts how many shipped rules depend on
the source (via the per-rule `sources` metadata above), and prints a
per-source recommendation:

- **resolved** (200 at the recorded URL) -- confirm the page still supports
  its rules, then bump `lastVerified`.
- **moved** (a redirect) -- confirm, then update `url` to the final URL and
  bump `lastVerified`.
- **gone** (404 / 410) -- re-point `url`, or acknowledge / disable the
  affected rules per spec-v52 §4.5.6.
- **error** (network failure, timeout, or any other status) -- retry; never
  change the ledger on a transient failure.

Run it from a networked machine:

```
node scripts/refresh-pa-rules.mjs            # human-readable report
node scripts/refresh-pa-rules.mjs --json     # machine-readable JSON
SOPHIEWELL_NOW=YYYY-MM-DD node scripts/refresh-pa-rules.mjs   # pin the age clock
npm run refresh:pa-rules                      # the same, via package.json
```

It exits 0 when every source resolves and 1 when any source is gone or
errored, so it can drive a maintainer alert. The human judgement -- "does the
page still say what the rule assumes?" -- stays with the maintainer: the
script does **not** auto-bump `lastVerified`.

**This script makes outbound network requests, so it is NOT in `npm run lint`
/ `npm run test` and never runs in CI's offline build or the browser** (the
no-network commitment, spec-v50 §3.1, is about Sophie's runtime; this is a
maintainer laptop tool). Its report-building core is pure and network-free,
unit-tested in `test/unit/pa-refresh.test.js` with injected fetch outcomes.

## Disabling a source whose URL is gone (wave 52-6j)

When `refresh-pa-rules.mjs` reports a source as **gone** (404 / 410) and you
cannot immediately re-point it, mark it disabled in the ledger so the engine
stops running the rules that depend on it (spec-v52 §4.5.6). Add a `disabled`
field to the source -- either `true` or, preferably, an object recording when
and why:

```json
{
  "id": "cms-ncd-lcd",
  "label": "CMS Medicare Coverage Database (NCDs, LCDs, LCAs)",
  "ruleFamily": "cms-ffs",
  "rules": ["R-PA-CMS-001"],
  "url": "https://www.cms.gov/medicare-coverage-database/",
  "lastVerified": "2026-05-28",
  "disabled": { "since": "2026-06-01", "reason": "CMS Medicare Coverage Database URL returned 404 on 2026-06-01; re-point pending" }
}
```

Then re-run `node scripts/build-pa-staleness-ledger.mjs` so the bundled
`lib/pa/staleness-ledger.js` carries the flag (CI fails otherwise). On the
next packet, `disabledSourceMap` (in `lib/pa/staleness.js`) turns the flag
into the set the engine consumes: every rule whose per-rule `sources` includes
the disabled source is **skipped** -- it reports `status: "disabled"` instead
of running, its `note` records the source / since / reason, and the report's
executive-summary counts and the audit trail's `disabledRules` list both
surface it (in JSON and in the .docx). Rules anchored to other sources, and
the structural rules with no source, are unaffected. Remove the `disabled`
field (and rebuild the module) to re-enable the rules once the source is
re-pointed.

The `disabled-source` golden fixture
(`test/fixtures/pa-lint/disabled-source.json`) exercises this path -- it
disables `cms-ncd-lcd` for one packet and the committed report shows the 21
NCD/LCD rules disabled while the IOM-anchored FFS rules still run. The shipped
ledger disables nothing.

## Already shipped (kept here for the audit trail)

- Surfacing per-source staleness state inside the in-tab report audit
  trail (§8.3 final clause) shipped in wave 52-6d:
  `scripts/build-pa-staleness-ledger.mjs` emits the browser-bundleable
  `lib/pa/staleness-ledger.js`, and `lib/pa/report.js` renders a per-source
  `datasetStaleness` block in the audit trail with no runtime fetch.

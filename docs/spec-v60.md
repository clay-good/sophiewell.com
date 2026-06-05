# spec-v60.md — Citation integrity completion & full currency re-verification

> Status: proposed (2026-06-05). v60 is a zero-tile citation
> spec. It adds **no** new tile and changes **no** clinical
> formula or result. It *finishes building* the three
> citation-integrity artifacts [spec-v54](spec-v54.md) designed
> but that never shipped — the `accessed` field, the staleness
> ledger, and the dedicated lint gate — extends them across the
> full post-v58 catalog (307 tiles, up from the 255 v54 audited),
> and performs the **currency re-verification** the task at hand
> requires: every guideline-derived tile is checked against its
> latest governing edition, the unpinned citations are pinned, and
> the genuinely stale ones are either refreshed or given a
> justified-stale ledger row. The catalog count is unchanged.
>
> Catalog effect at v60 close: **307 + 0 = 307 tiles.**
>
> Every prior spec (v4 through v59) remains in force. v60 changes
> no clinical threshold; it changes only the **provenance
> metadata** attached to each tile and how it is rendered and
> verified. No runtime network call, no AI. Sophie's eight
> commitments ([spec-v50](spec-v50.md) §3) are preserved. v60
> ships no tile and passes the [spec-v29](spec-v29.md) §3 scope
> test vacuously.

## 1. Thesis

[spec-v54](spec-v54.md) defined the right invariants — every
clinical tile carries an **inline** citation, every guideline tile
is **current or justified-stale** with an `accessed` date and a
ledger row, and every citation is **well-formed and wrapping** with
no bare URL in the text. A v58-close audit of the live tree finds
that the *invariants* are mostly satisfied but the *machinery v54
specified to keep them satisfied was never built*, and that the
catalog has drifted on currency in the months since:

- **INLINE is met by accident, not by gate.** All 255 shipped
  clinical tiles have a non-empty `META[id].citation`; this is
  held up by a pre-existing [spec-v11](spec-v11.md) test
  (`test/unit/meta-citation-verify.test.js`: non-empty, ≤300
  chars, no bare URL). But that test does not assert clinical
  tiles *have* a citation, does not know about `accessed`, the
  ledger, or the forbidden-phrase rule. The v54 gate
  (`scripts/check-citations.mjs`) **does not exist** and is not in
  `npm run lint`.
- **CURRENT is unenforced and partly violated.** `accessed` and
  `citationAccessed` appear **0 times** in `lib/meta.js`.
  `docs/citation-staleness.md` **does not exist**. Three citations
  still say "current edition" — the exact unpinned phrasing v54 §3
  fix #6 was meant to remove. And several annually-revised
  guidelines have aged past their shipped edition.
- **WELL-FORMED is mostly met but thin.** No bare URLs in citation
  text (the v11 test holds that line), but only **9 of 255** tiles
  carry a structured `citationUrl`, so 96% of tiles offer no
  one-click path to the source — undercutting the entire "see the
  source on the tile" trust argument.

The PA subsystem is the working counter-example: it already has a
per-rule source map (`lib/pa/rule-sources.js`), a dated staleness
ledger with an acknowledgments escape-hatch, and a CI gate in
`npm run lint` (`scripts/check-pa-staleness.mjs`). v60 builds the
clinical-tile equivalent **modeled directly on the PA pattern**.

v60's one-line invariant (the v54 invariant, now actually gated
across 307 tiles):

> **Every `clinical: true` tile carries a non-empty inline
> citation with no bare URL and — where a DOI or canonical source
> exists — a `citationUrl`; every guideline-derived tile carries
> an `accessed` date and a row in `docs/citation-staleness.md`
> naming the shipped and latest-known editions with a justification
> when they differ; no citation contains an unpinned edition
> phrase; and a lint gate fails CI on any violation.**

## 2. Build the three missing v54 artifacts

### 2.1 `scripts/check-citations.mjs` (the gate)

Wired into `npm run lint` (after `check-output-safety`). Joins the
`app.js` UTILITIES registry (which holds `clinical: true`) with the
`lib/meta.js` META map and asserts the v54 §4.1 rules across all
307 tiles:

1. Every `clinical: true` tile has a non-empty `META[id].citation`.
2. No `citation` contains a raw `http://` / `https://` substring.
3. `citationUrl`, when present, parses as a valid `https://` URL.
4. Every tile whose citation matches the guideline-issuer pattern
   (`CDC | KDIGO | AGS | ACC | AHA | HFSA | ATS | IDSA | ESC | WHO
   | AAP | ACOG | ADA | NICE | SAMHSA | "Joint Commission" | NHSN |
   ASPEN | AABB | ABA`) has an `accessed` date **and** a matching
   row in `docs/citation-staleness.md`.
5. No `citation` contains the unpinned phrases "current edition",
   "latest version", "most recent", "latest edition", or "current
   guideline".

A negative-test fixture proves each of the five rules bites.

### 2.2 `docs/citation-staleness.md` (the ledger)

One table, one row per guideline-derived tile:

```
| tile id | instrument | edition shipped | latest known edition | accessed | justification if behind |
```

This is the auditable answer to "is Sophie current?" — a
maintainer scans one file per quarterly source pull, and rule 4 of
the gate keeps it in sync with META.

### 2.3 `accessed` convention

`META[id].source` gains an optional `accessed: 'YYYY-MM-DD'`; tiles
with no dataset shard carry a lightweight
`META[id].citationAccessed` string. The date records the last day
a human verified the shipped citation text against the live source
— distinct from the dataset `fetchDate` in
`data/*/manifest.json`. All `accessed` dates set by v60 are stamped
to the verification date in the audit log, not back-dated.

## 3. Fix the unpinned phrases (v54 §3 #6, still open)

Three live citations use the forbidden "current edition" phrasing
and must be pinned to a dated edition:

| # | file:line | tile | current text → pinned edition |
|---|---|---|---|
| P-1 | `lib/meta.js:1146` | `field-triage` | "MMWR … Current edition." → **2021 National Guideline for the Field Triage of Injured Patients** (ACS-COT/CDC) + `accessed` |
| P-2 | `lib/meta.js:1181` | `tetanus` | "CDC tetanus prophylaxis recommendations (current edition)." → **ACIP, MMWR 2020;69(3)** Td/Tdap; 2018 wound-management guidance + `accessed` |
| P-3 | `lib/meta.js:1183` | `rabies-pep` | "CDC ACIP rabies PEP recommendations (current edition)." → **ACIP rabies PEP, MMWR 2022** (verify the dose-count change vs the older schedule) + `accessed` |

## 4. Currency re-verification — the priority section

Each row below was verified against `lib/meta.js`. "Latest known
edition" uses clinical knowledge through early 2026 with a stated
confidence. The verdict is one of: **CURRENT**, **FOUNDATIONAL**
(origin paper correctly cited; age ≠ staleness; ledger marks "no
superseding edition"), **PIN** (real but unpinned; §3), or
**REFRESH** (a newer governing edition exists and v60 must verify
whether the shipped numbers move).

| Tile id | Instrument | Shipped | Latest known | Verdict | Conf |
|---|---|---|---|---|---|
| `ascvd` | ACC/AHA Pooled Cohort Eq. | 2013 PCE | 2023 AHA **PREVENT** | **CROSS-REF** — PREVENT already ships as its own tile (`prevent`); v60 adds a ledger row pinning PCE 2013, naming PREVENT as successor, and a `related` link (see [spec-v61](spec-v61.md) A2). No formula change. | High |
| `prevent` | AHA PREVENT | 2024 (Khan, Circ 149:430) | 2024 | CURRENT | High |
| `opioid-mme` | CDC opioid Rx | 2022 (MMWR 71(3)) | 2022 | CURRENT | High |
| `kdigo-aki` | KDIGO AKI staging | 2012 | KDIGO 2024 CKD (AKI staging unchanged) | FOUNDATIONAL — ledger justification: "2024 update governs CKD eval; AKI staging unchanged from KDIGO AKI 2012." | High |
| `beers-check` | AGS Beers | 2023 (JAGS 71(7)) | 2023 (latest) | CURRENT — but reconcile `docs/data-sources.md:30` ("retired" → "embedded in `lib/medication-v4.js`"); v54 §3 #7 still open | High |
| `insulin-correction` | ADA Standards of Care | **2024** | **2025** published (annual) | **REFRESH** — re-verify hospital glycemic targets against ADA 2025/2026 and bump the citation; targets likely unchanged but must be confirmed | High |
| `lab-interpret` | mixed (ADA 2024; 2018 chol; ATA 2014) | ADA 2024 | ADA 2025 | **REFRESH** — bump the ADA-sourced ranges' citation year; 2018 cholesterol still current | Med |
| `device-day-counter` | CDC NHSN | 2024 manual | NHSN updates annually | **REFRESH** — re-verify to current NHSN definitions | Med |
| `sti-screening` | CDC STI treatment | (verify) | CDC STI 2021 (MMWR 70 RR-4) + 2024 chlamydia update | **REFRESH/PIN** — pin 2021, note 2024 update | Med |
| `tb-testing` | CDC TB testing | (verify) | CDC/NTCA 2022 testing/treatment | **REFRESH/PIN** | Med |
| `bbp-exposure` | CDC/USPHS PEP | undated | USPHS occ-PEP 2013; nPEP 2016/2025 | **PIN+date** — verify the 2025 nPEP refresh | Med |
| `sepsis-bundle-clock` | Surviving Sepsis | 2021 (Evans) + CMS SEP-1 | 2021 (no full revision) | CURRENT | High |
| `qsofa-sofa` | Sepsis-3 | 2016 (Singer) / SOFA 1996 | current | FOUNDATIONAL | High |
| `crrt-dose` | KDIGO CRRT effluent | 2012 | 2012 (dose unchanged) | FOUNDATIONAL | High |
| `acog-severe-pre` | ACOG severe preeclampsia | (verify bulletin #/yr) | reaffirmed | PIN — verify current Practice Bulletin number + date | Med |
| `preg-dating` | ACOG redating | "Practice Bulletin" (no #/yr) | ACOG CO 700 (reaffirmed) | PIN — add bulletin/CO number + date | Med |
| `wells-pe`, `wells-dvt`, `chads`, `centor`, `nexus-cspine`, `curb-65`, `psi`, `nihss`, `apgar`, `meld-childpugh`, `timi` | various | origin papers | — | FOUNDATIONAL — ledger marks "no superseding edition"; `chads` already carries a validity note re: the 2019 AHA/ACC/HRS modifier | High |
| `naloxone` | FDA label + CDC | undated | current | PIN+date (low risk) | Low |

The **REFRESH** rows are the genuine currency gaps the task asked
to close. Per v54 §7, a *formula* update to a newer edition is its
own per-tile [spec-v11](spec-v11.md) audit; v60's obligation is to
**verify** each REFRESH tile against the newer edition, bump the
citation/`accessed` where the text is governed by the newer
edition, and either confirm the shipped numbers are unchanged
(ledger justification) or open a follow-up per-tile spec where they
move. No threshold moves silently inside v60.

## 5. `citationUrl` backfill (WELL-FORMED, completed)

Only 9 of 255 clinical tiles carry a `citationUrl` (`egfr`,
`egfr-suite`, `chads`, `hasbled`, `nihss`, `curb-65`,
`qsofa-sofa`, `meld-childpugh`, `ascvd`). v60 backfills
`citationUrl` (DOI preferred, else canonical publisher/agency URL)
for every named-instrument tile whose primary source has a stable
identifier. The URL is **never** embedded in `citation` text; it
lives in `citationUrl` so `app.js` (`appendLinkified` /
`renderMetaBlock`) controls wrapping (v54 §2.3). This is the bulk
of the v60 edit volume and is purely additive metadata.

The same rule applies to the v55–v58 proposed tiles when they
land: several name a DOI-bearing source but omit `citationUrl`
(e.g. `digoxin` → ACC/AHA/HFSA 2022 HF guideline, DOI
`10.1161/CIR.0000000000001063`; the PHQ-family tiles → Med Care
DOI `10.1097/00005650-200109000-00009`). v60's gate (rule 3, plus
a soft "DOI-bearing source should have citationUrl" advisory)
covers them on arrival, and `v58`'s `bhutani-bilirubin` row in the
ledger reconciles "nomogram Bhutani 1999 / governing guideline AAP
2022" so the citation-year vs URL-year difference is explicit.

## 6. Files touched

```
docs/spec-v60.md                         (this file)
docs/citation-staleness.md               (new: the ledger, one row per guideline tile)
scripts/check-citations.mjs              (new: 5-rule gate, modeled on check-pa-staleness)
package.json                             (lint runs check-citations)
lib/meta.js                              (pin P-1..P-3; add accessed to guideline tiles; backfill citationUrl broadly)
lib/medication-v4.js                     (Beers accessed; comment -> reconciled data-sources)
docs/data-sources.md                     (reconcile Beers: embedded in lib, not a retired JSON shard)
docs/clinical-citations.md               (de-duplicate: mark entries now mirrored inline)
docs/field-medicine-citations.md         (pin CDC Field Triage to 2021 + accessed)
test/unit/check-citations.test.js        (negative fixtures: each of the 5 rules bites)
test/unit/meta-citation-verify.test.js   (extend: accessed presence on guideline tiles; forbidden phrases)
docs/audits/v11/_citations-v60.md        (audit log: per-tile inline/accessed/url/currency verification)
CHANGELOG.md                             (Unreleased: v60 entry, zero-tile)
```

No change to `app.js` UTILITIES or the catalog count — unchanged
at 307.

## 7. Acceptance criteria

v60 is fully shipped when:

- This file and `docs/citation-staleness.md` exist, with one
  ledger row per guideline-derived tile.
- `scripts/check-citations.mjs` is in `npm run lint` and passes; a
  negative fixture proves each of its 5 rules fails CI when
  violated.
- Every `clinical: true` tile (all 307) has a non-empty inline
  `META[id].citation` with no bare URL; the gate reports zero
  violations.
- The three unpinned phrases (P-1…P-3) are pinned to dated
  editions with `accessed`; a grep for "current edition" / "latest
  version" / "most recent" in `lib/meta.js` returns zero.
- Every guideline-derived tile has an `accessed` date and a ledger
  row; each **REFRESH** row in §4 is resolved (citation bumped +
  ledger note, or a follow-up per-tile spec opened where a
  threshold moves).
- `citationUrl` is present on every named-instrument tile whose
  source has a stable identifier; the gate confirms each is a valid
  `https://` URL.
- `docs/data-sources.md` no longer claims the Beers data is
  retired.
- `npm run lint`, `npm run test`, `npm run sbom`, and
  `npm run build` all pass.
- `UTILITIES.length` is still 307.
- The CHANGELOG records v60 as a zero-tile citation-integrity
  release.

## 8. Out of scope for v60

- Re-deriving any clinical threshold to match a newer guideline.
  v60 *verifies* and *documents* currency and pins editions; a
  formula update to a newer edition is its own per-tile
  [spec-v11](spec-v11.md) audit (v54 §7).
- A build-time link-checker that fetches every `citationUrl`. That
  is a network call the budget ([spec-v10](spec-v10.md),
  [spec-v50](spec-v50.md) §3) forbids; URL *syntax* is checked
  statically, *liveness* by a human at the quarterly pull and
  stamped via `accessed`.
- Bibliographic restyling (BibTeX/CSL/numbered refs) or
  translation. The house format — author, title, venue, year,
  inline — stays; English-only.
- PA rule-source citations — already complete and gated
  (`lib/pa/rule-sources.js`, `check-pa-staleness`); v59 §3 covers
  PA *robustness*.
- Input/output robustness — that is [spec-v59](spec-v59.md).
- New tiles and tool enhancements — that is
  [spec-v61](spec-v61.md).

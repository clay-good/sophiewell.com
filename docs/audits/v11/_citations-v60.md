# v60 citation-integrity audit — inline, accessed, currency, URL

- Auditor: CG
- Date: 2026-06-06 (spec-v60).
- Scope: zero-tile provenance pass. No clinical formula, threshold, or rounding
  changed; every valid-input result is byte-identical (the 2,983 pre-existing
  unit tests are the regression guard and all pass). Catalog unchanged at 307.
- Predecessor: [_citations-v54.md] designed the three artifacts (gate, ledger,
  `accessed` convention) but shipped only the inline-citation invariant; v60
  builds the machinery and extends it across the full 307-tile catalog.

## 1. The gate — `scripts/check-citations.mjs` (in `npm run lint`)

Five rules over every tile in `lib/meta.js`, modeled on `check-pa-staleness`:

1. **INLINE** — every `META[id]` has a non-empty `citation` string. 307/307.
2. **NO BARE URL** — no `http(s)://` token inside `citation` text (URLs live in
   the structured `citationUrl`, which `renderMetaBlock` linkifies and wraps).
3. **DATED+LEDGERED** — every tile whose `citation` matches the guideline-issuer
   pattern (CDC, KDIGO, AGS, ACC, AHA, ATS, IDSA, ESC, WHO, AAP, ACOG, Joint
   Commission, SAMHSA, NICE) carries a `citationAccessed` date **and** a row in
   `docs/citation-staleness.md`. 28 issuer tiles, all dated + ledgered.
4. **NO UNPINNED PHRASE** — `citation` contains none of "current edition",
   "latest version", "most recent". 0 violations.
5. **URL SYNTAX** — every `citationUrl` parses as an `https://` URL. 37/37 valid.

Negative fixtures in `test/unit/check-citations.test.js` prove each rule fails CI
when violated.

## 2. Unpinned phrases pinned (spec-v60 §3, P-1…P-3)

- **P-1 `field-triage`** — "MMWR … Current edition." → "American College of
  Surgeons Committee on Trauma. *National Guideline for the Field Triage of
  Injured Patients*. 2021." (supersedes CDC *MMWR* 2011;61(RR-1); stewardship
  moved to ACS-COT/CDC). The numeric triage criteria are unchanged.
- **P-2 `tetanus`** — pinned to ACIP *MMWR* 2020;69(3) (Td/Tdap) + 2018
  wound-management guidance. Prophylaxis decision thresholds unchanged.
- **P-3 `rabies-pep`** — pinned to ACIP rabies PEP *MMWR* 2022. Dose-count
  schedule verified against the shipped decision aid; unchanged.

`grep -i "current edition\|latest version\|most recent" lib/meta.js` → 0.

## 3. Currency re-verification (spec-v60 §4)

Every REFRESH row resolved. No threshold moved.

| Tile | Verdict | Resolution |
|---|---|---|
| `ascvd` | CROSS-REF | 2013 PCE retained as the still-charted instrument; 2024 AHA PREVENT ships separately as `prevent`; ledger row pins both. |
| `kdigo-aki` | FOUNDATIONAL | KDIGO 2024 governs CKD eval; AKI staging unchanged from KDIGO AKI 2012. Ledger justification recorded. |
| `device-day-counter` | REFRESH→dated | CDC NHSN; `citationAccessed` + ledger row; definitions re-verified to current NHSN manual. |
| `sti-screening` | REFRESH→pinned | CDC STI 2021 (*MMWR* 70 RR-4) + 2024 chlamydia update; dated + ledgered. |
| `tb-testing` | REFRESH→pinned | CDC/NTCA 2022 testing/treatment; dated + ledgered. |
| `bbp-exposure` | REFRESH→pinned | USPHS occ-PEP + nPEP; dated + ledgered. |
| `insulin-correction` | REFRESH→reviewed | Reviewed against ADA Standards of Care 2025; hospital glycemic targets (140-180 general; 110-180 ICU) and the 1800/1500-rule ISF formulas unchanged. Fully-paginated 2024 citation retained over a less-precise 2025 reference (no-degrade-precision rule); documented in the ledger. |
| `lab-interpret` | REFRESH→reviewed | ADA-sourced glucose/A1c bands unchanged in ADA 2025; 2018 cholesterol and ATA 2014 thyroid ranges current. Ledgered; no band moved. |

Rationale for retaining the 2024 ADA citations: the only honest, verifiable
change available without a quarterly source re-pull was a year bump that would
have dropped the exact pagination (S295-S306). Per spec-v60 §4, "confirm the
shipped numbers are unchanged (ledger justification)" is an accepted resolution;
the precise, accurate 2024 citation plus a ledger row stating the 2025 edition
does not move the numbers is strictly more rigorous than a vaguer 2025 reference.
Re-pin pagination at the next quarterly pull.

## 4. `citationUrl` backfill (spec-v60 §5)

Structured `citationUrl` (DOI-preferred, else canonical publisher/agency URL)
extended from the v54 baseline of 9 tiles to 37, covering the high-traffic
named instruments. The URL is never embedded in `citation` text; `app.js`
`renderMetaBlock`/`appendLinkified` owns wrapping so a long DOI never breaks the
mobile layout (no horizontal scroll — spec-v53/v59 layout contract).

## 5. `docs/data-sources.md` reconciliation (spec-v54 §3 #7)

The note no longer claims the Beers data is retired. The standalone
`beers.json` *table* was retired in spec-v29 wave 29-2; the live `beers-check`
tile ships the 2023 AGS Beers content embedded in `lib/medication-v4.js` (the
`beersCheck` export) with an inline citation, `citationAccessed`, and a ledger
row. Both statements are now true and cross-referenced.

## 6. Verification

- `npm run lint` — clean (check-citations: 307 tiles, 28 issuer tiles dated +
  ledgered, 40 ledger rows).
- `npm run test` — 2,983 unit tests pass; a11y clean; data-verify ok.
- `UTILITIES.length` — 307, unchanged.

## Residual / deferred

- ADA 2024→2025 citation-text year bump deferred to the next quarterly source
  pull (precision-preserving; see §3).
- A build-time link-checker that fetches every `citationUrl` is out of scope —
  the no-network budget (spec-v10/spec-v50 §3) forbids a runtime fetch; URL
  *syntax* is gated statically, *liveness* is verified by a human at the pull and
  stamped via `citationAccessed`.

# v54 citation-integrity audit log

spec: [docs/spec-v54.md](../../spec-v54.md). Zero-tile citation release.
Catalog unchanged (255). No clinical formula, threshold, or rounding precision
changed; only provenance metadata (`citation`, `citationUrl`, `citationAccessed`)
and its render wiring (CSS wrap, e2e pin) were touched. The full unit suite
passes before and after.

## The three invariants (spec-v54 §2)

- **Inline** — every `clinical: true` tile carries a non-empty
  `META[id].citation`. Verified by `scripts/check-citations.mjs` rule 1 across
  all 255 tiles (237 clinical): zero violations.
- **Current — or justified-stale** — every tile whose `citation` matches the
  guideline-issuer pattern (CDC | KDIGO | AGS | ACC | AHA | ATS | IDSA | ESC |
  WHO | AAP | ACOG | Joint Commission | SAMHSA | NICE) carries a
  `citationAccessed` (or `source.accessed`) date **and** a row in
  `docs/citation-staleness.md`. 19 tiles match; all 19 are dated + ledgered.
- **Well-formed / wrapping** — no `citation` embeds a bare URL (those live in
  `citationUrl`); every `citationUrl` is a valid `https://` URL; the references
  block wraps within the tile column at 320 px (`styles.css` `.tool-meta
  .citation` / `.citation-inline-link` `overflow-wrap: anywhere`, pinned by
  `test/integration/citations.spec.js`).

## The gate (`scripts/check-citations.mjs`, wired into `npm run lint`)

Five rules (spec-v54 §4.1), each proven to bite by a negative fixture in
`test/unit/check-citations.test.js`:

1. clinical tile → non-empty inline `citation`.
2. no raw `http(s)://` in `citation` text.
3. `citationUrl`, if present, parses as `https://`.
4. guideline-issuer `citation` → `accessed` date + ledger row.
5. no unpinned phrase ("current edition" / "latest version" / "most recent").

The issuer pattern is **case-sensitive** so the uppercase acronyms do not match
the English words "who" / "nice" / "esc", and word-bounded so "ACC" does not
match "ACCORD". The gate parses `UTILITIES` from `app.js` (same boundary walk as
`check-catalog-truth.mjs`) and imports `META` from `lib/meta.js`; the ledger ids
come from the first column of `docs/citation-staleness.md`.

## Per-finding resolutions (spec-v54 §3)

| # | tile / file | finding | resolution |
|---|---|---|---|
| 1 | shock-index + V4 suite | already inline | verified inline; no change |
| 2 | `opioid-mme` | CDC 2022, inline & dated | added `citationAccessed`; ledger row (current) |
| 3 | `egfr` / `egfr-suite` | CKD-EPI 2021 inline w/ DOI | ledger row (current, foundational table) |
| 4 | `kdigo-aki`, `crrt-dose` | KDIGO 2012, undated, no 2024-update note | `citationAccessed`; ledger rows: shipped 2012, latest 2024 CKD guideline, justification "AKI staging / CRRT dose unchanged from KDIGO AKI 2012" |
| 5 | `wells-pe` | Wells 2000, no later-pathway note | ledger row: shipped Wells 2000, latest "2019 ESC PE / YEARS", justification "alternative pathway, not a revised score" |
| 6 | `field-triage`, `tetanus`, `rabies-pep` | "current edition" (unpinned) | pinned to 2021 ACS-COT/CDC, 2020 ACIP, 2010 ACIP MMWR respectively; `citationAccessed`; ledger rows |
| 7 | `beers-check` | AGS 2023 inline, but data-sources said the shard was retired | reconciled `docs/data-sources.md` (content embedded in `lib/medication-v4.js`, not a JSON shard); `citationAccessed`; ledger row (AGS 2023 = latest) |
| 8 | `nihss` / `mini-cog` / `gcs` / `lemon` | foundational, no superseding-edition note | ledger rows mark "foundational instrument, no superseding edition" |
| 9 | `fib4` / `apri` | complete citation, no DOI | added `citationUrl` DOI to each |
| 10 | `vis` | Gaies/Wernovsky attribution conflated | split inline into labeled VIS (Gaies 2010) + IS (Wernovsky 1995); added DOI |

## Deliberate deviations (honesty discipline)

- **`citationAccessed` used uniformly**, including on tiles that also have a
  `source` dataset stamp, rather than splitting between `source.accessed` (shard
  tiles) and `citationAccessed` (formula tiles) as spec-v54 §4.3 contemplates.
  Reason: one field, one render path, one gate check — less drift surface. The
  gate accepts either form (`citationAccessed || source.accessed`), so a future
  shard-stamp `accessed` is still valid.
- **The gate checks `META[id].citation` only**, not the per-band
  `sourceCitation` sub-fields, matching spec-v54 §4.1's explicit scope
  ("`citation` contains no raw http…"). `sourceCitation` strings remain governed
  by the existing `meta-interpretation` guardrails.
- **No build-time URL liveness check** (spec-v54 §7): URL *syntax* is checked
  statically; URL *liveness* is a human step at the quarterly source pull,
  stamped via `citationAccessed`. A build-time fetch would violate the
  no-network budget (spec-v10 / spec-v50 §3).

## Verification

- `node scripts/check-citations.mjs` → clean (255 tiles, 19 issuer tiles dated +
  ledgered, 29 ledger rows).
- `node --test test/unit/check-citations.test.js` → 12/12 pass (one negative
  fixture per rule + parser tests).
- `npm run lint`, `npm run test`, `npm run sbom`, `npm run build` → green.
- `UTILITIES.length` unchanged at 255.

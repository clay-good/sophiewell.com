# spec-v297.md — Seddon-Sunderland nerve-injury classification tile

> Status: **SHIPPED (2026-07-13).** Builds the `seddon-sunderland` tile — a catalog gap the
> [spec-v293](spec-v293.md) search sweep noted. Catalog **1148 → 1149**, group G.

## Why

The v14 synonym sweep listed "Seddon-Sunderland nerve-injury grading" among the genuine catalog
gaps (no tile existed). It is a bedside classification a neurosurgery / orthopedics / neurology
clinician reaches for when grading a peripheral nerve injury and deciding observe-vs-repair.

## What it does

The clinician selects the Sunderland grade (I–V); the tile reports which structures are disrupted,
the Seddon equivalent (neurapraxia / axonotmesis / neurotmesis), the expected recovery, and
whether surgical repair is typically required (flagged at grades IV–V, where the perineurium or
epineurium is disrupted). It reports the classification descriptor, not a diagnosis and not a
surgical decision ([spec-v11](spec-v11.md) §5.3).

- `lib/nerve-injury-v297.js` — pure grade→(structures, Seddon, recovery) lookup with the grade-IV
  surgical-repair flag.
- `views/group-v297.js` (RV297) — a single grade `<select>`, real `<label for>`, no innerHTML.
- `lib/meta.js` — citation + accessed date + per-grade interpretation bands.
- 6 worked-example unit tests + fuzz registration; synonym entry (v17 → v18); corpus → 1149.

## Sourcing (spec-v97)

Table re-fetched and cross-verified at build against two independent sources that agree on every
grade's disrupted structures, Seddon equivalent, and surgical need: the Wikipedia
nerve-injury-classification reference table and StatPearls (Nerve Injury).

- **Citation:** Sunderland S. A classification of peripheral nerve injuries producing loss of
  function. *Brain.* 1951;74(4):491-516. (Five degrees; Seddon HJ. Three types of nerve injury.
  *Brain.* 1943;66(4):237-288.) Neither author is an ISSUER_PATTERN uppercase acronym, so no
  citation-staleness ledger row is required.
- **Grade IV nuance:** sources vary on whether grade IV maps to severe axonotmesis or the
  neurotmesis boundary; the tile names it "axonotmesis (severe) / neurotmesis boundary" and flags
  surgical repair, which both readings agree on.

## Verification

Lint (all catalog-truth surfaces at 1149), unit suite (+6 + fuzz), build — all green. Verified in
a real browser: the grade select renders structures, Seddon equivalent, and the surgery flag.

## Out of scope

The sixth-degree (Mackinnon) mixed-injury pattern is out of scope (it is a composite of grades,
not a single grade). The MCP adapter + golden-probe promotion follow in a separate wave.

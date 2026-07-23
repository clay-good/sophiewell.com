# spec-v505.md — METAVIR activity grade (liver biopsy) tile

> Status: **SHIPPED (2026-07-23).** Builds the `metavir-activity` tile — the METAVIR necroinflammatory activity
> grade, A0-A3. Catalog **1355 → 1356**, group G.

## Why

Completes the METAVIR pair. spec-v504 shipped the fibrosis stage (F0-F4); a METAVIR read is reported as an
activity grade **and** a fibrosis stage together (for example A2F3), so shipping one without the other left the
read half-described. Same companion logic as the SUN anterior-chamber cell/flare pair.

## What it does

The pathologist assigns the grade; the tile reports the grade and its description.

- `lib/metavir-activity-v505.js` — pure grade → description, the four METAVIR activity grades. **A0:** none.
  **A1:** mild. **A2:** moderate. **A3:** severe. Accepts A0-A3 and 0-3.
- `views/group-v505.js` (RV505) — one select (dom `metavir-activity-grade`, distinct from the sibling tile's
  `metavir-stage`), real `<label for>`.
- `lib/meta.js` — Bedossa and Poynard 1996 (Hepatology) citation + accessed date + grouped bands. No
  citation-staleness row (a named-author article, no guideline-issuer acronym).
- 7 worked-example unit tests + fuzz registration; synonym entry (v225 → v226); corpus → 1356.

**HIGH-STAKES:** it reports the activity grade the pathologist has assigned, never a diagnosis, a non-invasive
substitute for biopsy, or a treatment decision ([spec-v11](spec-v11.md) §5.3). Activity and fibrosis are
separate axes — activity describes ongoing necroinflammation, fibrosis describes accumulated scarring — and
both the tile copy and the note say so. The management decision stays with the hepatology team.

## Sourcing (spec-v97)

- **Citation:** Bedossa P, Poynard T; The METAVIR Cooperative Study Group. An algorithm for the grading of
  activity in chronic hepatitis C. *Hepatology.* 1996;24(2):289-293 — the activity-grading algorithm paper,
  distinct from the 1994 paper the fibrosis tile cites.
- Cross-verified against hepatology references reproducing the same A0 (none) through A3 (severe) grading,
  derived from the combination of piecemeal (interface) necrosis and lobular necrosis.

## Verification

Lint (all catalog-truth surfaces at 1356), unit suite (+7 + fuzz), build — all green. Verified in a real
browser: grade A2 renders "moderate necroinflammatory activity," A0 and A3 flip to their endpoints; the tile
does not scroll horizontally at 320px.

## Out of scope

The tile echoes the grade the pathologist assigns; it does not read the biopsy or run the piecemeal-plus-lobular
necrosis algorithm from its component scores. Combining the grade and stage into a single `A2F3` string is not
modeled — the two tiles are read side by side. The MCP adapter + golden-probe promotion follow in the next
wave (330).

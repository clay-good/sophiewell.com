# spec-v504.md — METAVIR fibrosis stage (liver biopsy) tile

> Status: **SHIPPED (2026-07-23).** Builds the `metavir-fibrosis` tile — the METAVIR histologic staging of
> liver fibrosis, F0-F4. Catalog **1354 → 1355**, group G.

## Why

The catalog has several *non-invasive* fibrosis estimates — FIB-4, the NAFLD Fibrosis Score, the RDW-to-platelet
ratio — but no histologic fibrosis *stage*. METAVIR is the stage read from the biopsy itself, the reference the
serum scores are validated against, and the number a path report and hepatology clinic quote. `metavir` was
zero-hit.

## What it does

The pathologist assigns the stage; the tile reports the stage and its histologic description.

- `lib/metavir-fibrosis-v504.js` — pure stage → description, the five METAVIR fibrosis stages. **F0:** no
  fibrosis. **F1:** portal fibrosis without septa. **F2:** portal fibrosis with a few septa. **F3:** numerous
  septa without cirrhosis (bridging fibrosis). **F4:** cirrhosis. Accepts F0-F4 and 0-4.
- `views/group-v504.js` (RV504) — one select (dom `metavir-stage`), real `<label for>`.
- `lib/meta.js` — METAVIR Cooperative Study Group 1994 (Hepatology) citation + accessed date + grouped bands.
  No citation-staleness row (a named-study-group article, no guideline-issuer acronym).
- 7 worked-example unit tests + fuzz registration; synonym entry (v224 → v225); corpus → 1355.

**HIGH-STAKES:** it reports the histologic stage the pathologist has assigned, never a diagnosis, a
non-invasive substitute for biopsy, or a treatment decision ([spec-v11](spec-v11.md) §5.3). METAVIR also grades
necroinflammatory **activity** (A0-A3) separately; this tile reports the fibrosis stage only and says so. The
management decision stays with the hepatology team.

## Sourcing (spec-v97)

- **Citation:** The French METAVIR Cooperative Study Group. Intraobserver and interobserver variations in liver
  biopsy interpretation in patients with chronic hepatitis C. *Hepatology.* 1994;20(1):15-20.
- Cross-verified against hepatology references reproducing the same F0 (none) through F4 (cirrhosis) staging.

## Verification

Lint (all catalog-truth surfaces at 1355), unit suite (+7 + fuzz), build — all green. Verified in a real
browser: stage F2 renders "portal fibrosis with a few septa," F0 and F4 flip to their endpoints; the tile does
not scroll horizontally at 320px.

## Out of scope

The tile echoes the stage the pathologist assigns; it does not read the biopsy, grade activity (A0-A3), or
convert to or from the Ishak or Batts-Ludwig systems. The activity grade is a candidate companion tile. The MCP
adapter + golden-probe promotion follow in the next wave (329).

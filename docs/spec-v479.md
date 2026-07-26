# spec-v479.md — Spitz classification (esophageal atresia) tile

> Status: **SHIPPED (2026-07-19).** Builds the `spitz-atresia` tile — the Spitz classification of esophageal
> atresia, groups I/II/III. Catalog **1329 → 1330**, group G.

## Why

The neonatology tiles (Sarnat HIE, Papile IVH, Bell NEC) had no esophageal-atresia risk grouping. `spitz` /
`esophageal atresia group` routed to nothing. This fills that neonatal-surgery gap.

## What it does

The clinician picks the group; the tile reports the group and its birth-weight / cardiac criteria.

- `lib/spitz-atresia-v479.js` — pure group → description, the three Spitz groups. **I:** birth weight 1500 g or
  more and no major congenital cardiac disease. **II:** birth weight less than 1500 g, or major cardiac
  disease. **III:** birth weight less than 1500 g and major cardiac disease. Accepts I-III and 1-3.
- `views/group-v479.js` (RV479) — one select (dom `spitz-group`), real `<label for>`.
- `lib/meta.js` — Spitz 1994 (J Pediatr Surg) citation + accessed date + grouped bands. No citation-staleness
  row (a named-author journal article, no guideline-issuer acronym).
- 5 worked-example unit tests + fuzz registration; synonym entry (v199 → v200); corpus → 1330.

**HIGH-STAKES:** it reports the risk group the clinician has determined from the birth weight and cardiac
status, never a diagnosis, a treatment decision, or a prognosis ([spec-v11](spec-v11.md) §5.3); the management
decision stays with the neonatal / pediatric-surgery team.

## Sourcing (spec-v97)

- **Citation:** Spitz L, Kiely EM, Morecroft JA, Drake DP. Oesophageal atresia: at-risk groups for the 1990s.
  *J Pediatr Surg.* 1994;29(6):723-725. The citation URL is a PubMed term search.
- Cross-verified against neonatal-surgery references reproducing the same weight->=1500g-and-no-cardiac (I) /
  one-risk-factor (II) / both-risk-factors (III) grouping. (An earlier Waterston grouping is historical and out
  of scope.)

## Verification

Lint (all catalog-truth surfaces at 1330), unit suite (+5 + fuzz), build — all green. Verified in a real
browser: group II renders "birth weight less than 1500 g, or major congenital cardiac disease," the other
groups flip to their criteria; the tile does not scroll horizontally at 320px.

## Out of scope

The tile echoes the group the clinician selects; it does not measure the birth weight, assess the heart, or
recommend management (staged vs primary repair). The MCP adapter + golden-probe promotion follow in the next
wave (304).

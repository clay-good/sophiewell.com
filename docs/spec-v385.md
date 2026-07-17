# spec-v385.md — Schwab & England ADL scale tile

> Status: **SHIPPED (2026-07-17).** Builds the `schwab-england` tile — the Schwab & England Activities of
> Daily Living (ADL) scale (0-100%). Catalog **1236 → 1237**, group G.

## Why

The catalog carries the Hoehn-Yahr motor-staging tile for Parkinson disease but not the Schwab & England
ADL scale — the standard global measure of functional independence (0-100% in 10% steps) that pairs with
Hoehn-Yahr in movement-disorder assessment. `schwab england` / `parkinson adl scale` routed to nothing.
This is the motor-stage↔functional-ADL companion-gap.

## What it does

The clinician picks the level; the tile reports the level and its functional-independence description.

- `lib/schwab-england-v385.js` — pure level → description over the 11 levels. **100%:** completely
  independent, normal. **80%:** independent in most chores, takes twice as long. **50%:** needs help with
  half of chores. **20%:** nothing alone, severe invalid. **0%:** bedridden, vegetative functions failing.
  Accepts 0-100 in steps of 10 (a trailing `%` is tolerated).
- `views/group-v385.js` (RV385) — one select (dom `se-percent`), real `<label for>`.
- `lib/meta.js` — Schwab & England 1969 citation + accessed date + grouped bands. No citation-staleness
  row (the citation carries no guideline-issuer acronym).
- 6 worked-example unit tests + fuzz registration; synonym entry (v106 → v107); corpus → 1237.

**FUNCTIONAL-STATUS DESCRIPTOR, NOT PATHOLOGY:** like the Karnofsky / ECOG performance scales, the tile
reports the level the clinician has assessed and does **not** flag any level as abnormal, nor assert a
diagnosis, a treatment decision, or a prognosis ([spec-v11](spec-v11.md) §5.3). The falling-independence
ordering (100 → 0) is the scale's own, not an order; the management decision stays with the treating team.

## Sourcing (spec-v97)

- **Citation:** Schwab RS, England AC Jr. Projection technique for evaluating surgery in Parkinson's
  disease. In: Gillingham FJ, Donaldson MC, eds. *Third Symposium on Parkinson's Disease.* Edinburgh: E&S
  Livingstone; 1969:152-157 (the 0-100% descriptors).
- All 11 level descriptors cross-verified across two independent look-ups (100-70%, 60%, 0% verbatim; 50-
  10% confirmed on a second pass) plus movement-disorder / rehabilitation references.

## Verification

Lint (all catalog-truth surfaces at 1237), unit suite (+6 + fuzz), build — all green. Verified in a real
browser: 50% renders the "needs help with half of chores" description, 100% flips to "completely
independent / essentially normal", and the tile does not scroll horizontally at 320px.

## Out of scope

The tile echoes the level the clinician selects; it does not compute the level from itemized ADLs (the
scale is a global judgement), pair automatically with Hoehn-Yahr, or track change over time. The MCP
adapter + golden-probe promotion follow in a separate wave.

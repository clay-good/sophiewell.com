# spec-v445.md — Revised Atlanta severity (acute pancreatitis) tile

> Status: **SHIPPED (2026-07-19).** Builds the `atlanta-pancreatitis` tile — the Revised Atlanta classification
> of acute pancreatitis severity, mild/moderately-severe/severe. Catalog **1296 → 1297**, group G.

## Why

The catalog had pancreatitis prediction scores (Ranson/BISAP) and the modified Marshall organ-failure score,
but not the Revised Atlanta *severity classification* itself — the standard mild/moderately-severe/severe
grouping. `atlanta pancreatitis severity` / `moderately severe pancreatitis` routed to nothing. This fills
that gastroenterology / critical-care gap.

## What it does

The clinician picks the severity; the tile reports the category and its definition.

- `lib/atlanta-pancreatitis-v445.js` — pure severity → definition. **Mild:** no organ failure and no
  complications. **Moderately severe:** transient organ failure (< 48 h) and/or local or systemic
  complications. **Severe:** persistent organ failure (> 48 h). Accepts the category names and 1-3.
- `views/group-v445.js` (RV445) — one select (dom `atlanta-sev`), real `<label for>`.
- `lib/meta.js` — Banks 2013 (Gut) citation + accessed date + grouped bands. No citation-staleness row (the
  citation carries no guideline-issuer acronym).
- 5 worked-example unit tests + fuzz registration; synonym entry (v166 → v167); corpus → 1297.

**HIGH-STAKES:** it reports the severity category the clinician has determined from the clinical course, never
a diagnosis, a treatment decision, or a prognosis ([spec-v11](spec-v11.md) §5.3); persistent organ failure is
defined at > 48 h and the assessment stays with the treating team.

## Sourcing (spec-v97)

- **Citation:** Banks PA, Bollen TL, Dervenis C, et al; Acute Pancreatitis Classification Working Group.
  Classification of acute pancreatitis -- 2012: revision of the Atlanta classification by international
  consensus. *Gut.* 2013;62(1):102-111.
- Cross-verified against gastroenterology / critical-care references reproducing the same mild / moderately
  severe / severe grouping by organ-failure duration and complications.

## Verification

Lint (all catalog-truth surfaces at 1297), unit suite (+5 + fuzz), build — all green. Verified in a real
browser: moderately-severe renders "transient organ failure," the other categories flip to their definitions;
the tile does not scroll horizontally at 320px.

## Out of scope

The tile echoes the severity the clinician selects; it does not compute organ failure (that is the modified
Marshall score) or predict severity (that is Ranson/BISAP). The MCP adapter + golden-probe promotion follow in
a separate wave.

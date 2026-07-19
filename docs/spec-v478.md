# spec-v478.md — Spaulding classification (device reprocessing) tile

> Status: **SHIPPED (2026-07-19).** Builds the `spaulding-classification` tile — the Spaulding classification of
> medical devices for reprocessing, critical / semicritical / noncritical. Catalog **1328 → 1329**, group G.

## Why

The infection-prevention / device tiles (device-day counter) had no Spaulding classification — the standard
framework that sets the required level of disinfection or sterilization for a reusable device. `spaulding` /
`device reprocessing category` routed to nothing. This fills that infection-prevention gap.

## What it does

The clinician / infection-preventionist picks the category; the tile reports the category and its required
reprocessing.

- `lib/spaulding-classification-v478.js` — pure category → description. **Critical:** enters sterile tissue or
  the bloodstream; requires sterilization. **Semicritical:** contacts mucous membranes or non-intact skin;
  requires at least high-level disinfection. **Noncritical:** contacts intact skin only; requires low-level
  disinfection. Accepts the three category slugs (and hyphenated / numeric aliases).
- `views/group-v478.js` (RV478) — one select (dom `spaulding-category`), real `<label for>`.
- `lib/meta.js` — Spaulding 1968 citation + accessed date + grouped bands. No citation-staleness row (the
  citation is a named-author book chapter, no guideline-issuer acronym).
- 5 worked-example unit tests + fuzz registration; synonym entry (v198 → v199); corpus → 1329.

**HIGH-STAKES:** it reports the reprocessing category the clinician has determined, never a diagnosis, a
treatment decision, or a prognosis ([spec-v11](spec-v11.md) §5.3); always follow the device instructions for use
and the sterile-processing / infection-prevention team.

## Sourcing (spec-v97)

- **Citation:** Spaulding EH. Chemical disinfection of medical and surgical materials. In: Lawrence C, Block SS,
  eds. *Disinfection, Sterilization, and Preservation.* Philadelphia: Lea & Febiger; 1968:517-531.
- Cross-verified against infection-prevention references reproducing the same critical (sterilization) /
  semicritical (high-level disinfection) / noncritical (low-level disinfection) grouping.

## Verification

Lint (all catalog-truth surfaces at 1329), unit suite (+5 + fuzz), build — all green. Verified in a real
browser: semicritical renders "contacts mucous membranes ... at least high-level disinfection," the other
categories flip to their descriptions; the tile does not scroll horizontally at 320px.

## Out of scope

The tile echoes the category the clinician selects; it does not classify a specific device, and it does not
override the manufacturer's instructions for use. The MCP adapter + golden-probe promotion follow in the next
wave (303).

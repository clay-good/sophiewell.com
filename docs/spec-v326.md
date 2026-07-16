# spec-v326.md — ACR O-RADS US v2022 risk categories tile

> Status: **SHIPPED (2026-07-15).** Builds the `o-rads` tile — the ACR O-RADS US v2022 ovarian-adnexal
> ultrasound risk categories (0–5). Catalog **1177 → 1178**, group G.

## Why

The catalog carries BI-RADS, Lung-RADS, and ACR TI-RADS but had no O-RADS ("o-rads" had zero corpus hits)
— it is the standard ovarian-adnexal-mass ultrasound risk system, completing the ACR -RADS cluster.
`o-rads` / `ovarian mass risk category` routed to nothing.

## What it does

The radiologist picks the risk category; the tile reports the descriptor, the risk-of-malignancy band, and
a general management direction.

- `lib/o-rads-v326.js` — pure category → descriptor + risk band + management. **0:** incomplete. **1:**
  normal premenopausal ovary (0%). **2:** almost certainly benign (< 1%). **3:** low risk (1% to < 10%).
  **4:** intermediate risk (10% to < 50%). **5:** high risk (≥ 50%). Categories 4–5 are flagged high-risk.
- `views/group-v326.js` (RV326) — one select (BI-RADS-style), real `<label for>`.
- `lib/meta.js` — Andreotti 2020 / ACR O-RADS US v2022 citation + accessed date + grouped bands. No
  citation-staleness row (ACR is not in the check-citations issuer pattern; matches the -RADS precedent).
- 7 worked-example unit tests + fuzz registration; synonym entry (v47 → v48); corpus → 1178.

**HIGH-STAKES:** it reports the risk category the radiologist assigned and a general management direction,
never a diagnosis or an order ([spec-v11](spec-v11.md) §5.3). Per the O-RADS governing concepts, management
is guidance based on average risk and is modified by symptoms, personal/family history (e.g. BRCA), and
clinical judgement.

## Sourcing (spec-v97)

- **Citation:** Andreotti RF, Timmerman D, Strachowski LM, et al. O-RADS US Risk Stratification and
  Management System: A Consensus Guideline from the ACR O-RADS Committee. *Radiology.* 2020;294(1):48-57
  (updated in the ACR O-RADS US v2022 assessment categories). The 0–5 categories and the 0% / < 1% /
  1–<10% / 10–<50% / ≥ 50% risk bands were cross-verified across the ACR material and secondary sources; the
  ACR "Governing Concepts" page (fetched and read directly) confirmed the "management is guidance, modified
  by clinical factors" framing.

## Verification

Lint (all catalog-truth surfaces at 1178), unit suite (+7 + fuzz), build — all green. Verified in a real
browser: the example (category 4) renders the "intermediate risk (10% to < 50%)" band, and the tile does
not scroll horizontally at 320px.

## Out of scope

The tile echoes the category the radiologist selects; it does not assign the category from the lesion
lexicon (size, locularity, solid components, color score, ascites) or tailor management to menopausal
status / CA-125. The MRI risk system and the other -RADS (LI-RADS) are separate potential tiles. The MCP
adapter + golden-probe promotion follow in a separate wave.

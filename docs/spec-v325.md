# spec-v325.md — ACR Lung-RADS v2022 assessment categories tile

> Status: **SHIPPED (2026-07-15).** Builds the `lung-rads` tile — the ACR Lung-RADS v2022 lung-cancer-
> screening assessment categories (0, 1, 2, 3, 4A, 4B, 4X). Catalog **1176 → 1177**, group G.

## Why

The catalog carries the BI-RADS and ACR TI-RADS reporting tiles but had no Lung-RADS ("lung-rads" had zero
corpus hits) — lung cancer screening LDCT is one of the highest-volume reporting settings. `lung-rads` /
`lung screening category` routed to nothing.

## What it does

The radiologist picks the assessment category; the tile reports the descriptor and the standard management
recommendation.

- `lib/lung-rads-v325.js` — pure category → descriptor + management. **0:** incomplete (comparison or more
  imaging; 1–3 mo LDCT if infectious/inflammatory). **1/2:** negative / benign, 12-month LDCT. **3:**
  probably benign, 6-month LDCT. **4A:** suspicious, 3-month LDCT (PET/CT if solid component ≥ 8 mm). **4B:**
  very suspicious, diagnostic CT / PET-CT / tissue sampling / referral. **4X:** category 3/4 nodule with
  additional suspicious features, managed as 4B. Categories 4A–4X are flagged suspicious.
- `views/group-v325.js` (RV325) — one select (BI-RADS-style), real `<label for>`.
- `lib/meta.js` — ACR Lung-RADS v2022 citation + accessed date + grouped bands. No citation-staleness row
  (ACR is not in the check-citations issuer pattern; matches the `bi-rads`/`acr-tirads` precedent).
- 7 worked-example unit tests + fuzz registration; synonym entry (v46 → v47); corpus → 1177.

**HIGH-STAKES:** it reports the assessment category the radiologist assigned and its standard management,
never a diagnosis or an order ([spec-v11](spec-v11.md) §5.3).

## Sourcing (spec-v97)

- **Citation:** American College of Radiology. Lung CT Screening Reporting & Data System (Lung-RADS) v2022.
  ACR; November 2022 — transcribed from the primary ACR assessment-category table (also reproduced in
  Christensen J, et al. *J Am Coll Radiol.* 2024).
- **v2022 note:** the ACR removed the risk-of-malignancy column, so the tile reports the descriptor +
  management (the actionable v2022 content), not a malignancy percentage.

## Verification

Lint (all catalog-truth surfaces at 1177), unit suite (+7 + fuzz), build — all green. Verified in a real
browser: the example (category 4A) renders the "3-month LDCT … solid component ≥ 8 mm" management, and the
tile does not scroll horizontally at 320px.

## Out of scope

The tile echoes the category the radiologist selects; it does not measure nodules or assign the category
from nodule size/type/growth (the v2022 size rules), and the "S" modifier is noted but not a selectable
category. The other -RADS systems (LI-RADS, O-RADS) are separate potential tiles. The MCP adapter +
golden-probe promotion follow in a separate wave.

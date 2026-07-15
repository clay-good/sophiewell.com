# spec-v322.md — ACR BI-RADS assessment categories tile

> Status: **SHIPPED (2026-07-15).** Builds the `bi-rads` tile — the ACR BI-RADS breast-imaging assessment
> categories (0–6, with 4A/4B/4C). Catalog **1173 → 1174**, group G.

## Why

The catalog carried the ACR TI-RADS thyroid tile (`acr-tirads`) but had no BI-RADS — one of the most
widely used imaging reporting systems in all of medicine. `bi-rads` / `breast imaging category` routed to
nothing.

## What it does

The radiologist picks the final assessment category; the tile reports the category, its likelihood-of-
malignancy band, and the standard management.

- `lib/bi-rads-v322.js` — pure category → band + management. **0:** incomplete. **1:** negative (~0%).
  **2:** benign (~0%). **3:** probably benign (> 0% to ≤ 2%), short-interval follow-up. **4:** suspicious
  (> 2% to < 95%), biopsy — sub-divided **4A** (> 2–10%), **4B** (> 10–50%), **4C** (> 50 to < 95%).
  **5:** highly suggestive (≥ 95%), biopsy. **6:** known biopsy-proven malignancy. Categories 4–6 are
  flagged suspicious.
- `views/group-v322.js` (RV322) — one select (acr-tirads-style), real `<label for>`; concise space-
  separated option labels (no long unbreakable tokens, per the spec-v320 320px-hscroll fix).
- `lib/meta.js` — ACR BI-RADS Atlas 5th ed citation + accessed date + grouped bands. No citation-staleness
  row (ACR is not in the check-citations issuer pattern; matches the `acr-tirads` precedent).
- 8 worked-example unit tests + fuzz registration; synonym entry (v43 → v44); corpus → 1174.

**HIGH-STAKES:** it reports the assessment category the radiologist assigned and its standard management,
never a diagnosis or an order ([spec-v11](spec-v11.md) §5.3); the biopsy/follow-up decision stays with the
clinician and the patient.

## Sourcing (spec-v97)

- **Citation:** D'Orsi CJ, Sickles EA, Mendelson EB, Morris EA, et al. ACR BI-RADS Atlas, Breast Imaging
  Reporting and Data System. 5th ed. Reston, VA: American College of Radiology; 2013. Cross-verified
  against StatPearls (NBK459169) and the ACR category definitions.
- The 0–6 categories and the 4A (> 2–10%), 4B (> 10–50%), 4C (> 50 to < 95%) likelihood bands are as
  published in the 5th edition.

## Verification

Lint (all catalog-truth surfaces at 1174), unit suite (+8 + fuzz), build — all green. Verified in a real
browser: the example (category 4B) renders the "moderate suspicion … > 10% to ≤ 50%" band, and the tile
does not scroll horizontally at 320px.

## Out of scope

The tile echoes the category the radiologist selects; it does not read the images, assign the category, or
choose between biopsy and follow-up. The other -RADS systems (LI-RADS, Lung-RADS, O-RADS) and Bethesda
cytology categories are separate potential tiles. The MCP adapter + golden-probe promotion follow in a
separate wave.

# spec-v327.md — ACR LI-RADS v2018 CT/MRI diagnostic categories tile

> Status: **SHIPPED (2026-07-15).** Builds the `li-rads` tile — the ACR LI-RADS v2018 CT/MRI diagnostic
> categories (LR-1 to LR-5, LR-M, LR-TIV, LR-NC). Catalog **1178 → 1179**, group G.

## Why

The catalog carries HCC risk/staging tiles (`milan-criteria`, `bclc-hcc`, `galad-hcc`, …) but had no
LI-RADS imaging category system ("li-rads" had zero corpus hits) — it is the standard HCC-imaging reporting
system and the liver peer of the -RADS cluster. `li-rads` / `liver imaging category` routed to nothing.

## What it does

The radiologist picks the diagnostic category; the tile reports the descriptor and a general management
direction.

- `lib/li-rads-v327.js` — pure category → descriptor + management. **LR-1/LR-2:** definitely / probably
  benign, routine surveillance. **LR-3:** intermediate probability of malignancy, repeat or alternative
  imaging in 3–6 months. **LR-4/LR-5:** probably / definitely HCC (LR-5 may be treated as HCC without
  biopsy after multidisciplinary discussion). **LR-M:** malignant, not HCC-specific (biopsy often
  considered). **LR-TIV:** definite tumor in vein. **LR-NC:** not categorizable. LR-4/5/M/TIV are flagged
  malignant. Input is normalized (bare number, no-dash, case-insensitive).
- `views/group-v327.js` (RV327) — one select (BI-RADS-style), real `<label for>`.
- `lib/meta.js` — Chernyak 2018 / ACR LI-RADS v2018 citation + accessed date + grouped bands. No
  citation-staleness row (ACR is not in the check-citations issuer pattern; matches the -RADS precedent).
- 6 worked-example unit tests + fuzz registration; synonym entry (v48 → v49); corpus → 1179.

**HIGH-STAKES:** it reports the diagnostic category the radiologist assigned and its general management,
never a diagnosis or an order ([spec-v11](spec-v11.md) §5.3); the workup/treatment decision stays with the
multidisciplinary team.

## Sourcing (spec-v97)

- **Citation:** Chernyak V, Fowler KJ, Kamaya A, et al. Liver Imaging Reporting and Data System (LI-RADS)
  Version 2018: Imaging of Hepatocellular Carcinoma in At-Risk Patients. *Radiology.* 2018;289(3):816-830.
  Cross-verified against the ACR RADS-support diagnostic-categories material.
- The category is assigned from observation size and the major features (non-rim arterial-phase
  hyperenhancement, non-peripheral washout, enhancing capsule, threshold growth); the tile echoes the
  assigned category and its standard management (it does not run the assignment algorithm).

## Verification

Lint (all catalog-truth surfaces at 1179), unit suite (+6 + fuzz), build — all green. Verified in a real
browser: the example (LR-3) renders the "intermediate probability … 3 to 6 months" management, and the tile
does not scroll horizontally at 320px.

## Out of scope

The tile echoes the category the radiologist selects; it does not run the LI-RADS assignment algorithm or
the CEUS/treatment-response algorithms. The MCP adapter + golden-probe promotion follow in a separate wave.

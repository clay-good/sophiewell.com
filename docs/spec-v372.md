# spec-v372.md — CAD-RADS 2.0 category (coronary CTA) tile

> Status: **SHIPPED (2026-07-17).** Builds the `cad-rads` tile — the CAD-RADS 2.0 coronary-CT-angiography
> categories (0–5, with 4A/4B). Catalog **1223 → 1224**, group G.

## Why

The catalog carries the other RADS reporting systems (BI/LI/PI/O/TI/Lung/C-RADS) but not CAD-RADS — the
standardized coronary-CT-angiography category by maximal coronary stenosis, one of the most common
cardiac-imaging reporting tasks. `cad-rads` / `coronary cta category` / `coronary stenosis grade` routed
to nothing.

## What it does

The radiologist picks the category; the tile reports the category, its stenosis description, and whether
it is obstructive (category 3+).

- `lib/cad-rads-v372.js` — pure category → description. **0** 0% (no plaque). **1** 1–24% minimal. **2**
  25–49% mild. **3** 50–69% moderate (obstructive) — flagged. **4A** 70–99% severe — flagged. **4B** left
  main ≥ 50% or three-vessel obstructive — flagged. **5** 100% occlusion — flagged. Accepts 0/1/2/3/4A/4B/5
  (case-insensitive) or bare 4 (→ 4A). Modifiers (N/S/G/HRP/I/E) and the P-score are out of scope.
- `views/group-v372.js` (RV372) — one select (dom `cadrads-cat`), real `<label for>`.
- `lib/meta.js` — Cury et al. 2022 (J Cardiovasc Comput Tomogr) citation + accessed date + grouped bands.
  No citation-staleness row (the citation cites the journal without a guideline-issuer acronym).
- 5 worked-example unit tests + fuzz registration; synonym entry (v93 → v94); corpus → 1224.

**HIGH-STAKES:** it reports the CAD-RADS stenosis category the radiologist has assigned, never a
diagnosis, a management order, or a prognosis ([spec-v11](spec-v11.md) §5.3). The category-linked pathway
(functional testing / invasive angiography for higher categories) is the classically taught association,
not an order; the management decision stays with the cardiology / radiology team (surfaced in the tile
note).

## Sourcing (spec-v97)

- **Citation:** Cury RC, Abbara S, Achenbach S, et al. CAD-RADS 2.0 – 2022 Coronary Artery Disease
  Reporting and Data System. *J Cardiovasc Comput Tomogr.* 2022;16(6):536-557.
- Cross-verified against radiology references (RadioGraphics / Radiology Assistant) reproducing the same
  0–5 stenosis categories with the 4A/4B split.

## Verification

Lint (all catalog-truth surfaces at 1224), unit suite (+5 + fuzz), build — all green. Verified in a real
browser: CAD-RADS 3 renders the flagged "moderate 50–69% / obstructive" description, CAD-RADS 0 flips to
the "no plaque" description, and the tile does not scroll horizontally at 320px.

## Out of scope

The tile echoes the category the radiologist selects; it does not read the CTA, measure stenosis, apply
the modifiers, or compute the P-score. The MCP adapter + golden-probe promotion follow in a separate wave.

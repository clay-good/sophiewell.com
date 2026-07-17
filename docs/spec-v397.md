# spec-v397.md — El Khoury classification (aortic regurgitation) tile

> Status: **SHIPPED (2026-07-17).** Builds the `el-khoury-ar` tile — the El Khoury (Boodhwani) functional
> classification of aortic regurgitation (types I/II/III). Catalog **1248 → 1249**, group G.

## Why

The catalog just gained the Sievers bicuspid-aortic-valve typing; its complement is the El Khoury
repair-oriented functional classification of aortic regurgitation — the aortic analog of Carpentier's
mitral classification, used to plan aortic-valve-sparing / repair surgery. `el khoury` / `aortic
regurgitation mechanism` routed to nothing. This is the Sievers↔El-Khoury aortic-valve companion-gap.

## What it does

The clinician picks the type; the tile reports the type and its mechanism description.

- `lib/el-khoury-ar-v397.js` — pure type → description. **I:** normal cusp motion with functional-aortic-
  annulus dilatation (subtypes Ia sinotubular / Ib root / Ic annular / Id perforation). **II:** cusp
  prolapse (excessive motion). **III:** cusp restriction (restrictive motion). Accepts I/II/III, 1-3, and
  the Ia-Id subtypes → I.
- `views/group-v397.js` (RV397) — one select (dom `elk-type`), real `<label for>`.
- `lib/meta.js` — Boodhwani 2009 (J Thorac Cardiovasc Surg) citation + accessed date + grouped bands. No
  citation-staleness row (the citation carries no guideline-issuer acronym).
- 5 worked-example unit tests + fuzz registration; synonym entry (v118 → v119); corpus → 1249.

**HIGH-STAKES:** it reports the functional type the clinician has determined from the imaging, never a
diagnosis, a treatment decision, or a prognosis ([spec-v11](spec-v11.md) §5.3). The type guides the repair
strategy, but the management decision stays with the cardiology / cardiac-surgery team.

## Sourcing (spec-v97)

- **Citation:** Boodhwani M, de Kerchove L, Glineur D, et al. Repair-oriented classification of aortic
  insufficiency: impact on surgical techniques and clinical outcomes. *J Thorac Cardiovasc Surg.*
  2009;137(2):286-294 (the El Khoury type I / II / III functional classification).
- Cross-verified against cardiac-surgery / echocardiography references reproducing the same
  normal-motion-with-FAA-dilatation (I; subtypes Ia-Id) / cusp-prolapse (II) / cusp-restriction (III)
  grouping.

## Verification

Lint (all catalog-truth surfaces at 1249), unit suite (+5 + fuzz), build — all green. Verified in a real
browser: type II renders "cusp prolapse", type I flips to "normal motion / annulus dilatation" with the
Ia-Id subtypes, and the tile does not scroll horizontally at 320px.

## Out of scope

The tile echoes the type the clinician selects; it does not read the imaging, resolve the Ia-Id subtype
beyond mapping it to I, or recommend a repair technique. The MCP adapter + golden-probe promotion follow
in a separate wave.

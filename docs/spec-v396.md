# spec-v396.md — Sievers classification (bicuspid aortic valve) tile

> Status: **SHIPPED (2026-07-17).** Builds the `sievers-bav` tile — the Sievers classification of a
> bicuspid aortic valve (types 0/1/2). Catalog **1247 → 1248**, group G.

## Why

The catalog carries cardiology / valve tiles but not the Sievers classification — the standard
morphological typing of a bicuspid aortic valve by the number of raphes, used in echocardiography, CT,
and aortic-valve repair / TAVR planning. `sievers` / `bicuspid aortic valve type` routed to nothing.
Found on a fresh cardiology / echo sweep.

## What it does

The clinician picks the type; the tile reports the type and its raphe description.

- `lib/sievers-bav-v396.js` — pure type → description. **0:** no raphe (two symmetrical leaflets). **1:**
  one raphe (the most common; sub-typed by the fused sinuses L-R / R-N / N-L). **2:** two raphes (least
  common). Accepts 0/1/2.
- `views/group-v396.js` (RV396) — one select (dom `sievers-type`), real `<label for>`.
- `lib/meta.js` — Sievers 2007 (J Thorac Cardiovasc Surg) citation + accessed date + grouped bands. No
  citation-staleness row (the citation carries no guideline-issuer acronym).
- 5 worked-example unit tests + fuzz registration; synonym entry (v117 → v118); corpus → 1248.

**HIGH-STAKES:** it reports the Sievers type the clinician has determined from the imaging, never a
diagnosis, a treatment decision, or a prognosis ([spec-v11](spec-v11.md) §5.3). The type informs repair /
TAVR planning, but the management decision stays with the cardiology / cardiac-surgery team.

## Sourcing (spec-v97)

- **Citation:** Sievers HH, Schmidtke C. A classification system for the bicuspid aortic valve from 304
  surgical specimens. *J Thorac Cardiovasc Surg.* 2007;133(5):1226-1233 (the 0/1/2 typing by raphe number,
  with spatial-position and function subcategories).
- Cross-verified against cardiology / echocardiography references reproducing the same no-raphe (0) /
  one-raphe (1, most common; L-R / R-N / N-L subtypes) / two-raphe (2) grouping.

## Verification

Lint (all catalog-truth surfaces at 1248), unit suite (+5 + fuzz), build — all green. Verified in a real
browser: type 1 renders "one raphe / most common", type 0 flips to "no raphe / two symmetrical leaflets",
and the tile does not scroll horizontally at 320px.

## Out of scope

The tile echoes the type the clinician selects; it does not read the imaging, resolve the type-1 L-R/R-N/
N-L subtype beyond the copy note, or recommend an intervention. The MCP adapter + golden-probe promotion
follow in a separate wave.

# spec-v371.md — C-RADS category (CT colonography) tile

> Status: **SHIPPED (2026-07-17).** Builds the `c-rads` tile — the C-RADS (CT Colonography Reporting and
> Data System) colonic categories (C0–C4, 2023 update). Catalog **1222 → 1223**, group G.

## Why

The catalog carries the other RADS reporting systems (`bi-rads`, `li-rads`, `pi-rads`, `o-rads`,
`acr-tirads`, `lung-rads`) but not C-RADS — the standardized reporting category for the colonic findings
on a CT colonography (virtual colonoscopy). `c-rads` / `ct colonography category` / `virtual colonoscopy
reporting` routed to nothing. (Completes the RADS family — its seventh member.)

## What it does

The radiologist picks the colonic category; the tile reports the category, its description, and whether it
is an actionable (C3–C4, colonoscopy-warranting) finding.

- `lib/c-rads-v371.js` — pure category → description. **C0** inadequate study. **C1** normal / benign.
  **C2a** indeterminate 6–9 mm polyps (<3). **C2b** mass-like likely-benign stricture (2023 update).
  **C3** polyp(s) ≥ 10 mm or ≥ 3 polyps 6–9 mm — flagged. **C4** colonic mass, malignant-appearing —
  flagged. Accepts C0/C1/C2a/C2b/C3/C4 (case-insensitive) or bare 0/1/3/4.
- `views/group-v371.js` (RV371) — one select (dom `crads-cat`), real `<label for>`.
- `lib/meta.js` — Zalis 2005 + 2023 update citation + accessed date + grouped bands. No citation-staleness
  row (the citation carries no guideline-issuer acronym).
- 5 worked-example unit tests + fuzz registration; synonym entry (v92 → v93); corpus → 1223.

**HIGH-STAKES:** it reports the C-RADS colonic category the radiologist has assigned, never a diagnosis, a
management order, or a prognosis ([spec-v11](spec-v11.md) §5.3). The category-linked follow-up (routine
screening, surveillance, or colonoscopy) is the classically taught association, not an order; the
management decision stays with the radiologist and referring team (surfaced in the tile note). The
extracolonic (E0–E4) axis is out of scope.

## Sourcing (spec-v97)

- **Citation:** Zalis ME, Barish MA, Choi JR, et al. CT colonography reporting and data system: a
  consensus proposal. *Radiology.* 2005;236(1):3-9; and the C-RADS Version 2023 Update (*Radiology* 2024,
  which split C2 into C2a / C2b).
- Cross-verified against Radiopaedia and radiology references reproducing the same C0–C4 colonic
  categories.

## Verification

Lint (all catalog-truth surfaces at 1223), unit suite (+5 + fuzz), build — all green. Verified in a real
browser: C3 renders the flagged "polyp ≥ 10 mm … colonoscopy" description, C1 flips to the "normal colon"
description, and the tile does not scroll horizontally at 320px.

## Out of scope

The tile echoes the category the radiologist selects; it does not read the study, size polyps, or apply
the extracolonic (E) axis. The MCP adapter + golden-probe promotion follow in a separate wave.

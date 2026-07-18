# spec-v423.md — Marsh-Oberhuber classification (celiac histology) tile

> Status: **SHIPPED (2026-07-18).** Builds the `marsh-oberhuber` tile — the modified Marsh (Marsh-Oberhuber)
> classification of celiac duodenal histology, types 0/1/2/3a/3b/3c. Catalog **1274 → 1275**, group G.

## Why

The catalog had no grading for the duodenal histology in celiac disease — the standard scheme a pathologist
reports on a celiac biopsy. `marsh oberhuber` / `celiac histology grade` routed to nothing. This fills that
GI-pathology gap.

## What it does

The pathologist picks the type; the tile reports the type and its histologic description.

- `lib/marsh-oberhuber-v423.js` — pure type → description, the modified Marsh (Oberhuber 1999) grading by the
  intraepithelial-lymphocyte infiltrate, crypt architecture, and villous atrophy. **0:** preinfiltrative
  (normal). **1:** infiltrative (increased IELs, normal villi). **2:** hyperplastic (increased IELs + crypt
  hyperplasia). **3a:** partial villous atrophy. **3b:** subtotal. **3c:** total. Accepts the types
  case-insensitively; a bare `3` maps to 3a.
- `views/group-v423.js` (RV423) — one select (dom `mo-type`), real `<label for>`.
- `lib/meta.js` — Oberhuber 1999 (Eur J Gastroenterol Hepatol) citation + accessed date + grouped bands. No
  citation-staleness row (the citation carries no guideline-issuer acronym).
- 7 worked-example unit tests + fuzz registration; synonym entry (v144 → v145); corpus → 1275.

**HIGH-STAKES:** it reports the histologic type the pathologist has determined, never a diagnosis of celiac
disease (which needs serology and the clinical picture), a treatment decision, or a prognosis
([spec-v11](spec-v11.md) §5.3); the diagnostic and management decisions stay with the gastroenterology /
pathology team.

## Sourcing (spec-v97)

- **Citation:** Oberhuber G, Granditsch G, Vogelsang H. The histopathology of coeliac disease: time for a
  standardized report scheme for pathologists. *Eur J Gastroenterol Hepatol.* 1999;11(10):1185-1194.
- Cross-verified against the original Marsh scheme (Marsh MN. *Gastroenterology.* 1992;102(1):330-354). This
  tile reports the modified (Oberhuber) grading, types 0 through 3c, in modern pathology use; the original
  Marsh type 4 (hypoplastic/atrophic-flat lesion) is not part of the modified grading and is not reported.

## Verification

Lint (all catalog-truth surfaces at 1275), unit suite (+7 + fuzz), build — all green. Verified in a real
browser: type 3a renders "partial villous atrophy," the other types flip to their descriptions; the tile does
not scroll horizontally at 320px.

## Out of scope

The tile echoes the type the pathologist selects; it does not read the slide, add serology to diagnose celiac
disease, or recommend treatment. The MCP adapter + golden-probe promotion follow in a separate wave.

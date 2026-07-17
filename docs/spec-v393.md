# spec-v393.md — Lauren classification (gastric cancer) tile

> Status: **SHIPPED (2026-07-17).** Builds the `lauren-gastric` tile — the Lauren classification of gastric
> carcinoma (intestinal / diffuse / mixed). Catalog **1244 → 1245**, group G.

## Why

The catalog carries many oncology-staging tiles but not the Lauren classification — the classic
histological typing of gastric adenocarcinoma by growth pattern, with distinct epidemiology and
prognosis. `lauren` / `gastric cancer histology type` routed to nothing. Found on the same fresh
GI-endoscopy/GI-oncology sweep as Hill.

## What it does

The pathologist picks the type; the tile reports the type and its histological description.

- `lib/lauren-gastric-v393.js` — pure type → description. **intestinal:** cohesive cells retaining
  glandular structure (chronic gastritis / intestinal metaplasia; the "epidemic" type). **diffuse:**
  poorly cohesive cells, signet-ring cells, no gland formation (classically a worse prognosis).
  **mixed:** both components. Accepts intestinal/diffuse/mixed, case-insensitive, and the i/d/m aliases.
- `views/group-v393.js` (RV393) — one select (dom `lauren-type`), real `<label for>`.
- `lib/meta.js` — Lauren 1965 (Acta Pathol Microbiol Scand) citation + accessed date + grouped bands. No
  citation-staleness row (the citation carries no guideline-issuer acronym).
- 5 worked-example unit tests + fuzz registration; synonym entry (v114 → v115); corpus → 1245.

**HIGH-STAKES:** it reports the Lauren type the pathologist has determined, never a diagnosis, a treatment
decision, or a prognosis ([spec-v11](spec-v11.md) §5.3). The diffuse type's worse-prognosis association is
descriptive, not an order; the management decision stays with the treating oncology / pathology team.

## Sourcing (spec-v97)

- **Citation:** Lauren P. The two histological main types of gastric carcinoma: diffuse and so-called
  intestinal-type carcinoma. An attempt at a histo-clinical classification. *Acta Pathol Microbiol Scand.*
  1965;64:31-49 (the intestinal / diffuse dichotomy; the mixed type is the later addition).
- Cross-verified against pathology / oncology references reproducing the same cohesive-glandular
  (intestinal) vs poorly-cohesive-signet-ring (diffuse) vs both-components (mixed) grouping.

## Verification

Lint (all catalog-truth surfaces at 1245), unit suite (+5 + fuzz), build — all green. Verified in a real
browser: the diffuse type renders "poorly cohesive / signet-ring", the intestinal type flips to
"glandular / tubular", and the tile does not scroll horizontally at 320px.

## Out of scope

The tile echoes the type the pathologist selects; it does not read the slide, map to the WHO
classification beyond the copy note, or recommend treatment. The MCP adapter + golden-probe promotion
follow in a separate wave.

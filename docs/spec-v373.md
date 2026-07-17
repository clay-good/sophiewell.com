# spec-v373.md — NI-RADS category (head & neck surveillance) tile

> Status: **SHIPPED (2026-07-17).** Builds the `ni-rads` tile — the NI-RADS (Neck Imaging Reporting and
> Data System) categories (1–4, with 2A/2B). Catalog **1224 → 1225**, group G. Completes the RADS family.

## Why

The catalog carries the other RADS reporting systems (BI/LI/PI/O/TI/Lung/C/CAD-RADS) but not NI-RADS —
the ACR structured category for post-treatment surveillance imaging in head-and-neck cancer, assigned
separately to the primary site and the neck (nodes). `ni-rads` / `neck imaging reporting` / `head and
neck cancer surveillance category` routed to nothing. (This is the ninth and final member — the RADS
family is now complete in the catalog.)

## What it does

The radiologist picks the category (for the primary site or the neck); the tile reports the category, its
description, and whether it is a suspicious (category 3–4) finding.

- `lib/ni-rads-v373.js` — pure category → description. **1** no evidence of recurrence (routine
  surveillance). **2A** low suspicion, mucosal. **2B** low suspicion, deep. **3** high suspicion (biopsy
  if indicated) — flagged. **4** definite recurrence — flagged. Accepts 1/2A/2B/3/4 (case-insensitive) or
  bare 2 (→ 2A).
- `views/group-v373.js` (RV373) — one select (dom `nirads-cat`), real `<label for>`.
- `lib/meta.js` — Aiken et al. 2018 (J Am Coll Radiol) citation + accessed date + grouped bands. No
  citation-staleness row (the citation carries no ISSUER_PATTERN guideline-issuer acronym; "ACR" is not
  in the pattern).
- 5 worked-example unit tests + fuzz registration; synonym entry (v94 → v95); corpus → 1225.

**HIGH-STAKES:** it reports the NI-RADS category the radiologist has assigned, never a diagnosis, a
management order, or a prognosis ([spec-v11](spec-v11.md) §5.3). NI-RADS is for surveillance after
definitive treatment (not during treatment); the category-linked pathway is the classically taught
association, not an order; the management decision stays with the head-and-neck oncology / radiology team
(surfaced in the tile note).

## Sourcing (spec-v97)

- **Citation:** Aiken AH, Rath TJ, Anzai Y, et al. ACR Neck Imaging Reporting and Data Systems (NI-RADS):
  A White Paper of the ACR NI-RADS Committee. *J Am Coll Radiol.* 2018;15(8):1097-1108.
- Cross-verified against radiology references reproducing the same 1–4 categories with the 2A (mucosal) /
  2B (deep) split.

## Verification

Lint (all catalog-truth surfaces at 1225), unit suite (+5 + fuzz), build — all green. Verified in a real
browser: NI-RADS 3 renders the flagged "high suspicion / biopsy" description, NI-RADS 1 flips to the "no
evidence of recurrence" description, and the tile does not scroll horizontally at 320px.

## Out of scope

The tile echoes the category the radiologist selects; it does not read the study, distinguish primary vs
nodal, or generate the two separate scores. The MCP adapter + golden-probe promotion follow in a separate
wave.

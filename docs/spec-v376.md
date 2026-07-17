# spec-v376.md — Denis classification (sacral fracture) tile

> Status: **SHIPPED (2026-07-17).** Builds the `denis-sacral` tile — the Denis classification of a sacral
> fracture (zones I–III). Catalog **1227 → 1228**, group G.

## Why

The catalog carries many fracture eponyms and the penetrating-neck-trauma zones but not the Denis sacral
zoning — the standard anatomic classification that predicts the neurologic-injury risk of a sacral
fracture by its relationship to the sacral foramina and central canal. `denis` / `denis classification
sacral` / `sacral fracture zone` routed to nothing.

## What it does

The clinician picks the zone; the tile reports the zone, its anatomic/neurologic description, and whether
it is a higher-neurologic-risk (zone II–III) fracture.

- `lib/denis-sacral-v376.js` — pure zone → description. **I:** alar, lateral to the foramina (lowest
  neurologic-injury rate, ~6%). **II:** through the foramina (intermediate, ~28%) — flagged. **III:**
  central sacral canal, medial to the foramina (highest rate; bowel/bladder/sexual dysfunction) —
  flagged. Accepts I/II/III or 1–3, case-insensitive.
- `views/group-v376.js` (RV376) — one select (dom `denis-zone`), real `<label for>`.
- `lib/meta.js` — Denis et al. 1988 (CORR) citation + accessed date + grouped bands. No
  citation-staleness row (the citation carries no guideline-issuer acronym).
- 5 worked-example unit tests + fuzz registration; synonym entry (v97 → v98); corpus → 1228.

**HIGH-STAKES:** it reports the Denis zone the clinician has determined from the imaging, never a
diagnosis, a treatment decision, or a prognosis ([spec-v11](spec-v11.md) §5.3). The
rising-neurologic-injury-risk association (I → III) is the classically taught pattern, not an order; the
management decision stays with the orthopedic / spine / trauma team (surfaced in the tile note).

## Sourcing (spec-v97)

- **Citation:** Denis F, Davis S, Comfort T. Sacral fractures: an important problem. Retrospective
  analysis of 236 cases. *Clin Orthop Relat Res.* 1988;(227):67-81 (the three zones and their
  neurologic-injury rates).
- Cross-verified against orthopedic / spine references reproducing the same alar / foraminal /
  central-canal zoning and the rising neurologic-injury gradient.

## Verification

Lint (all catalog-truth surfaces at 1228), unit suite (+5 + fuzz), build — all green. Verified in a real
browser: zone III renders the flagged "central canal / bowel-bladder" description, zone I flips to the
"alar / lowest rate" description, and the tile does not scroll horizontally at 320px.

## Out of scope

The tile echoes the zone the clinician selects; it does not read imaging, distinguish transverse vs
vertical patterns, or recommend fixation. The MCP adapter + golden-probe promotion follow in a separate
wave.

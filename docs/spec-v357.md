# spec-v357.md — NYHA functional classification (heart failure) tile

> Status: **SHIPPED (2026-07-16).** Builds the `nyha-class` tile — the NYHA (New York Heart Association)
> functional classification of heart failure (classes I–IV). Catalog **1208 → 1209**, group G.

## Why

NYHA class is one of the most widely used classifications in medicine, but the catalog only carried it
as an **input field** inside composite cardiac scores (`maggic`, `euroscore2`, …) — there was no
standalone tile to look up the class definitions. `nyha class` / `new york heart association class` /
`heart failure functional class` routed to nothing.

## What it does

The clinician picks the functional class; the tile reports the class, its symptom-limitation
description, and whether it is an advanced (class III–IV) limitation.

- `lib/nyha-class-v357.js` — pure class → description. **I:** no limitation. **II:** slight limitation;
  symptoms on ordinary activity, comfortable at rest. **III:** marked limitation; symptoms on
  less-than-ordinary activity — flagged. **IV:** symptoms at rest / any activity causes discomfort —
  flagged. Accepts I/II/III/IV or 1–4, case-insensitive.
- `views/group-v357.js` (RV357) — one select (dom `nyha-class`), real `<label for>`.
- `lib/meta.js` — NYHA Criteria Committee 1994 citation + accessed date + grouped bands. No
  citation-staleness row (the citation carries no guideline-issuer acronym — "New York Heart
  Association" spelled out, no ISSUER_PATTERN match).
- 5 worked-example unit tests + fuzz registration; synonym entry (v78 → v79); corpus → 1209.

**HIGH-STAKES:** it reports the NYHA class the clinician has determined from the patient's symptoms,
never a diagnosis, a treatment decision, or a prognosis ([spec-v11](spec-v11.md) §5.3). The class is
symptom-based and can vary visit to visit; the management decision stays with the treating clinician
(surfaced in the tile note).

## Sourcing (spec-v97)

- **Citation:** The Criteria Committee of the New York Heart Association. Nomenclature and Criteria for
  Diagnosis of Diseases of the Heart and Great Vessels. 9th ed. Boston: Little, Brown & Co;
  1994:253-256.
- Cross-verified against standard cardiology references reproducing the same class I–IV symptom-
  limitation definitions.

## Verification

Lint (all catalog-truth surfaces at 1209), unit suite (+5 + fuzz), build — all green. Verified in a real
browser: the example (class III) renders the "marked limitation" warn description, class I flips to the
"no limitation" description, and the tile does not scroll horizontally at 320px.

## Out of scope

The tile echoes the class the clinician selects; it does not assess the patient or compute a risk score
(the composite tiles that consume NYHA as an input still do that). The MCP adapter + golden-probe
promotion follow in a separate wave.

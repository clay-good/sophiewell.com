# spec-v495.md — Ranawat classification (rheumatoid cervical myelopathy) tile

> Status: **SHIPPED (2026-07-23).** Builds the `ranawat-myelopathy` tile — the Ranawat classification of the
> neurologic deficit of the rheumatoid cervical spine, classes I / II / IIIA / IIIB. Catalog **1345 → 1346**,
> group G.

## Why

The cervical-myelopathy tiles (`mjoa`, `nurick`) grade *spondylotic* myelopathy by function and gait. Neither
is the rheumatoid-specific descriptor the spine literature reports outcomes against, and `ranawat` routed to
nothing — the only mention anywhere in the corpus was a co-author credit on the Crowe DDH tile. This is a
companion-gap fill in a cluster the catalog already covers.

## What it does

The clinician picks the class; the tile reports the class and its neurologic-deficit description.

- `lib/ranawat-myelopathy-v495.js` — pure class → description, the four Ranawat classes. **I:** pain, no
  neural deficit. **II:** subjective weakness with dysesthesias and hyperreflexia. **IIIA:** objective weakness
  and long-tract signs, ambulatory. **IIIB:** the same, non-ambulatory. Accepts the classes case-insensitively
  plus `1`, `2`, `3A`, `3B`; bare `III` is rejected so the ambulation split stays explicit.
- `views/group-v495.js` (RV495) — one select (dom `ranawat-class`), real `<label for>`.
- `lib/meta.js` — Ranawat and colleagues 1979 (J Bone Joint Surg Am) citation + accessed date + grouped bands.
  No citation-staleness row (a named-author article, no guideline-issuer acronym).
- 6 worked-example unit tests + fuzz registration; synonym entry (v215 → v216); corpus → 1346.

**HIGH-STAKES:** it reports the class the clinician has determined from the neurologic examination, never a
diagnosis, a decision to operate, or a prognosis ([spec-v11](spec-v11.md) §5.3); the management decision stays
with the spine team.

## Sourcing (spec-v97)

- **Citation:** Ranawat CS, et al. Cervical spine fusion in rheumatoid arthritis. *J Bone Joint Surg Am.*
  1979;61(7):1003-1010. The citation URL is a PubMed term search. The author list is given in the `et al.` form
  because the second author name carries an apostrophe, which is a syntax hazard in this codebase.
- Cross-verified against spine references reproducing the same no-deficit (I) / subjective-weakness (II) /
  objective-weakness-ambulatory (IIIA) / objective-weakness-non-ambulatory (IIIB) grouping.

## Verification

Lint (all catalog-truth surfaces at 1346), unit suite (+6 + fuzz), build — all green. Verified in a real
browser: class IIIA renders "still ambulatory," IIIB flips to "no longer ambulatory"; the tile does not scroll
horizontally at 320px.

## Out of scope

The tile echoes the class the clinician selects; it does not examine the patient, measure atlantoaxial
subluxation or the cervicomedullary angle, or recommend fusion. The MCP adapter + golden-probe promotion follow
in the next wave (320).

# spec-v355.md — Lachman test grade (ACL laxity) tile

> Status: **SHIPPED (2026-07-16).** Builds the `lachman-acl` tile — the Lachman test grade of anterior
> cruciate ligament (ACL) laxity (grades I–III). Catalog **1206 → 1207**, group G.

## Why

The catalog carries the knee ED decision rules (`ottawa-knee`, `pittsburgh-knee-rule`) but had no
ACL-laxity exam grade. The Lachman test is the standard bedside ACL-laxity maneuver; its grade combines
the anterior tibial translation (vs the uninjured knee) and the endpoint quality. `lachman test grade` /
`acl laxity grade` / `anterior tibial translation grade` routed to nothing.

## What it does

The clinician picks the laxity grade; the tile reports the grade, its translation/endpoint description,
and whether it is a higher (grade II–III) laxity.

- `lib/lachman-acl-v355.js` — pure grade → description. **I:** 0–5 mm, firm endpoint (mild). **II:** 6–10
  mm, soft endpoint (moderate) — flagged. **III:** 11–15 mm, no endpoint (severe) — flagged. Accepts
  I/II/III, 1–3, or 1+/2+/3+, case-insensitive.
- `views/group-v355.js` (RV355) — one select (dom `lachman-grade`), real `<label for>`.
- `lib/meta.js` — StatPearls / IKDC grading convention citation + accessed date + grouped bands. No
  citation-staleness row (the citation carries no guideline-issuer acronym).
- 5 worked-example unit tests + fuzz registration; synonym entry (v76 → v77); corpus → 1207.

**HIGH-STAKES:** it reports the Lachman grade the clinician has determined on examination, never a
diagnosis (partial vs complete ACL tear), an imaging substitute, or a treatment decision
([spec-v11](spec-v11.md) §5.3). The grade is one exam finding; 5 mm or more of translation is highly
suggestive of a complete ACL tear, but MRI and the overall clinical picture decide management, which
stays with the treating clinician (surfaced in the tile note).

## Sourcing (spec-v97)

- **Grading:** anterior tibial translation vs the contralateral knee plus endpoint quality, per StatPearls
  (Lachman Test, NCBI Bookshelf) and the IKDC knee-examination convention: I 0–5 mm firm, II 6–10 mm soft,
  III 11–15 mm no endpoint.
- Cross-verified against Physiopedia and standard sports-medicine examination references reproducing the
  same three-grade translation + endpoint bands.

## Verification

Lint (all catalog-truth surfaces at 1207), unit suite (+5 + fuzz), build — all green. Verified in a real
browser: the example (grade II) renders the "6–10 mm / soft endpoint" warn description, grade I flips to
the "0–5 mm / firm endpoint" description, and the tile does not scroll horizontally at 320px.

## Out of scope

The tile echoes the grade the clinician selects; it does not perform the maneuver, measure translation,
or diagnose an ACL tear. The MCP adapter + golden-probe promotion follow in a separate wave.

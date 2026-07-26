# spec-v469.md — Steinbrocker functional class (rheumatoid arthritis) tile

> Status: **SHIPPED (2026-07-19).** Builds the `steinbrocker-ra` tile — the Steinbrocker functional
> classification of rheumatoid arthritis, classes I/II/III/IV. Catalog **1319 → 1320**, group G.

## Why

The catalog had RA disease-activity indices (DAS28, CDAI, SDAI) but no functional-status classification.
`steinbrocker` / `rheumatoid arthritis functional class` routed to nothing. This fills the RA functional-status
gap.

## What it does

The clinician picks the class; the tile reports the class and its functional-capacity description.

- `lib/steinbrocker-ra-v469.js` — pure class → description, the four Steinbrocker functional classes. **I:**
  complete capacity, all usual duties. **II:** adequate for normal activities despite discomfort or limited
  joint mobility. **III:** adequate for little or none of the usual occupation or self-care. **IV:** largely or
  wholly incapacitated. Accepts I-IV and 1-4.
- `views/group-v469.js` (RV469) — one select (dom `steinbrocker-class`), real `<label for>`.
- `lib/meta.js` — Steinbrocker 1949 (JAMA) citation + accessed date + grouped bands. No citation-staleness row
  (the citation carries no guideline-issuer acronym — the original JAMA paper, not the ACR revision).
- 6 worked-example unit tests + fuzz registration; synonym entry (v189 → v190); corpus → 1320.

**HIGH-STAKES:** it reports the functional class the clinician has determined, never a diagnosis, a treatment
decision, or a prognosis ([spec-v11](spec-v11.md) §5.3); the management decision stays with the rheumatology
team.

## Sourcing (spec-v97)

- **Citation:** Steinbrocker O, Traeger CH, Batterman RC. Therapeutic criteria in rheumatoid arthritis. *JAMA.*
  1949;140(8):659-662. The citation URL is a PubMed term search for the classic paper.
- Cross-verified against rheumatology references reproducing the same complete (I) / adequate-despite-handicap
  (II) / limited-occupation-or-self-care (III) / incapacitated (IV) functional grouping. The ACR revised the
  wording in 1991 (self-care / vocational / avocational activities); this tile uses the original Steinbrocker
  classes and notes the ACR revision.

## Verification

Lint (all catalog-truth surfaces at 1320), unit suite (+6 + fuzz), build — all green. Verified in a real
browser: class II renders "adequate for normal activities despite the handicap," the other classes flip to
their descriptions; the tile does not scroll horizontally at 320px.

## Out of scope

The tile echoes the class the clinician selects; it does not assess the patient or recommend management, and it
does not implement the ACR 1991 self-care/vocational/avocational wording. The MCP adapter + golden-probe
promotion follow in the next wave (294).

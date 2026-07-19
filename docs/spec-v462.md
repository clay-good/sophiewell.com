# spec-v462.md — GMFCS level (cerebral palsy gross motor function) tile

> Status: **SHIPPED (2026-07-19).** Builds the `gmfcs` tile — the Gross Motor Function Classification System
> (GMFCS) for cerebral palsy, levels I/II/III/IV/V. Catalog **1312 → 1313**, group G.

## Why

The catalog had neonatal-encephalopathy staging (Sarnat) but no GMFCS — the standard functional classification
of gross motor ability in cerebral palsy, one of the most widely used pediatric-rehabilitation scales.
`gmfcs` / `gross motor function` routed to nothing. This fills that pediatric-neurology / rehabilitation gap.

## What it does

The clinician picks the level; the tile reports the level and its self-initiated-mobility description.

- `lib/gmfcs-v462.js` — pure level → description, the five GMFCS levels by self-initiated movement. **I:**
  walks without limitations. **II:** walks with limitations. **III:** walks using a hand-held mobility device.
  **IV:** self-mobility with limitations, may use powered mobility. **V:** transported in a manual wheelchair.
  Accepts I-V and 1-5.
- `views/group-v462.js` (RV462) — one select (dom `gmfcs-level`), real `<label for>`.
- `lib/meta.js` — Palisano 1997 (Dev Med Child Neurol) citation + accessed date + grouped bands. No
  citation-staleness row (the citation carries no guideline-issuer acronym).
- 7 worked-example unit tests + fuzz registration; synonym entry (v182 → v183); corpus → 1313.

**HIGH-STAKES:** it reports the functional level the clinician has determined, never a diagnosis, a treatment
decision, or a prognosis ([spec-v11](spec-v11.md) §5.3); the management decision stays with the
pediatric-neurology / rehabilitation team.

## Sourcing (spec-v97)

- **Citation:** Palisano R, Rosenbaum P, Walter S, Russell D, Wood E, Galuppi B. Development and reliability of
  a system to classify gross motor function in children with cerebral palsy. *Dev Med Child Neurol.*
  1997;39(4):214-223.
- Cross-verified against GMFCS-E&R references reproducing the same walks-without-limitation (I) /
  walks-with-limitation (II) / hand-held-device (III) / self-mobility-or-powered (IV) / transported (V)
  grouping. The tile uses the general level descriptors (the full system also gives age-band-specific
  descriptions).

## Verification

Lint (all catalog-truth surfaces at 1313), unit suite (+7 + fuzz), build — all green. Verified in a real
browser: level III renders "walks using a hand-held mobility device," the other levels flip to their
descriptions; the tile does not scroll horizontally at 320px.

## Out of scope

The tile echoes the level the clinician selects; it does not assess the child or give the age-band-specific
descriptors. The MCP adapter + golden-probe promotion follow in the next wave (287).

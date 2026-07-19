# spec-v434.md — Pfirrmann disc degeneration grade tile

> Status: **SHIPPED (2026-07-19).** Builds the `pfirrmann-disc` tile — the Pfirrmann classification of lumbar
> intervertebral disc degeneration on MRI, grades I/II/III/IV/V. Catalog **1285 → 1286**, group G.

## Why

The catalog gained the Modic endplate classification ([spec-v433](spec-v433.md)) but had no Pfirrmann grade —
the standard MRI grading of disc degeneration itself. `pfirrmann grade` / `disc degeneration grade` routed to
nothing. This continues the spine-MRI cluster.

## What it does

The radiologist picks the grade; the tile reports the grade and its MRI description.

- `lib/pfirrmann-disc-v434.js` — pure grade → description, the five Pfirrmann grades on T2 MRI by disc
  structure, nucleus-annulus distinction, signal, and height. **I:** homogeneous bright, normal. **II:**
  inhomogeneous bright, normal. **III:** gray, unclear distinction. **IV:** gray to black, lost distinction.
  **V:** black, collapsed disc space. Accepts I-V and 1-5.
- `views/group-v434.js` (RV434) — one select (dom `pfirrmann-grade`), real `<label for>`.
- `lib/meta.js` — Pfirrmann 2001 (Spine) citation + accessed date + grouped bands. No citation-staleness row
  (the citation carries no guideline-issuer acronym).
- 7 worked-example unit tests + fuzz registration; synonym entry (v155 → v156); corpus → 1286.

**HIGH-STAKES:** it reports the imaging grade the radiologist has determined, never a diagnosis, a treatment
decision, or a prognosis ([spec-v11](spec-v11.md) §5.3); the clinical decision stays with the treating team.

## Sourcing (spec-v97)

- **Citation:** Pfirrmann CW, Metzdorf A, Zanetti M, Hodler J, Boos N. Magnetic resonance classification of
  lumbar intervertebral disc degeneration. *Spine (Phila Pa 1976).* 2001;26(17):1873-1878.
- Cross-verified against radiology / spine references reproducing the same homogeneous-bright (I) to
  collapsed-black (V) grading.

## Verification

Lint (all catalog-truth surfaces at 1286), unit suite (+7 + fuzz), build — all green. Verified in a real
browser: grade III renders "inhomogeneous gray, unclear ...," the other grades flip to their descriptions; the
tile does not scroll horizontally at 320px.

## Out of scope

The tile echoes the grade the radiologist selects; it does not read the MRI, add the Modic endplate type, or
estimate clinical significance. The MCP adapter + golden-probe promotion follow in a separate wave.

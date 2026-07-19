# spec-v433.md — Modic changes (vertebral endplate MRI) tile

> Status: **SHIPPED (2026-07-18).** Builds the `modic-changes` tile — the Modic classification of vertebral
> endplate / subchondral bone-marrow changes on MRI, types 1/2/3. Catalog **1284 → 1285**, group G.

## Why

The catalog's spine tiles (Meyerding spondylolisthesis, Risser sign) had no Modic classification — the
standard descriptor of vertebral endplate marrow changes on spine MRI. `modic changes` / `modic type` routed
to nothing. This fills that radiology / spine gap.

## What it does

The radiologist picks the type; the tile reports the type and its T1/T2 signal description.

- `lib/modic-changes-v433.js` — pure type → signal, the three base Modic types. **1:** bone-marrow edema /
  inflammation (T1 hypointense, T2 hyperintense). **2:** fatty (yellow) marrow (T1 hyperintense, T2 iso- to
  hyperintense). **3:** subchondral bony sclerosis (T1 hypointense, T2 hypointense). Accepts 1-3 and I-III.
- `views/group-v433.js` (RV433) — one select (dom `modic-type`), real `<label for>`.
- `lib/meta.js` — Modic 1988 (Radiology) citation + accessed date + grouped bands. No citation-staleness row
  (the citation carries no guideline-issuer acronym).
- 5 worked-example unit tests + fuzz registration; synonym entry (v154 → v155); corpus → 1285.

**HIGH-STAKES:** it reports the imaging type the radiologist has determined, never a diagnosis, a treatment
decision, or a prognosis ([spec-v11](spec-v11.md) §5.3); the clinical decision stays with the treating team.

## Sourcing (spec-v97)

- **Citation:** Modic MT, Steinberg PM, Ross JS, Masaryk TJ, Carter JR. Degenerative disk disease: assessment
  of changes in vertebral body marrow with MR imaging. *Radiology.* 1988;166(1 Pt 1):193-199.
- Cross-verified against radiology / spine references reproducing the same edema (1) / fatty (2) / sclerotic
  (3) signal pattern. Mixed types (1/2, 2/3) are described when features coexist; the base three types are the
  standard reporting units.

## Verification

Lint (all catalog-truth surfaces at 1285), unit suite (+5 + fuzz), build — all green. Verified in a real
browser: type 1 renders "edema / inflammation ... T1 hypointense, T2 hyperintense," the other types flip to
their signals; the tile does not scroll horizontally at 320px.

## Out of scope

The tile echoes the type the radiologist selects; it does not read the MRI, capture mixed types, or estimate
clinical significance. The MCP adapter + golden-probe promotion follow in a separate wave.

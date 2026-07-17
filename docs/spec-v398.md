# spec-v398.md — Carpentier classification (mitral regurgitation) tile

> Status: **SHIPPED (2026-07-17).** Builds the `carpentier-mr` tile — the Carpentier functional
> classification of mitral regurgitation (types I/II/IIIa/IIIb). Catalog **1249 → 1250**, group G.

## Why

The catalog just gained the El Khoury repair-oriented classification of aortic regurgitation, whose own
note names it "the aortic analog of Carpentier's mitral classification." Its mitral complement — the
Carpentier "French correction" functional classification of mitral regurgitation — was still missing.
`carpentier` / `mitral regurgitation mechanism` routed to nothing. This is the El-Khoury↔Carpentier
aortic-mitral companion-gap.

## What it does

The clinician picks the type; the tile reports the type and its mechanism description.

- `lib/carpentier-mr-v398.js` — pure type → description. **I:** normal leaflet motion (annular dilatation
  or perforation). **II:** excessive motion (prolapse or flail). **IIIa:** restricted motion in both
  systole and diastole (structural, e.g. rheumatic). **IIIb:** restricted motion in systole only
  (functional / ischemic). Accepts I/II/IIIa/IIIb, 1/2, and 3a/3b; bare `III` is ambiguous → invalid.
- `views/group-v398.js` (RV398) — one select (dom `carp-type`), real `<label for>`.
- `lib/meta.js` — Carpentier 1983 (J Thorac Cardiovasc Surg) citation + accessed date + grouped bands. No
  citation-staleness row (the citation carries no guideline-issuer acronym).
- 5 worked-example unit tests + fuzz registration; synonym entry (v119 → v120); corpus → 1250.

**HIGH-STAKES:** it reports the functional type the clinician has determined from the echocardiogram, never
a diagnosis, a treatment decision, or a prognosis ([spec-v11](spec-v11.md) §5.3). The type guides the
repair strategy, but the management decision stays with the cardiology / cardiac-surgery team.

## Sourcing (spec-v97)

- **Citation:** Carpentier A. Cardiac valve surgery — the "French correction." *J Thorac Cardiovasc Surg.*
  1983;86(3):323-337 (the type I / II / III functional classification of mitral regurgitation).
- Cross-verified against cardiology / cardiac-surgery / echocardiography references reproducing the same
  normal-motion (I) / excessive-motion (II) / restricted-motion (III, split IIIa structural and IIIb
  functional) grouping.

## Verification

Lint (all catalog-truth surfaces at 1250), unit suite (+5 + fuzz), build — all green. Verified in a real
browser: type II renders "excessive leaflet motion / prolapse," type IIIa flips to "structural restriction
in systole and diastole," type IIIb to "functional restriction in systole only," and the tile does not
scroll horizontally at 320px.

## Out of scope

The tile echoes the type the clinician selects; it does not read the echocardiogram, resolve the IIIa/IIIb
split from imaging, or recommend a repair technique. The MCP adapter + golden-probe promotion follow in a
separate wave.

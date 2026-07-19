# spec-v442.md — Zabramski classification (cerebral cavernous malformation) tile

> Status: **SHIPPED (2026-07-19).** Builds the `zabramski` tile — the Zabramski classification of a cerebral
> cavernous malformation, types I/II/III/IV. Catalog **1293 → 1294**, group G.

## Why

The catalog's neurovascular tiles (Barrow CCF, Borden DAVF, Spetzler-Ponce AVM) had no Zabramski type — the
standard MRI classification of a cavernoma. `zabramski` / `cavernous malformation type` routed to nothing.
This continues the neuro-imaging cluster.

## What it does

The radiologist picks the type; the tile reports the type and its MRI description.

- `lib/zabramski-v442.js` — pure type → description, the four Zabramski types by MRI appearance. **I:**
  subacute hemorrhage (hyperintense on T1/T2). **II:** classic popcorn/mulberry with a hemosiderin rim. **III:**
  chronic hemorrhage (iso- to hypointense). **IV:** punctate microhemorrhages seen only on GRE/SWI. Accepts
  I-IV and 1-4.
- `views/group-v442.js` (RV442) — one select (dom `zabramski-type`), real `<label for>`.
- `lib/meta.js` — Zabramski 1994 (J Neurosurg) citation + accessed date + grouped bands. No citation-staleness
  row (the citation carries no guideline-issuer acronym).
- 6 worked-example unit tests + fuzz registration; synonym entry (v163 → v164); corpus → 1294.

**HIGH-STAKES:** it reports the imaging type the radiologist has determined, never a diagnosis, a treatment
decision, or a prognosis ([spec-v11](spec-v11.md) §5.3); the management decision stays with the neurosurgery /
neuroradiology team.

## Sourcing (spec-v97)

- **Citation:** Zabramski JM, Wascher TM, Spetzler RF, et al. The natural history of familial cavernous
  malformations: results of an ongoing study. *J Neurosurg.* 1994;80(3):422-432.
- Cross-verified against neuroradiology references reproducing the same subacute-hyperintense (I) /
  popcorn-with-hemosiderin-rim (II) / chronic-hypointense (III) / punctate-GRE-only (IV) grouping.

## Verification

Lint (all catalog-truth surfaces at 1294), unit suite (+6 + fuzz), build — all green. Verified in a real
browser: type II renders "hemosiderin rim," the other types flip to their descriptions; the tile does not
scroll horizontally at 320px.

## Out of scope

The tile echoes the type the radiologist selects; it does not read the MRI, count lesions, or estimate
hemorrhage risk. The MCP adapter + golden-probe promotion follow in a separate wave.

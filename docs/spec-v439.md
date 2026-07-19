# spec-v439.md — Hamada grade (cuff tear arthropathy) tile

> Status: **SHIPPED (2026-07-19).** Builds the `hamada` tile — the Hamada classification of rotator cuff tear
> arthropathy, grades 1/2/3/4/5. Catalog **1290 → 1291**, group G.

## Why

The catalog gained the Goutallier fatty-infiltration grade ([spec-v437](spec-v437.md)) but had no Hamada grade
— the standard radiographic staging of cuff tear arthropathy. `hamada` / `cuff tear arthropathy grade` routed
to nothing. This continues the shoulder-imaging cluster.

## What it does

The clinician picks the grade; the tile reports the grade and its radiographic description.

- `lib/hamada-v439.js` — pure grade → description, the original Hamada (1990) five-grade scheme. **1:**
  acromiohumeral interval (AHI) ≥ 6 mm. **2:** AHI ≤ 5 mm. **3:** AHI ≤ 5 mm with acetabularization. **4:**
  glenohumeral arthritis. **5:** humeral head collapse. Accepts 1-5.
- `views/group-v439.js` (RV439) — one select (dom `hamada-grade`), real `<label for>`.
- `lib/meta.js` — Hamada 1990 (Clin Orthop Relat Res) citation + accessed date + grouped bands. No
  citation-staleness row (the citation carries no guideline-issuer acronym).
- 6 worked-example unit tests + fuzz registration; synonym entry (v160 → v161); corpus → 1291.

**HIGH-STAKES:** it reports the radiographic grade the clinician has determined, never a diagnosis, a
treatment decision, or a prognosis ([spec-v11](spec-v11.md) §5.3); the management decision stays with the
orthopedic / shoulder team.

## Sourcing (spec-v97)

- **Citation:** Hamada K, Fukuda H, Mikasa M, Kobayashi Y. Roentgenographic findings in massive rotator cuff
  tears. A long-term observation. *Clin Orthop Relat Res.* 1990;(254):92-96.
- Cross-verified against radiology / orthopedic references reproducing the same AHI≥6 (1) / AHI≤5 (2) /
  acetabularization (3) / glenohumeral-arthritis (4) / humeral-head-collapse (5) grading. This reports the
  original scheme; a later modification subdivides grade 4 into 4A/4B and is out of scope.

## Verification

Lint (all catalog-truth surfaces at 1291), unit suite (+6 + fuzz), build — all green. Verified in a real
browser: grade 1 renders "acromiohumeral interval (AHI) 6 mm or more," the other grades flip to their
descriptions; the tile does not scroll horizontally at 320px.

## Out of scope

The tile echoes the grade the clinician selects; it does not read the radiograph, apply the modified 4A/4B
subdivision, or recommend management. The MCP adapter + golden-probe promotion follow in a separate wave.

# spec-v436.md — Biffl grade (blunt cerebrovascular injury) tile

> Status: **SHIPPED (2026-07-19).** Builds the `biffl-bcvi` tile — the Biffl (Denver) grading scale for blunt
> cerebrovascular injury, grades I/II/III/IV/V. Catalog **1287 → 1288**, group G.

## Why

The catalog had the expanded Denver *screening* criteria (`denver-bcvi`, who to image) but no Biffl injury
*grade* — the angiographic severity grading that follows a positive screen. `biffl grade` / `BCVI injury
grade` routed to nothing. This companions the screening tile.

## What it does

The clinician picks the grade; the tile reports the grade and its angiographic description.

- `lib/biffl-bcvi-v436.js` — pure grade → description, the five Biffl grades. **I:** luminal irregularity or
  dissection < 25% narrowing. **II:** dissection / hematoma ≥ 25% narrowing, thrombus, or raised intimal flap.
  **III:** pseudoaneurysm. **IV:** occlusion. **V:** transection with free extravasation. Accepts I-V and 1-5.
- `views/group-v436.js` (RV436) — one select (dom `biffl-grade`), real `<label for>`.
- `lib/meta.js` — Biffl 1999 (J Trauma) citation + accessed date + grouped bands. No citation-staleness row
  (the citation carries no guideline-issuer acronym).
- 7 worked-example unit tests + fuzz registration; synonym entry (v157 → v158); corpus → 1288.

**HIGH-STAKES:** it reports the angiographic injury grade the clinician has determined, never a diagnosis, a
treatment decision (antithrombotic, endovascular, surgical), or a prognosis ([spec-v11](spec-v11.md) §5.3);
the management decision stays with the trauma / neurosurgery / neurointervention team.

## Sourcing (spec-v97)

- **Citation:** Biffl WL, Moore EE, Offner PJ, Brega KE, Franciose RJ, Burch JM. Blunt carotid arterial
  injuries: implications of a new grading scale. *J Trauma.* 1999;47(5):845-853.
- Cross-verified against trauma / neuroradiology references reproducing the same irregularity (I) /
  dissection-with-stenosis (II) / pseudoaneurysm (III) / occlusion (IV) / transection (V) grading.

## Verification

Lint (all catalog-truth surfaces at 1288), unit suite (+7 + fuzz), build — all green. Verified in a real
browser: grade III renders "pseudoaneurysm," the other grades flip to their descriptions; the tile does not
scroll horizontally at 320px.

## Out of scope

The tile echoes the grade the clinician selects; it does not read the angiogram, screen for BCVI (that is
`denver-bcvi`), or choose therapy. The MCP adapter + golden-probe promotion follow in a separate wave.

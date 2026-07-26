# spec-v464.md — Crawford classification (thoracoabdominal aortic aneurysm) tile

> Status: **SHIPPED (2026-07-19).** Builds the `crawford-taaa` tile — the Crawford classification of
> thoracoabdominal aortic aneurysms, extents I/II/III/IV. Catalog **1314 → 1315**, group G.

## Why

The catalog carried the DeBakey aortic-dissection classification but had no Crawford grade — the standard
extent classification for thoracoabdominal aortic aneurysms, which drives open/endovascular repair planning.
`crawford` / `thoracoabdominal aortic aneurysm extent` routed to nothing. This companions the DeBakey tile
(aortic cluster).

## What it does

The clinician picks the extent; the tile reports the extent and its aortic-segment description.

- `lib/crawford-taaa-v464.js` — pure extent → description, the four Crawford extents. **I:** left subclavian to
  above the renals. **II:** left subclavian to the aortoiliac bifurcation (most extensive). **III:** distal
  descending thoracic (sixth intercostal space) to below the renals. **IV:** the entire abdominal aorta.
  Accepts I-IV and 1-4. The note records the Safi extent V modification (out of scope).
- `views/group-v464.js` (RV464) — one select (dom `crawford-extent`), real `<label for>`.
- `lib/meta.js` — Crawford 1986 (J Vasc Surg) citation + accessed date + grouped bands. No citation-staleness
  row (the citation carries no guideline-issuer acronym).
- 6 worked-example unit tests + fuzz registration; synonym entry (v184 → v185); corpus → 1315.

**HIGH-STAKES:** it reports the anatomic extent the clinician has determined from imaging, never a diagnosis, a
treatment decision, or a prognosis ([spec-v11](spec-v11.md) §5.3); the management decision stays with the
vascular / cardiac-surgery team.

## Sourcing (spec-v97)

- **Citation:** Crawford ES, Crawford JL, Safi HJ, et al. Thoracoabdominal aortic aneurysms: preoperative and
  intraoperative factors determining immediate and long-term results of operations in 605 patients. *J Vasc
  Surg.* 1986;3(3):389-404. The citation URL is a PubMed term search for the classic paper.
- Cross-verified against vascular-surgery references reproducing the same four extents. The Safi modification
  later added an extent V (distal descending thoracic to above the renals); this tile ships the four original
  Crawford extents and notes V.

## Verification

Lint (all catalog-truth surfaces at 1315), unit suite (+6 + fuzz), build — all green. Verified in a real
browser: extent II renders "the most extensive, involving the entire thoracoabdominal aorta," the other
extents flip to their descriptions; the tile does not scroll horizontally at 320px.

## Out of scope

The tile echoes the extent the clinician selects; it does not read the CT or recommend management (open vs
endovascular). The MCP adapter + golden-probe promotion follow in the next wave (289).

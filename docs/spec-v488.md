# spec-v488.md — Bigliani classification (acromion morphology) tile

> Status: **SHIPPED (2026-07-19).** Builds the `bigliani-acromion` tile — the Bigliani classification of
> acromion morphology, types I/II/III. Catalog **1338 → 1339**, group G.

## Why

The shoulder tiles (Goutallier, Hamada, Samilson-Prieto, Rockwood AC) had no acromion-morphology
classification — a factor in subacromial impingement. `bigliani` / `acromion morphology` routed to nothing.
This fills that shoulder gap.

## What it does

The clinician picks the type; the tile reports the type and its acromial-undersurface description.

- `lib/bigliani-acromion-v488.js` — pure type → description, the three Bigliani types. **I:** flat. **II:**
  curved (paralleling the humeral head). **III:** hooked (anterior hook), most associated with impingement and
  cuff tears. Accepts I-III and 1-3.
- `views/group-v488.js` (RV488) — one select (dom `bigliani-type`), real `<label for>`.
- `lib/meta.js` — Bigliani 1986 (Orthop Trans) citation + accessed date + grouped bands. No citation-staleness
  row (a named-author reference, no guideline-issuer acronym).
- 5 worked-example unit tests + fuzz registration; synonym entry (v208 → v209); corpus → 1339.

**HIGH-STAKES:** it reports the imaging type the clinician has determined, never a diagnosis, a treatment
decision, or a prognosis ([spec-v11](spec-v11.md) §5.3); the management decision stays with the orthopedic team.

## Sourcing (spec-v97)

- **Citation:** Bigliani LU, Morrison DS, April EW. The morphology of the acromion and its relationship to
  rotator cuff tears. *Orthop Trans.* 1986;10:228. The citation URL is a PubMed term search.
- Cross-verified against shoulder references reproducing the same flat (I) / curved (II) / hooked (III)
  acromial-undersurface grouping; the hooked type is most associated with impingement and cuff tears.

## Verification

Lint (all catalog-truth surfaces at 1339), unit suite (+5 + fuzz), build — all green. Verified in a real
browser: type II renders "a curved acromion," the other types flip to their descriptions; the tile does not
scroll horizontally at 320px.

## Out of scope

The tile echoes the type the clinician selects; it does not read the radiograph or recommend management
(acromioplasty). The MCP adapter + golden-probe promotion follow in the next wave (313).

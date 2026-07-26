# spec-v486.md — Samilson-Prieto grade (shoulder dislocation arthropathy) tile

> Status: **SHIPPED (2026-07-19).** Builds the `samilson-prieto` tile — the Samilson-Prieto classification of
> dislocation arthropathy of the shoulder, mild/moderate/severe. Catalog **1336 → 1337**, group G.

## Why

The shoulder tiles (Hamada cuff-tear arthropathy, Goutallier fatty infiltration) had no post-instability
glenohumeral OA grade. `samilson` / `dislocation arthropathy shoulder` routed to nothing. This fills that
shoulder gap.

## What it does

The clinician picks the grade; the tile reports the grade and its inferior-osteophyte-size description.

- `lib/samilson-prieto-v486.js` — pure grade → description. **Mild:** osteophyte less than 3 mm. **Moderate:**
  3 to 7 mm, with slight joint irregularity. **Severe:** greater than 7 mm, with joint-space narrowing and
  sclerosis. Accepts mild/moderate/severe (and 1-3 / I-III aliases).
- `views/group-v486.js` (RV486) — one select (dom `samilson-grade`), real `<label for>`.
- `lib/meta.js` — Samilson & Prieto 1983 (J Bone Joint Surg Am) citation + accessed date + grouped bands. No
  citation-staleness row (a named-author journal article, no guideline-issuer acronym).
- 5 worked-example unit tests + fuzz registration; synonym entry (v206 → v207); corpus → 1337.

**HIGH-STAKES:** it reports the radiographic grade the clinician has determined, never a diagnosis, a treatment
decision, or a prognosis ([spec-v11](spec-v11.md) §5.3); the management decision stays with the orthopedic team.

## Sourcing (spec-v97)

- **Citation:** Samilson RL, Prieto V. Dislocation arthropathy of the shoulder. *J Bone Joint Surg Am.*
  1983;65(4):456-460. The citation URL is a PubMed term search.
- Cross-verified against shoulder references reproducing the same osteophyte-<3mm (mild) /
  3-7mm-with-irregularity (moderate) / >7mm-with-narrowing-and-sclerosis (severe) grouping.

## Verification

Lint (all catalog-truth surfaces at 1337), unit suite (+5 + fuzz), build — all green. Verified in a real
browser: moderate renders "an inferior osteophyte 3 to 7 mm," the other grades flip to their descriptions; the
tile does not scroll horizontally at 320px.

## Out of scope

The tile echoes the grade the clinician selects; it does not read the radiograph or recommend management. The
MCP adapter + golden-probe promotion follow in the next wave (311).

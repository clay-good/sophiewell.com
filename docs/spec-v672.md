# spec-v672.md — Minimal Disease Activity (MDA) in psoriatic arthritis

> Status: **SHIPPED (2026-08-08).** Builds the `mda-psoriatic` tile. Catalog **1502 → 1503**, group G.

## Why

The catalog ships the psoriatic-arthritis screening and activity tiles (`caspar`, `dapsa`, `pest`) but not
the MDA treat-to-target state — the outcome most PsA trials and treat-to-target strategies actually report.
MDA is the composite target; VLDA (all criteria met) is its stringent form.

## What it does

Counts how many of **7 criteria** are met; **≥ 5 of 7 = MDA**, **7 of 7 = VLDA**:

| # | Criterion | Cutoff |
| --- | --- | --- |
| 1 | Tender joint count (68-joint) | ≤ 1 |
| 2 | Swollen joint count (66-joint) | ≤ 1 |
| 3 | Psoriasis: PASI **or** BSA | PASI ≤ 1 **or** BSA ≤ 3% |
| 4 | Patient pain (0–100 mm VAS) | ≤ 15 |
| 5 | Patient global disease activity (0–100 mm VAS) | ≤ 20 |
| 6 | HAQ | ≤ 0.5 |
| 7 | Tender entheseal points | ≤ 1 |

## Posture (spec-v97)

Because PASI and HAQ are themselves scored instruments and the skin item is an either/or, each criterion is
confirmed **met/not-met** rather than recomputed here (the standard operationalization). The result flags that
the pain and global scores are **0–100 mm** scales, not 0–10, and that MDA excludes acute-phase reactants and
axial disease. MDA is a treatment target that informs care, not by itself an order to change therapy.

## Files

- `lib/mda-psoriatic-v672.js` — `mdaPsoriatic()`, `MDA_NOTE`.
- `views/group-v672.js` (RV672) — seven criterion checkboxes; a11y-checked, no innerHTML, no network.
- `mcp/adapters/mda-psoriatic-v672.js` — exposes the tile (clinical disclaimer).
- `lib/meta.js` — citation, example, interpretation, specialties, related.
- `test/unit/mda-psoriatic.test.js` — 6 tests (VLDA at 7/7, MDA at exactly 5/7, active at 4/7, empty case,
  worked 6/7 example, form/MCP truthy encodings).
- `docs/spec-v672.md` (this file).

## Sourcing (spec-v97)

Coates LC, Fransen J, Helliwell PS. Defining minimal disease activity in psoriatic arthritis: a proposed
objective target for treatment. *Ann Rheum Dis.* 2010;69(1):48-53 (PMID 19147615). A source-verification
subagent confirmed the seven cutoffs, the ≥ 5-of-7 MDA rule and 7-of-7 VLDA extension, the 68/66 joint counts,
the PASI-or-BSA skin alternative, and that the pain/global VAS are on 0–100 mm scales (cross-checked against
MDCalc and the GRAPPA/JRheum review literature).

# spec-v387.md — Dimeglio classification (clubfoot severity) tile

> Status: **SHIPPED (2026-07-17).** Builds the `dimeglio-clubfoot` tile — the Dimeglio classification of a
> clubfoot (total 0-20, grades I-IV). Catalog **1238 → 1239**, group G.

## Why

The catalog just gained the Pirani clubfoot score ([spec-v386](spec-v386.md)); its companion is the
Dimeglio classification — the other standard clubfoot-severity system, often used alongside Pirani during
Ponseti management. `dimeglio` / `clubfoot classification score` routed to nothing. This is the
Pirani↔Dimeglio companion-gap.

## What it does

The clinician scores the four reducibility parameters (each 0-4) and checks the four bonus features; the
tile reports the total (0-20), the reducibility/bonus subscores, and the grade (I-IV).

- `lib/dimeglio-clubfoot-v387.js` — pure sum. **Reducibility (0-16):** equinus, varus, derotation of the
  calcaneopedal block, forefoot adduction (each 0-4 by reducibility). **Bonus (0-4):** posterior crease,
  medial crease, cavus, muscle abnormality (1 each). Grade: 0 normal; 1-5 I (benign); 6-10 II (moderate);
  11-15 III (severe); 16-20 IV (very severe). Flags grade III-IV (total ≥ 11).
- `views/group-v387.js` (RV387) — four selects (dom `dim-equinus/varus/derotation/adduction`) + four
  checkboxes (dom `dim-pc/mc/cavus/muscle`), each with a real `<label for>`.
- `lib/meta.js` — Dimeglio 1995 (J Pediatr Orthop B) citation + accessed date + grouped bands. No
  citation-staleness row. The example (4/3/3/3, no bonus → 13, grade III) round-trips its numbers through
  the band; the four bonus flags are optional (default false), so a caller need not supply them.
- 6 worked-example unit tests + fuzz registration; synonym entry (v108 → v109); corpus → 1239.

**HIGH-STAKES:** it reports the Dimeglio score and grade from the parameters the clinician has assessed,
never a diagnosis, a treatment decision, or a prognosis ([spec-v11](spec-v11.md) §5.3). Higher = more
severe; the management decision stays with the treating orthopedic team.

## Sourcing (spec-v97)

- **Citation:** Dimeglio A, Bensahel H, Souchet P, Mazeau P, Bonnet F. Classification of clubfoot. *J
  Pediatr Orthop B.* 1995;4(2):129-136 (the four reducibility parameters, the bonus points, the 0-20
  grading).
- Cross-verified against clubfoot references reproducing the same four parameters and grade bands (1-5 I,
  6-10 II, 11-15 III, 16-20 IV).

## Verification

Lint (all catalog-truth surfaces at 1239), unit suite (+6 + fuzz), build — all green. Verified in a real
browser: the four selects + four checkboxes sum to the total, the grade updates across the boundaries, and
the tile does not scroll horizontally at 320px.

## Out of scope

The tile echoes the parameters the clinician scores; it does not measure the reducibility angles, read the
foot, or recommend treatment. The MCP adapter + golden-probe promotion follow in a separate wave.

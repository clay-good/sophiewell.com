# spec-v318.md — Los Angeles (LA) classification of erosive esophagitis tile

> Status: **SHIPPED (2026-07-15).** Builds the `la-esophagitis` tile — the Los Angeles (LA)
> classification that grades erosive (reflux) esophagitis A–D from the endoscopic mucosal-break
> findings. Catalog **1169 → 1170**, group G.

## Why

The catalog had no LA-grade tile — the "Los Angeles" corpus hits were all the LAMS stroke motor scale.
LA grade is the erosive-esophagitis peer of the existing endoscopic-grading tiles (e.g. `forrest`), the
standard way a GERD/reflux endoscopy is graded, and `la grade` / `erosive esophagitis grade` routed to
nothing.

## What it does

The endoscopist picks the grade (A–D); the tile reports the grade and its standard definition.

- `lib/la-esophagitis-v318.js` — pure input → grade + definition. **A:** break(s) ≤ 5 mm, not between two
  fold tops. **B:** break(s) > 5 mm, not between two fold tops. **C:** break(s) between ≥ 2 fold tops but
  < 75% circumference. **D:** break(s) ≥ 75% circumference. A–B mild, C–D severe.
- `views/group-v318.js` (RV318) — one select (Deauville-style), real `<label for>`.
- `lib/meta.js` — Lundell 1999 citation + accessed date + per-grade bands. No citation-staleness row (the
  Gut citation carries no guideline-issuer acronym).
- 6 worked-example unit tests + fuzz registration; synonym entry (v39 → v40); corpus → 1170.

**HIGH-STAKES:** it reports the classification grade the endoscopist has determined, never a diagnosis or
a treatment order ([spec-v11](spec-v11.md) §5.3).

## Sourcing (spec-v97)

Transcribed and cross-verified across agreeing sources:

- **Citation:** Lundell LR, Dent J, Bennett JR, et al. Endoscopic assessment of oesophagitis: clinical and
  functional correlates and further validation of the Los Angeles classification. *Gut.*
  1999;45(2):172-180. Cross-checked against the IWGCO LA classification (Armstrong 1996 / Lundell 1999).
- The four grades are defined by the **extent of mucosal breaks** as above; the 5 mm break-size and 75%
  circumference edges are stable and universally used.

## Verification

Lint (all catalog-truth surfaces at 1170), unit suite (+6 + fuzz), build — all green. Verified in a real
browser: the example (grade B) renders the "> 5 mm … not extending between the tops of two mucosal folds"
definition, and selecting grade D flips the result to the severe ≥ 75% circumference band.

## Out of scope

The tile echoes the grade the endoscopist selects; it does not grade the images, diagnose GERD, classify
non-erosive reflux (a normal-appearing mucosa is not graded here), or stage Barrett esophagus. The MCP
adapter + golden-probe promotion follow in a separate wave.

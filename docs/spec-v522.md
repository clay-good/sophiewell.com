# spec-v522.md — PCDAI (Pediatric Crohn Disease Activity Index) tile

> Status: **SHIPPED (2026-07-27).** Builds the `pcdai` tile — the eleven-item pediatric Crohn's activity
> index, total 0-100. Catalog **1371 → 1372**, group G.

## Why

`pcdai` and `hyams` were zero-hit across `corpus.json`, `app.js`, and `lib/meta.js`.

**Age-band + disease companion gap.** Every Crohn's instrument in the catalog is validated in **adults**
(`cdai-crohns`, `harvey-bradshaw`, `ses-cd`, `rutgeerts`), and the one pediatric IBD index present is
`pucai`, which is **ulcerative colitis**. The PCDAI fills the corner neither covers — and it is not the adult
CDAI with a child's weight plugged in. It deliberately **adds growth parameters and lab measures** and
**down-weights the subjective items**, because Crohn's disease in a child can do its worst damage to growth
while the gut symptoms look mild.

## What it does

Eleven items, total **0-100**. **The weights are not uniform, and that is the thing to get right:**

| Group | Items | Each scores |
| --- | --- | --- |
| History (pain, stools, well-being) | 3 | 0 / 5 / 10 |
| Exam and growth (weight, height, abdomen, perirectal, extra-intestinal) | 5 | 0 / 5 / 10 |
| Hematocrit, ESR | 2 | **0 / 2.5 / 5** |
| Albumin | 1 | **0 / 5 / 10** |

`8 × 10 + 5 + 5 + 10 = 100`. Treating all three labs as half weight caps the index at **95**; treating all
three as full weight caps it at **110**. Both are wrong and both are easy, so albumin's odd-one-out weighting
is called out in the copy and pinned by two tests.

**The hematocrit threshold depends on age and sex.** There is no single "low hematocrit" cut: 34% is a
perfect 0 in a girl of 12 and worth 2.5 points in a boy of 12. The tile therefore asks for the age/sex band
**explicitly** rather than hiding it, because scoring every child against one threshold is the specific error
that item exists to prevent. A test walks all sixteen published band edges.

| Band | 0 pts | 2.5 pts | 5 pts |
| --- | --- | --- | --- |
| 10 years or younger | ≥33 | 28-32 | <28 |
| Male 11-14 | ≥35 | 30-34 | <30 |
| Male 15-19 | ≥37 | 32-36 | <32 |
| Female 11-19 | ≥34 | 29-33 | <29 |

ESR: <20 → 0, 20-50 → 2.5, >50 → 5. Albumin: ≥3.5 → 0, 3.1-3.4 → 5, ≤3.0 → 10.

**Values between the printed rows.** The published tables leave gaps at finer precision — a hematocrit of
32.5, an albumin of 3.45 — that fall in no printed row. The lib documents the only reading that closes the
scale *without moving a published edge* (drop to the next band down), and a test pins it.

**The band edges are stated inconsistently in reproductions** ("0-10 inactive, 10-30 mild" puts 10 in both).
Scores move in steps of 2.5, so exactly 10 and exactly 30 are reachable and the boundary is not academic.
The tile follows the cut scores Hyams and colleagues **recommended** in the 2005 prospective evaluation —
**below 10** inactive, **30 or above** moderate-to-severe — and says that is the convention it follows rather
than presenting it as the only reading.

- `lib/pcdai-v522.js` — pure inputs → total, clinical subtotal, lab subtotal, per-lab points, activity band.
  Exports `PCDAI_ITEMS` and `HCT_BANDS`.
- `views/group-v522.js` (RV522) — eight selects, the band select, and three number inputs under three **h2**
  headings following the index's own three fields.
- `lib/meta.js` — Hyams 1991 citation + accessed date + bands, related to `pucai`, `cdai-crohns`,
  `harvey-bradshaw`. No citation-staleness row (a named-author article, no guideline-issuer acronym).
- 14 worked-example unit tests + fuzz registration; synonym entry; corpus → 1372.

**HIGH-STAKES:** a disease-activity index, not a diagnosis and not a treatment plan. It does not diagnose
Crohn's disease, does not describe disease **location or behavior** (that is the Paris classification), does
not measure **mucosal healing** — a child can score in the inactive range with active endoscopic
inflammation, so it is not a substitute for endoscopy — and is not an indication to start, stop, escalate, or
de-escalate any therapy ([spec-v11](spec-v11.md) §5.3). The growth items need serial measurements plotted
against a standard curve, not a single visit.

## Duplicate check

Per the procedure in [spec-v508](spec-v508.md): the abbreviation (`pcdai`) and the first author (`hyams`)
against **both** `corpus.json` and `app.js` (and `lib/meta.js`), plus a `test/unit/` scan. Both zero. The
adult and ulcerative-colitis neighbors are present and are addressed above.

## Sourcing (spec-v97)

- **Citation:** Hyams JS, Ferry GD, Mandel FS, et al. Development and validation of a pediatric Crohn's
  disease activity index. *J Pediatr Gastroenterol Nutr.* 1991;12(4):439-447.
- Every threshold was transcribed from **two independent pediatric Crohn's trial protocols** reproducing the
  complete PCDAI appendix table (one attributing it to Hyams 1991), which agree **cell for cell** on all four
  hematocrit bands, the ESR cut points, the albumin cut points, and the weight and height option wording.
- Cut scores from Hyams JS, Markowitz J, Otley A, et al. Evaluation of the pediatric Crohn disease activity
  index: a prospective multicenter experience. *J Pediatr Gastroenterol Nutr.* 2005;41(4):416-421, which also
  independently confirms the 0/5/10-except-hematocrit-and-ESR weighting and the 0-100 range.

## Verification

Lint (all catalog-truth surfaces at 1372), unit suite (+14 + fuzz), a11y, build, and the chromium
heading-level check — all green.

## Out of scope

The tile does not compute the abbreviated or weighted short PCDAI variants, apply the Paris classification,
convert a height velocity into an SD score (it takes the SD reading as scored), or recommend therapy. The MCP
adapter + golden-probe promotion follow in the next wave (347).

# spec-v177.md — Frailty & sarcopenia: Clinical Frailty Scale, SARC-F, SARC-CalF, PRISMA-7, SOF index, GFI, Edmonton Frail Scale (+7 tiles)

> Status: **PROPOSED (2026-06-24).** Feature spec of the
> [spec-v172](spec-v172.md) **Long-Term Care & Geriatric Assessment (LTC-GA)**
> program (§3.5). Adds **7** deterministic frailty / sarcopenia case-finding and
> staging instruments that fill confirmed long-term-care gaps. None duplicates a
> live tile.
>
> Catalog effect at v177: **live `UTILITIES.length` + 7 tiles** — never a number
> copied from this document (the running counts carry a known off-by-one that the
> catalog-truth gate enforces, per the [spec-v100](spec-v100.md) program lessons).
>
> Every prior spec (v4 through v176) remains in force. v177 adds no runtime
> network call and no AI; each tile obeys the [spec-v100](spec-v100.md) §2
> doctrine (re-binding [spec-v85](spec-v85.md) §2) — including the §2
> **classification-tile clarification** (a tile *consumes the clinician's
> observations and computes a class/score*; it does not display a static reference
> table) — and the [spec-v100](spec-v100.md) §6 CI/CD contract. Each passes the
> [spec-v29](spec-v29.md) §3 one-line test, ships its primary citation inline
> ([spec-v54](spec-v54.md)), and inherits the [spec-v59](spec-v59.md)
> output-safety contract. **Every weight, band, and cutoff is re-fetched and
> cross-verified against ≥2 independent sources at implementation**
> ([spec-v97](spec-v97.md)); nothing here is implemented from recall.

## 1. Thesis

The live frailty surface (`frail-scale`, `mfi-5`, `mfi-11`, `ves-13`) is a set of
deficit-count and self-report screens. v177 adds the three frailty modalities the
long-term-care workflow actually reaches for and does not find here: the global
**clinical-judgment** scale (Rockwood CFS — a clinician maps a described
mobility / function / comorbidity / cognition state onto a 1–9 level), the
**sarcopenia** case-finders (SARC-F and SARC-CalF), and the **multidomain LTC
frailty screens** (PRISMA-7, SOF, GFI, EFS) that triage residents into
robust / pre-frail / frail bands at admission and on review. Each is a bounded
sum or a staging selection mapped to published bands; none authors a care-plan
order in Sophie's voice.

- **Clinical Frailty Scale (CFS)** — Rockwood's 1–9 global frailty rating, derived
  from the clinician's described state (1 very fit → 9 terminally ill).
  **Licensing review at implementation — see §2.1 and §4.**
- **SARC-F** — the 5-item sarcopenia screen (Strength, Assistance walking, Rise
  from a chair, Climb stairs, Falls), 0–10; **≥4 positive**.
- **SARC-CalF** — SARC-F plus a calf-circumference add-on (0–20); **≥11 positive**.
- **PRISMA-7** — a 7-item yes/no frailty/disability questionnaire, 0–7; **≥3** flags.
- **SOF frailty index** — the Study of Osteoporotic Fractures 3-item index, 0–3;
  0 robust / 1 pre-frail / ≥2 frail.
- **Groningen Frailty Indicator (GFI)** — a 15-item multidomain screen, 0–15; **≥4**.
- **Edmonton Frail Scale (EFS)** — a 9-domain assessment, 0–17, with severity bands.

## 2. What v177 adds (7 tiles)

### 2.1 `clinical-frailty-scale` — Clinical Frailty Scale (Rockwood CFS)

- **Citation:** Rockwood K, Song X, MacKnight C, et al. A global clinical measure
  of fitness and frailty in elderly people. *CMAJ.* 2005;173(5):489-495.
- **citationUrl:** https://doi.org/10.1503/cmaj.050051
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `geriatrics`, `internal-medicine`, `nursing-general`,
  `palliative-care`.
- **Inputs:** the clinician's described resident state across mobility, function
  (ADL/IADL dependence), comorbidity burden, and cognition — the tile presents the
  nine anchored level descriptors (1 very fit, 2 well, 3 managing well, 4 living
  with very mild frailty / vulnerable, 5 mildly frail, 6 moderately frail, 7
  severely frail, 8 very severely frail, 9 terminally ill) and the clinician selects
  the best-matching level.
- **Output:** the **CFS level (1–9)** with the published descriptor and the
  fitness→frailty framing, naming the selected anchor. Class A. **Licensing review
  at implementation — confirm redistribution terms or DEFER with `gail-bcrat` /
  `crib-ii` ([spec-v148](spec-v148.md) §7.1 deferral pattern).** The Rockwood CFS
  is free for non-commercial education/research, but Dalhousie University requires a
  permission/license for commercial use; the implementing session must confirm the
  redistribution terms for this catalog before shipping or defer the tile. Cross-links
  `frail-scale`.

### 2.2 `sarc-f` — SARC-F Sarcopenia Screen

- **Citation:** Malmstrom TK, Morley JE. SARC-F: a simple questionnaire to rapidly
  diagnose sarcopenia. *J Am Med Dir Assoc.* 2013;14(8):531-532.
- **citationUrl:** https://doi.org/10.1016/j.jamda.2013.05.018
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `geriatrics`, `nursing-general`, `primary-care`,
  `physical-medicine-rehabilitation`.
- **Inputs:** the 5 items, each 0–2 — **S**trength (lifting/carrying ~10 lb),
  **A**ssistance walking across a room, **R**ise from a chair/bed, **C**limb a
  flight of stairs, and **F**alls in the past year.
- **Output:** the **SARC-F total (0–10)** with the published cutoff — **≥4 predicts
  sarcopenia and poor outcomes** — naming the items counted. Class A. Cross-links
  `frail-scale`.

### 2.3 `sarc-calf` — SARC-F + Calf Circumference

- **Citation:** Barbosa-Silva TG, Menezes AMB, Bielemann RM, et al. Enhancing
  SARC-F: improving sarcopenia screening in the clinical practice. *J Am Med Dir
  Assoc.* 2016;17(12):1136-1141.
- **citationUrl:** https://doi.org/10.1016/j.jamda.2016.08.004
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `geriatrics`, `nursing-general`, `primary-care`,
  `physical-medicine-rehabilitation`.
- **Inputs:** the SARC-F 5 items (0–10) **plus** measured calf circumference (cm)
  and sex; the add-on contributes **+10 points** when calf circumference is below
  the sex-specific cutoff (**<34 cm men, <33 cm women**), 0 otherwise.
- **Output:** the **SARC-CalF total (0–20)** with the published cutoff — **≥11
  positive** (verify at implementation, [spec-v97](spec-v97.md)) — naming the
  SARC-F items and whether the calf add-on fired. Class A. Cross-links `sarc-f`.

### 2.4 `prisma-7` — PRISMA-7 Frailty Questionnaire

- **Citation:** Raîche M, Hébert R, Dubois MF. PRISMA-7: a case-finding tool to
  identify older adults with moderate to severe disabilities. *Arch Gerontol
  Geriatr.* 2008;47(1):9-18.
- **citationUrl:** https://doi.org/10.1016/j.archger.2007.07.007
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `geriatrics`, `primary-care`, `nursing-general`,
  `internal-medicine`.
- **Inputs:** the 7 yes/no items (each +1 for "yes") — age >85; male sex; health
  problems limiting activities; needs someone to help on a regular basis; health
  problems requiring you to stay at home; can count on someone close (scored when
  answered **"no"** — verify polarity at implementation, [spec-v97](spec-v97.md));
  uses a cane, walker, or wheelchair to get about.
- **Output:** the **PRISMA-7 total (0–7)** with the published cutoff — **≥3 suggests
  frailty / moderate-to-severe disability** — naming the items counted. Class A.

### 2.5 `sof-frailty-index` — Study of Osteoporotic Fractures Frailty Index

- **Citation:** Ensrud KE, Ewing SK, Taylor BC, et al. Comparison of 2 frailty
  indexes for prediction of falls, disability, fractures, and death in older women.
  *Arch Intern Med.* 2008;168(4):382-389.
- **citationUrl:** https://doi.org/10.1001/archinternmed.2007.113
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `geriatrics`, `internal-medicine`, `primary-care`,
  `nursing-general`.
- **Inputs:** the 3 items (each +1) — weight loss ≥5% over the prior year;
  inability to rise from a chair 5 times without using the arms; reduced energy
  level (answers **"no"** to "do you feel full of energy?").
- **Output:** the **SOF total (0–3)** with the published bands — **0 robust,
  1 pre-frail, ≥2 frail** — naming the items counted. Class A. Cross-links
  `frail-scale`.

### 2.6 `groningen-frailty-indicator` — Groningen Frailty Indicator (GFI)

- **Citation:** Steverink N, Slaets JPJ, Schuurmans H, van Lis M. Measuring frailty:
  developing and testing the GFI (Groningen Frailty Indicator). *Gerontologist.*
  2001;41(special issue 1):236-237. Validation: Peters LL, Boter H, Buskens E,
  Slaets JPJ. Measurement properties of the Groningen Frailty Indicator in
  home-dwelling and institutionalized elderly people. *J Am Med Dir Assoc.*
  2012;13(6):546-551.
- **citationUrl:** https://doi.org/10.1016/j.jamda.2012.04.007
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `geriatrics`, `nursing-general`, `primary-care`,
  `internal-medicine`.
- **Inputs:** the 15 items across the published domains — mobility (shopping,
  walking outdoors, dressing/undressing, toileting), vision, hearing, nutrition
  (recent unintended weight loss), comorbidity/polypharmacy (≥4 medications),
  cognition (memory complaints), and psychosocial (emptiness, missing people,
  feeling abandoned, sadness/depression, nervousness/anxiety) — each scored per the
  published 0/1 scheme.
- **Output:** the **GFI total (0–15)** with the published cutoff — **≥4 indicates
  frailty** — naming the contributing domains. Class A.

### 2.7 `edmonton-frail-scale` — Edmonton Frail Scale (EFS)

- **Citation:** Rolfson DB, Majumdar SR, Tsuyuki RT, Tahir A, Rockwood K. Validity
  and reliability of the Edmonton Frail Scale. *Age Ageing.* 2006;35(5):526-529.
- **citationUrl:** https://doi.org/10.1093/ageing/afl041
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `geriatrics`, `nursing-rehab`, `physical-medicine-rehabilitation`,
  `rehabilitation`.
- **Inputs:** the 9 domains — cognition (clock-drawing test result), general health
  status (hospital admissions in past year; self-rated health), functional
  independence (number of IADL needing help), social support, medication use
  (≥5 medications; forgetting to take), nutrition (recent weight loss), mood,
  continence, and functional performance (the Timed Up & Go result) — each scored
  per the published 0/1/2 scheme.
- **Output:** the **EFS total (0–17)** with the published severity bands — **0–5
  not frail, 6–7 vulnerable, 8–9 mild, 10–11 moderate, ≥12 severe frailty**
  (verify at implementation, [spec-v97](spec-v97.md)) — naming the contributing
  domains. Class A.

## 3. Per-tile robustness

- **`clinical-frailty-scale` is a judgment level derived from the described state**
  — it presents the nine anchored descriptors and the clinician selects the
  best-matching level; this **consumes the clinician's described mobility / function
  / comorbidity / cognition state and computes/reports the level**, satisfying the
  [spec-v100](spec-v100.md) §2 classification-tile clarification (it is not a static
  reference card). A blank selection renders a complete-the-fields fallback, never a
  value from `NaN`. **Subject to the §4 licensing review** — ship only after the
  redistribution terms are confirmed, else defer per [spec-v148](spec-v148.md) §7.1.
- **`sarc-f`, `prisma-7`, `sof-frailty-index`, `groningen-frailty-indicator`, and
  `edmonton-frail-scale` are bounded sums** mapped to published bands; each names
  which items/domains were counted. Band boundaries (SARC-F ≥4, PRISMA-7 ≥3, SOF 1
  vs ≥2, GFI ≥4, the EFS severity cut-points) are unit-tested at each edge.
- **`sarc-calf` guards the calf-circumference cutoff add-on** — the sex-specific
  threshold (<34 cm men, <33 cm women) is applied as a discrete +10/0 step, not a
  continuous term; a non-finite or blank calf circumference falls back to the
  SARC-F-only total or a surfaced `valid:false`, never a value from `NaN`, and the
  renderer states whether the add-on fired.
- All seven render the [spec-v50](spec-v50.md) §3 clinical-posture note and quote
  the source's interpretation; none authors a care-plan / treatment order in
  Sophie's voice ([spec-v11](spec-v11.md) §5.3); all flow through the
  [spec-v59](spec-v59.md) fuzz harness with zero non-finite leaks and hold the
  [spec-v50](spec-v50.md) §3 posture.

## 4. CI/CD & maintenance

Per the [spec-v100](spec-v100.md) §6 contract (re-binding [spec-v85](spec-v85.md)
§6):

- **Maintenance classes (§6.3):** all seven tiles are **Class A** — fixed
  formulas / bounded sums / staging selections cited by journal + authors, none
  naming a society/consensus issuer that trips `ISSUER_PATTERN`
  ([spec-v92](spec-v92.md)/[spec-v94](spec-v94.md) lesson), so none requires a
  `docs/citation-staleness.md` row. The implementing session confirms at build time
  that none of the seven citations trips the pattern rather than assuming it from
  this document.
- **Licensing review (`clinical-frailty-scale`):** the Rockwood CFS is free for
  non-commercial education/research, but **Dalhousie University requires a
  permission/license for commercial use.** Before shipping, the implementing session
  must **confirm the redistribution terms for this catalog** (it is Class A on the
  formula axis but carries a redistribution gate). If the terms cannot be confirmed,
  **DEFER `clinical-frailty-scale` with `gail-bcrat` / `crib-ii`** per the
  [spec-v148](spec-v148.md) §7.1 deferral pattern and ship **+6** (see §5 fallback).
  The other six tiles carry no licensing flag.
- **Build & gates (§6.1/§6.2):** the seven computes live in the new
  `lib/ltcga-v177.js` module (`clinicalFrailtyScale`, `sarcF`, `sarcCalf`,
  `prisma7`, `sofFrailtyIndex`, `groningenFrailtyIndicator`, `edmontonFrailScale`),
  added to the `test/unit/fuzz-tools.test.js` `MODULES` list — `sarc-calf`
  explicitly fuzzed for the calf-circumference add-on path (zero non-finite leaks).
  Renderers live in the new `views/group-v177.js` module; its `RV177` export is
  spread into the `app.js` `RENDERERS` map. Every input carries a real
  `<label for>`. The catalog count moves on all **13 catalog-truth surfaces**
  ([spec-v46](spec-v46.md)) in the same change, using the **live `UTILITIES.length`
  + delta**; a11y, `mobile-no-hscroll`, `mobile-touch-targets`, and the chromium
  `example-correctness` sweep pass for `views/group-v177.js`.

## 5. Files touched

```
docs/spec-v177.md                        (this file)
app.js                                   (+7 UTILITIES rows, group G; import group-v177 RV177 into RENDERERS)
lib/ltcga-v177.js                        (new module: clinicalFrailtyScale, sarcF, sarcCalf, prisma7, sofFrailtyIndex, groningenFrailtyIndicator, edmontonFrailScale)
lib/meta.js                              (+7 META entries: inline citation + citationUrl + accessed; cross-links to frail-scale, mfi-5, mfi-11, ves-13)
views/group-v177.js                      (new renderer module: 7 renderers)
docs/clinical-citations.md               (+ rows for the seven sources)
test/unit/clinical-frailty-scale.test.js, sarc-f.test.js, sarc-calf.test.js, prisma-7.test.js, sof-frailty-index.test.js, groningen-frailty-indicator.test.js, edmonton-frail-scale.test.js  (≥3 boundary worked examples each)
test/unit/fuzz-tools.test.js             (add lib/ltcga-v177.js to MODULES)
docs/audits/v12/clinical-frailty-scale.md, sarc-f.md, sarc-calf.md, prisma-7.md, sof-frailty-index.md, groningen-frailty-indicator.md, edmonton-frail-scale.md  (spec-v11 audit logs)
docs/scope-mdcalc-parity.md              (catalog count live -> live + 7; record v177 under the spec-v172 LTC-GA program)
CHANGELOG.md                             (Unreleased: v177 entry, +7)
README.md, package.json                  (catalog count live -> live + 7; spec-progression line -> v177)
```

If the §4 licensing review forces `clinical-frailty-scale` to be deferred, v177
ships **+6** (the other six tiles), the deferral is recorded with `gail-bcrat` /
`crib-ii` per the [spec-v148](spec-v148.md) §7.1 pattern, and every count above
moves by **+6** instead of +7.

## 6. Acceptance criteria

v177 is fully shipped when:

- The implementing session has **re-run the [spec-v85 §6.2](spec-v85.md) collision
  check** and confirmed all seven ids are absent.
- The **`clinical-frailty-scale` licensing review (§4) is resolved** —
  ship-with-confirmed-terms or deferred-and-recorded ([spec-v148](spec-v148.md)
  §7.1).
- All shipped tiles in §2 are live (group G) with a `META[id]` entry, an inline
  primary citation + `citationUrl` + `accessed`, ≥3 boundary worked examples each —
  including a **SARC-F 3→4 positive flip**, a **SOF 1→2 (pre-frail→frail) flip**, an
  **EFS vulnerable→mild boundary**, and a **CFS level selection** — a
  [spec-v11](spec-v11.md) audit log, and a passing [spec-v29](spec-v29.md) §3 check.
- `sarc-calf` guards the calf-circumference add-on path; blank inputs render a
  complete-the-fields fallback; the CFS renders the selected anchor descriptor.
- Every compute uses `lib/num.js` and is covered by the [spec-v59](spec-v59.md)
  fuzz harness with zero non-finite leaks.
- `UTILITIES.length` is **live + 7** (or **live + 6** if CFS defers) and all
  catalog-truth surfaces ([spec-v46](spec-v46.md)) agree; `scope-mdcalc-parity.md`
  records v177 under the spec-v172 LTC-GA program.
- `npm run lint`, `npm run test`, `npm run sbom`, and `npm run build` all pass.
- The CHANGELOG records v177 with the catalog delta (+7, or +6 on CFS deferral).

## 7. Out of scope for v177

- **No licensed Edmonton variants** — the Reported Edmonton Frail Scale (REFS) and
  other adapted/licensed EFS derivatives are excluded; v177 ships the published 2006
  Rolfson EFS only.
- **No Fried physical frailty phenotype** — it requires grip-strength dynamometry
  plus measured gait speed and a physical-activity questionnaire (objective
  performance measures, not a bedside checklist); the 4-metre `gait-speed` component
  lands in [spec-v176](spec-v176.md), and the full Fried phenotype is out of scope
  for this cluster per [spec-v100](spec-v100.md) §8.
- **No MNA / MNA-SF** — the Mini Nutritional Assessment is a Nestlé Nutrition
  Institute trademark, excluded per [spec-v172](spec-v172.md) §4; geriatric
  nutrition screens land in [spec-v178](spec-v178.md) (GNRI, PNI, CONUT, SNAQ,
  EAT-10, DETERMINE).
- **No automatic care-plan or treatment order** — each tile reports the score /
  level and the source's interpretation; the decision stays with the clinician and
  local protocol ([spec-v11](spec-v11.md) §5.3).

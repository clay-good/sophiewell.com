# spec-v208.md — Nutrition-status assessment & maternal-neonatal risk: Subjective Global Assessment, the GLIM criteria, the scored PG-SGA, the sFlt-1/PlGF ratio, and the neonatal Ponderal Index (+5 tiles)

> Status: **PROPOSED (2026-07-02).** Closing feature spec of the **Frontline & Bedside
> Decision Instruments** program ([spec-v204](spec-v204.md) §1.1). Adds **5**
> deterministic nutrition-assessment and maternal-neonatal instruments. **Each tile was
> verified absent by a direct scan of `app.js`** (zero id / name / keyword hits at
> draft): the catalog carries the nutrition *screening* tools `must-nutrition`,
> `nrs2002`, `mnutric`, `nutric`, `conut`, `gnri`, `snaq`, and `refeeding-risk`, the
> preeclampsia tools `fullpiers`, `minipiers`, `acog-severe-pre`, and
> `mgso4-preeclampsia`, and the neonatal tools `bhutani-bilirubin` and `ballard`, but
> **not** Subjective Global Assessment, the GLIM diagnostic criteria, the scored PG-SGA,
> the sFlt-1/PlGF ratio, or the neonatal Ponderal Index.
>
> Catalog effect: **live `UTILITIES.length` + 5** — enforced by the catalog-truth
> gate ([spec-v46](spec-v46.md)) at build time; no number is copied here.
>
> Every prior spec remains in force. v208 adds no runtime network call and no AI; each
> tile obeys the [spec-v100](spec-v100.md) §2 doctrine, passes the
> [spec-v29](spec-v29.md) §3 one-line test, ships its citation inline
> ([spec-v54](spec-v54.md)), inherits the [spec-v59](spec-v59.md) output-safety
> contract, renders the [spec-v50](spec-v50.md) §3 posture note, and honors
> [spec-v11](spec-v11.md) §5.3 (**no feeding order, delivery order, magnesium order, or
> disposition in Sophie's voice** — these assess and stratify; the decision stays with the
> dietitian, the obstetrician, the neonatologist, and the patient). **Every threshold,
> weight, and band is re-fetched and cross-verified against ≥2 independent open sources at
> implementation** ([spec-v97](spec-v97.md)); uncertain values carry an explicit *(verify
> at implementation, [spec-v97](spec-v97.md))* tag. The implementing session **re-runs the
> [spec-v85 §6.2](spec-v85.md) collision check** first.

## 1. Thesis

The catalog is dense in nutrition *screening* (MUST, NRS-2002, NUTRIC, CONUT, GNRI) but
carries no *assessment / diagnosis* instrument — the step that converts a positive screen
into a graded diagnosis a dietitian, oncologist, or coder can act on. This slice adds the
reference bedside assessment (SGA), the international consensus diagnostic framework
(GLIM), and the oncology-specific scored assessment (PG-SGA), then closes the program with
two high-value maternal-neonatal instruments the catalog lacks: the biomarker ratio that
rules preeclampsia out for a week (sFlt-1/PlGF) and the neonatal morphometric index that
distinguishes asymmetric from symmetric growth restriction (Ponderal Index). Each is a
transparent computation and each is decision support — **never a feeding, delivery,
magnesium, or disposition order**.

## 2. What v208 adds (5 tiles)

### 2.1 `sga-nutrition` — Subjective Global Assessment (Detsky SGA)

- **Citation:** Detsky AS, McLaughlin JR, Baker JP, Johnston N, Whittaker S, Mendelson RA,
  Jeejeebhoy KN. What is subjective global assessment of nutritional status? *JPEN J
  Parenter Enteral Nutr.* 1987;11(1):8-13.
- **citationUrl:** https://doi.org/10.1177/014860718701100108
- **Group:** G (clinical scoring & risk). **Specialties:** `nutrition`,
  `internal-medicine`, `geriatrics`.
- **Inputs:** the five history features (weight change over 6 months and the past 2 weeks,
  dietary-intake change, GI symptoms persisting > 2 weeks, functional capacity, and disease
  metabolic demand) and the four physical-exam features (loss of subcutaneous fat, muscle
  wasting, ankle/sacral edema, ascites), each graded normal / mild-moderate / severe, plus
  a clinician-selected overall rating.
- **Output:** the **SGA rating — A (well nourished) / B (moderately or suspected
  malnourished) / C (severely malnourished)** — a structured clinician gestalt, **not** an
  arithmetic sum (the original SGA emits no numeric score), naming the features that drive
  the rating (weight loss > 10% ongoing, poor intake, and fat/muscle loss weigh heaviest).
  Framed as the reference bedside malnutrition assessment, the tile presents the nine
  features as prompts and records the clinician's A/B/C rating. Class A. Cross-links
  `must-nutrition`, `nrs2002`, `glim-malnutrition`.

### 2.2 `glim-malnutrition` — GLIM criteria for malnutrition diagnosis

- **Citation:** Cederholm T, Jensen GL, Correia MITD, et al. GLIM criteria for the
  diagnosis of malnutrition — a consensus report from the global clinical nutrition
  community. *Clin Nutr.* 2019;38(1):1-9. (Co-published *JPEN J Parenter Enteral Nutr.*
  2019;43(1):32-40.)
- **citationUrl:** https://doi.org/10.1016/j.clnu.2018.08.002
- **Group:** G. **Specialties:** `nutrition`, `internal-medicine`, `geriatrics`,
  `oncology`.
- **Inputs:** a positive screen (any validated tool), then the phenotypic criteria
  (non-volitional weight loss > 5% within 6 months or > 10% beyond; low BMI < 20 if < 70 y
  or < 22 if ≥ 70 y; reduced muscle mass) and the etiologic criteria (reduced intake
  ≤ 50% of requirement > 1 week / any reduction > 2 weeks / chronic GI condition;
  inflammation or disease burden) *(Asian BMI cut-points and the age split use ≥ 70 y;
  verify at implementation, [spec-v97](spec-v97.md))*.
- **Output:** the **GLIM diagnosis** — malnutrition present when **≥ 1 phenotypic AND ≥ 1
  etiologic** criterion is met — with the **severity grade (Stage 1 moderate vs Stage 2
  severe)** driven by the phenotypic criterion met (weight loss 5–10% vs > 10% within
  6 months; BMI < 20 vs < 18.5 if < 70 y), naming the criteria satisfied. Framed as the
  current international consensus that unifies ESPEN / ASPEN / PENSA / FELANPE malnutrition
  diagnosis and supplies the formal diagnostic step after screening. Class A. Cross-links
  `sga-nutrition`, `must-nutrition`, `conut`.

### 2.3 `pg-sga` — Scored Patient-Generated Subjective Global Assessment

- **Citation:** Ottery FD. Definition of standardized nutritional assessment and
  interventional pathways in oncology. *Nutrition.* 1996;12(1 Suppl):S15-S19. **Scored
  form:** Bauer J, Capra S, Ferguson M. Use of the scored Patient-Generated Subjective
  Global Assessment (PG-SGA) as a nutrition assessment tool in patients with cancer.
  *Eur J Clin Nutr.* 2002;56(8):779-785.
- **citationUrl:** https://doi.org/10.1016/0899-9007(96)90011-8
- **Group:** G. **Specialties:** `nutrition`, `oncology`, `internal-medicine`.
- **Inputs:** the patient-completed boxes (weight history and 1-month change, food-intake
  change, nutrition-impact symptoms, activities and function) and the clinician worksheets
  (diagnosis / age / metabolic-demand points, and the physical-exam fat / muscle / fluid
  grading) *(the box-by-box point weights are transcribed verbatim from the scored PG-SGA
  worksheet at implementation, [spec-v97](spec-v97.md))*.
- **Output:** the **PG-SGA numeric score** with the triage bands (rising totals mark
  progressively greater need for symptom management and nutrition intervention) and the
  companion **global A / B / C rating**, naming the highest-scoring boxes; framed as the
  oncology-specific assessment that adds a quantitative, patient-driven score to the SGA
  gestalt. Class A. Cross-links `sga-nutrition`, `glim-malnutrition`, `ecog-karnofsky`.

### 2.4 `sflt1-plgf` — sFlt-1/PlGF ratio (preeclampsia rule-out / rule-in)

- **Citation:** Zeisler H, Llurba E, Chantraine F, et al. Predictive value of the
  sFlt-1:PlGF ratio in women with suspected preeclampsia. *N Engl J Med.*
  2016;374(1):13-22. **Phase-specific cut-points:** Verlohren S, et al. New gestational
  phase-specific cutoff values for the sFlt-1/PlGF ratio as a diagnostic test for
  preeclampsia. *Hypertension.* 2014;63(2):346-352.
- **citationUrl:** https://doi.org/10.1056/NEJMoa1414838
- **Group:** G. **Specialties:** `obstetrics`, `maternal-fetal-medicine`.
- **Inputs:** the measured **sFlt-1/PlGF ratio** (dimensionless, Roche Elecsys) and a
  gestational-age band (early-onset < 34 weeks vs late-onset ≥ 34 weeks) to select the
  applicable cut-point set.
- **Output:** the **risk category** — a single-cutoff **≤ 38 rules preeclampsia out for
  the next week (NPV ≈ 99.3%)** and **> 38 flags elevated short-term risk (PPV ≈ 37% within
  4 weeks)**; the phase-specific triage adds **rule-in ≥ 85 (early-onset) / ≥ 110
  (late-onset)** *(verify the phase-specific cut-points at implementation,
  [spec-v97](spec-v97.md))* — naming the band and the assay. Framed as a rule-out biomarker
  that safely reduces unnecessary admissions in women with suspected preeclampsia; a single
  numeric input, no delivery or magnesium order. Class A. Cross-links `fullpiers`,
  `acog-severe-pre`, `mgso4-preeclampsia`.

### 2.5 `ponderal-index` — Neonatal Ponderal Index (Rohrer's index)

- **Citation:** Miller HC, Hassanein K. Diagnosis of impaired fetal growth in newborn
  infants. *Pediatrics.* 1971;48(4):511-522. **Validation:** Fay RA, Dey PL, Saadie CM,
  Buhl JA, Gebski VJ. Ponderal index: a better definition of the "at risk" group with
  intrauterine growth problems than birth-weight for gestational age in term infants.
  *Aust N Z J Obstet Gynaecol.* 1991;31(1):17-19.
- **citationUrl:** https://doi.org/10.1111/j.1479-828X.1991.tb02755.x
- **Group:** F (bedside physiology). **Specialties:** `neonatology`, `pediatrics`,
  `obstetrics`.
- **Inputs:** birth weight (g) and crown-heel length (cm).
- **Output:** the **Ponderal Index** = `[birth weight (g) × 100] / [length (cm)]³`
  (g/cm³ × 100) with the term-infant interpretation bands — **normal 2.2–3.0; < 2.2 (or
  < 10th percentile for gestational age) suggests asymmetric, soft-tissue-wasting IUGR
  with relatively spared length; > 3.0 suggests a heavy-for-length / LGA proportion**
  *(the exact normal-range endpoints vary 2.2–3.0 vs 2.32–2.85 by source and a percentile
  interpretation is more defensible; verify at implementation, [spec-v97](spec-v97.md))* —
  naming the value; framed as the morphometric index that separates asymmetric from
  symmetric growth restriction (different etiologies and neonatal risks) where a weight-for-
  GA percentile alone cannot. Class A. Cross-links `bhutani-bilirubin`, `ballard`.

## 3. Per-tile robustness

- **Every compute routes through `lib/num.js` and is finite-guarded.** `ponderal-index`
  clamps a non-positive length and floors the index; `sflt1-plgf` clamps a negative ratio;
  the three nutrition tiles are structured categorical assessments (SGA and GLIM emit a
  rating / diagnosis; PG-SGA a bounded score) and render a complete-the-fields fallback for
  a missing item rather than a partial result.
- **Each tile reports which band / rating / diagnosis applies and names its basis**
  ([spec-v59](spec-v59.md)) — the SGA driving features, the GLIM criteria met, the PG-SGA
  top boxes, the sFlt-1/PlGF band, the Ponderal Index value — so a result is never read
  without its basis. SGA and GLIM keep the final rating / diagnosis clinician-selected so
  each tile stays a deterministic function of stated inputs.
- **All five render assessment / stratification, not orders** — none authors a feeding,
  delivery, magnesium, or disposition order in Sophie's voice ([spec-v11](spec-v11.md)
  §5.3); each renders the [spec-v50](spec-v50.md) §3 posture note.
- **All five flow through the [spec-v59](spec-v59.md) fuzz harness with zero non-finite
  leaks**, fuzzed at the band boundaries and at weight / length / ratio extremes.

## 4. CI/CD & maintenance

- **Maintenance classes (§6.3):** all five are **Class A** — fixed thresholds / formulas,
  each cited by journal + authors. The implementing session confirms whether any citation
  (e.g. GLIM / ESPEN / ASPEN wording) trips `ISSUER_PATTERN`
  ([spec-v92](spec-v92.md)/[spec-v94](spec-v94.md)) and adds a
  `docs/citation-staleness.md` row only if the live pattern matches.
- **Build & gates (§6.1/§6.2):** the five computes live in a new
  `lib/nutrition-maternal-v208.js` module, added to `test/unit/fuzz-tools.test.js`
  `MODULES`. Renderers live in a new `views/group-v208.js`; its `RV208` export is spread
  into the `app.js` `RENDERERS` map. Every input carries a real `<label for>`. The catalog
  count moves on all **13 catalog-truth surfaces** using the **live `UTILITIES.length` +
  5**; a11y, `mobile-no-hscroll`, `mobile-touch-targets`, and the chromium
  `example-correctness` sweep pass.
- **Specialties** are drawn from the closed vocabulary: `nutrition`, `internal-medicine`,
  `geriatrics`, `oncology`, `obstetrics`, `maternal-fetal-medicine`, `neonatology`,
  `pediatrics`; the implementing session adds any tag missing from `ALLOWED_SPECIALTIES`.

## 5. Files touched

```
docs/spec-v208.md                        (this file)
app.js                                   (+5 UTILITIES rows; import group-v208 RV208 into RENDERERS)
lib/nutrition-maternal-v208.js           (new: sga, glim, pgSga, sflt1Plgf, ponderalIndex)
lib/meta.js                              (+5 META entries: inline citation + citationUrl + accessed; cross-links to must-nutrition, fullpiers, bhutani-bilirubin)
views/group-v208.js                      (new renderer module: 5 renderers)
docs/clinical-citations.md               (+5 rows)
test/unit/sga-nutrition.test.js, glim-malnutrition.test.js, pg-sga.test.js, sflt1-plgf.test.js, ponderal-index.test.js  (>=3 worked examples each)
test/unit/fuzz-tools.test.js             (add lib/nutrition-maternal-v208.js to MODULES)
docs/scope-mdcalc-parity.md              (catalog count live -> live+5; record the v208 delta; close the Frontline & Bedside Decision Instruments program)
CHANGELOG.md, README.md, package.json    (catalog count live -> live+5; spec-progression line)
```

## 6. Acceptance criteria

v208 is fully shipped when:

- The implementing session has **re-run the [spec-v85 §6.2](spec-v85.md) collision
  check** and confirmed all five ids are absent (as verified at draft).
- All 5 tiles in §2 are live (Class A) with a `META[id]` entry, inline citation +
  `citationUrl` + `accessed`, and ≥ 3 worked examples each — including an **SGA A / B / C
  triple**, a **GLIM present-with-stage vs absent pair**, a **PG-SGA across its triage
  bands**, an **sFlt-1/PlGF crossing ≤ 38 / > 38 (and a phase-specific rule-in)**, and a
  **Ponderal Index below 2.2, normal, and above 3.0**.
- Every compute is finite-guarded, routes through `lib/num.js`, and is covered by the
  [spec-v59](spec-v59.md) fuzz harness with **zero non-finite leaks**.
- `UTILITIES.length` is **live + 5** and all catalog-truth surfaces agree.
- `npm run lint`, `npm run test`, `npm run sbom`, and `npm run build` all pass; the
  CHANGELOG records v208 with the +5 delta and notes the Frontline & Bedside Decision
  Instruments program (v204–v208) closed.

## 7. Out of scope for v208

- **No feeding / delivery / magnesium / disposition order** — the tiles assess and
  stratify; the feed / deliver / treat decisions stay with the dietitian, the
  obstetrician, the neonatologist, and the patient ([spec-v11](spec-v11.md) §5.3).
- **No proprietary or non-reproducible model** — the QUiPP preterm-birth app is explicitly
  deferred: its survival-model coefficients are not published and cannot be reproduced from
  ≥ 2 open sources ([spec-v97](spec-v97.md)).

<!-- Program note: v204–v208 close the Frontline & Bedside Decision Instruments program,
adding 25 deterministic frontline calculators (nephrology / fluids, pulmonology / COPD /
sleep, TBI & stroke prognosis, resuscitation & trauma-death prognosis, and nutrition
assessment & maternal-neonatal risk). Each was verified absent at draft; each is Class A,
cited, finite-guarded, and order-free. Two high-value instruments were deferred for failing
the ≥2-open-source reproducibility bar: the GWTG-Stroke mortality score (v206) and the
QUiPP preterm-birth app (v208). -->

# spec-v262.md — Pediatric acute assessment: the Lab-score for serious bacterial infection, the CHALICE head-injury rule, and the Egami score for IVIG resistance in Kawasaki disease (+3 tiles)

> Status: **SHIPPED (2026-07-09, 1118 → 1121).** Second feature spec of the **Bedside Acute-Care
> Instruments** program ([spec-v261](spec-v261.md) §1.1). Adds **3** deterministic
> pediatric instruments — one for the febrile-infant sepsis-workup decision, one for the
> head-CT decision, one for the Kawasaki treatment-escalation decision. **Each id was
> verified absent by a fixed-string scan of the extracted `app.js` id/name list**
> ([spec-v85 §6.2](spec-v85.md)): the catalog carries `step-by-step`, `rochester`,
> `bacterial-meningitis-score`, `pecarn-head`, `catch`, and `kobayashi`, but **not** the
> Lab-score, the CHALICE rule, or the Egami score.
>
> Catalog effect: **live `UTILITIES.length` + 3** — enforced by the catalog-truth
> gate ([spec-v46](spec-v46.md)) at build time; no number is copied here.
>
> Every prior spec remains in force. v262 adds no runtime network call and no AI; each
> tile obeys the [spec-v100](spec-v100.md) §2 doctrine, passes the
> [spec-v29](spec-v29.md) §3 one-line test, ships its citation inline
> ([spec-v54](spec-v54.md)), inherits the [spec-v59](spec-v59.md) output-safety
> contract, renders the [spec-v50](spec-v50.md) §3 posture note, and honors
> [spec-v11](spec-v11.md) §5.3 (**no imaging, lumbar-puncture, admission, or drug order in
> Sophie's voice** — these compute a risk/eligibility category; the decision stays with the
> clinician). **Every item, band, and threshold is re-fetched and cross-verified against
> ≥2 independent open sources at implementation** ([spec-v97](spec-v97.md)); uncertain
> values carry an explicit *(verify at implementation, [spec-v97](spec-v97.md))* tag. The
> implementing session **re-runs the [spec-v85 §6.2](spec-v85.md) collision check** first.

## 1. Thesis

The catalog carries the young-infant fever engines (Step-by-Step, Rochester,
Philadelphia), the Bacterial Meningitis Score, and the pediatric head-imaging rules
(PECARN, CATCH), plus the Kobayashi IVIG-resistance score for Kawasaki disease. It does
**not** carry the biomarker-based **Lab-score** that stratifies serious bacterial
infection from CRP, procalcitonin, and urine dipstick; not the **CHALICE** head-injury
rule that (with PECARN and CATCH) completes the three major validated pediatric head-CT
instruments; and not the **Egami** IVIG-resistance score that sits alongside Kobayashi in
the Kawasaki escalation decision. Each is a transparent, externally-validated pediatric
instrument, freely reproducible from open sources, and each is decision support — **never
an imaging, lumbar-puncture, admission, or prescribing order**.

## 2. What v262 adds (3 tiles)

### 2.1 `lab-score` — Lab-score for serious bacterial infection in febrile children

- **Citation:** Lacour AG, Zamora SA, Gervaix A. A score identifying serious bacterial
  infections in children with fever without source. *Pediatr Infect Dis J.*
  2008;27(7):654-656.
- **citationUrl:** https://doi.org/10.1097/INF.0b013e318168d2b4
- **Group:** G. **Specialties:** `pediatrics`, `emergency-medicine`,
  `infectious-disease`.
- **Inputs — three biomarkers in bands** *(each band is transcribed verbatim from the
  primary paper at implementation, [spec-v97](spec-v97.md))*: **CRP** — < 40 mg/L (0),
  40-99 mg/L (+2), ≥ 100 mg/L (+4); **procalcitonin** — < 0.5 ng/mL (0), 0.5-1.99 ng/mL
  (+2), ≥ 2.0 ng/mL (+4) *(note: the lower PCT band is 0.5, not 0.05 — a propagated
  secondary-source typo; the tile uses the derivation table)*; **urine dipstick** —
  negative (0), positive for leukocyte esterase and/or nitrite (+1).
- **Output:** the **Lab-score total (0-9)** with the **≥ 3 = high risk of serious
  bacterial infection** cutoff (derivation sensitivity ≈ 94 %, specificity ≈ 81 %),
  naming the contributing biomarkers. Framed as the biomarker score that risk-stratifies
  fever without source; **it reports a risk band, never a sepsis-workup, antibiotic, or
  admission order** ([spec-v11](spec-v11.md) §5.3). Class A. Cross-links `step-by-step`,
  `rochester`, `bacterial-meningitis-score`.

### 2.2 `chalice` — CHALICE pediatric head-injury rule

- **Citation:** Dunning J, Daly JP, Lomas J-P, Lecky F, Batchelor J, Mackway-Jones K.
  Derivation of the children's head injury algorithm for the prediction of important
  clinical events decision rule for head injury in children. *Arch Dis Child.*
  2006;91(11):885-891.
- **citationUrl:** https://doi.org/10.1136/adc.2005.083980
- **Group:** G. **Specialties:** `pediatrics`, `emergency-medicine`, `neurosurgery`,
  `neurology`.
- **Inputs — 14 criteria in three groups, any one positive** *(the wording is transcribed
  verbatim from the primary paper at implementation, [spec-v97](spec-v97.md))*: **history**
  — witnessed loss of consciousness > 5 min; amnesia > 5 min; abnormal drowsiness; ≥ 3
  vomits after injury; suspicion of non-accidental injury; post-traumatic seizure without
  an epilepsy history. **Examination** — GCS < 14 (or < 15 if age < 1 year); suspected
  penetrating/depressed skull injury or tense fontanelle; signs of a basal skull fracture;
  positive focal neurology; bruise, swelling, or laceration > 5 cm if age < 1 year.
  **Mechanism** — high-speed road-traffic accident (> 40 mph / ~ 64 km/h) as pedestrian,
  cyclist, or occupant; fall > 3 m; high-speed projectile or object.
- **Output:** **CT head recommended** when **any** criterion is present (naming which
  criteria fired and their group); **CT not required by the rule** when all 14 are absent
  — the rule's value is its ≈ 98 % sensitivity for a clinically significant intracranial
  injury. Framed as the sensitivity-first pediatric head-CT rule that completes the
  PECARN/CATCH/CHALICE triad; **it reports a rule result, never an imaging order**
  ([spec-v11](spec-v11.md) §5.3). Class A. Cross-links `pecarn-head`, `catch`,
  `canadian-ct-head`.

### 2.3 `egami` — Egami score (IVIG-resistance risk in Kawasaki disease)

- **Citation:** Egami K, Muta H, Ishii M, et al. Prediction of resistance to intravenous
  immunoglobulin treatment in patients with Kawasaki disease. *J Pediatr.*
  2006;149(2):237-240.
- **citationUrl:** https://doi.org/10.1016/j.jpeds.2006.03.050
- **Group:** G. **Specialties:** `pediatrics`, `cardiology`, `rheumatology`,
  `infectious-disease`.
- **Inputs — five items** *(each weight is transcribed verbatim from the primary paper at
  implementation, [spec-v97](spec-v97.md))*: ALT ≥ 80 IU/L (+2); age ≤ 6 months (+1);
  treatment on illness day ≤ 4 (+1); CRP ≥ 8 mg/dL (+1); platelet count ≤ 300 × 10³/mm³
  (+1).
- **Output:** the **Egami total (0-6)** with the **≥ 3 = high risk of IVIG resistance**
  cutoff (derivation sensitivity ≈ 78 %, specificity ≈ 76 % in the Japanese cohort),
  naming the contributing items. Framed as the compact companion to the catalog's
  Kobayashi score for flagging children who may need intensified initial therapy; the tile
  states the well-documented drop in sensitivity in non-Japanese/Western and infant
  populations. **It reports a resistance-risk band, never an IVIG, steroid, or
  intensified-therapy order** ([spec-v11](spec-v11.md) §5.3). Class A. Cross-links
  `kobayashi`.

## 3. Per-tile robustness

- **Every compute routes through `lib/num.js` and is finite-guarded.** Lab-score is a
  bounded 0-9 banded sum, CHALICE a boolean any-positive rule, Egami a bounded 0-6 sum —
  each renders a "complete the fields" fallback for a missing item rather than a `NaN`, and
  clamps any reported probability to [0, 100] %.
- **Each tile reports which items fired and the resulting category**
  ([spec-v59](spec-v59.md)) — the Lab-score biomarker bands, the CHALICE positive
  criteria, the Egami items — so a result is never read without its basis.
- **All three render a category, not an order** — none authors an imaging,
  lumbar-puncture, admission, or prescribing order in Sophie's voice
  ([spec-v11](spec-v11.md) §5.3); each renders the [spec-v50](spec-v50.md) §3 posture
  note.
- **All three flow through the [spec-v59](spec-v59.md) fuzz harness with zero non-finite
  leaks**, fuzzed at the Lab-score band edges, the CHALICE any-positive boundary, and the
  Egami ≥ 3 cutoff.

## 4. CI/CD & maintenance

- **Maintenance classes (§6.3):** all three are **Class A** — fixed item/band models, each
  cited by journal + authors. The implementing session confirms whether any citation trips
  `ISSUER_PATTERN` ([spec-v92](spec-v92.md)/[spec-v94](spec-v94.md)) and adds a
  `docs/citation-staleness.md` row only if the live pattern matches.
- **Build & gates (§6.1/§6.2):** the three computes live in a new
  `lib/pediatric-acute-v262.js`, added to `test/unit/fuzz-tools.test.js` `MODULES`.
  Renderers live in a new `views/group-v262.js`; its `RV262` export is spread into the
  `app.js` `RENDERERS` map. Every input carries a real `<label for>`. The catalog count
  moves on all catalog-truth surfaces using the **live `UTILITIES.length` + 3**; a11y,
  `mobile-no-hscroll`, `mobile-touch-targets`, and the chromium `example-correctness`
  sweep pass.
- **Specialties** are drawn from the closed vocabulary; the implementing session confirms
  `pediatrics`, `rheumatology`, and `neurosurgery` are present in `ALLOWED_SPECIALTIES`
  (all used by existing tiles) before use.
- **MCP exposure (post-ship):** all three are Class A deterministic computes and are
  **routinely MCP-adaptable** — a follow-up MCP wave exposes them as deterministic agent
  tools per the [spec-v85](spec-v85.md) recipe, self-describing the fired items and band so
  the numeric round-trip passes.

## 5. Files touched

```
docs/spec-v262.md                        (this file)
app.js                                   (+3 UTILITIES rows; import group-v262 RV262 into RENDERERS)
lib/pediatric-acute-v262.js              (new: labScore, chalice, egami)
lib/meta.js                              (+3 META entries: inline citation + citationUrl + accessed; cross-links to step-by-step, pecarn-head, kobayashi)
views/group-v262.js                      (new renderer module: 3 renderers)
docs/clinical-citations.md               (+3 rows)
test/unit/lab-score.test.js, chalice.test.js, egami.test.js   (>=3 worked examples each)
test/unit/fuzz-tools.test.js             (add lib/pediatric-acute-v262.js to MODULES)
docs/scope-post-parity.md                (catalog count live -> live+3; record the v262 delta)
CHANGELOG.md, README.md, package.json    (catalog count live -> live+3; spec-progression line)
```

## 6. Acceptance criteria

v262 is fully shipped when:

- The implementing session has **re-run the [spec-v85 §6.2](spec-v85.md) collision check**
  and confirmed all three ids are absent (as verified at draft).
- All 3 tiles in §2 are live (Class A) with a `META[id]` entry, inline citation +
  `citationUrl` + `accessed`, and ≥ 3 worked examples each — including a **Lab-score
  crossing the ≥ 3 cutoff across the CRP and PCT bands**, a **CHALICE with a
  history-only, an examination-only, and an all-negative case**, and an **Egami crossing
  the ≥ 3 IVIG-resistance cutoff**.
- The transcribed Lab-score bands, CHALICE criteria, and Egami weights are reproduced from
  the primary sources and re-verified against ≥ 2 independent references at implementation
  ([spec-v97](spec-v97.md)) — including the PCT-band 0.5 (not 0.05) correction.
- Every compute is finite-guarded, routes through `lib/num.js`, clamps probabilities to
  [0, 100] %, and is covered by the [spec-v59](spec-v59.md) fuzz harness with **zero
  non-finite leaks**.
- `UTILITIES.length` is **live + 3** and all catalog-truth surfaces agree.
- `npm run lint`, `npm run test`, `npm run sbom`, and `npm run build` all pass; the
  CHANGELOG records v262 with the +3 delta.

## 7. Out of scope for v262

- **No imaging / lumbar-puncture / admission / prescribing order** — the tiles compute a
  risk or eligibility category; the scan/tap/admit/treat decisions stay with the clinician
  ([spec-v11](spec-v11.md) §5.3).
- **No proprietary or non-reproducible variant** — the Sano and San Diego IVIG-resistance
  scores and locally-refitted Lab-score cutoffs are deferred; this slice adds only the
  three canonical, openly-published instruments. If any band table cannot be reproduced
  from ≥ 2 open, fetchable sources at implementation, that tile is parked (not
  approximated), per [spec-v97](spec-v97.md) and the [spec-v259](spec-v259.md) precedent.

# spec-v58.md — Neonatal, maternal, and pediatric/adult ICU bedside scores (12 tiles)

> Status: proposed (2026-06-05). v58 is a multi-tile spec
> completing the 50-tile expansion begun in v55. It adds **12**
> deterministic neonatal, maternal, and ICU bedside scores that
> fill confirmed gaps for the NICU / L&D / PICU / ICU nurse — the
> gestational-age and neonatal-distress scores the NICU nurse
> assigns at the bedside, the bilirubin and blood-loss tools the
> nursery and L&D teams act on, and the pediatric/adult organ-
> dysfunction and peri-op risk scores the ICU team tracks. None
> duplicates an existing tile (checked against the v52-close
> catalog of 255 and the v55–v57 additions). Every tile passes
> the [spec-v29](spec-v29.md) §3 one-line test.
>
> Catalog effect at v58 close: **295 + 12 = 307 tiles.**
>
> Combined v55–v58 add **52** new tiles (13 + 13 + 14 + 12),
> moving the catalog from 255 to 307.
>
> Every prior spec (v4 through v57) remains in force. v58 adds no
> runtime network call and no AI; each tile ships its primary
> citation inline ([spec-v54](spec-v54.md)) and inherits the
> [spec-v53](spec-v53.md) input/output-safety contract. Sophie's
> eight commitments ([spec-v50](spec-v50.md) §3) are preserved.

## 1. Thesis

Sophie's maternal-newborn and ICU surfaces are strong on adult
scoring (SOFA, MODS, NUTRIC, the v17–v28 risk scores) and the
recent neonatal-pain extensions (NIPS, N-PASS, CRIES), but three
high-frequency bedside surfaces are still missing:

- **Neonatal assessment.** APGAR ships, but not the **New Ballard
  Score** (gestational-age assignment), the **Silverman-Andersen**
  and **Downes** respiratory-distress scores, the **Finnegan**
  neonatal abstinence score (the most frequently *repeated*
  neonatal nursing assessment in the U.S.), or the **Bhutani
  hour-specific bilirubin** nomogram that gates phototherapy.
- **Maternal bedside.** MEOWS and the preeclampsia tiles ship,
  but not the **quantitative blood loss + PPH risk** tool that
  every delivery now requires under the AIM/CMQCC obstetric-
  hemorrhage bundles.
- **Pediatric/adult ICU organ-dysfunction and peri-op risk.**
  Adult SOFA ships, but not **pSOFA** or **PELOD-2** (the
  pediatric organ-dysfunction scores), the **Burch-Wartofsky**
  thyroid-storm score, the **ARISCAT** postoperative-pulmonary-
  complication risk, the classic **APACHE II** ICU mortality
  score, or the **Braden Q** pediatric pressure-injury scale
  (the peds counterpart to the adult Braden that already ships).

Each is a published, deterministic instrument a bedside nurse
already assigns by hand; v58 brings them onto the page and closes
the 50-tile expansion.

## 2. What v58 adds (12 tiles)

### 2.1 `ballard` — New Ballard Score (gestational age)

- **Citation:** Ballard JL, et al. J Pediatr. 1991;119(3):
  417-423 (New Ballard Score, extended to 20 weeks).
- **citationUrl:** https://doi.org/10.1016/S0022-3476(05)82056-6
- **Group:** Pediatrics & Neonatal (`N`).
- **Specialties:** `nursing-nicu`, `neonatology`, `nursing-ld`,
  `pediatrics`.
- **Inputs:** six neuromuscular + six physical-maturity criteria
  (each −1 to +5 / 0 to +5).
- **Output:** total maturity score mapped to estimated
  gestational age (weeks), with the ±2-week assessment-precision
  note.

### 2.2 `finnegan` — Finnegan Neonatal Abstinence Scoring (NAS)

- **Citation:** Finnegan LP, et al. Addict Dis. 1975;2(1-2):
  141-158 (Finnegan NAS); modified Finnegan as used in most U.S.
  protocols.
- **Group:** Pediatrics & Neonatal (`N`).
- **Specialties:** `nursing-nicu`, `neonatology`,
  `nursing-postpartum`.
- **Inputs:** the modified-Finnegan signs (CNS, metabolic/
  vasomotor/respiratory, GI), each weighted.
- **Output:** total NAS score with the conventional bands
  (≥8 on three consecutive scores, or ≥12 on two, prompts
  pharmacologic-treatment consideration per protocol). Framed as
  the *trend* tool it is, with the "score the full interval" note.

### 2.3 `silverman-andersen` — Silverman-Andersen Respiratory Severity Score

- **Citation:** Silverman WA, Andersen DH. Pediatrics. 1956;17(1):
  1-10.
- **Group:** Pediatrics & Neonatal (`N`).
- **Specialties:** `nursing-nicu`, `neonatology`,
  `respiratory-therapy`.
- **Inputs:** five signs (chest movement, intercostal retraction,
  xiphoid retraction, nares dilatation, expiratory grunt), 0–2
  each.
- **Output:** total (0–10) with the respiratory-distress severity
  band (0 = no distress, ≥7 = severe / impending respiratory
  failure). Note the inverted convention vs APGAR (higher = worse)
  is surfaced explicitly to prevent misreading.

### 2.4 `downes` — Downes Score (neonatal respiratory distress)

- **Citation:** Downes JJ, et al. Clin Pediatr (Phila). 1970;9(6):
  325-331.
- **Group:** Pediatrics & Neonatal (`N`).
- **Specialties:** `nursing-nicu`, `neonatology`,
  `respiratory-therapy`.
- **Inputs:** five parameters (respiratory rate, cyanosis, air
  entry, grunting, retractions), 0–2 each.
- **Output:** total (0–10) with the bands (0–3 mild, 4–6
  moderate / impending failure, ≥7 severe / consider assisted
  ventilation).

### 2.5 `bhutani-bilirubin` — Bhutani hour-specific bilirubin nomogram + phototherapy threshold

- **Citation:** Bhutani VK, et al. Pediatrics. 1999;103(1):6-14
  (hour-specific nomogram); AAP Clinical Practice Guideline
  (Kemper AR, et al. Pediatrics. 2022;150(3):e2022058859) for the
  phototherapy thresholds.
- **citationUrl:** https://doi.org/10.1542/peds.2022-058859
- **Group:** Pediatrics & Neonatal (`N`).
- **Specialties:** `nursing-nicu`, `nursing-nursery`,
  `neonatology`, `pediatrics`.
- **Inputs:** age in hours, total serum bilirubin (mg/dL),
  gestational age, and neurotoxicity-risk-factor flag.
- **Output:** the Bhutani risk-zone percentile (low / low-
  intermediate / high-intermediate / high) **and** the AAP-2022
  phototherapy-threshold comparison (above/below threshold for the
  entered gestational age + risk factors). The 2022 AAP edition is
  pinned in the citation-staleness ledger as the current edition.

### 2.6 `qbl-pph` — Quantitative blood loss + PPH risk

- **Citation:** ACOG Practice Bulletin 183 / reaffirmed obstetric-
  hemorrhage guidance; AIM / CMQCC Obstetric Hemorrhage bundle
  (risk stratification: low / medium / high).
- **Group:** Pediatrics & Neonatal (`N`) / OB.
- **Specialties:** `nursing-ld`, `obstetrics`,
  `maternal-fetal-medicine`, `nursing-postpartum`.
- **Inputs:** measured/collected blood volume and weighed-pad
  grams (1 g = 1 mL) for QBL; the CMQCC admission risk factors for
  the risk tier.
- **Output:** total quantitative blood loss (mL) with the
  postpartum-hemorrhage threshold flag (≥1000 mL, or ≥500 mL
  vaginal with instability), and the CMQCC risk tier (low/medium/
  high → type-and-screen vs crossmatch readiness). Decision
  support, not a transfusion order.

### 2.7 `pelod2` — PELOD-2 (Pediatric Logistic Organ Dysfunction-2)

- **Citation:** Leteurtre S, et al. Crit Care Med. 2013;41(7):
  1761-1773 (PELOD-2).
- **citationUrl:** https://doi.org/10.1097/CCM.0b013e31828a2bbd
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `nursing-picu`, `pediatric-critical-care`.
- **Inputs:** ten variables across five organ systems
  (neuro/GCS, cardiovascular/lactate+MAP-by-age, renal/creatinine-
  by-age, respiratory/PaO₂-FiO₂+PaCO₂+ventilation, hematologic/
  WBC+platelets).
- **Output:** PELOD-2 score (0–33) with the mortality-risk
  context; the age-banded cutoffs for MAP and creatinine are
  applied automatically from the entered age.

### 2.8 `psofa` — Pediatric SOFA Score

- **Citation:** Matics TJ, Sanchez-Pinto LN. JAMA Pediatr. 2017;
  171(10):e172352 (pSOFA, age-adjusted from adult SOFA).
- **citationUrl:** https://doi.org/10.1001/jamapediatrics.2017.2352
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `nursing-picu`, `pediatric-critical-care`,
  `pediatric-emergency-medicine`.
- **Inputs:** the six SOFA organ systems with age-adjusted
  cardiovascular and renal cutoffs (respiration PaO₂/FiO₂ or
  SpO₂/FiO₂, coagulation, hepatic, cardiovascular by age, neuro/
  GCS, renal/creatinine by age).
- **Output:** pSOFA (0–24) with the organ-by-organ breakdown;
  the age-banding for MAP and creatinine is automatic from the
  entered age. Companion to the adult SOFA already shipped.

### 2.9 `burch-wartofsky` — Burch-Wartofsky Point Scale (thyroid storm)

- **Citation:** Burch HB, Wartofsky L. Endocrinol Metab Clin North
  Am. 1993;22(2):263-277.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `endocrinology`, `emergency-medicine`,
  `nursing-icu`, `critical-care`.
- **Inputs:** weighted criteria across thermoregulatory, CNS, GI-
  hepatic, cardiovascular (tachycardia, CHF, atrial fibrillation),
  and precipitant-history.
- **Output:** total with the bands (<25 unlikely, 25–44
  impending / suggestive, ≥45 highly suggestive of thyroid
  storm). Decision support for an endocrine emergency.

### 2.10 `ariscat` — ARISCAT postoperative pulmonary complication risk

- **Citation:** Canet J, et al. Anesthesiology. 2010;113(6):
  1338-1350 (ARISCAT score).
- **citationUrl:** https://doi.org/10.1097/ALN.0b013e3181fc6e0a
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `anesthesiology`, `nursing-preop`,
  `nursing-postop`, `surgery`.
- **Inputs:** seven weighted predictors (age band, preoperative
  SpO₂, respiratory infection in last month, preoperative anemia
  ≤10 g/dL, surgical incision site, surgery duration, emergency
  procedure).
- **Output:** total with the low / intermediate / high
  postoperative-pulmonary-complication risk bands and the
  associated predicted incidence.

### 2.11 `apache2` — APACHE II Score (ICU mortality estimate)

- **Citation:** Knaus WA, et al. Crit Care Med. 1985;13(10):
  818-829 (APACHE II).
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `nursing-icu`, `critical-care`,
  `internal-medicine`.
- **Inputs:** the twelve acute physiology variables (temp, MAP,
  HR, RR, oxygenation, arterial pH, Na, K, creatinine, hematocrit,
  WBC, GCS), age points, and chronic-health points.
- **Output:** APACHE II (0–71) with the acute-physiology / age /
  chronic-health breakdown and the associated approximate
  hospital-mortality band, with the explicit note that APACHE II
  is a cohort-mortality estimate, not an individual prognosis.

### 2.12 `braden-q` — Braden Q (pediatric pressure-injury risk)

- **Citation:** Quigley SM, Curley MAQ. J Soc Pediatr Nurs. 1996;
  1(1):7-18 (Braden Q scale).
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `nursing-picu`, `nursing-peds`,
  `wound-care`, `pediatrics`.
- **Inputs:** seven subscales (mobility, activity, sensory
  perception, moisture, friction/shear, nutrition, tissue
  perfusion/oxygenation), 1–4 each.
- **Output:** total (7–28; lower = higher risk) with the
  at-risk threshold (≤16) and subscale breakdown; the pediatric
  counterpart to the adult Braden already shipped.

## 3. Per-tile robustness and convention notes

- The neonatal respiratory scores (`silverman-andersen`,
  `downes`) and `finnegan` use a *higher = worse* convention,
  the inverse of APGAR; each renderer states the direction
  explicitly so a nurse cross-reading scores cannot invert the
  interpretation.
- `bhutani-bilirubin`, `pelod2`, and `psofa` apply **age/
  gestational-age-banded** cutoffs automatically from the entered
  age; the active band is shown so the user can verify the right
  threshold was applied.
- `qbl-pph` uses the 1 g = 1 mL weighed-pad convention and
  subtracts dry-pad/irrigation tare explicitly; it reports blood
  loss and a risk tier, never a transfusion order.
- All compute functions import the shared `lib/num.js` helpers
  and are covered by the [spec-v53](spec-v53.md) fuzz harness with
  zero `NaN`/`Infinity`/`undefined` leaks; partial-instrument
  inputs render a "(complete all items)" fallback.
- The four guideline-pinned tiles (`bhutani-bilirubin` → AAP 2022;
  `qbl-pph` → ACOG/CMQCC; `mgso4`-adjacent maternal context) carry
  `accessed` dates and `docs/citation-staleness.md` rows
  ([spec-v54](spec-v54.md)).

## 4. Files touched

```
docs/spec-v58.md                         (this file)
app.js                                   (+12 UTILITIES rows, groups N and G)
lib/scoring-v6.js                        (new module: 12 compute exports)
lib/meta.js                              (+12 META entries, inline citations + accessed)
views/group-v10.js                       (new renderer module: 12 renderers)
app.js                                   (import group-v10 renderers into RENDERERS)
docs/citation-staleness.md               (+ rows: bhutani-bilirubin (AAP 2022), qbl-pph (ACOG/CMQCC))
test/unit/ballard.test.js                (new)
test/unit/finnegan.test.js               (new)
test/unit/silverman-andersen.test.js     (new)
test/unit/downes.test.js                 (new)
test/unit/bhutani-bilirubin.test.js      (new)
test/unit/qbl-pph.test.js                (new)
test/unit/pelod2.test.js                 (new)
test/unit/psofa.test.js                  (new)
test/unit/burch-wartofsky.test.js        (new)
test/unit/ariscat.test.js                (new)
test/unit/apache2.test.js                (new)
test/unit/braden-q.test.js               (new)
test/integration/fuzz-tools.spec.js      (import lib/scoring-v6.js for coverage)
docs/audits/v11/ballard.md ... braden-q.md   (12 new audit logs)
docs/scope-mdcalc-parity.md              (catalog count 295 -> 307)
CHANGELOG.md                             (Unreleased: v58 entry, +12)
README.md                                (catalog count 295 -> 307)
package.json                             (description count 295 -> 307)
```

## 5. Acceptance criteria

v58 is fully shipped when:

- This file exists.
- All 12 tiles in §2 are present: each has a `META[id]` entry, a
  primary citation visible inline, ≥3 boundary worked examples in
  its unit test (including the age-band boundaries for
  `bhutani-bilirubin`/`pelod2`/`psofa`), and a
  [spec-v11](spec-v11.md) audit log.
- The higher-is-worse neonatal scores state their direction
  explicitly (pinned by an a11y/text check), and age-banded tiles
  show the active band.
- Every compute function uses `lib/num.js` and is covered by the
  spec-v53 fuzz harness with zero non-finite leaks.
- The guideline-pinned tiles carry `accessed` + a
  `docs/citation-staleness.md` row ([spec-v54](spec-v54.md)).
- `UTILITIES.length` is 307 and all 15 catalog-truth surfaces
  ([spec-v46](spec-v46.md)) agree.
- `npm run lint`, `npm run test`, `npm run sbom`, and
  `npm run build` all pass.
- The CHANGELOG records v58 with the +12 catalog delta, and a
  note that v55–v58 together added 52 tiles (255 → 307).

## 6. Out of scope for v58

- Growth-chart percentile plotting (Fenton, WHO/CDC growth
  curves) — these require bundled reference curves and a plotting
  surface; candidate for a future spec.
- Bilirubin/exchange-transfusion *management pathways* beyond the
  threshold comparison — `bhutani-bilirubin` reports the zone and
  the AAP threshold; it does not order phototherapy or exchange.
- PRISM III / SNAP-II and other proprietary or coefficient-heavy
  neonatal/pediatric mortality models — deferred (licensing /
  coefficient-provenance concerns).
- Real-time trend storage for the repeated scores (Finnegan,
  NAS) — Sophie computes a single score from entered inputs; it
  does not persist a trend (consistent with the no-storage
  posture, [spec-v50](spec-v50.md) §3).
- Transfusion-protocol automation from `qbl-pph` — the massive-
  transfusion ratio tracker already ships separately; v58 adds the
  blood-loss/risk front end only.

# spec-v55.md — Bedside hematology, renal-acid, and oxygenation math (13 tiles)

> Status: proposed (2026-06-05). v55 is a multi-tile clinical-math
> spec. It adds **13** deterministic calculators that fill
> confirmed gaps in Sophie's hematology, renal/acid-base, and
> mechanical-ventilation/oxygenation surfaces — every one
> bedside-actionable for the ICU / acute-care RN, RT, and the
> resident verifying a number at 3 a.m. None duplicates an
> existing tile (the v52-close catalog of 255 was checked tile by
> tile). Every tile passes the [spec-v29](spec-v29.md) §3
> one-line test: it consumes at least one user input and computes
> an output.
>
> Catalog effect at v55 close: **255 + 13 = 268 tiles.**
>
> Every prior spec (v4 through v54) remains in force. v55 adds no
> runtime network call and no AI; each tile ships its primary
> citation inline per [spec-v54](spec-v54.md) and is fuzz-covered
> by the [spec-v53](spec-v53.md) harness the moment its lib export
> exists. Sophie's eight commitments ([spec-v50](spec-v50.md) §3)
> are preserved.

## 1. Thesis

Sophie's clinical-math surface (Group E) is broad on
fluids/electrolytes and acid-base but thin in three places a
bedside nurse actually reaches:

- **Hematology bedside math** — the catalog has Mentzer (anemia
  screen) and SAAG, but not the absolute neutrophil count that
  decides neutropenic precautions, the corrected reticulocyte
  index that distinguishes a hypo- from hyper-proliferative
  anemia, the transferrin saturation that gates IV iron, or the
  corrected count increment that diagnoses platelet
  refractoriness on the transfusion service.
- **Renal/acid-base bedside math** — anion gap, delta-delta,
  FENa/FEUrea, and free-water deficit ship, but the **urine**
  anion gap (the non-gap acidosis discriminator), the transtubular
  potassium gradient (the hypo/hyperkalemia work-up step), and the
  bicarbonate/sodium deficit a nurse titrates against do not.
- **Oxygenation / ventilation math** — ROX and HACOR (NIV/HFNC
  failure) ship, but the arterial oxygen content and delivery
  (CaO2 / DO2), the oxygenation index and oxygen-saturation index
  (the peds-ARDS severity metric and the saturation-only proxy
  used when no ABG is drawn), and the driving pressure / static
  compliance (the single most outcome-associated lung-protective
  parameter) do not.

Each is a published formula, computed in seconds, that a nurse or
RT currently does on scratch paper or skips. v55 ships them.

## 2. What v55 adds (13 tiles)

### 2.1 `anc` — Absolute Neutrophil Count + neutropenia grade

- **Citation:** Common Terminology Criteria for Adverse Events
  (CTCAE) v5.0, U.S. DHHS/NCI, 2017 (neutropenia grading); ANC =
  WBC × (% segmented neutrophils + % bands) / 100.
- **citationUrl:** https://ctep.cancer.gov/protocoldevelopment/electronic_applications/ctc.htm
- **Group:** Clinical Math & Conversions (`E`).
- **Specialties:** `nursing-onc`, `nursing-icu`, `hematology`,
  `internal-medicine`.
- **Inputs:** WBC (×10⁹/L or K/µL), % neutrophils (segs), %
  bands.
- **Output:** ANC (cells/µL) and CTCAE grade — normal
  (≥1500), mild (1000–1499), moderate (500–999), severe
  (<500), and the conventional <500 "neutropenic precautions /
  fever = emergency" flag.

### 2.2 `retic-index` — Corrected reticulocyte count + Reticulocyte Production Index

- **Citation:** Hillman RS, Finch CA. *Red Cell Manual.* 7th ed.
  FA Davis, 1996 (maturation-correction factors). Corrected retic
  = retic% × (measured Hct / 45); RPI = corrected retic /
  maturation factor.
- **Group:** Clinical Math & Conversions (`E`).
- **Specialties:** `hematology`, `internal-medicine`,
  `nursing-floor`.
- **Inputs:** reticulocyte % (or absolute), hematocrit (%).
- **Output:** corrected reticulocyte %, RPI, and the
  interpretation band — RPI <2 = inadequate marrow response
  (hypoproliferative), RPI >2–3 = adequate response (hemolysis /
  blood loss).

### 2.3 `tsat` — Transferrin saturation + iron-studies interpreter

- **Citation:** Kidney Disease: Improving Global Outcomes
  (KDIGO) Anemia in CKD work group, and AGA/ACG iron-deficiency
  guidance; TSAT (%) = serum iron / TIBC × 100.
- **Group:** Clinical Math & Conversions (`E`).
- **Specialties:** `hematology`, `nephrology`, `nursing-floor`,
  `nursing-onc`.
- **Inputs:** serum iron (µg/dL), TIBC (µg/dL), optional ferritin
  (ng/mL).
- **Output:** TSAT (%); pattern interpretation — TSAT <20% with
  low ferritin = absolute iron deficiency; TSAT <20% with normal/
  high ferritin = functional iron deficiency / anemia of
  inflammation. No dosing automation.

### 2.4 `cci-platelet` — Corrected Count Increment (platelet refractoriness)

- **Citation:** AABB Technical Manual, 20th ed., 2020; CCI =
  (post-transfusion − pre-transfusion platelet count, ×10⁹/L) ×
  BSA (m²) / platelets transfused (×10¹¹).
- **Group:** Clinical Math & Conversions (`E`).
- **Specialties:** `hematology`, `transfusion-medicine`,
  `nursing-onc`.
- **Inputs:** pre- and post-transfusion platelet count (×10⁹/L),
  BSA (m²) or height+weight, platelet dose (×10¹¹).
- **Output:** CCI at the stated interval; the <5000–7500
  ("refractory") threshold and the "consider HLA-matched
  platelets" note when two sequential CCIs are low.

### 2.5 `ldl-calc` — Calculated LDL (Friedewald + Martin/Hopkins)

- **Citation:** Friedewald WT, Levy RI, Fredrickson DS. Clin
  Chem. 1972;18(6):499-502; Martin SS, et al. JAMA.
  2013;310(19):2061-2068 (adjustable factor for accuracy at high
  TG / low LDL).
- **citationUrl:** https://doi.org/10.1001/jama.2013.280532
- **Group:** Clinical Math & Conversions (`E`).
- **Specialties:** `cardiology`, `internal-medicine`,
  `nursing-floor`.
- **Inputs:** total cholesterol, HDL, triglycerides (mg/dL).
- **Output:** Friedewald LDL and Martin/Hopkins LDL side by
  side, with a note that Friedewald is invalid for TG ≥400 mg/dL
  (where Martin/Hopkins or direct LDL is preferred).

### 2.6 `eag-a1c` — Estimated Average Glucose from A1c (ADAG)

- **Citation:** Nathan DM, et al. (A1c-Derived Average Glucose
  study group). Diabetes Care. 2008;31(8):1473-1478; eAG (mg/dL)
  = 28.7 × A1c − 46.7.
- **citationUrl:** https://doi.org/10.2337/dc08-0545
- **Group:** Clinical Math & Conversions (`E`).
- **Specialties:** `endocrinology`, `nursing-floor`,
  `family-medicine`, `patients`.
- **Inputs:** HbA1c (%).
- **Output:** estimated average glucose in mg/dL and mmol/L, with
  the linear-relationship caveat (eAG is a population estimate,
  not a substitute for individual glucose monitoring).

### 2.7 `cao2-do2` — Arterial O₂ content (CaO₂) + O₂ delivery (DO₂)

- **Citation:** standard oxygen-transport physiology (e.g.
  Marino PL, *The ICU Book*, 4th ed., 2014). CaO₂ = (1.34 × Hb ×
  SaO₂/100) + (0.0031 × PaO₂); DO₂ = CaO₂ × cardiac output × 10.
- **Group:** Clinical Math & Conversions (`E`).
- **Specialties:** `nursing-icu`, `critical-care`,
  `respiratory-therapy`, `anesthesiology`.
- **Inputs:** hemoglobin (g/dL), SaO₂ (%), PaO₂ (mmHg), optional
  cardiac output (L/min) for DO₂.
- **Output:** CaO₂ (mL O₂/dL); DO₂ (mL O₂/min) when cardiac
  output is supplied; dissolved-vs-bound contribution breakdown.

### 2.8 `oxygenation-index` — Oxygenation Index (OI) + Oxygen Saturation Index (OSI)

- **Citation:** Pediatric Acute Lung Injury Consensus Conference
  (PALICC-2), Emeriaud G, et al. Pediatr Crit Care Med.
  2023;24(2):143-168. OI = (FiO₂ × mean airway pressure × 100) /
  PaO₂; OSI = (FiO₂ × MAP × 100) / SpO₂.
- **citationUrl:** https://doi.org/10.1097/PCC.0000000000003147
- **Group:** Clinical Math & Conversions (`E`).
- **Specialties:** `nursing-picu`, `nursing-nicu`,
  `pediatric-critical-care`, `respiratory-therapy`.
- **Inputs:** FiO₂ (0.21–1.0), mean airway pressure (cmH₂O),
  PaO₂ (mmHg) for OI / SpO₂ (%) for OSI.
- **Output:** OI and OSI with the PALICC-2 pediatric-ARDS
  severity bands (mild / moderate / severe), and the note that
  OSI is the saturation-only proxy used when no arterial line/ABG
  is available.

### 2.9 `driving-pressure` — Driving pressure + static/dynamic compliance

- **Citation:** Amato MBP, et al. NEJM. 2015;372(8):747-755
  (driving pressure and survival in ARDS); ΔP = plateau pressure
  − PEEP; static compliance = tidal volume / ΔP.
- **citationUrl:** https://doi.org/10.1056/NEJMsa1410639
- **Group:** Clinical Math & Conversions (`E`).
- **Specialties:** `nursing-icu`, `respiratory-therapy`,
  `critical-care`.
- **Inputs:** plateau pressure (cmH₂O), PEEP (cmH₂O), tidal
  volume (mL), optional peak pressure for dynamic compliance.
- **Output:** driving pressure (cmH₂O) with the ≤15 cmH₂O
  lung-protective target flag, static compliance, and dynamic
  compliance when peak pressure is supplied.

### 2.10 `ttkg` — Transtubular Potassium Gradient

- **Citation:** West ML, et al. (renal physiology of the TTKG),
  and Halperin ML, Kamel KS. Kidney Int. 1998;53(5):1313-1327.
  TTKG = (urine K / plasma K) / (urine osm / plasma osm).
- **Group:** Clinical Math & Conversions (`E`).
- **Specialties:** `nephrology`, `nursing-icu`,
  `internal-medicine`.
- **Inputs:** urine K and plasma K (mEq/L), urine and plasma
  osmolality (mOsm/kg).
- **Output:** TTKG, with the interpretation bands and the
  mandatory validity note: TTKG is interpretable only when urine
  osmolality > plasma osmolality and urine Na > 25 mEq/L (the
  renderer surfaces this guard rather than computing on invalid
  conditions).

### 2.11 `urine-anion-gap` — Urine Anion Gap (non-gap metabolic acidosis)

- **Citation:** Goldstein MB, et al. Am J Med Sci. 1986;292(4):
  198-202 (urine net charge / urinary ammonium estimation). UAG =
  urine Na + urine K − urine Cl.
- **Group:** Clinical Math & Conversions (`E`).
- **Specialties:** `nephrology`, `nursing-icu`,
  `internal-medicine`, `emergency-medicine`.
- **Inputs:** urine Na, urine K, urine Cl (mEq/L).
- **Output:** UAG, with the interpretation — negative UAG
  (appropriate renal ammonium excretion → GI bicarbonate loss,
  e.g. diarrhea); positive UAG (impaired ammonium excretion →
  renal tubular acidosis). Distinguishes the two commonest causes
  of a normal-anion-gap acidosis.

### 2.12 `acid-base-deficit` — Bicarbonate deficit + Sodium deficit

- **Citation:** Adrogué HJ, Madias NE. NEJM. 2000;342(20):
  1493-1499 (sodium); standard base-deficit replacement formula.
  HCO₃ deficit = 0.5 × weight × (target − measured HCO₃); Na
  deficit = TBW × (target − measured Na).
- **citationUrl:** https://doi.org/10.1056/NEJM200005183422006
- **Group:** Clinical Math & Conversions (`E`).
- **Specialties:** `nursing-icu`, `critical-care`, `nephrology`.
- **Inputs:** weight (kg), sex (for TBW fraction), measured and
  target HCO₃ (mEq/L), measured and target Na (mEq/L).
- **Output:** total bicarbonate deficit (mEq) and total sodium
  deficit (mEq), explicitly labeled as *deficit estimates* — not
  an infusion rate (the existing `corrected-sodium` /
  Adrogué-Madias rate planner owns rate). Carries the
  over-rapid-correction warning for hyponatremia (≤8 mEq/L per
  24 h).

### 2.13 `schwartz-egfr` — Bedside Schwartz eGFR (pediatric)

- **Citation:** Schwartz GJ, et al. (bedside/updated Schwartz).
  J Am Soc Nephrol. 2009;20(3):629-637; eGFR = 0.413 × height
  (cm) / serum creatinine (mg/dL).
- **citationUrl:** https://doi.org/10.1681/ASN.2008030287
- **Group:** Clinical Math & Conversions (`E`).
- **Specialties:** `pediatrics`, `pediatric-nephrology`,
  `nursing-picu`, `nursing-peds`.
- **Inputs:** height (cm), serum creatinine (mg/dL).
- **Output:** estimated GFR (mL/min/1.73 m²) for a child/
  adolescent, with the validity note (bedside Schwartz is
  validated for ages 1–18 with IDMS-traceable creatinine; not for
  neonates or adults — the adult `egfr-suite` owns those).

## 3. Per-tile robustness (inherits spec-v53)

Every tile in §2 lands on top of [spec-v53](spec-v53.md):

- All compute functions import `r1`/`r2`/`r3`, `num`, and `fmt`
  from `lib/num.js`; none re-declares them.
- Division denominators (TIBC, plasma K, urine osm − plasma osm,
  PaO₂, driving pressure, serum creatinine) are guarded: a
  non-positive or conditions-invalid denominator returns `null`,
  and the renderer shows a `(…)` fallback through `fmt()`, never
  `NaN`/`Infinity`/`undefined`.
- `ttkg` enforces its interpretability preconditions (urine osm >
  plasma osm, urine Na > 25) as a *surfaced guard*, not a silent
  computation.
- Each new export is automatically covered by
  `test/integration/fuzz-tools.spec.js` (spec-v53 §4.4) once its
  lib module is imported there.

## 4. Files touched

```
docs/spec-v55.md                         (this file)
app.js                                   (+13 UTILITIES rows, group E)
lib/clinical-v6.js                       (new module: 13 compute exports)
lib/meta.js                              (+13 META entries, inline citations + accessed)
views/group-v7.js                        (new renderer module: 13 renderers)
app.js                                   (import group-v7 renderers into RENDERERS)
docs/citation-staleness.md               (+ rows for guideline-derived tiles: tsat, oxygenation-index)
test/unit/anc.test.js                    (new)
test/unit/retic-index.test.js            (new)
test/unit/tsat.test.js                   (new)
test/unit/cci-platelet.test.js           (new)
test/unit/ldl-calc.test.js               (new)
test/unit/eag-a1c.test.js                (new)
test/unit/cao2-do2.test.js               (new)
test/unit/oxygenation-index.test.js      (new)
test/unit/driving-pressure.test.js       (new)
test/unit/ttkg.test.js                   (new)
test/unit/urine-anion-gap.test.js        (new)
test/unit/acid-base-deficit.test.js      (new)
test/unit/schwartz-egfr.test.js          (new)
test/integration/fuzz-tools.spec.js      (import lib/clinical-v6.js for coverage)
docs/audits/v11/anc.md ... schwartz-egfr.md   (13 new audit logs)
docs/scope-mdcalc-parity.md              (catalog count 255 -> 268)
CHANGELOG.md                             (Unreleased: v55 entry, +13)
README.md                                (catalog count 255 -> 268)
package.json                             (description count 255 -> 268)
```

## 5. Acceptance criteria

v55 is fully shipped when:

- This file exists.
- All 13 tiles in §2 are present: each has a `META[id]` entry, a
  primary citation visible inline, ≥3 boundary worked examples in
  its unit test, and a [spec-v11](spec-v11.md) audit log in
  `docs/audits/v11/`.
- Each tile's compute function uses the shared `lib/num.js`
  helpers and is covered by the spec-v53 fuzz harness with zero
  `NaN`/`Infinity`/`undefined` leaks across the adversarial
  matrix.
- The two guideline-derived tiles (`tsat`, `oxygenation-index`)
  carry an `accessed` date and a `docs/citation-staleness.md` row
  ([spec-v54](spec-v54.md)).
- `UTILITIES.length` is 268, and all 15 catalog-truth surfaces
  ([spec-v46](spec-v46.md)) agree.
- `npm run lint`, `npm run test`, `npm run sbom`, and
  `npm run build` all pass.
- The CHANGELOG records v55 with the +13 catalog delta.

## 6. Out of scope for v55

- Full iron-overload / hemochromatosis staging from TSAT and
  ferritin — the `tsat` tile reports the pattern, not a
  management pathway. Candidate for a future spec.
- A complete six-equation acid-base compensation engine (acute vs
  chronic respiratory, fully integrated) — `winters` and the ABG
  walkthrough own the acid-base teaching surface; v55 adds only
  the renal/deficit pieces. Candidate for a future spec.
- Cardiac-output measurement or estimation — `cao2-do2` takes a
  user-supplied cardiac output; v55 does not add a Fick or
  thermodilution estimator.
- Neonatal/adult Schwartz variants — `schwartz-egfr` is the
  bedside pediatric equation only; the adult suite already ships.

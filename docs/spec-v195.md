# spec-v195.md — Advanced oxygenation & ventilation efficiency: the SpO2/FiO2 (S/F) ratio, the ventilatory ratio, the oxygen saturation index, and the ventilation index (+4 tiles)

> Status: **PROPOSED (2026-07-01).** Feature spec of the **Advanced Specialist
> Quantitation** program ([spec-v193](spec-v193.md) §1.1). Adds **4** deterministic
> gas-exchange / ventilation-efficiency instruments. **Each tile was verified absent
> by a direct scan of `app.js`** (zero id / name / keyword hits): the catalog carries
> `pf-ratio`, `aa-gradient`, `aa-pf-suite`, `oxygenation-index` (the PaO₂-based OI),
> `dead-space`, `minute-ventilation`, `driving-pressure`, `mechanical-power`, and
> `mean-airway-pressure`, but **not** the non-invasive SpO₂/FiO₂ ratio, the
> ventilatory ratio, the SpO₂-based oxygen saturation index, or the ventilation index.
>
> Catalog effect: **live `UTILITIES.length` + 4** — enforced by the catalog-truth
> gate ([spec-v46](spec-v46.md)) at build time; no number is copied here.
>
> Every prior spec remains in force. v195 adds no runtime network call and no AI;
> each tile obeys the [spec-v100](spec-v100.md) §2 doctrine, passes the
> [spec-v29](spec-v29.md) §3 one-line test, ships its citation inline
> ([spec-v54](spec-v54.md)), inherits the [spec-v59](spec-v59.md) output-safety
> contract, renders the [spec-v50](spec-v50.md) §3 posture note, and honors
> [spec-v11](spec-v11.md) §5.3 (**no ventilator-setting or escalation order in
> Sophie's voice**). **Every coefficient, threshold, and severity band is re-fetched
> and cross-verified against ≥2 independent open sources at implementation**
> ([spec-v97](spec-v97.md)); uncertain values carry an explicit *(verify at
> implementation, [spec-v97](spec-v97.md))* tag. The implementing session **re-runs
> the [spec-v85 §6.2](spec-v85.md) collision check** first.

## 1. Thesis

The bedside intensivist grades oxygenation and ventilation efficiency with four
derived quantities the catalog does not yet carry — two of them **non-invasive**
(needing only pulse oximetry, avoiding an arterial stick) and two that quantify
**ventilatory dead space / efficiency**. Each is a transparent formula with published
severity bands, a workhorse in ARDS and pediatric respiratory failure, and each is
decision support — **never a ventilator-setting or escalation order**.

## 2. What v195 adds (4 tiles)

### 2.1 `sf-ratio` — SpO2/FiO2 (S/F) Ratio with estimated P/F

- **Citation:** Rice TW, Wheeler AP, Bernard GR, et al. Comparison of the SpO₂/FiO₂
  ratio and the PaO₂/FiO₂ ratio in patients with acute lung injury or ARDS. *Chest.*
  2007;132(2):410-417.
- **citationUrl:** https://doi.org/10.1378/chest.07-0617
- **Group:** E (clinical math). **Specialties:** `critical-care`, `pulmonology`,
  `emergency-medicine`.
- **Inputs:** SpO₂ (%) and FiO₂. Computes **S/F = SpO₂ / FiO₂** and the Rice-regression
  estimate **P/F ≈ (S/F − 64) / 0.84** (equivalently S/F = 64 + 0.84 × P/F).
- **Output:** the **S/F ratio and estimated P/F** with the ALI/ARDS oxygenation band
  (S/F 315 ≈ P/F 300 ALI; S/F 235 ≈ P/F 200 ARDS *(verify at implementation,
  [spec-v97](spec-v97.md))*), and the explicit **validity caveat that S/F is only
  reliable when SpO₂ ≤ 97%** (ceiling effect). Class A. Cross-links `pf-ratio`,
  `oxygenation-index`, `aa-pf-suite`.

### 2.2 `ventilatory-ratio` — Ventilatory Ratio (VR)

- **Citation:** Sinha P, Fauvel NJ, Singh S, Soni N. Ventilatory ratio: a simple
  bedside measure of ventilation. *Br J Anaesth.* 2009;102(5):692-697.
- **citationUrl:** https://doi.org/10.1093/bja/aep054
- **Group:** E. **Specialties:** `critical-care`, `pulmonology`,
  `respiratory-therapy`.
- **Inputs:** measured minute ventilation (mL/min), measured PaCO₂ (mmHg), height, and
  sex (for ARDSNet predicted body weight). Computes
  **VR = (V̇E_measured × PaCO₂_measured) / (PBW × 100 × 37.5)** (normal ≈ 1).
- **Output:** the **ventilatory ratio (dimensionless)** with its interpretation —
  higher = worse ventilatory efficiency / larger dead-space fraction; VR rising above
  ~2 tracks ARDS mortality *(verify at implementation, [spec-v97](spec-v97.md))* —
  naming the inputs. Guards the PBW denominator > 0. Class A. Cross-links `dead-space`,
  `minute-ventilation`, `driving-pressure`.

### 2.3 `osi-oxygenation` — Oxygen Saturation Index (OSI)

- **Citation:** Pediatric Acute Lung Injury Consensus Conference Group. Pediatric
  acute respiratory distress syndrome: consensus recommendations from the Pediatric
  Acute Lung Injury Consensus Conference. *Pediatr Crit Care Med.* 2015;16(5):428-439.
- **citationUrl:** https://doi.org/10.1097/PCC.0000000000000350
- **Group:** E. **Specialties:** `pediatric-critical-care`, `critical-care`,
  `pulmonology`.
- **Inputs:** FiO₂, mean airway pressure (cmH₂O), and SpO₂ (%). Computes
  **OSI = (FiO₂ × mean airway pressure × 100) / SpO₂** — the non-invasive analogue of
  the PaO₂-based oxygenation index.
- **Output:** the **OSI value** with the PARDS severity band (mild 5–<7.5, moderate
  7.5–<12.3, severe ≥12.3 *(verify at implementation, [spec-v97](spec-v97.md))*), and
  the **SpO₂ ≤ 97% validity caveat**. Guards SpO₂ > 0. Class A. Cross-links
  `oxygenation-index`, `mean-airway-pressure`, `sf-ratio`.

### 2.4 `ventilation-index` — Ventilation Index (VI)

- **Citation:** Paret G, Ziv T, Barzilai A, et al. Ventilation index and outcome in
  children with acute respiratory distress syndrome. *Pediatr Pulmonol.*
  1998;26(2):125-128.
- **citationUrl:** https://doi.org/10.1002/(SICI)1099-0496(199808)26:2%3C125::AID-PPUL9%3E3.0.CO;2-L
- **Group:** E. **Specialties:** `pediatric-critical-care`, `critical-care`,
  `respiratory-therapy`.
- **Inputs:** respiratory rate, peak inspiratory pressure (PIP, cmH₂O), and PaCO₂
  (mmHg). Computes **VI = (respiratory rate × PIP × PaCO₂) / 1000**.
- **Output:** the **ventilation index** with its interpretation — higher = worse; used
  to track mortality / extubation-failure risk in pediatric respiratory failure — and
  a note that a PEEP-corrected variant uses (PIP − PEEP). Class A. Cross-links
  `mean-airway-pressure`, `dead-space`, `ventilatory-ratio`.

## 3. Per-tile robustness

- **Every compute routes through `lib/num.js` and is finite-guarded.** `sf-ratio` and
  `osi-oxygenation` guard FiO₂ / SpO₂ > 0; `ventilatory-ratio` guards the PBW
  denominator > 0; `ventilation-index` is a bounded product; outside the valid domain
  each renders a complete-the-fields fallback, never a `NaN`/`Infinity`.
- **The two SpO₂-based tiles (`sf-ratio`, `osi-oxygenation`) render the SpO₂ ≤ 97%
  ceiling caveat in-tile**, so a value is never read outside its validity range
  ([spec-v59](spec-v59.md)).
- **Each tile reports the estimate basis and which severity band applies**, and
  `sf-ratio` labels the P/F output as an *estimate* from the Rice regression, not a
  measured ratio.
- **All four flow through the [spec-v59](spec-v59.md) fuzz harness with zero
  non-finite leaks**, fuzzed at the band boundaries and the zero-denominator edges.
- **These grade gas exchange; they are not orders.** Every tile renders the
  [spec-v50](spec-v50.md) §3 posture note; none authors a ventilator-setting or
  escalation order in Sophie's voice.

## 4. CI/CD & maintenance

- **Maintenance classes (§6.3):** all four are **Class A** — fixed formulas with
  published severity bands, each cited by journal + authors (PALICC is a consensus
  group). The implementing session confirms whether any citation trips
  `ISSUER_PATTERN` ([spec-v92](spec-v92.md)/[spec-v94](spec-v94.md)) and adds a
  `docs/citation-staleness.md` row only if the live pattern matches.
- **Build & gates (§6.1/§6.2):** the four computes live in a new `lib/vent-v195.js`
  module, added to `test/unit/fuzz-tools.test.js` `MODULES`. Renderers live in a new
  `views/group-v195.js`; its `RV195` export is spread into the `app.js` `RENDERERS`
  map. Every input carries a real `<label for>`. The catalog count moves on all **13
  catalog-truth surfaces** using the **live `UTILITIES.length` + 4**; a11y,
  `mobile-no-hscroll`, `mobile-touch-targets`, and the chromium `example-correctness`
  sweep pass. ASCII unit tokens (cmH2O, mmHg, %) accompany any Unicode notation so the
  example-correctness gate matches ([spec-v183](spec-v183.md) precedent).
- **Specialties** are drawn from the closed vocabulary: `critical-care`,
  `pulmonology`, `emergency-medicine`, `respiratory-therapy`,
  `pediatric-critical-care` — all already in the vocabulary.

## 5. Files touched

```
docs/spec-v195.md                        (this file)
app.js                                   (+4 UTILITIES rows; import group-v195 RV195 into RENDERERS)
lib/vent-v195.js                         (new: sfRatio, ventilatoryRatio, osi, ventilationIndex)
lib/meta.js                              (+4 META entries: inline citation + citationUrl + accessed; cross-links to pf-ratio, oxygenation-index, dead-space)
views/group-v195.js                      (new renderer module: 4 renderers)
docs/clinical-citations.md               (+4 rows)
test/unit/sf-ratio.test.js, ventilatory-ratio.test.js, osi-oxygenation.test.js, ventilation-index.test.js  (>=3 worked examples each)
test/unit/fuzz-tools.test.js             (add lib/vent-v195.js to MODULES)
docs/audits/v12/*.md                     (4 spec-v11 audit logs)
docs/scope-mdcalc-parity.md              (catalog count live -> live+4; record the v195 delta)
CHANGELOG.md, README.md, package.json    (catalog count live -> live+4; spec-progression line)
```

## 6. Acceptance criteria

v195 is fully shipped when:

- The implementing session has **re-run the [spec-v85 §6.2](spec-v85.md) collision
  check** and confirmed all four ids are absent (as verified at draft).
- All 4 tiles in §2 are live (Class A) with a `META[id]` entry, inline citation +
  `citationUrl` + `accessed`, and ≥ 3 worked examples each — including an **S/F ratio
  with its estimated P/F and the ≤ 97% caveat exercised**, a **ventilatory ratio above
  and below 2**, an **OSI crossing the moderate/severe PARDS band**, and a
  **ventilation index worked example**.
- Every compute is finite-guarded at its denominator edge, routes through
  `lib/num.js`, and is covered by the [spec-v59](spec-v59.md) fuzz harness with **zero
  non-finite leaks**.
- `UTILITIES.length` is **live + 4** and all catalog-truth surfaces agree.
- `npm run lint`, `npm run test`, `npm run sbom`, and `npm run build` all pass; the
  CHANGELOG records v195 with the +4 delta.

## 7. Out of scope for v195

- **No ventilator-setting / escalation order** — the tiles grade oxygenation and
  ventilation; the FiO₂ / PEEP / mode and escalation decisions stay with the clinician
  and respiratory therapist ([spec-v11](spec-v11.md) §5.3).
- **No copyrighted symptom instrument** — the COPD Assessment Test (CAT) and Asthma
  Control Test (ACT) are proprietary, licensed instruments and fail the
  [spec-v97](spec-v97.md) free-reproducibility bar; they are excluded.
- **No waveform interpretation** — the stress index and esophageal-manometry
  transpulmonary pressure require waveform / hardware input and are not bundled here.

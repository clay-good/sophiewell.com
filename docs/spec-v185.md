# spec-v185.md — Genuinely-absent advanced calculators: Fick cardiac output, Gorlin valve area, Qp/Qs shunt ratio, Doppler LVOT stroke volume, VTE-BLEED, Matsuda index, Rosendaal TTR, and Janmahasatian lean body weight (+8 tiles)

> Status: **SHIPPED (2026-07-01, +8 → 782; commit 9a29087).** This spec **supersedes and replaces** an
> earlier v185–v195 batch of draft specs that were withdrawn: those drafts
> proposed ~49 calculators but an audit against the live `UTILITIES` (774 tiles)
> found ~41 of them **already shipped** (the earlier absence check used a faulty
> keyword scan). This spec re-does the work honestly: every tile below was
> verified absent by a direct scan of `app.js` (zero id/name/keyword hits), and the
> already-present concepts (vancomycin AUC → `vanc-auc`, Berlin ARDS → `berlin-ards`,
> RASS → `rass`, CAM-ICU → `cam-icu`, APRI → `apri`, HEART → `heart`, SAAG → `saag`,
> ICH score → `ich-score`, Duke → `duke-endocarditis`, PSI → `psi`, SMART-COP →
> `smart-cop`, Parkland → `burn-fluid`, King's College → `kings-college`, and the
> rest) are **not** re-shipped.
>
> Adds **8** deterministic, free-to-reproduce calculators that fill *confirmed*
> gaps in the cardiac/echo hemodynamics, anticoagulation, metabolic, and
> dosing-weight surfaces. Catalog effect: **live `UTILITIES.length` + 8** —
> enforced by the catalog-truth gate ([spec-v46](spec-v46.md)) at build time; no
> number is copied here.
>
> Every prior spec remains in force. v185 adds no runtime network call and no AI;
> each tile obeys the [spec-v100](spec-v100.md) §2 doctrine (re-binding
> [spec-v85](spec-v85.md) §2) and the §6 CI/CD contract, passes the
> [spec-v29](spec-v29.md) §3 one-line test, ships its citation inline
> ([spec-v54](spec-v54.md)), inherits the [spec-v59](spec-v59.md) output-safety
> contract, renders the [spec-v50](spec-v50.md) §3 posture note, and honors
> [spec-v11](spec-v11.md) §5.3 (**no order in Sophie's voice**). **Every constant,
> coefficient, and band is re-fetched and cross-verified against ≥2 independent
> sources at implementation** ([spec-v97](spec-v97.md)); uncertain values carry an
> explicit *(verify at implementation, [spec-v97](spec-v97.md))* tag. The
> implementing session **re-runs the [spec-v85 §6.2](spec-v85.md) collision check**
> and confirms all eight ids are still absent before writing code.

## 1. Thesis

The catalog is already comprehensive (774 tiles), so the value here is precision:
eight genuinely-missing computations that a cardiologist, intensivist, endocrinologist,
or pharmacist still cannot reach for. Four complete the invasive/echo hemodynamics
set the catalog left open (a **Fick** cardiac output beside the thermodilution
`hemodynamic-suite`, the **Gorlin** catheter valve area beside the continuity-equation
`aortic-valve-area`, the **Qp/Qs** shunt ratio, and the **Doppler LVOT-VTI** stroke
volume). Two close anticoagulation gaps (the **VTE-BLEED** bleeding score for
patients on stable anticoagulation, and the **Rosendaal** time-in-therapeutic-range
quality metric). One adds the **Matsuda** whole-body insulin-sensitivity index beside
the fasting-only `homa-ir`/`quicki`. One adds the **Janmahasatian lean body weight**
that anesthetic and drug dosing is scaled to. Each is a transparent formula or point
score — auditable, unit-tested at its band edges — and each is decision support,
**never an order**.

## 2. What v185 adds (8 tiles)

### 2.1 `fick-cardiac-output` — Cardiac Output by the Fick Principle

- **Citation:** Fick A. Über die Messung des Blutquantums in den Herzventrikeln.
  *Sitzungsber Phys Med Ges Würzburg.* 1870. Estimated-VO₂ form: LaFarge CG,
  Miettinen OS. The estimation of oxygen consumption. *Cardiovasc Res.*
  1970;4(1):23-30.
- **citationUrl:** https://doi.org/10.1093/cvr/4.1.23
- **Group:** E. **Specialties:** `cardiology`, `critical-care`, `echocardiography`,
  `pediatric-cardiology`.
- **Inputs:** VO₂ (measured, or estimated by LaFarge from age / sex / heart rate),
  hemoglobin, and the arterial and mixed-venous O₂ saturations (± PaO₂/PvO₂).
  **CO = VO₂ / [(Ca − Cv)O₂ × 10]**, with the cardiac index when BSA is supplied.
- **Output:** the **cardiac output (L/min)** and **cardiac index**, naming the
  arteriovenous O₂ difference, banded against normal CI 2.5–4.0 L/min/m². Class A.
  Cross-links `hemodynamic-suite` (thermodilution) and `cao2-do2`.

### 2.2 `gorlin` — Gorlin Valve-Area Equation

- **Citation:** Gorlin R, Gorlin SG. Hydraulic formula for the calculation of the
  area of the stenotic mitral valve, other cardiac valves, and central circulatory
  shunts. *Am Heart J.* 1951;41(1):1-29.
- **citationUrl:** https://doi.org/10.1016/0002-8703(51)90002-6
- **Group:** E. **Specialties:** `cardiology`, `interventional-radiology`,
  `echocardiography`, `critical-care`.
- **Inputs:** cardiac output, heart rate, the systolic (aortic) or diastolic
  (mitral) filling period, the mean pressure gradient, and the valve type
  (constant 44.3; the mitral empirical factor). **Valve area = (CO / (period × HR))
  / (44.3 × √mean gradient)** *(verify the constant / period at implementation,
  [spec-v97](spec-v97.md))*.
- **Output:** the **valve area (cm²)** banded by stenosis severity (aortic severe
  < 1.0 cm²), naming the flow and gradient. Class A. Cross-links
  `aortic-valve-area` (continuity method).

### 2.3 `qp-qs` — Pulmonary-to-Systemic Flow Ratio (shunt)

- **Citation:** the Fick-based shunt ratio Qp/Qs = (SaO₂ − SvO₂) / (SpvO₂ − SpaO₂).
  Wilkinson JL. Haemodynamic calculations in the catheter laboratory. *Heart.*
  2001;85(1):113-120.
- **citationUrl:** https://doi.org/10.1136/heart.85.1.113
- **Group:** E. **Specialties:** `pediatric-cardiology`, `cardiology`,
  `interventional-radiology`.
- **Inputs:** the aortic (systemic arterial), mixed-venous, pulmonary-vein
  (default 98%), and pulmonary-artery saturations. **Qp/Qs = (Ao − MV) / (PV − PA)**.
- **Output:** the **Qp/Qs ratio** interpreted (≈ 1 no net shunt; > 1 net
  left-to-right; < 1 net right-to-left; the ~1.5–2.0 intervention-consideration band
  noted *(verify at implementation, [spec-v97](spec-v97.md))*), naming the
  saturations. Class A. Cross-links `gorlin`.

### 2.4 `lvot-stroke-volume` — Doppler Stroke Volume & Cardiac Output (LVOT-VTI)

- **Citation:** Lang RM, Badano LP, Mor-Avi V, et al. Recommendations for cardiac
  chamber quantification by echocardiography in adults (ASE/EACVI). *J Am Soc
  Echocardiogr.* 2015;28(1):1-39. SV = LVOT cross-sectional area × LVOT VTI.
- **citationUrl:** https://doi.org/10.1016/j.echo.2014.10.003
- **Group:** E. **Specialties:** `echocardiography`, `cardiology`, `critical-care`.
- **Inputs:** LVOT diameter (cm), LVOT velocity-time integral (cm), and heart rate.
  Computes **LVOT area = π·(D/2)²**, **SV = area × VTI**, **CO = SV × HR / 1000**,
  and the indexed values with BSA. The [spec-v158](spec-v158.md) echo tiles are the
  ASE precedent (ASE did not trip `ISSUER_PATTERN`).
- **Output:** the **stroke volume (mL)** and **cardiac output (L/min)** (indexed),
  naming the LVOT area, banded against normal SV / CI. Class A. Cross-links
  `hemodynamic-suite` and `fick-cardiac-output`.

### 2.5 `vte-bleed` — VTE-BLEED Score (bleeding risk on anticoagulation)

- **Citation:** Klok FA, Hösel V, Clemens A, et al. Prediction of bleeding events
  in patients with venous thromboembolism on stable anticoagulation treatment.
  *Eur Respir J.* 2016;48(5):1369-1376.
- **citationUrl:** https://doi.org/10.1183/13993003.00280-2016
- **Group:** G. **Specialties:** `hematology`, `cardiology`, `internal-medicine`,
  `pulmonology`.
- **Inputs:** active cancer (2), male with uncontrolled hypertension (1), anemia
  (1.5), history of bleeding (1.5), age ≥ 60 (1.5), renal dysfunction (CrCl 30–60,
  1.5) *(verify weights at implementation, [spec-v97](spec-v97.md))*.
- **Output:** the **score** dichotomized at ≥ 2 (elevated bleeding risk during
  stable anticoagulation), framed to **weigh against recurrence risk, not to stop
  anticoagulation on its own**. Class A. Cross-links `hasbled`, `atria-bleeding`,
  and `orbit-bleeding`.

### 2.6 `matsuda-index` — Matsuda Insulin Sensitivity Index (OGTT)

- **Citation:** Matsuda M, DeFronzo RA. Insulin sensitivity indices obtained from
  oral glucose tolerance testing. *Diabetes Care.* 1999;22(9):1462-1470.
- **citationUrl:** https://doi.org/10.2337/diacare.22.9.1462
- **Group:** E. **Specialties:** `endocrinology`, `internal-medicine`.
- **Inputs:** fasting glucose and insulin, plus the mean glucose and mean insulin
  across the OGTT (or the 0/30/60/90/120-min values). **ISI = 10000 / √(fasting
  glucose × fasting insulin × mean glucose × mean insulin)** *(verify constant /
  units at implementation, [spec-v97](spec-v97.md))*.
- **Output:** the **Matsuda index** (lower = more insulin resistant), a whole-body
  measure complementary to the fasting-only `homa-ir` / `quicki`; guards the
  square-root domain. Class A. Cross-links `homa-ir` and `quicki`.

### 2.7 `rosendaal-ttr` — Time in Therapeutic Range (Rosendaal linear interpolation)

- **Citation:** Rosendaal FR, Cannegieter SC, van der Meer FJM, Briët E. A method
  to determine the optimal intensity of oral anticoagulant therapy. *Thromb
  Haemost.* 1993;69(3):236-239.
- **citationUrl:** https://doi.org/10.1055/s-0038-1651587
- **Group:** E. **Specialties:** `hematology`, `cardiology`, `pharmacy`,
  `primary-care`.
- **Inputs:** a sequence of dated INR values and the target range (default 2.0–3.0).
  Linearly interpolates the INR between consecutive measurements and reports the
  fraction of interpolated days in range.
- **Output:** the **TTR (%)** with days in / below / above range, banded against the
  good-control threshold (≥ 70% *(verify at implementation, [spec-v97](spec-v97.md))*);
  requires ≥ 2 in-order measurements. Class A. Cross-links the warfarin dosing tiles.

### 2.8 `lean-body-weight` — Lean Body Weight (Janmahasatian)

- **Citation:** Janmahasatian S, Duffull SB, Ash S, Ward LC, Byrne NM, Green B.
  Quantification of lean bodyweight. *Clin Pharmacokinet.* 2005;44(10):1051-1065.
- **citationUrl:** https://doi.org/10.2165/00003088-200544100-00004
- **Group:** E. **Specialties:** `anesthesiology`, `pharmacy`, `critical-care`.
- **Inputs:** sex, total body weight, and height (for BMI). **LBW = 9270·TBW /
  (6680 + 216·BMI)** for men; **9270·TBW / (8780 + 244·BMI)** for women *(verify
  constants at implementation, [spec-v97](spec-v97.md))*.
- **Output:** the **lean body weight (kg)**, contrasted with total and ideal body
  weight, noting that many anesthetic induction agents dose to LBW; guards the BMI
  denominator. Class A. Cross-links the IBW/AdjBW/BSA suite.

## 3. Per-tile robustness

- **Every compute routes through `lib/num.js` and is finite-/positive-guarded.**
  Fick guards the (Ca − Cv)O₂ denominator; Gorlin guards the mean gradient > 0
  before the square root; Qp/Qs guards the (PV − PA) denominator ≠ 0;
  `lvot-stroke-volume` guards the LVOT diameter > 0; `matsuda-index` guards the
  radicand > 0 before the root; `rosendaal-ttr` guards ≥ 2 in-order dates and a
  non-zero day-gap; `lean-body-weight` guards the BMI denominator. Outside these,
  each tile renders a complete-the-fields fallback, never a `NaN`/`Infinity` or a
  negative area/content.
- **`vte-bleed` renders the "weigh against recurrence, do not stop on this alone"
  framing as first-class output** ([spec-v59](spec-v59.md); [spec-v11](spec-v11.md)
  §5.3).
- **All eight flow through the [spec-v59](spec-v59.md) fuzz harness with zero
  non-finite leaks**, fuzzed at the divisor, radicand, and gradient edges.
- **These quantify and stratify; they are not orders.** Every tile renders the
  [spec-v50](spec-v50.md) §3 posture note; none authors an order in Sophie's voice.

## 4. CI/CD & maintenance

- **Maintenance classes (§6.3):** all eight are **Class A** — fixed physiologic
  formulas / a validated point score, each cited by journal + authors. The ASE/EACVI
  reference on `lvot-stroke-volume` is the [spec-v158](spec-v158.md) precedent (ASE
  did not trip `ISSUER_PATTERN`); the implementing session confirms the pattern
  result at build time and adds a `docs/citation-staleness.md` row only if one
  matches.
- **Build & gates (§6.1/§6.2):** the eight computes live in a new
  `lib/gaps-v185.js` module, added to `test/unit/fuzz-tools.test.js` `MODULES`.
  Renderers live in a new `views/group-v185.js`; its `RV185` export is spread into
  the `app.js` `RENDERERS` map. Every input carries a real `<label for>`. The
  catalog count moves on all **13 catalog-truth surfaces** ([spec-v46](spec-v46.md))
  using the **live `UTILITIES.length` + 8**; a11y, `mobile-no-hscroll`,
  `mobile-touch-targets`, and the chromium `example-correctness` sweep pass.
- **Specialties** are drawn from the closed vocabulary
  (`test/unit/specialty-coverage.test.js`): `cardiology`, `critical-care`,
  `echocardiography`, `pediatric-cardiology`, `interventional-radiology`,
  `hematology`, `internal-medicine`, `pulmonology`, `endocrinology`,
  `anesthesiology`, `pharmacy`, `primary-care` — all already in the vocabulary.
- **MCP eligibility:** once shipped, `lib/gaps-v185.js` is a clean future
  [spec-v183](spec-v183.md) MCP-wave candidate (flat numeric/enum inputs,
  round-tripping `META.example`, no DOM coupling) — except `rosendaal-ttr`, whose
  variable-length INR series needs a bespoke `toArgs` (ledger it beside the
  array-arg deferrals).

## 5. Files touched

```
docs/spec-v185.md                        (this file)
app.js                                   (+8 UTILITIES rows; import group-v185 RV185 into RENDERERS)
lib/gaps-v185.js                         (new: fickCardiacOutput, gorlin, qpQs, lvotStrokeVolume, vteBleed, matsudaIndex, rosendaalTtr, leanBodyWeight)
lib/meta.js                              (+8 META entries: inline citation + citationUrl + accessed; cross-links to hemodynamic-suite, aortic-valve-area, homa-ir, quicki, hasbled)
views/group-v185.js                      (new renderer module: 8 renderers)
docs/clinical-citations.md               (+8 rows)
test/unit/fick-cardiac-output.test.js, gorlin.test.js, qp-qs.test.js, lvot-stroke-volume.test.js, vte-bleed.test.js, matsuda-index.test.js, rosendaal-ttr.test.js, lean-body-weight.test.js  (>=3 worked examples each)
test/unit/fuzz-tools.test.js             (add lib/gaps-v185.js to MODULES)
docs/audits/v12/*.md                     (8 spec-v11 audit logs)
docs/scope-mdcalc-parity.md              (catalog count live -> live+8; record the v185 delta)
CHANGELOG.md, README.md, package.json    (catalog count live -> live+8; spec-progression line)
```

## 6. Acceptance criteria

v185 is fully shipped when:

- The implementing session has **re-run the [spec-v85 §6.2](spec-v85.md) collision
  check** and confirmed all eight ids are absent (as this spec verified at draft).
- All 8 tiles in §2 are live (Class A) with a `META[id]` entry, inline citation +
  `citationUrl` + `accessed`, and ≥ 3 worked examples each — including a **Fick CO
  from estimated VO₂**, a **Gorlin aortic-vs-mitral pair**, a **Qp/Qs left-to-right
  example**, an **LVOT SV + CO**, a **VTE-BLEED crossing the ≥ 2 cut-point**, a
  **Matsuda index illustrating insulin resistance**, a **Rosendaal TTR with an
  out-of-range interval**, and a **male-vs-female lean body weight**.
- Every compute is finite/positive-guarded (including the Gorlin and Matsuda
  square-root domains and the Qp/Qs denominator), routes through `lib/num.js`, and
  is covered by the [spec-v59](spec-v59.md) fuzz harness with **zero non-finite
  leaks**.
- `UTILITIES.length` is **live + 8** and all catalog-truth surfaces agree.
- `npm run lint`, `npm run test`, `npm run sbom`, and `npm run build` all pass;
  the CHANGELOG records v185 with the +8 delta.

## 7. Out of scope for v185

- **No re-shipping of already-live tiles** — the withdrawn v185–v195 drafts'
  ~41 already-present concepts (vancomycin AUC, aminoglycoside PK, corrected
  phenytoin, Calvert carboplatin, A–a gradient, Berlin ARDS, oxygenation index,
  CaO₂/DO₂, Rumack-Matthew nomogram, King's College, TTKG, Centor, free-water
  deficit, RASS, CAM-ICU, Parkland (`burn-fluid`), maintenance fluids, local-
  anesthetic max, EBV/MABL, Apfel, APRI, Ganzoni, ANC, Light's, HAS-BLED, ICH
  volume/score, FOUR, Canadian CT head, RTS, Duke, PSI, SMART-COP, Westley,
  Finnegan, Silverman-Andersen, PEWS, HEART, SAAG, corrected sodium) are
  cross-linked, not duplicated.
- **No proprietary / closed-coefficient models** — every tile reproduces from its
  cited public equation ([spec-v97](spec-v97.md)).
- **No order** — each tile reports the computed quantity and the source's
  interpretation as decision support ([spec-v11](spec-v11.md) §5.3).

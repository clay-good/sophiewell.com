# spec-v193.md — Acute coronary, primary-PCI & cardiogenic-shock risk: CRUSADE, the SCAI SHOCK stage, the Zwolle primary-PCI score, the TIMI Risk Index, and the CADILLAC risk score (+5 tiles)

> Status: **PROPOSED (2026-07-01).** First feature spec of the **Advanced
> Specialist Quantitation** program (umbrella below, §1.1), advancing the
> long-horizon [scope-mdcalc-parity.md](scope-mdcalc-parity.md) commitment to carry
> every clinically actionable calculator. Adds **5** deterministic acute-cardiology
> risk instruments. **Each tile was verified absent by a direct scan of `app.js`**
> (zero id / name / keyword hits): the catalog carries `grace`, `timi`,
> `timi-stemi`, `heart`, `edacs`, `killip`, `cardshock-score`, and the bleeding
> scores (`hasbled`, `crusade`-adjacent none), but not the CRUSADE NSTEMI bleeding
> score, the SCAI SHOCK cardiogenic-shock stage, the Zwolle primary-PCI early-
> discharge score, the TIMI Risk Index, or the CADILLAC post-PCI mortality score.
>
> Catalog effect: **live `UTILITIES.length` + 5** — enforced by the catalog-truth
> gate ([spec-v46](spec-v46.md)) at build time; no number is copied here.
>
> Every prior spec remains in force. v193 adds no runtime network call and no AI;
> each tile obeys the [spec-v100](spec-v100.md) §2 doctrine (re-binding
> [spec-v85](spec-v85.md) §2) and the §6 CI/CD contract, passes the
> [spec-v29](spec-v29.md) §3 one-line test, ships its citation inline
> ([spec-v54](spec-v54.md)), inherits the [spec-v59](spec-v59.md) output-safety
> contract, renders the [spec-v50](spec-v50.md) §3 posture note, and honors
> [spec-v11](spec-v11.md) §5.3 (**no revascularization, transfusion, mechanical-
> support, or disposition order in Sophie's voice** — these stratify risk; the
> decision stays with the interventional team and the patient). **Every point
> weight, threshold, and risk band is re-fetched and cross-verified against ≥2
> independent open sources at implementation** ([spec-v97](spec-v97.md)); uncertain
> values carry an explicit *(verify at implementation, [spec-v97](spec-v97.md))*
> tag. The implementing session **re-runs the [spec-v85 §6.2](spec-v85.md) collision
> check** first.

### 1.1 Program umbrella — Advanced Specialist Quantitation (v193–v198)

The remaining [scope-mdcalc-parity.md](scope-mdcalc-parity.md) tail is no longer the
common bedside scores — those are carried — but the **specialist-grade instruments**
a subspecialist reaches for: the interventional cardiologist's post-PCI risk models,
the intensivist's invasive-hemodynamic and gas-exchange math, the hepatologist's
transplant-free-survival models, the endocrinologist's thyroid-homeostasis and
β-cell indices, and the subspecialty prognostic scores in heme-onc, ID, neurology,
and gyn-onc. v193 opens a six-spec slice, each a deterministic, cited, actionable
instrument confirmed absent from the catalog:

- **[spec-v193](spec-v193.md)** — acute coronary / primary-PCI / cardiogenic-shock risk (this spec).
- **[spec-v194](spec-v194.md)** — right-heart & echocardiographic hemodynamics.
- **[spec-v195](spec-v195.md)** — advanced oxygenation & ventilation efficiency.
- **[spec-v196](spec-v196.md)** — chronic liver disease prognosis.
- **[spec-v197](spec-v197.md)** — endocrine & metabolic quantitation.
- **[spec-v198](spec-v198.md)** — cross-specialty prognostic & diagnostic scores.

Each slice follows the same contract; further slices may follow.

## 2. What v193 adds (5 tiles)

### 2.1 `crusade` — CRUSADE Major-Bleeding Risk (NSTEMI)

- **Citation:** Subherwal S, Bach RG, Chen AY, et al. Baseline risk of major bleeding
  in non-ST-segment-elevation myocardial infarction: the CRUSADE bleeding score.
  *Circulation.* 2009;119(14):1873-1882.
- **citationUrl:** https://doi.org/10.1161/CIRCULATIONAHA.108.828541
- **Group:** G (clinical scoring & risk). **Specialties:** `cardiology`,
  `emergency-medicine`, `critical-care`.
- **Inputs:** baseline hematocrit (%), creatinine clearance (mL/min), heart rate,
  sex, signs of heart failure at presentation, prior vascular disease, diabetes, and
  systolic blood pressure — each mapped to its published sub-range points. **Note the
  U-shaped systolic-BP term** (both ≤ 90 and ≥ 181 mmHg add points).
- **Output:** the **CRUSADE total (score range ~1–100)** mapped to the in-hospital
  major-bleeding risk band — very low (≤ 20, ~3.1%), low (21–30, ~5.5%), moderate
  (31–40, ~8.5%), high (41–50, ~11.9%), very high (> 50, ~19.5%) *(verify the band
  cut-points and rates at implementation, [spec-v97](spec-v97.md))* — naming the
  contributors. Class A. Cross-links `hasbled`, `heart`, `timi`.

### 2.2 `scai-shock` — SCAI SHOCK Cardiogenic-Shock Stage

- **Citation:** Naidu SS, Baran DA, Jentzer JC, et al. SCAI SHOCK stage
  classification expert consensus update. *J Soc Cardiovasc Angiogr Interv.*
  2022;1(1):100008. Operationalization: Kadosh BS, Berg DD, Bohula EA, et al.
  Criteria for defining stages of cardiogenic shock severity. *J Am Coll Cardiol.*
  2022;80(3):185-198.
- **citationUrl:** https://doi.org/10.1016/j.jscai.2021.100008
- **Group:** G. **Specialties:** `cardiology`, `critical-care`, `emergency-medicine`.
- **Inputs:** the operationalized discrete markers per axis — hypotension /
  vasopressor-or-MCS support, lactate, and (when entered) cardiac index / PCWP —
  applied per the 2022 update as reframed by the Kadosh/Jentzer operationalization,
  which the tile cites because the raw consensus is **prototypical, not a fixed
  input→stage rule**.
- **Output:** the **SCAI stage A–E** (at risk / beginning / classic / deteriorating /
  extremis) with the stage's associated mortality signal, naming which axis drove the
  stage; framed as a shared-vocabulary severity classification, not an order. Class A.
  Cross-links `cardshock-score`, `vasopressor`, `lactate-clearance`.

### 2.3 `zwolle-pci` — Zwolle Primary-PCI Risk Score

- **Citation:** De Luca G, Suryapranata H, van 't Hof AWJ, et al. Prognostic
  assessment of patients with acute myocardial infarction treated with primary
  angioplasty: implications for early discharge. *Circulation.*
  2004;109(22):2737-2743.
- **citationUrl:** https://doi.org/10.1161/01.CIR.0000131765.73959.87
- **Group:** G. **Specialties:** `cardiology`, `critical-care`.
- **Inputs:** Killip class (I 0 / II 4 / III–IV 9), post-PCI TIMI flow (3 → 0, 2 → 1,
  0–1 → 2), **age ≥ 60 (2 points)**, three-vessel disease (1), anterior infarction
  (1), and ischemic time > 4 h (1). Total range 0–16.
- **Output:** the **Zwolle total** with the risk band — score **≤ 3 = low risk**
  (candidate for early discharge; 30-day mortality ~0.1–0.2%), 4–6 intermediate,
  ≥ 7 high *(verify the upper band cut-points at implementation,
  [spec-v97](spec-v97.md))* — naming the contributors. Class A. Cross-links `killip`,
  `timi-stemi`, `grace`.

### 2.4 `timi-risk-index` — TIMI Risk Index

- **Citation:** Wiviott SD, Morrow DA, Frederick PD, et al. Application of the TIMI
  Risk Index in patients with ST-elevation and non-ST-elevation myocardial
  infarction. *J Am Coll Cardiol.* 2006;47(8):1553-1558. Derivation: Morrow DA,
  Antman EM, Giugliano RP, et al. *Lancet.* 2001;358(9293):1571-1575.
- **citationUrl:** https://doi.org/10.1016/j.jacc.2005.11.075
- **Group:** E (clinical math). **Specialties:** `cardiology`, `emergency-medicine`.
- **Inputs:** heart rate, age, and systolic blood pressure. Computes
  **TRI = heart rate × (age / 10)² / systolic blood pressure** (note the **age/10
  squared** term).
- **Output:** the **TIMI Risk Index value** mapped to the mortality-risk group
  (the published quintiles span roughly 5% to 26% long-term mortality across
  increasing index *(verify the group cut-points at implementation,
  [spec-v97](spec-v97.md))*), naming the inputs. Class A. Cross-links `timi`,
  `shock-index`.

### 2.5 `cadillac-risk` — CADILLAC Risk Score (post-PCI mortality)

- **Citation:** Halkin A, Singh M, Nikolsky E, et al. Prediction of mortality after
  primary percutaneous coronary intervention for acute myocardial infarction: the
  CADILLAC risk score. *J Am Coll Cardiol.* 2005;45(9):1397-1405.
- **citationUrl:** https://doi.org/10.1016/j.jacc.2005.01.041
- **Group:** G. **Specialties:** `cardiology`, `critical-care`.
- **Inputs:** baseline LVEF < 40% (4 points), renal insufficiency / CrCl < 60 mL/min
  (3), Killip class 2–3 (3), post-PCI TIMI flow 0–2 (2), age > 65 (2), anemia — Hct
  < 39% (men) / < 36% (women) (2), and three-vessel disease (2). Total range 0–18.
- **Output:** the **CADILLAC total** with the risk band — low (0–2), intermediate
  (3–5), high (≥ 6) — and the band's associated 30-day / 1-year mortality signal
  (low < 1%, intermediate ~4–4.5%, high > 12% at 1 year, *reported qualitatively in
  open sources; verify the exact per-band percentages at implementation,
  [spec-v97](spec-v97.md)*), naming the contributors. Class A. Cross-links
  `zwolle-pci`, `killip`, `grace`.

## 3. Per-tile robustness

- **Every compute routes through `lib/num.js` and is finite-guarded.** `crusade`
  applies the U-shaped systolic-BP term exactly and clamps each input to its
  published sub-range; `timi-risk-index` guards systolic BP > 0 before the division
  and squares age/10 exactly; the point tiles clamp to the published ranges; outside
  these each renders a complete-the-fields fallback, never a `NaN`/`Infinity`.
- **`scai-shock` renders the stage as shared severity vocabulary, not an order**, and
  states in-tile that the consensus is prototypical while its computed stage follows
  the cited Kadosh/Jentzer operationalization ([spec-v59](spec-v59.md);
  [spec-v11](spec-v11.md) §5.3).
- **Every tile reports which rule/term fired** (the CRUSADE contributors, the SCAI
  driving axis, the Zwolle / CADILLAC band), so a result is never read without its
  basis.
- **All five flow through the [spec-v59](spec-v59.md) fuzz harness with zero
  non-finite leaks**, fuzzed at the band / score boundaries and — for
  `timi-risk-index` — at the systolic-BP → 0 edge.
- **These stratify risk; they are not orders.** Every tile renders the
  [spec-v50](spec-v50.md) §3 posture note; none authors a revascularization,
  transfusion, mechanical-support, or disposition order in Sophie's voice.

## 4. CI/CD & maintenance

- **Maintenance classes (§6.3):** all five are **Class A** — fixed point / formula /
  classification models, each cited by journal + authors. The **CRUSADE** and
  **CADILLAC** name the AHA/ACC journals and **SCAI** names the society; the
  implementing session confirms whether those trip `ISSUER_PATTERN`
  ([spec-v92](spec-v92.md)/[spec-v94](spec-v94.md)) at build time and adds a
  `docs/citation-staleness.md` row only if the live pattern matches.
- **Build & gates (§6.1/§6.2):** the five computes live in a new `lib/acs-v193.js`
  module, added to `test/unit/fuzz-tools.test.js` `MODULES`. Renderers live in a new
  `views/group-v193.js`; its `RV193` export is spread into the `app.js` `RENDERERS`
  map. Every input carries a real `<label for>`. The catalog count moves on all **13
  catalog-truth surfaces** using the **live `UTILITIES.length` + 5**; a11y,
  `mobile-no-hscroll`, `mobile-touch-targets`, and the chromium `example-correctness`
  sweep pass.
- **Specialties** are drawn from the closed vocabulary: `cardiology`,
  `critical-care`, `emergency-medicine` — all already in the vocabulary.

## 5. Files touched

```
docs/spec-v193.md                        (this file)
app.js                                   (+5 UTILITIES rows; import group-v193 RV193 into RENDERERS)
lib/acs-v193.js                          (new: crusade, scaiShock, zwollePci, timiRiskIndex, cadillacRisk)
lib/meta.js                              (+5 META entries: inline citation + citationUrl + accessed; cross-links)
views/group-v193.js                      (new renderer module: 5 renderers)
docs/clinical-citations.md               (+5 rows)
test/unit/crusade.test.js, scai-shock.test.js, zwolle-pci.test.js, timi-risk-index.test.js, cadillac-risk.test.js  (>=3 worked examples each)
test/unit/fuzz-tools.test.js             (add lib/acs-v193.js to MODULES)
docs/audits/v12/*.md                     (5 spec-v11 audit logs)
docs/scope-mdcalc-parity.md              (catalog count live -> live+5; record the v193 delta)
CHANGELOG.md, README.md, package.json    (catalog count live -> live+5; spec-progression line)
```

## 6. Acceptance criteria

v193 is fully shipped when:

- The implementing session has **re-run the [spec-v85 §6.2](spec-v85.md) collision
  check** and confirmed all five ids are absent (as verified at draft).
- All 5 tiles in §2 are live (Class A) with a `META[id]` entry, inline citation +
  `citationUrl` + `accessed`, and ≥ 3 worked examples each — including a **CRUSADE
  band crossing with the U-shaped SBP term exercised**, a **SCAI stage set spanning
  B → C → E**, a **Zwolle ≤ 3 low-risk / ≥ 7 high-risk pair**, a **TIMI Risk Index
  value with the age² term**, and a **CADILLAC low / intermediate / high set**.
- Every compute is finite-guarded, routes through `lib/num.js`, and is covered by the
  [spec-v59](spec-v59.md) fuzz harness with **zero non-finite leaks**.
- `UTILITIES.length` is **live + 5** and all catalog-truth surfaces agree.
- `npm run lint`, `npm run test`, `npm run sbom`, and `npm run build` all pass; the
  CHANGELOG records v193 with the +5 delta.

## 7. Out of scope for v193

- **No revascularization / transfusion / mechanical-support / disposition order** —
  the tiles stratify risk; the cath-lab, transfusion, MCS, and admission decisions
  stay with the interventional team and the patient ([spec-v11](spec-v11.md) §5.3).
- **No proprietary nonlinear model** — **GRACE 2.0** (restricted-cubic-spline
  coefficients not openly published) fails the [spec-v97](spec-v97.md) free-
  reproducibility bar and is excluded; the openly-reproducible additive `grace`
  remains the carried instrument.
- **No angiographic scoring** — SYNTAX and similar operator-scored angiographic
  indices are a separate, subjectivity-laden sourcing question and are not bundled
  here.

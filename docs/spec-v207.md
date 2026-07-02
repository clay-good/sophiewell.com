# spec-v207.md — Resuscitation, cardiac arrest & trauma-death prognosis: the CAHP score, the CRASH-2 mortality model, the Termination-of-Resuscitation rule, the CART score, and the Rapid Emergency Medicine Score (+5 tiles)

> Status: **PROPOSED (2026-07-02).** Fourth feature spec of the **Frontline & Bedside
> Decision Instruments** program ([spec-v204](spec-v204.md) §1.1). Adds **5**
> deterministic resuscitation, cardiac-arrest, trauma-death, and deterioration
> instruments. **Each tile was verified absent by a direct scan of `app.js`** (zero id /
> name / keyword hits at draft): the catalog carries `go-far`, `four-score`,
> `shock-index`, `sipa`, `iss-rts`, `triss`, `abc-mtp`, `tash-score`, `news`, `mews`,
> `qsofa`, `sofa`, and `meds-score`, but **not** the CAHP score, the CRASH-2 mortality
> model, the Termination-of-Resuscitation rule, the CART score, or the Rapid Emergency
> Medicine Score.
>
> Catalog effect: **live `UTILITIES.length` + 5** — enforced by the catalog-truth
> gate ([spec-v46](spec-v46.md)) at build time; no number is copied here.
>
> Every prior spec remains in force. v207 adds no runtime network call and no AI; each
> tile obeys the [spec-v100](spec-v100.md) §2 doctrine, passes the
> [spec-v29](spec-v29.md) §3 one-line test, ships its citation inline
> ([spec-v54](spec-v54.md)), inherits the [spec-v59](spec-v59.md) output-safety
> contract, renders the [spec-v50](spec-v50.md) §3 posture note, and honors
> [spec-v11](spec-v11.md) §5.3 (**no resuscitation-termination, rapid-response,
> transfusion, or withdrawal-of-care order in Sophie's voice** — these estimate prognosis
> and support a decision; the go / no-go call stays with the treating team, medical
> control, and — where applicable — the patient / family). **Every point weight,
> coefficient, and risk band is re-fetched and cross-verified against ≥2 independent open
> sources at implementation** ([spec-v97](spec-v97.md)); models published as logistic
> nomograms rather than integer tables carry an explicit *(verify coefficients at
> implementation, [spec-v97](spec-v97.md))* tag. The implementing session **re-runs the
> [spec-v85 §6.2](spec-v85.md) collision check** first.

## 1. Thesis

The catalog carries the in-hospital-arrest survival estimate (GO-FAR) and the trauma
severity scores (ISS/RTS, TRISS), but not the instruments that stratify prognosis *after*
an arrest or major hemorrhage, the validated rule that supports *stopping* field
resuscitation, or the vital-sign models that flag deterioration on the ward and in the ED.
This slice adds the post-arrest neurological-outcome score (CAHP), the traumatic-bleeding
mortality model from the 20,000-patient CRASH-2 trial, the BLS/ALS Termination-of-
Resuscitation rule, the Cardiac Arrest Risk Triage ward-deterioration model (CART), and
the Rapid Emergency Medicine Score for ED mortality (REMS). Each is a transparent
computation and each is decision support — **never a termination, rapid-response,
transfusion, or care-limitation order**.

## 2. What v207 adds (5 tiles)

### 2.1 `cahp-score` — Cardiac Arrest Hospital Prognosis (CAHP) score

- **Citation:** Maupain C, Bougouin W, Lamhaut L, et al. The CAHP (Cardiac Arrest Hospital
  Prognosis) score: a tool for risk stratification after out-of-hospital cardiac arrest.
  *Eur Heart J.* 2016;37(42):3222-3228.
- **citationUrl:** https://doi.org/10.1093/eurheartj/ehv556
- **Group:** G (clinical scoring & risk). **Specialties:** `critical-care`, `cardiology`,
  `emergency-medicine`.
- **Inputs:** age, arrest setting (home vs public), initial rhythm (shockable vs
  non-shockable), no-flow interval (collapse → CPR, minutes), low-flow interval
  (CPR → ROSC, minutes), admission arterial pH, and total epinephrine dose (mg) *(CAHP is
  published as a logistic-regression nomogram totalling to 350; the per-variable
  coefficients are transcribed verbatim from the primary paper at implementation, verify
  coefficients at implementation, [spec-v97](spec-v97.md))*.
- **Output:** the **CAHP score (0–350)** with the three risk bands for poor neurological
  outcome (CPC 3–5) at discharge — **low ≤ 150 (~30%), moderate 150–200 (~86%),
  high ≥ 200 (~99%)** — naming the dominant contributors; framed as an admission-time
  post-arrest prognostic aid for early conversations and post-resuscitation care planning,
  explicitly **not** a basis for withdrawal on its own. Class A. Cross-links `go-far`,
  `four-score`.

### 2.2 `crash2-mortality` — CRASH-2 prognostic model (death in traumatic bleeding)

- **Citation:** Perel P, Prieto-Merino D, Shakur H, et al. Predicting early death in
  patients with traumatic bleeding: development and validation of prognostic model.
  *BMJ.* 2012;345:e5166.
- **citationUrl:** https://doi.org/10.1136/bmj.e5166
- **Group:** G. **Specialties:** `emergency-medicine`, `surgery`, `critical-care`.
- **Inputs:** age, Glasgow Coma Scale, systolic blood pressure (mmHg), heart rate (bpm),
  respiratory rate, and injury type (penetrating vs blunt); a **simple** model uses
  age + SBP + GCS and the **full** model adds HR, RR, and injury type *(CRASH-2 is a
  logistic-regression model / point-of-care chart, not a fixed integer table; the
  published equation is transcribed at implementation, verify coefficients at
  implementation, [spec-v97](spec-v97.md))*.
- **Output:** the predicted **probability of death within 28 days** with the low → high
  risk stratification, naming the entered variables; framed as a routine-variable,
  point-of-care mortality estimate derived from a 20,000-patient trauma trial (designed to
  work in low-resource settings). Class A. Cross-links `iss-rts`, `shock-index`.

### 2.3 `tor-rule` — Termination-of-Resuscitation rule (BLS and ALS)

- **Citation:** Morrison LJ, Visentin LM, Kiss A, et al. Validation of a rule for
  termination of resuscitation in out-of-hospital cardiac arrest. *N Engl J Med.*
  2006;355(5):478-487. **ALS rule:** Morrison LJ, Verbeek PR, Vermeulen MJ, et al.
  Derivation and evaluation of a termination of resuscitation clinical prediction rule for
  advanced life support providers. *Resuscitation.* 2007;74(2):266-275.
- **citationUrl:** https://doi.org/10.1056/NEJMoa052620
- **Group:** G. **Specialties:** `emergency-medicine`, `critical-care`.
- **Inputs:** a rule toggle (BLS vs ALS) and the yes/no criteria — **BLS:** arrest not
  witnessed by EMS, no ROSC before transport, and no shock delivered; **ALS:** the three
  BLS criteria plus no bystander CPR, with "witnessed" extended to bystander witness
  *(verify the exact ALS criterion set at implementation, [spec-v97](spec-v97.md))*.
- **Output:** a categorical result — **all criteria met → "termination of resuscitation
  may be considered"; any criterion absent → "continue resuscitation / transport"** —
  naming which criteria are and are not met, with the reported specificity / positive
  predictive value for death (BLS ≈ 90% / 99.5%); framed strictly as decision support for
  a field crew, **never** a mandate to stop and never a disposition order. Applies to
  non-traumatic adult OHCA only. Class A. Cross-links `go-far`, `cahp-score`.

### 2.4 `cart-score` — Cardiac Arrest Risk Triage (CART) score

- **Citation:** Churpek MM, Yuen TC, Park SY, Gibbons R, Edelson DP. Derivation of a
  cardiac arrest prediction model using ward vital signs. *Crit Care Med.*
  2012;40(7):2102-2108.
- **citationUrl:** https://doi.org/10.1097/CCM.0b013e318250aa5a
- **Group:** G. **Specialties:** `internal-medicine`, `critical-care`,
  `hospital-medicine`.
- **Inputs:** the four ward vital signs, each banded — respiratory rate, heart rate,
  diastolic blood pressure, and age — with the published point weights *(the full banded
  point table is transcribed verbatim at implementation, [spec-v97](spec-v97.md))*.
- **Output:** the **CART total (0–57)** with the deterioration-risk interpretation (a
  score > 20 marks markedly elevated risk of ward cardiac arrest within 48 hours), naming
  the contributing vital signs; framed as a vital-sign early-warning model that
  outperformed MEWS in its derivation for predicting in-hospital arrest. Class A.
  Cross-links `news`, `mews`.

### 2.5 `rems` — Rapid Emergency Medicine Score (REMS)

- **Citation:** Olsson T, Terent A, Lind L. Rapid Emergency Medicine Score: a new
  prognostic tool for in-hospital mortality in nonsurgical emergency department patients.
  *J Intern Med.* 2004;255(5):579-587.
- **citationUrl:** https://doi.org/10.1111/j.1365-2796.2004.01321.x
- **Group:** G. **Specialties:** `emergency-medicine`, `internal-medicine`,
  `critical-care`.
- **Inputs:** the six variables, each banded per the abbreviated-APACHE-II scheme — age,
  mean arterial pressure, heart rate, respiratory rate, peripheral oxygen saturation, and
  Glasgow Coma Scale *(the full banded point table is transcribed verbatim at
  implementation, [spec-v97](spec-v97.md))*.
- **Output:** the **REMS total (0–26)** with the interpretation that in-hospital mortality
  rises steeply with the score (near 0% at ≤ 2 to the majority at ≥ 22), naming the
  contributing variables; framed as a rapid, attribute-light generalization of APACHE II
  for the undifferentiated non-surgical ED patient. Class A. Cross-links `news`,
  `shock-index`.

## 3. Per-tile robustness

- **Every compute routes through `lib/num.js` and is finite-guarded.** CART and REMS are
  bounded banded sums; CAHP and CRASH-2 carry logistic terms — each clamps its inputs to
  the published domains, floors / caps probabilities to [0, 100] %, and renders a
  complete-the-fields fallback for a blank or out-of-domain input rather than a
  `NaN`/`Infinity`. The TOR rule is a pure boolean evaluation.
- **Each tile reports which band / criteria set applies and names the contributing
  items** ([spec-v59](spec-v59.md)) — the CAHP band, the CRASH-2 variables, the met /
  unmet TOR criteria, the CART / REMS contributing vitals — so a result is never read
  without its basis.
- **All five render prognosis / decision support, not orders** — none authors a
  termination, rapid-response, transfusion, or withdrawal-of-care order in Sophie's voice
  ([spec-v11](spec-v11.md) §5.3); each renders the [spec-v50](spec-v50.md) §3 posture
  note. The TOR tile is explicit that "may be considered" is not a mandate to stop.
- **All five flow through the [spec-v59](spec-v59.md) fuzz harness with zero non-finite
  leaks**, fuzzed at the band boundaries and at pH / interval / vital-sign extremes.

## 4. CI/CD & maintenance

- **Maintenance classes (§6.3):** all five are **Class A** — fixed point / logistic
  models, each cited by journal + authors. The implementing session confirms whether any
  citation trips `ISSUER_PATTERN` ([spec-v92](spec-v92.md)/[spec-v94](spec-v94.md)) and
  adds a `docs/citation-staleness.md` row only if the live pattern matches.
- **Build & gates (§6.1/§6.2):** the five computes live in a new
  `lib/resus-prognosis-v207.js` module, added to `test/unit/fuzz-tools.test.js`
  `MODULES`. Renderers live in a new `views/group-v207.js`; its `RV207` export is spread
  into the `app.js` `RENDERERS` map. Every input carries a real `<label for>`. The catalog
  count moves on all **13 catalog-truth surfaces** using the **live `UTILITIES.length` +
  5**; a11y, `mobile-no-hscroll`, `mobile-touch-targets`, and the chromium
  `example-correctness` sweep pass.
- **Specialties** are drawn from the closed vocabulary: `critical-care`, `cardiology`,
  `emergency-medicine`, `surgery`, `internal-medicine`, `hospital-medicine`; the
  implementing session adds any tag missing from `ALLOWED_SPECIALTIES`.

## 5. Files touched

```
docs/spec-v207.md                        (this file)
app.js                                   (+5 UTILITIES rows; import group-v207 RV207 into RENDERERS)
lib/resus-prognosis-v207.js              (new: cahp, crash2, torRule, cart, rems)
lib/meta.js                              (+5 META entries: inline citation + citationUrl + accessed; cross-links to go-far, iss-rts, news)
views/group-v207.js                      (new renderer module: 5 renderers)
docs/clinical-citations.md               (+5 rows)
test/unit/cahp-score.test.js, crash2-mortality.test.js, tor-rule.test.js, cart-score.test.js, rems.test.js  (>=3 worked examples each)
test/unit/fuzz-tools.test.js             (add lib/resus-prognosis-v207.js to MODULES)
docs/scope-mdcalc-parity.md              (catalog count live -> live+5; record the v207 delta)
CHANGELOG.md, README.md, package.json    (catalog count live -> live+5; spec-progression line)
```

## 6. Acceptance criteria

v207 is fully shipped when:

- The implementing session has **re-run the [spec-v85 §6.2](spec-v85.md) collision
  check** and confirmed all five ids are absent (as verified at draft).
- All 5 tiles in §2 are live (Class A) with a `META[id]` entry, inline citation +
  `citationUrl` + `accessed`, and ≥ 3 worked examples each — including a **CAHP crossing
  low / moderate / high**, a **CRASH-2 spanning a mortality range**, a **TOR pair (all
  criteria met vs one absent) for both the BLS and ALS rule**, a **CART across its risk
  range**, and a **REMS spanning a mortality range**.
- Every compute is finite-guarded, routes through `lib/num.js`, clamps probabilities to
  [0, 100] %, and is covered by the [spec-v59](spec-v59.md) fuzz harness with **zero
  non-finite leaks**.
- `UTILITIES.length` is **live + 5** and all catalog-truth surfaces agree.
- `npm run lint`, `npm run test`, `npm run sbom`, and `npm run build` all pass; the
  CHANGELOG records v207 with the +5 delta.

## 7. Out of scope for v207

- **No resuscitation-termination / rapid-response / transfusion / care-limitation
  order** — the tiles estimate prognosis and support a decision; the stop / escalate /
  transfuse / limit calls stay with the treating team, medical control, and the patient /
  family ([spec-v11](spec-v11.md) §5.3).
- **No proprietary or non-reproducible model** — any model whose coefficients are not
  reproducible from ≥ 2 open sources is deferred under [spec-v97](spec-v97.md); CAHP and
  CRASH-2 are included because their model form and risk bands are openly published and
  their coefficients are transcribed from the primary papers at implementation.

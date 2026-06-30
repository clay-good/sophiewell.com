# spec-v185.md — Advanced therapeutic drug monitoring & pharmacokinetic dosing suite: vancomycin AUC, aminoglycoside PK, corrected phenytoin, Calvert carboplatin, and Rosendaal TTR (+5 tiles)

> Status: **PROPOSED (2026-06-30).** First feature spec of the new
> **Advanced Bedside Quantitation** program (umbrella below, §1.1), implementing
> the **therapeutic drug monitoring / pharmacokinetic dosing** cluster. Adds
> **5** deterministic, first-principles pharmacokinetic tools that fill a
> confirmed gap: the catalog doses by weight and renal function and interprets
> single drug levels, but it does not yet carry the **model-based bedside PK**
> the pharmacist and the intensivist reach for — AUC-guided vancomycin,
> individualized aminoglycoside kinetics, albumin/renal-corrected phenytoin,
> AUC-targeted carboplatin, and anticoagulation time-in-range. None duplicates a
> live tile (`digoxin maintenance`, `enoxaparin dose`, `carboplatin` were all
> checked absent for the AUC form at draft).
>
> Catalog effect: **live `UTILITIES.length` + 5** — the catalog-truth gate
> ([spec-v46](spec-v46.md)) enforces the live count + delta at build time; no
> number is copied here (the running counts carry a known off-by-one).
>
> Every prior spec remains in force. v185 adds no runtime network call and no AI;
> each tile obeys the [spec-v100](spec-v100.md) §2 doctrine (re-binding
> [spec-v85](spec-v85.md) §2) and the [spec-v100](spec-v100.md) §6 CI/CD
> contract, passes the [spec-v29](spec-v29.md) §3 one-line test, ships its primary
> citation inline ([spec-v54](spec-v54.md)), inherits the [spec-v59](spec-v59.md)
> output-safety contract, renders the [spec-v50](spec-v50.md) §3 clinical-posture
> note, and honors [spec-v11](spec-v11.md) §5.3 (**no dosing order in Sophie's
> voice** — these compute and interpret; the prescription stays with the
> clinician). **Every coefficient, population kinetic constant, target band, and
> nomogram threshold is re-fetched and cross-verified against ≥2 independent
> sources at implementation** ([spec-v97](spec-v97.md)); nothing here is
> implemented from recall. Any uncertain constant carries an explicit *(verify at
> implementation, [spec-v97](spec-v97.md))* tag.

## 1. Thesis

A bedside calculator catalog that can convert and dose but cannot *individualize*
is missing the one quantitative task pharmacists and intensivists perform most:
turning a measured drug level into the next dose. v185 ships the deterministic,
free-to-reproduce core of therapeutic drug monitoring. Each tile is a closed-form
pharmacokinetic computation — no Bayesian prior, no proprietary nomogram image,
no opaque regression — so each is fully auditable and unit-testable, and each is
**decision support for the prescriber, never an automatic order**.

### 1.1 Program umbrella — Advanced Bedside Quantitation (v185–v187)

v185 opens a three-spec program closing the last *advanced-quantitation* gaps
after MDCalc parity (`spec-v100`), Post-Parity Coverage (`spec-v150`), and the
Subspecialty Depth program: **v185** therapeutic drug monitoring & PK dosing,
**[spec-v186](spec-v186.md)** critical-care oxygenation / gas exchange / ARDS
severity, and **[spec-v187](spec-v187.md)** emergency toxicology, electrolyte &
acute decision instruments. Each feature spec re-verifies its own constants
(spec-v97) and ships only what reproduces from ≥2 independent public sources.

## 2. What v185 adds (5 tiles)

### 2.1 `vancomycin-auc` — Vancomycin AUC₂₄:MIC (first-order two-level kinetics)

- **Citation:** Rybak MJ, Le J, Lodise TP, et al. Therapeutic monitoring of
  vancomycin for serious MRSA infections: a revised consensus guideline of ASHP,
  IDSA, PIDS, and SIDP. *Am J Health-Syst Pharm.* 2020;77(11):835-864. Kinetic
  method: Sawchuk RJ, Zaske DE. *J Pharmacokinet Biopharm.* 1976;4(2):183-195.
- **citationUrl:** https://doi.org/10.1093/ajhp/zxaa036
- **Group:** F (specialized dosing). **Specialties:** `pharmacy`, `critical-care`,
  `infectious-disease`.
- **Inputs:** a peak and a trough level with their draw times relative to the
  infusion, the dose given, the infusion duration, and the target MIC (default
  1 mg/L). Computes the elimination rate constant `k = ln(Cpeak/Ctrough)/Δt`, the
  half-life, the volume of distribution, clearance, and the **steady-state
  AUC₂₄** (trapezoidal over the infusion + elimination phases), then the
  **AUC₂₄:MIC ratio**.
- **Output:** the **AUC₂₄ (mg·h/L)** and **AUC:MIC**, banded against the 2020
  consensus target of **400–600** (sub-therapeutic < 400, target 400–600,
  nephrotoxicity-risk > 600 *(verify the band edges at implementation,
  [spec-v97](spec-v97.md))*), naming the derived k, t½, Vd, and CL. Class A.
  Cross-links `cockcroft-gault` and `digoxin maintenance`.

### 2.2 `aminoglycoside-pk` — Aminoglycoside Kinetics (extended-interval + conventional)

- **Citation:** Nicolau DP, Freeman CD, Belliveau PP, et al. Experience with a
  once-daily aminoglycoside program administered to 2,184 adult patients.
  *Antimicrob Agents Chemother.* 1995;39(3):650-655 (the Hartford nomogram).
  Conventional individualized method: Sawchuk-Zaske (as above).
- **citationUrl:** https://doi.org/10.1128/AAC.39.3.650
- **Group:** F. **Specialties:** `pharmacy`, `infectious-disease`, `critical-care`.
- **Inputs:** agent (gentamicin / tobramycin / amikacin), method (extended-interval
  vs conventional), weight, an estimated CrCl, and — for the conventional path —
  a measured peak and trough with times. Computes k, t½, Vd, the predicted peak
  and trough, and the recommended dose / interval for the chosen target range
  *(targets verified at implementation, [spec-v97](spec-v97.md))*.
- **Output:** the **predicted peak / trough** and the **dose-interval band**
  (Hartford zone for the extended-interval path; conventional peak/trough targets
  otherwise), naming k, t½, and Vd. Class A. Cross-links `cockcroft-gault`.

### 2.3 `phenytoin-correction` — Corrected & Free Phenytoin (Sheiner-Tozer / renal-adjusted)

- **Citation:** Sheiner LB, Tozer TN. Clinical pharmacokinetics: the use of
  plasma concentrations of drugs. In: Melmon & Morrelli, *Clinical
  Pharmacology*, 1978. Renal-adjusted (Liponi) form: Liponi DF, Winter ME,
  Tozer TN. Renal function and therapeutic concentrations of phenytoin.
  *Neurology.* 1984;34(3):395-397.
- **citationUrl:** https://doi.org/10.1212/wnl.34.3.395
- **Group:** E (clinical math). **Specialties:** `neurology`, `pharmacy`,
  `emergency-medicine`.
- **Inputs:** the measured total phenytoin, serum albumin, and a CrCl-impaired
  toggle (the dialysis / CrCl < 25 mL/min branch changes the binding factor from
  0.2 to 0.1 and the albumin denominator constant *(verify at implementation,
  [spec-v97](spec-v97.md))*). Computes the **normalized (albumin-corrected) total
  phenytoin** and the **estimated free phenytoin**.
- **Output:** the **corrected total** and **estimated free** concentrations
  banded against the usual therapeutic ranges (total 10–20 mg/L, free 1–2 mg/L),
  stating the binding factor used. Class A. Cross-links `cockcroft-gault` and the
  corrected-calcium tile.

### 2.4 `carboplatin-calvert` — Calvert Carboplatin Dose (AUC-targeted)

- **Citation:** Calvert AH, Newell DR, Gumbrell LA, et al. Carboplatin dosage:
  prospective evaluation of a simple formula based on renal function. *J Clin
  Oncol.* 1989;7(11):1748-1756.
- **citationUrl:** https://doi.org/10.1200/JCO.1989.7.11.1748
- **Group:** F. **Specialties:** `oncology`, `pharmacy`.
- **Inputs:** target AUC (mg·min/mL, typically 4–7), and a GFR — entered directly
  or estimated from age / weight / sex / creatinine by Cockcroft-Gault. The
  **dose = target AUC × (GFR + 25)**, with the **GFR capped** per the FDA
  guidance (cap GFR at 125 mL/min when estimated from creatinine) so the dose is
  not over-stated in patients with falsely-low creatinine *(cap value verified at
  implementation, [spec-v97](spec-v97.md))*.
- **Output:** the **carboplatin dose (mg)**, naming the GFR used and whether the
  cap was applied. Class A. Cross-links `cockcroft-gault` and the BSA suite.

### 2.5 `rosendaal-ttr` — Time in Therapeutic Range (Rosendaal linear interpolation)

- **Citation:** Rosendaal FR, Cannegieter SC, van der Meer FJM, Briët E. A method
  to determine the optimal intensity of oral anticoagulant therapy. *Thromb
  Haemost.* 1993;69(3):236-239.
- **citationUrl:** https://doi.org/10.1055/s-0038-1651587
- **Group:** E. **Specialties:** `hematology`, `cardiology`, `pharmacy`,
  `primary-care`.
- **Inputs:** a sequence of dated INR values and the target range (default
  2.0–3.0). The method **linearly interpolates the INR between consecutive
  measurements** and computes the fraction of interpolated days that fall within
  range — the **percent time in therapeutic range (TTR)**.
- **Output:** the **TTR (%)** with the days in / below / above range, banded
  against the quality threshold (good control ≥ 70% *(verify at implementation,
  [spec-v97](spec-v97.md))*). Class A. Cross-links the warfarin dosing tiles.

## 3. Per-tile robustness

- **Every kinetic computation routes through `lib/num.js` and is finite- and
  positive-checked.** The elimination constant `k = ln(Cpeak/Ctrough)/Δt` is only
  computed when `Cpeak > Ctrough > 0` and `Δt > 0`; otherwise the tile renders a
  complete-the-fields fallback rather than a value derived from a negative log,
  a divide-by-zero, or a `NaN`. AUC trapezoids, Vd, and CL are each guarded.
- **`carboplatin-calvert` applies the GFR cap before the multiply**, so a
  spuriously low serum creatinine cannot inflate the dose — the [spec-v59](spec-v59.md)
  output-safety contract on a high-consequence number.
- **`rosendaal-ttr` ignores out-of-order or duplicate-date INRs and requires ≥ 2
  measurements**; with fewer it renders the fallback. The interpolation never
  divides by a zero day-gap.
- **All five flow through the [spec-v59](spec-v59.md) fuzz harness with zero
  non-finite leaks**, fuzzed explicitly at the saturation edges (near-equal
  peak/trough, tiny Δt, extreme creatinine).
- **These are decision-support computations, not orders.** Every tile renders the
  [spec-v50](spec-v50.md) §3 posture note and frames the result as the cited
  method's estimate; none authors a dose, an interval, or a hold in Sophie's
  voice ([spec-v11](spec-v11.md) §5.3) — the prescription stays with the
  clinician, the pharmacist, and local protocol.

## 4. CI/CD & maintenance

- **Maintenance classes (§6.3):** all five are **Class A** — fixed
  pharmacokinetic formulas / point methods, each cited by journal + authors. The
  **vancomycin consensus names ASHP/IDSA/PIDS/SIDP**; the implementing session
  confirms whether that trips `ISSUER_PATTERN` ([spec-v92](spec-v92.md)/[spec-v94](spec-v94.md)
  lesson — society acronyms in the issuer regex force a `docs/citation-staleness.md`
  row) at build time rather than from this document, and adds the row only if the
  live pattern matches.
- **Build & gates (§6.1/§6.2):** the five computes live in a new
  `lib/pkdosing-v185.js` module, added to `test/unit/fuzz-tools.test.js` `MODULES`.
  Renderers live in a new `views/group-v185.js`; its `RV185` export is spread into
  the `app.js` `RENDERERS` map. Every input carries a real `<label for>`. The
  catalog count moves on all **13 catalog-truth surfaces** ([spec-v46](spec-v46.md))
  using the **live `UTILITIES.length` + 5**; a11y, `mobile-no-hscroll`,
  `mobile-touch-targets`, and the chromium `example-correctness` sweep pass for
  `views/group-v185.js`.
- **Specialties** are drawn from the closed vocabulary
  (`test/unit/specialty-coverage.test.js`): `pharmacy`, `critical-care`,
  `infectious-disease`, `neurology`, `emergency-medicine`, `oncology`,
  `hematology`, `cardiology`, `primary-care` — all already in the vocabulary.
- **MCP eligibility:** once shipped, `lib/pkdosing-v185.js` is a clean candidate
  for a future [spec-v183](spec-v183.md) MCP wave — flat numeric/enum inputs, a
  `META.example` that round-trips, no DOM coupling.

## 5. Files touched

```
docs/spec-v185.md                        (this file)
app.js                                   (+5 UTILITIES rows; import group-v185 RV185 into RENDERERS)
lib/pkdosing-v185.js                     (new: vancomycinAuc, aminoglycosidePk, phenytoinCorrection, carboplatinCalvert, rosendaalTtr)
lib/meta.js                              (+5 META entries: inline citation + citationUrl + accessed; cross-links to cockcroft-gault, the BSA suite, warfarin tiles)
views/group-v185.js                      (new renderer module: 5 renderers)
docs/clinical-citations.md               (+5 rows)
test/unit/vancomycin-auc.test.js, aminoglycoside-pk.test.js, phenytoin-correction.test.js, carboplatin-calvert.test.js, rosendaal-ttr.test.js  (>=3 worked examples each)
test/unit/fuzz-tools.test.js             (add lib/pkdosing-v185.js to MODULES)
docs/audits/v12/*.md                     (5 spec-v11 audit logs)
docs/scope-advanced-quantitation.md      (new ledger for the v185-v187 program; records the v185 delta)
CHANGELOG.md, README.md, package.json    (catalog count live -> live+5; spec-progression line)
```

## 6. Acceptance criteria

v185 is fully shipped when:

- The implementing session has **re-run the [spec-v85 §6.2](spec-v85.md) collision
  check** and confirmed all five ids are absent.
- All 5 tiles in §2 are live (Class A) with a `META[id]` entry, an inline primary
  citation + `citationUrl` + `accessed`, and ≥ 3 worked examples each — including
  a **vancomycin AUC crossing the 400 and 600 band edges**, an **aminoglycoside
  extended-interval-vs-conventional pair**, a **phenytoin correction with the
  renal binding-factor branch toggled**, a **Calvert dose with the GFR cap
  applied vs not**, and a **Rosendaal TTR with an out-of-range interval**.
- Every kinetic compute is finite/positive-guarded, routes through `lib/num.js`,
  and is covered by the [spec-v59](spec-v59.md) fuzz harness with **zero
  non-finite leaks**.
- `UTILITIES.length` is **live + 5** and all catalog-truth surfaces agree.
- `npm run lint`, `npm run test`, `npm run sbom`, and `npm run build` all pass;
  the CHANGELOG records v185 with the +5 delta.

## 7. Out of scope for v185

- **No Bayesian / population-prior dosing** — model-informed precision dosing
  needs a fitted prior and an optimizer; v185 ships only the closed-form
  first-order methods that reproduce from the cited equations
  ([spec-v97](spec-v97.md)).
- **No proprietary nomogram images** — the Hartford nomogram is reproduced from
  its published zone boundaries, not embedded as a copyrighted figure.
- **No automatic dose order** — every tile reports the computed quantity and the
  source's interpretation as decision support; the prescription stays with the
  clinician and local protocol ([spec-v11](spec-v11.md) §5.3).

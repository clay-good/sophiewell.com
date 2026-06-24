# spec-v164.md — Ophthalmology: IOL power, visual-acuity converter, and ocular perfusion pressure (+3 tiles)

> Status: **PROPOSED (2026-06-23).** Feature spec of the
> [spec-v162](spec-v162.md) **Cross-Discipline Completion** program. Adds **3**
> deterministic ophthalmology computes that fill a confirmed gap — ophthalmology
> has **zero** tiles in the live catalog. None duplicates a live tile.
>
> Catalog effect at v164 close: **live count + 3** (catalog-truth gate enforces).
>
> Every prior spec (v4 through v163) remains in force. v164 adds no runtime
> network call and no AI; each tile obeys the [spec-v100](spec-v100.md) §2
> doctrine, passes the [spec-v29](spec-v29.md) §3 one-line test, ships its primary
> citation inline ([spec-v54](spec-v54.md)), and inherits the
> [spec-v59](spec-v59.md) output-safety contract. Formulas and constants are
> re-fetched and cross-verified to ≥2 sources at implementation
> ([spec-v97](spec-v97.md)).

## 1. Thesis

Ophthalmology is absent from the catalog despite three of its computes being
deterministic, free, and high-frequency: the intraocular-lens power calculation done
for every cataract operation, the visual-acuity unit conversion used in every chart
and study, and the ocular perfusion pressure relevant to glaucoma. Each is a closed
formula over standard biometry/clinical values.

## 2. What v164 adds (3 tiles)

### 2.1 `iol-power` — Intraocular Lens Power (SRK II)

- **Citation:** Sanders DR, Retzlaff J, Kraff MC. Comparison of the SRK II formula
  and other second-generation formulas. *J Cataract Refract Surg.*
  1988;14(2):136-141. (Original SRK: Retzlaff 1980.)
- **citationUrl:** https://doi.org/10.1016/S0886-3350(88)80087-7 (verify at
  implementation)
- **Group:** Clinical Math & Conversions (`E`).
- **Specialties:** `ophthalmology`, `surgery`.
- **Inputs:** the surgeon/lens **A-constant**, axial length (AL, mm), and average
  keratometry (K, diopters); optional target refraction.
- **Output:** **IOL power P = A1 − 0.9·K − 2.5·AL**, where **A1** is the A-constant
  with the **SRK II axial-length adjustment** (+3 if AL<20, +2 if 20–21, +1 if
  21–22, 0 if 22–24.5, −0.5 if ≥24.5), plus the refraction-target correction
  (×1.25/1.0 by power range). Class A. **Explicit caveat:** SRK II is a
  second-generation regression formula; modern biometry uses theoretical/optical
  formulas (SRK/T, Barrett) — the renderer states this and that it does not replace
  device biometry. Guards the inputs.

### 2.2 `visual-acuity-converter` — Visual Acuity Converter (Snellen / logMAR / decimal)

- **Citation:** Holladay JT. Visual acuity measurements. *J Cataract Refract Surg.*
  2004;30(2):287-290.
- **citationUrl:** https://doi.org/10.1016/j.jcrs.2004.01.014 (verify at
  implementation)
- **Group:** Clinical Math & Conversions (`E`).
- **Specialties:** `ophthalmology`, `optometry`, `emergency-medicine`.
- **Inputs:** a visual acuity in any one notation — Snellen (20/x or 6/x metric),
  decimal, or logMAR.
- **Output:** the **equivalent value in the other two notations** — **logMAR =
  log10(denominator/20)** (or −log10(decimal)), **decimal = 20/denominator**,
  Snellen = 20/(20·10^logMAR) — plus the count-fingers/hand-motion/light-perception
  low-vision anchors handled as special cases. Class A. Guards log/division domains;
  the metric (6/x) vs imperial (20/x) toggle is explicit.

### 2.3 `ocular-perfusion-pressure` — Ocular Perfusion Pressure (OPP)

- **Citation:** Costa VP, Harris A, Anderson D, et al. Ocular perfusion pressure in
  glaucoma. *Acta Ophthalmol.* 2014;92(4):e252-266.
- **citationUrl:** https://doi.org/10.1111/aos.12298 (verify at implementation)
- **Group:** Clinical Math & Conversions (`E`).
- **Specialties:** `ophthalmology`, `optometry`.
- **Inputs:** systolic and diastolic blood pressure (mmHg) and intraocular pressure
  (IOP, mmHg).
- **Output:** **mean OPP = ⅔·MAP − IOP** (MAP = DBP + ⅓·(SBP−DBP)), and the
  systolic/diastolic OPP variants (SBP−IOP, DBP−IOP), with the low-OPP
  glaucoma-risk framing. Class A. Cross-linked to `map` (mean arterial pressure).
  Guards the subtraction.

## 3. Per-tile robustness

- All three are **closed-form arithmetic** over finite-checked inputs using
  `lib/num.js`; every log/division (`visual-acuity-converter`) and subtraction
  (`ocular-perfusion-pressure`) is guarded — a blank/non-finite/zero/negative input
  renders a surfaced `valid:false` complete-the-fields fallback rather than
  `NaN`/`Infinity`.
- **`iol-power` A-constant axial-length band** is the chief correctness risk — the
  +3/+2/+1/0/−0.5 adjustment by AL is a documented step table, unit-tested at each
  band boundary (20, 21, 22, 24.5 mm); the refraction-target multiplier is exercised
  on both power ranges.
- **`visual-acuity-converter` low-vision anchors** (CF/HM/LP) are non-numeric special
  cases handled explicitly so they do not feed the log conversion and yield `−∞`.
- **`ocular-perfusion-pressure`** reuses the established MAP formula; the ⅔ factor and
  the three OPP variants are unit-tested against a worked BP/IOP example.
- All three render the [spec-v50](spec-v50.md) §3 posture note (IOL power does not
  replace device biometry; OPP is one of several glaucoma-risk factors) and author
  no order ([spec-v11](spec-v11.md) §5.3).

## 4. CI/CD & maintenance

Per the [spec-v100](spec-v100.md) §6 contract:

- **Maintenance class (§6.3):** all three are **Class A** — fixed published formulas
  cited by journal/authors; none trips `ISSUER_PATTERN`; **no
  `citation-staleness.md` row.**
- **Specialty vocabulary:** adds **`ophthalmology`** and **`optometry`** to
  `ALLOWED_SPECIALTIES` (see [spec-v162](spec-v162.md) §4).
- **Build & gates (§6.1/§6.2):** the three computes live in the new
  `lib/ophtho-v164.js` module (`iolPower`, `visualAcuityConverter`,
  `ocularPerfusionPressure`), added to `fuzz-tools.test.js` `MODULES` (the
  log-domain and AL-band paths fuzzed). Renderers live in the new
  `views/group-v164.js`; its `RV164` export is spread into `app.js` `RENDERERS`.
  The catalog count moves on all **13 catalog-truth surfaces**; a11y,
  `mobile-no-hscroll`, `mobile-touch-targets`, and the chromium
  `example-correctness` sweep pass.

## 5. Files touched

```
docs/spec-v164.md                        (this file)
app.js                                   (+3 UTILITIES rows, group E; import group-v164 RV164 into RENDERERS)
lib/ophtho-v164.js                       (new module: iolPower, visualAcuityConverter, ocularPerfusionPressure)
lib/meta.js                              (+3 META entries: inline citation + citationUrl + accessed; cross-link to map)
views/group-v164.js                      (new renderer module: 3 renderers)
test/unit/specialty-coverage.test.js     (add 'ophthalmology', 'optometry' to ALLOWED_SPECIALTIES)
docs/clinical-citations.md               (+ rows for the three sources)
test/unit/iol-power.test.js, visual-acuity-converter.test.js, ocular-perfusion-pressure.test.js   (≥3 boundary worked examples each)
test/unit/fuzz-tools.test.js             (add lib/ophtho-v164.js to MODULES)
docs/audits/v12/iol-power.md, visual-acuity-converter.md, ocular-perfusion-pressure.md   (spec-v11 audit logs)
docs/scope-cross-discipline.md           (catalog ledger; advance the v162 running count)
CHANGELOG.md                             (Unreleased: v164 entry, +3)
README.md, package.json                  (catalog count + spec-progression line -> v164)
```

## 6. Acceptance criteria

v164 is fully shipped when:

- The implementing session has re-run the [spec-v85 §6.2](spec-v85.md) collision
  check and confirmed all three ids are absent.
- All 3 tiles are live with a `META[id]` entry, inline primary citation +
  `citationUrl` + `accessed`, ≥3 boundary worked examples each (including an
  **IOL power across an axial-length band boundary**, a **Snellen 20/40 ↔ logMAR 0.3
  ↔ decimal 0.5 round-trip**, and an **OPP from a worked BP/IOP**), a
  [spec-v11](spec-v11.md) audit log, and a passing [spec-v29](spec-v29.md) §3 check.
- Every log/division/subtraction is guarded; the AL-band table resolves at each
  boundary; CF/HM/LP anchors are handled; blank inputs render a complete-the-fields
  fallback.
- `ophthalmology`/`optometry` are in `ALLOWED_SPECIALTIES` and
  `specialty-coverage.test.js` passes.
- Every compute uses `lib/num.js` and is covered by the [spec-v59](spec-v59.md)
  fuzz harness with zero non-finite leaks.
- `UTILITIES.length` is live count + 3 and all catalog-truth surfaces agree.
- `npm run lint`, `npm run test`, `npm run sbom`, and `npm run build` all pass; the
  CHANGELOG records v164 with the +3 delta.

## 7. Out of scope for v164

- **No theoretical/optical IOL formulas** — SRK II (regression) is shipped with the
  explicit caveat; SRK/T, Hoffer Q, Holladay, Haigis, and Barrett are device/
  constant-optimized and out of scope for a v164 first pass.
- **No biometry device replacement** — `iol-power` takes the surgeon's measured AL/K/
  A-constant; it does not perform optical biometry.
- **No automatic surgical/medical recommendation** — each tile reports the value and
  the source's framing; the decision stays with the clinician.

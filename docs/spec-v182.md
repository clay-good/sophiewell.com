# spec-v182.md — Continence, caregiver burden & advanced wound assessment: Sandvik, ICIQ-UI-SF, MCSI, CSI, Waterlow, and BWAT (+6 tiles)

> Status: **SHIPPED 5 of 6 (2026-06-29).** Closing implementation spec of the
> spec-v172 LTC-GA program; `sandvik-incontinence` (Group E), `iciq-ui-sf`,
> `modified-caregiver-strain-index`, `caregiver-strain-index`, and `bwat` are live
> (all Class A; bands/cutoffs cross-verified, spec-v97). **Deferred:** `waterlow` —
> the Waterlow Pressure Ulcer Risk card has detailed per-category sub-weights with
> documented edition drift (1985 vs the 2005 revised card) and could not be
> byte-verified against ≥ 2 independent sources at implementation (sourcing gate,
> spec-v97); braden/braden-q/norton-push remain the live pressure-injury tiles.
> Original draft below.
>
> **PROPOSED (2026-06-24).** Feature spec of the
> [spec-v172](spec-v172.md) **Long-Term Care & Geriatric Assessment (LTC-GA)**
> program, cluster **§3.10**, and the **CLOSING spec of the entire LTC-GA
> program** (v173–v182). Adds **6** deterministic continence-severity,
> caregiver-strain, and advanced-wound instruments that fill the confirmed gaps
> in the long-term-care surface. None duplicates a live tile.
>
> Catalog effect at v182: **live count + 6** — the program end state, using the
> live `UTILITIES.length` + delta (never a number copied from this document; the
> catalog-truth gate enforces agreement, per the [spec-v100](spec-v100.md)
> program lessons' known off-by-one).
>
> Every prior spec (v4 through v181) remains in force. v182 adds no runtime
> network call and no AI; each tile obeys the [spec-v100](spec-v100.md) §2
> doctrine (re-binding [spec-v85](spec-v85.md) §2) — including the §2
> classification-tile clarification — and the [spec-v100](spec-v100.md) §6 CI/CD
> contract. Each passes the [spec-v29](spec-v29.md) §3 one-line test, ships its
> primary citation inline ([spec-v54](spec-v54.md)), and inherits the
> [spec-v59](spec-v59.md) output-safety contract. **Every weight, band, and
> category cut-point is re-fetched and cross-verified against ≥2 independent
> sources at implementation** ([spec-v97](spec-v97.md)); nothing here is
> implemented from recall.

## 1. Thesis

v182 closes the LTC-GA program by completing three small but high-traffic
nursing-home surfaces the acute-care passes never indexed: **continence
severity**, **caregiver strain**, and **advanced wound assessment**. The catalog
already carries pressure-injury *risk* (`braden`, `braden-q`) and *one* healing
scale (the PUSH tool inside `norton-push`); v182 adds the alternative Waterlow
risk score and the full Bates-Jensen wound-healing trajectory beside them. It
adds the two free caregiver-strain instruments (CSI and MCSI) that the
assisted-living / home-and-community decision turns on — the licensed Zarit
Burden Interview being excluded (§7). And it adds the two continence-severity
indices (Sandvik, ICIQ-UI-SF) that drive LTC continence care plans.

- **Sandvik index** — the Severity Index for urinary incontinence, a
  frequency × amount product → 1–12 mapped to slight/moderate/severe/very-severe.
- **ICIQ-UI-SF** — the ICIQ Urinary Incontinence Short Form, three scored items
  summed → 0–21 with the published severity bands (a fourth self-diagnostic item
  is unscored).
- **MCSI** — the Modified Caregiver Strain Index, 13 items 0/1/2 → 0–26.
- **CSI** — the original Robinson Caregiver Strain Index, 13 yes/no items → 0–13,
  with the published high-strain threshold.
- **Waterlow** — the Waterlow Pressure Ulcer Risk Assessment, weighted categories
  summed → total with at-risk/high/very-high bands.
- **BWAT** — the Bates-Jensen Wound Assessment Tool, 13 scored items 1–5 → 13–65
  framed as a healing trajectory across serial scores.

## 2. What v182 adds (6 tiles)

### 2.1 `sandvik-incontinence` — Sandvik Severity Index for Urinary Incontinence

- **Citation:** Sandvik H, Hunskaar S, Vanvik A, et al. Diagnostic classification
  of female urinary incontinence: an epidemiological survey corrected for validity.
  *J Epidemiol Community Health.* 1993;47(6):497-499; validation in Sandvik H,
  Seim A, Vanvik A, Hunskaar S. A severity index for epidemiological surveys of
  female urinary incontinence: comparison with 48-hour pad-weighing tests.
  *Neurourol Urodyn.* 2000;19(2):137-145.
- **citationUrl:** https://doi.org/10.1136/jech.47.6.497
- **Group:** Clinical Math & Conversions (`E`).
- **Specialties:** `urology`, `geriatrics`, `nursing-general`.
- **Inputs:** frequency of leakage (1 = less than once a month, up to 4 = every
  day/night) and amount of leakage (1 = drops, 2 = small splashes, 3 = more).
- **Output:** the **Severity Index = frequency × amount** → 1–12, mapped to the
  published categories — **1–2 slight, 3–6 moderate, 8–9 severe, 12 very severe**
  (verify category cut-points at implementation, [spec-v97](spec-v97.md)). Class A.
  The product is guarded against blank inputs (a blank frequency or amount surfaces
  `valid:false`, never a value from `NaN`). Cross-links `iciq-ui-sf`.

### 2.2 `iciq-ui-sf` — ICIQ Urinary Incontinence Short Form

- **Citation:** Avery K, Donovan J, Peters TJ, et al. ICIQ: a brief and robust
  measure for evaluating the symptoms and impact of urinary incontinence.
  *Neurourol Urodyn.* 2004;23(4):322-330.
- **citationUrl:** https://doi.org/10.1002/nau.20041
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `urology`, `geriatrics`, `nursing-general`.
- **Inputs:** the three scored items — frequency of leakage (0–5), amount of
  leakage (0–6), and overall impact on daily life (0–10 visual analogue) — plus the
  fourth self-diagnostic "when does urine leak" item, which is **documented but
  unscored**.
- **Output:** the **ICIQ-UI-SF score = sum of the three scored items** → **0–21**,
  mapped to the published severity bands — **1–5 slight, 6–12 moderate, 13–18
  severe, 19–21 very severe** (verify bands at implementation,
  [spec-v97](spec-v97.md)). Class A. **Registration note:** the ICIQ is **free to
  use, but the questionnaire is registered with the ICIQ Group, Bristol** — v182
  ships the *scoring*, links the source, and **confirms redistribution terms at
  implementation** (a lighter version of the [spec-v172](spec-v172.md) §4 licensing
  flag; if terms cannot be confirmed the tile defers with the §4 set). Cross-links
  `sandvik-incontinence`.

### 2.3 `modified-caregiver-strain-index` — Modified Caregiver Strain Index (MCSI)

- **Citation:** Thornton M, Travis SS. Analysis of the reliability of the Modified
  Caregiver Strain Index. *J Gerontol B Psychol Sci Soc Sci.* 2003;58(2):S127-S132.
- **citationUrl:** https://doi.org/10.1093/geronb/58.2.S127
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `social-work`, `case-management`, `nursing-general`, `geriatrics`.
- **Inputs:** the 13 items, each scored **0 (no) / 1 (yes, sometimes) / 2 (yes, on
  a regular basis)** — covering sleep disruption, physical strain, confinement,
  family adjustments, plan changes, other demands, emotional adjustments, upsetting
  behavior, the change in the person being cared for, work adjustments, financial
  strain, feeling overwhelmed, and being completely overwhelmed.
- **Output:** the **MCSI total** → **0–26**; higher = greater caregiver strain. A
  commonly used threshold is provided in the interpretation (verify the published
  cut-point at implementation, [spec-v97](spec-v97.md)). Class A. Cross-links
  `caregiver-strain-index`.

### 2.4 `caregiver-strain-index` — Caregiver Strain Index (CSI, Robinson)

- **Citation:** Robinson BC. Validation of a Caregiver Strain Index. *J Gerontol.*
  1983;38(3):344-348.
- **citationUrl:** https://doi.org/10.1093/geronj/38.3.344
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `social-work`, `case-management`, `nursing-general`, `geriatrics`.
- **Inputs:** the 13 **yes/no** items (each yes = 1) — sleep, inconvenience,
  physical strain, confinement, family adjustments, plan changes, other demands,
  emotional adjustments, upsetting behavior, the change in the person, work
  adjustments, financial strain, and feeling overwhelmed.
- **Output:** the **CSI total** → **0–13**; **≥ 7 indicates a high level of strain**
  (verify the published threshold at implementation, [spec-v97](spec-v97.md)).
  Class A. Cross-links `modified-caregiver-strain-index`.

### 2.5 `waterlow` — Waterlow Pressure Ulcer Risk Assessment

- **Citation:** Waterlow J. Pressure sores: a risk assessment card. *Nurs Times.*
  1985;81(48):49-55.
- **citationUrl:** https://www.judy-waterlow.co.uk/ (verify the current card edition
  at implementation, [spec-v97](spec-v97.md))
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `wound-care`, `nursing-general`, `nursing-rehab`, `geriatrics`.
- **Inputs:** the weighted categories — build/weight-for-height (BMI band),
  continence, skin type/visual risk, mobility, sex and age, and appetite/recent
  weight loss — plus the **special-risk categories** (tissue malnutrition,
  neurological deficit, major surgery/trauma, and medication) summed on top.
- **Output:** the **Waterlow total**, mapped to the published bands — **10+ at risk,
  15+ high risk, 20+ very high risk** (verify the current card's band values at
  implementation, [spec-v97](spec-v97.md)). Class A. Cross-links `braden` and
  `norton-push` (alternative pressure-injury risk scores).

### 2.6 `bates-jensen` — Bates-Jensen Wound Assessment Tool (BWAT)

- **Citation:** Bates-Jensen BM, Vredevoe DL, Brecht ML. Validity and reliability
  of the Pressure Sore Status Tool. *Decubitus.* 1992;5(6):20-28 (the PSST, renamed
  the Bates-Jensen Wound Assessment Tool); BWAT validation in Harris C, Bates-Jensen
  B, Parslow N, et al. *J Wound Ostomy Continence Nurs.* (verify the validation
  locator at implementation, [spec-v97](spec-v97.md)).
- **citationUrl:** https://doi.org/10.1097/00129334-199211000-00006
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `wound-care`, `nursing-general`.
- **Inputs:** the 13 scored items, each **1–5** — size, depth, edges, undermining,
  necrotic tissue type, necrotic tissue amount, exudate type, exudate amount,
  surrounding skin colour, peripheral tissue oedema, peripheral tissue induration,
  granulation tissue, and epithelialization. **Location and shape are documented but
  unscored.**
- **Output:** the **BWAT total = sum of the 13 scored items** → **13–65**; higher =
  more severe, and a **rising serial score signals a degenerating wound** (a falling
  score signals healing). The renderer frames the number as a **trajectory across
  serial assessments**, not a one-time grade. Class A. Cross-links `norton-push`
  (the PUSH healing tool) and `braden`.

## 3. Per-tile robustness

- **`sandvik-incontinence` is a guarded product** — Index = frequency × amount,
  with a blank or non-finite frequency/amount surfaced as `valid:false` rather than
  producing a value from `NaN`; the category cut-points are unit-tested at each
  boundary (re-fetched verbatim, [spec-v100](spec-v100.md) §5).
- **`iciq-ui-sf`, `modified-caregiver-strain-index`, `caregiver-strain-index`, and
  `waterlow` are bounded weighted sums** mapped to published bands; each names which
  items were counted, and the band boundaries are unit-tested. `iciq-ui-sf` sums
  only the three scored items (the fourth self-diagnostic item is documented but
  never added). `waterlow` adds the special-risk categories on top of the core
  categories.
- **`bates-jensen` is a bounded sum (13–65) framed as a trajectory** — the renderer
  names the worsening items (rising necrotic tissue, deepening, expanding size,
  increasing exudate) and presents the score as a **serial trend** (compare against
  the prior assessment) rather than a single-point grade; location and shape are
  shown but excluded from the total.
- All six render the [spec-v50](spec-v50.md) §3 clinical-posture note and quote the
  source's interpretation; **none authors a care, dosing, or treatment order in
  Sophie's voice** ([spec-v11](spec-v11.md) §5.3); all flow through the
  [spec-v59](spec-v59.md) fuzz harness with **zero non-finite leaks**.

## 4. CI/CD & maintenance

Per the [spec-v100](spec-v100.md) §6 contract (re-binding [spec-v85](spec-v85.md)
§6):

- **Maintenance classes (§6.3):** all six are **Class A** — fixed
  formulas/weights/bands cited by journal + authors (Sandvik, Avery, Thornton-Travis,
  Robinson, Waterlow, Bates-Jensen). The implementing session confirms at build time
  whether any citation issuer trips `ISSUER_PATTERN`
  ([spec-v92](spec-v92.md)/[spec-v94](spec-v94.md) lesson) — none is expected to, as
  all six are journal/author instruments; if one does, it gets a
  `docs/citation-staleness.md` row naming the edition, `accessed` date, and review
  cadence rather than being assumed clean from this document.
- **Licensing flag (§4 of [spec-v172](spec-v172.md)):** `iciq-ui-sf` carries the
  **ICIQ-registration note** — free to use, questionnaire registered with the ICIQ
  Group, Bristol; ship the scoring, link the source, **confirm redistribution terms
  at implementation**, deferring with the [spec-v172](spec-v172.md) §4 set if terms
  cannot be confirmed.
- **Build & gates (§6.1/§6.2):** the six computes live in the new
  `lib/ltcga-v182.js` module (`sandvikIncontinence`, `iciqUiSf`,
  `modifiedCaregiverStrainIndex`, `caregiverStrainIndex`, `waterlow`, `batesJensen`),
  added to the `test/unit/fuzz-tools.test.js` `MODULES` list — `sandvik-incontinence`
  explicitly fuzzed for the product/blank-input path (zero non-finite leaks).
  Renderers live in the new `views/group-v182.js` module; its `RV182` export is
  spread into the `app.js` `RENDERERS` map. Every input carries a real
  `<label for>`. The catalog count moves on all **13 catalog-truth surfaces**
  ([spec-v46](spec-v46.md)) in the same change, using the **live `UTILITIES.length`
  + delta**; a11y, `mobile-no-hscroll`, `mobile-touch-targets`, and the chromium
  `example-correctness` sweep pass for `views/group-v182.js`.
- **Program-close note:** v182 is the **closing spec of the LTC-GA program**
  (v173–v182). `scope-mdcalc-parity.md` records the **LTC-GA program complete** and
  its **final shipped delta** (the running sum of v173–v182's actual shipped tiles,
  including any source-governance deferrals along the way), not the nominal +54 from
  the [spec-v172](spec-v172.md) umbrella.

## 5. Files touched

```
docs/spec-v182.md                        (this file)
app.js                                   (+6 UTILITIES rows, groups E/G; import group-v182 RV182 into RENDERERS)
lib/ltcga-v182.js                        (new module: sandvikIncontinence, iciqUiSf, modifiedCaregiverStrainIndex, caregiverStrainIndex, waterlow, batesJensen)
lib/meta.js                              (+6 META entries: inline citation + citationUrl + accessed; cross-links to braden, braden-q, norton-push, and within the v182 set)
views/group-v182.js                      (new renderer module: 6 renderers)
docs/clinical-citations.md               (+6 rows for the six sources)
test/unit/sandvik-incontinence.test.js, iciq-ui-sf.test.js, modified-caregiver-strain-index.test.js, caregiver-strain-index.test.js, waterlow.test.js, bates-jensen.test.js  (≥3 boundary worked examples each)
test/unit/fuzz-tools.test.js             (add lib/ltcga-v182.js to MODULES)
docs/audits/v12/sandvik-incontinence.md, iciq-ui-sf.md, modified-caregiver-strain-index.md, caregiver-strain-index.md, waterlow.md, bates-jensen.md  (spec-v11 audit logs)
docs/scope-mdcalc-parity.md              (catalog count live -> live + 6; RECORD the LTC-GA program COMPLETE with its final shipped delta)
CHANGELOG.md                             (Unreleased: v182 entry, +6; LTC-GA program-close note)
README.md, package.json                  (catalog count live -> live + 6; spec-progression line -> v182)
```

## 6. Acceptance criteria

v182 is fully shipped when:

- The implementing session has **re-run the [spec-v85 §6.2](spec-v85.md) collision
  check** and confirmed all six ids are absent.
- All 6 tiles in §2 are live (groups E/G) with a `META[id]` entry, an inline primary
  citation + `citationUrl` + `accessed`, ≥3 boundary worked examples each — including
  **at least three boundary examples each carrying a band-flip**: a **Sandvik 6 → 8
  moderate → severe boundary** (the index skips 7 — 6 = 2×3 or 3×2, the next
  attainable product is 8 = 2×4), a **Waterlow 14 → 15 at-risk → high-risk flip**, a
  **CSI 6 → 7 high-strain flip**, and a **BWAT serial-score worsening example** (a
  rising total across two assessments) — a [spec-v11](spec-v11.md) audit log, and a
  passing [spec-v29](spec-v29.md) §3 check.
- `sandvik-incontinence` guards its product (blank frequency/amount → surfaced
  `valid:false`); blank inputs on every tile render a complete-the-fields fallback.
- `iciq-ui-sf` sums only the three scored items and carries the ICIQ-registration
  note with confirmed (or deferred) terms.
- `bates-jensen` frames the score as a serial trajectory (names the worsening items;
  presents the trend, not a one-time grade) and excludes location/shape from the
  total.
- Every compute uses `lib/num.js` and is covered by the [spec-v59](spec-v59.md) fuzz
  harness with zero non-finite leaks.
- `UTILITIES.length` is **live count + 6** and all catalog-truth surfaces
  ([spec-v46](spec-v46.md)) agree; `scope-mdcalc-parity.md` records the **LTC-GA
  program complete** with its **final shipped delta**.
- `npm run lint`, `npm run test`, `npm run sbom`, and `npm run build` all pass.
- The CHANGELOG records v182 with the +6 catalog delta and the LTC-GA
  program-close note.

## 7. Out of scope for v182

- **No re-shipping the live pressure-injury tiles** — `braden`, `braden-q`, and
  `norton-push` (the latter includes the PUSH healing tool) are not duplicated;
  `waterlow` is the **alternative** risk score and `bates-jensen` the **full
  multi-item healing trajectory** that sit beside them.
- **No Zarit Burden Interview** — Mapi license (see [spec-v172](spec-v172.md) §4),
  excluded; the **free CSI and MCSI** are shipped as the caregiver-strain
  instruments instead.
- **No full ICIQ module set beyond the UI-SF** — the broader ICIQ family (ICIQ-OAB,
  ICIQ-LUTSqol, ICIQ-N, ICIQ-FLUTS, etc.) is out of scope; v182 ships only the
  UI Short Form, with its registration note.
- **No automatic care, treatment, or dressing order** — each tile reports the
  score/index and the source's interpretation; the continence, caregiver-support,
  and wound-care decisions stay with the clinician and local protocol
  ([spec-v11](spec-v11.md) §5.3).
- **Program close:** v182 **CLOSES the LTC-GA program** (v173–v182); the
  implementing session records the program's **final shipped delta** in
  `scope-mdcalc-parity.md`.

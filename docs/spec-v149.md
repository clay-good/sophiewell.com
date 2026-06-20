# spec-v149.md — roughlogic.com EMS/pre-hospital parity: pediatric weight estimate, PALS vital-sign reference & draw-up volume (+3 tiles)

> Status: **SHIPPED (2026-06-20).** Catalog **576 → 579** (the live count at
> implementation). All three tiles live in Group I with META entries, inline
> citations, worked examples, audit logs, and passing gates; `peds-vitals` carries its
> Class B `docs/citation-staleness.md` row. A standalone feature spec — **not** part of the
> [spec-v100](spec-v100.md) MDCalc Parity Completion program (which reserves v101–v148;
> v119 is mid-implementation). v149 sits **above** that reserved band so it cannot
> collide with the running program.
>
> Origin: a cross-catalog audit of **roughlogic.com's EMS group** (`/groups/ems/`,
> the sibling field-trades site's group `V`, 27 tools) against sophiewell's catalog.
> sophiewell already covers **24 of 27**; v149 adds the **3** that have no home here,
> copying the deterministic formulas from roughlogic's `calc-ems.js` and re-grounding
> each in its primary clinical source. None duplicates a live sophiewell tile.
>
> Catalog effect: **N → N + 3** where N is the live `UTILITIES.length` at implementation
> (measured **576** on 2026-06-20; re-measure because spec-v119 is landing concurrently —
> use the then-current count + 3, never a hard-coded number, per the program's
> standing off-by-one warning).
>
> Every prior spec (v4 through the latest) remains in force. v149 adds no runtime network
> call and no AI; each tile obeys the [spec-v100](spec-v100.md) §2 doctrine (re-binding
> the [spec-v85](spec-v85.md) §2 doctrine) and the [spec-v100](spec-v100.md) §6 CI/CD
> contract, passes the [spec-v29](spec-v29.md) §3 one-line test, ships its primary
> citation inline ([spec-v54](spec-v54.md)), and inherits the [spec-v59](spec-v59.md)
> output-safety contract.

## 0. The audit: roughlogic EMS group vs sophiewell (27 tools)

roughlogic.com's `/groups/ems/` page is its tools-data group `V` (`build-shells.mjs`
`V: "ems"`), exactly 27 tools. Mapped against sophiewell's `UTILITIES`:

| # | roughlogic EMS tool | sophiewell coverage | Status |
|---|---|---|---|
| 1 | Glasgow Coma Scale | `gcs` (+ `peds-gcs`, `avpu-gcs`) | covered |
| 2 | Parkland Burn-Fluid Formula | `burn-fluid` (Parkland + modified Brooke) | covered |
| 3 | Cincinnati Prehospital Stroke Scale | `cincinnati` / `cpss` | covered |
| 4 | APGAR Newborn Score | `apgar` | covered |
| 5 | IV Drip Rate | `drip-rate` | covered |
| 6 | O2 Cylinder Duration | `o2-cylinder-duration` | covered |
| 7 | **Pediatric Weight Estimate (APLS)** | — (`peds-weight-conv` is lb↔kg only; `peds-dose`/`peds-weight-dose` require a weight input) | **MISSING → add** |
| 8 | Shock Index (HR/SBP) | `shock-index` (+ `map` suite) | covered |
| 9 | Mean Arterial Pressure (MAP) | `map` | covered |
| 10 | Anion Gap (+ K / albumin variants) | `anion-gap`, `corrected-anion-gap`, `anion-gap-dd` | covered |
| 11 | Corrected Calcium (Payne) | `corrected-calcium` | covered |
| 12 | CHA2DS2-VASc | `cha2ds2-va` (+ `chads2`, `chads-65`) | covered |
| 13 | Wells DVT Score | `wells-dvt` | covered |
| 14 | Wells PE Score | `wells-pe` | covered |
| 15 | PERC Rule | `perc` | covered |
| 16 | Rule of 9s / Lund-Browder TBSA | `lund-browder` (+ `bsa_burn`) | covered |
| 17 | **Pediatric Vital Signs Reference (PALS)** | — (no age-banded HR/RR/SBP reference; no hypotension-cutoff calculator) | **MISSING → add** |
| 18 | NIH Stroke Scale | `nihss` | covered |
| 19 | START / JumpSTART Triage | `start-triage` + `jumpstart-triage` | covered |
| 20 | **Drug Concentration to Volume** | — (`conc-rate` is infusion **rate** mL/hr only; no bolus draw-up volume = dose ÷ concentration) | **MISSING → add** |
| 21 | Ideal / Lean / Adjusted Body Weight | `bw-bsa-suite` (Devine IBW + 0.4 AdjBW + BSA) | covered* |
| 22 | Corrected QT (QTc) | `qtc` / `qtc-suite` | covered |
| 23 | Pediatric ET-Tube Size & Depth | `peds-ett` (size **and** lip depth = 3×ID) | covered |
| 24 | Cockcroft-Gault CrCl | `cockcroft-gault` | covered |
| 25 | Winters' Formula Expected pCO2 | `winters` | covered |
| 26 | Alveolar-Arterial Oxygen Gradient | `aa-gradient` | covered |
| 27 | Fractional Excretion of Sodium | `fena-feurea` (FENa + FEUrea) | covered |

\* #21 is covered at the tile level; `bw-bsa-suite` omits roughlogic's Hume **lean** body
weight. That is a one-line additive enhancement to an existing tile, **out of scope for
v149** (noted in §7) — it does not warrant a new tile.

**Conclusion: 3 net-new tiles** — `peds-weight-est`, `peds-vitals`, `dose-volume`.

## 1. Thesis

These three are the pre-hospital/field bedside arithmetic a paramedic, flight nurse, or
ED nurse reaches for when a child arrives with no scale, when an age-specific "is this
number normal?" question lands, and when a syringe needs a verified draw-up volume. Each
is first-principles or a published reference; each fills a confirmed gap; all three belong
in **Group I (EMS & Field)** with the `field` audience, alongside `peds-ett`, `naloxone`,
`peds-weight-dose`, and the `avpu-gcs` reference tile.

## 2. What v149 adds (3 tiles)

### 2.1 `peds-weight-est` — Pediatric Weight Estimate (APLS)

- **Citation:** Advanced Paediatric Life Support: The Practical Approach, 6th ed.
  (APLS / Advanced Life Support Group), Wiley-Blackwell, 2016 — age-based weight
  estimation formulas.
- **citationUrl:** https://www.alsg.org/en/?q=APLS
- **Group:** EMS & Field (`I`). **Audiences:** `clinicians`, `educators`, `field`.
- **Specialties:** `emergency-medicine`, `pediatric-emergency`, `nursing-emergency`.
- **Inputs:** age in **months (0–12)** *or* age in **years (1–14)**; months takes
  precedence when both are present (infant path).
- **Compute (copied verbatim from roughlogic `computePediatricWeight`):**
  - 0–12 months: `weight_kg = (months / 2) + 4`
  - 1–5 years: `weight_kg = (2 × years) + 8`
  - 6–12 years: `weight_kg = (3 × years) + 7`
  - years input `< 1`: convert to months and use the infant formula.
  - years `> 12`: compute `(3 × years) + 7` **but** surface a "consider adult-weight
    dosing per APLS convention" flag.
  - Output kg **and** lb (`× 2.2046226218`), the formula string used, and the note.
- **Output:** estimated weight (kg / lb) with the formula shown. Class A (fixed published
  formulas; "APLS" is **not** in `ISSUER_PATTERN`, and the 6th-edition pin avoids the
  `UNPINNED` rule) — **no** `docs/citation-staleness.md` row. Cross-links `peds-ett`,
  `peds-weight-dose`, `broselow`-style dosing.
- **Posture note:** a calibrated field weighing is the gold standard; this is a
  resuscitation-planning estimate when no scale is available. The licensed Broselow tape
  (length-based) is **not** bundled.

### 2.2 `peds-vitals` — Pediatric Vital Signs Reference (PALS)

- **Citation:** American Heart Association. Pediatric Advanced Life Support (PALS)
  Provider Manual, 2020 — normal heart-rate, respiratory-rate, and systolic-BP ranges by
  age band, and the PALS hypotensive-SBP definition.
- **citationUrl:** https://cpr.heart.org/en/cpr-courses-and-kits/healthcare-professional/pals
- **Group:** EMS & Field (`I`). **Audiences:** `clinicians`, `educators`, `field`.
- **Specialties:** `pediatric-emergency`, `emergency-medicine`, `nursing-emergency`,
  `nursing-pediatric`.
- **Inputs:** age band — neonate (0–28 d) / infant (1–12 mo) / toddler (1–2 y) /
  preschool (3–5 y) / school (6–11 y) / adolescent (12–15 y).
- **Compute (copied from roughlogic `computePedsVitals` / `PEDS_VITALS`):** returns the
  selected band's published HR (awake/asleep), RR, and SBP ranges, **and computes the
  PALS hypotensive-SBP threshold** for the band:
  - neonate `< 60`, infant `< 70`, ages 1–10 y `< 70 + (2 × age_years)`, ≥ 10 y `< 90` mmHg.
  The hypotension cutoff (`70 + 2×age`) is the **calculated** element that makes this a
  tool, not a static lookup — it answers "what SBP means shock in *this* child."
- **Output:** the age-band normal HR/RR/SBP ranges plus the computed hypotensive-SBP
  cutoff. Class **B** — the citation contains "AHA", which trips `ISSUER_PATTERN`, so this
  tile **requires** a `docs/citation-staleness.md` row, a `citationAccessed` date, and
  on-revision cadence tracking (next PALS guideline cycle). Cross-links `peds-resus`,
  `peds-weight-est`, `peds-gcs`.
- **Policy note (read before implementing):** the [nurse-first pivot](../CLAUDE.md)
  removed *googleable static reference tables*. A bare HR/RR/SBP table would fail that
  test. This tile is admitted **only** because it computes the band-specific
  `70 + 2×age` hypotension threshold (a real calculation), exactly as the existing
  `avpu-gcs` reference tile earns its place by mapping rather than merely listing. If the
  implementing session judges the calculated cutoff too thin to clear the spec-v29 §3
  test, **drop `peds-vitals` and ship the other two** — note the drop in the CHANGELOG.

### 2.3 `dose-volume` — Drug Concentration to Volume (draw-up)

- **Citation:** First-principles dosing arithmetic over the drug-concentration label:
  `volume_mL = ordered_dose_mg ÷ stock_concentration_mg_per_mL`. Verify against the
  current local protocol and the receiving facility's medical director.
- **citationUrl:** *(none — first-principles arithmetic; no issuing source.)*
- **Group:** EMS & Field (`I`). **Audiences:** `clinicians`, `educators`, `field`.
- **Specialties:** `emergency-medicine`, `nursing-emergency`, `pharmacy`.
- **Inputs:** ordered dose (mg) **and** stock concentration (mg/mL); *optionally* weight
  (kg) + per-kg dose (mg/kg) to **derive** the ordered dose when it is not entered
  directly.
- **Compute (copied verbatim from roughlogic `computeDrugConcentration`):**
  - require `concentration > 0`.
  - if `ordered_dose_mg` absent/zero, derive `dose_mg = weight_kg × dose_mg_per_kg`
    (both must be `> 0`); show the derivation string. An explicitly **zeroed** order
    prompts ("Ordered dose must be positive"), it never prints "draw 0 mL".
  - `volume_mL = dose_mg / concentration`.
  - flags: `> 50 mL` → "very large draw, verify carefully"; `< 0.05 mL` →
    "tuberculin-syringe draw, verify".
- **Output:** draw-up volume (mL), the dose used, the optional derivation, and the
  safety flags. Class A (first-principles arithmetic; no issuer) — **no** staleness row.
  Distinct from `conc-rate` (which solves an **infusion rate** in mL/hr, not a bolus
  draw-up volume). Cross-links `conc-rate`, `peds-weight-dose`, `drip-rate`.

## 3. Per-tile robustness

- **All three are bounded, deterministic arithmetic** — no logistic, no table-from-network.
  Each compute is re-implemented in `lib/num.js`-guarded form and re-fetched verbatim from
  roughlogic's `calc-ems.js` (per the v97 "re-implement, don't recall" lesson), with the
  formulas re-grounded in their primary clinical sources above.
- **Domain guards (carried from roughlogic):** `peds-weight-est` clamps months to 0–12
  and years to 0–14 and prompts otherwise; `dose-volume` rejects non-positive
  concentration and non-positive/zeroed dose and demands either an ordered dose or the
  weight+per-kg pair; `peds-vitals` falls back to a "select an age band" prompt.
- All three flow through the [spec-v59](spec-v59.md) fuzz harness with **zero non-finite
  leaks** (note `peds-weight-est`'s lb conversion and `dose-volume`'s division must stay
  finite for fuzzed extremes), render the [spec-v50](spec-v50.md) §3 clinical posture
  note, quote the source's framing, and author no treatment recommendation in Sophie's
  voice ([spec-v11](spec-v11.md) §5.3). Each is mobile-first per
  [spec-v72](spec-v72.md) (44px targets, no 320px horizontal scroll) — watch the
  slash-joined HR "awake/asleep" string in `peds-vitals` for a 320px unbreakable token
  (apply the v17 spaced-separator fix if it overflows).

## 4. CI/CD & maintenance

Per the [spec-v100](spec-v100.md) §6 contract (re-binding [spec-v85](spec-v85.md) §6):

- **Maintenance classes (§6.3):**
  - `peds-weight-est` — **Class A** (APLS formulas; "APLS" not in `ISSUER_PATTERN`;
    edition pinned) — no staleness row.
  - `peds-vitals` — **Class B** (citation names "AHA") — **requires** a
    `docs/citation-staleness.md` row + `citationAccessed` + cadence entry.
  - `dose-volume` — **Class A** (first-principles arithmetic) — no staleness row.
- **Build (§6.1):** the compute lives in new `lib/ems-v149.js`; the renderers in new
  `views/group-v149.js` whose `RV149` export is added to the `app.js` `RENDERERS` spread;
  three `UTILITIES` rows (all group `I`, `field` audience) and three `META` entries
  (inline citation; `citationUrl` + `citationAccessed` where applicable).
- **Gates (§6.2):** `lib/ems-v149.js` is added to the `test/unit/fuzz-tools.test.js`
  `MODULES` list (zero non-finite leaks); each `META` example is pinned by the chromium
  `example-correctness` sweep; the catalog count moves on **all 13 catalog-truth
  surfaces** ([spec-v46](spec-v46.md)); a11y, `mobile-no-hscroll`, and 44px touch-target
  checks pass for `views/group-v149.js`. New specialty tags (if any of
  `nursing-emergency` / `nursing-pediatric` are not yet present) must be added to
  `test/unit/specialty-coverage.test.js` `ALLOWED_SPECIALTIES`.

## 5. Files touched

```
docs/spec-v149.md                        (this file)
app.js                                   (+3 UTILITIES rows, group I, field audience; import group-v149 renderers into RENDERERS as RV149)
lib/ems-v149.js                          (new module: pedsWeightEst, pedsVitals, doseVolume)
lib/meta.js                              (+3 META entries: inline citation; peds-vitals gets citationUrl + citationAccessed; cross-links to peds-ett/peds-weight-dose/conc-rate/peds-resus)
views/group-v149.js                      (new renderer module: 3 renderers)
docs/citation-staleness.md               (+1 row for peds-vitals, Class B, on-PALS-revision cadence)
docs/clinical-citations.md               (+ rows for the three sources)
test/unit/peds-weight-est.test.js, peds-vitals.test.js, dose-volume.test.js  (>=3 boundary worked examples each)
test/unit/fuzz-tools.test.js             (add lib/ems-v149.js to MODULES)
test/unit/specialty-coverage.test.js     (add any new specialty tags to ALLOWED_SPECIALTIES)
docs/audits/v12/peds-weight-est.md, peds-vitals.md, dose-volume.md  (spec-v11 audit logs)
CHANGELOG.md                             (Unreleased: v149 entry, +3 — or +2 if peds-vitals is dropped per 2.2)
README.md, package.json                  (catalog count N -> N+3; spec-progression line -> v149)
```

## 6. Acceptance criteria

v149 is fully shipped when:

- The implementing session has **re-run the collision check** and confirmed
  `peds-weight-est`, `peds-vitals`, `dose-volume` are absent from the live catalog and
  from each other (all three measured **free** on 2026-06-20).
- All tiles in §2 are live in Group I with a `META[id]` entry, an inline primary
  citation, ≥3 boundary worked examples each — including:
  - `peds-weight-est`: 5 yr → **18 kg** `(2×5)+8`; 6 mo → **7 kg** `(6/2)+4`; >12 yr flag.
  - `peds-vitals`: preschool band → SBP-normal lower bound and the `70+2×5 = 80` mmHg
    hypotension cutoff; neonate → `< 60` cutoff.
  - `dose-volume`: 25 mg from 50 mg/mL → **0.5 mL**; weight-derived dose path; zeroed-dose
    prompt; >50 mL flag.
- Each tile renders a complete-the-fields fallback for partial input and a
  [spec-v11](spec-v11.md) audit log, and passes the [spec-v29](spec-v29.md) §3 one-line
  test.
- Every compute function uses `lib/num.js` and is covered by the
  [spec-v59](spec-v59.md) fuzz harness with zero non-finite leaks.
- `peds-vitals` carries its **Class B** `docs/citation-staleness.md` row (or is dropped
  per §2.2, with the CHANGELOG noting +2 instead of +3); the other two carry **no**
  staleness row.
- `UTILITIES.length` is the then-current live count **+ 3** (or **+ 2** if `peds-vitals`
  is dropped) and all catalog-truth surfaces ([spec-v46](spec-v46.md)) agree.
- `npm run lint`, `npm run test`, `npm run sbom`, and `npm run build` all pass.
- The CHANGELOG records v149 with the catalog delta and the roughlogic-parity provenance.

## 7. Out of scope for v149

- **The other 24 roughlogic EMS tools** — already covered (see §0); v149 re-implements
  none of them.
- **Hume lean body weight on `bw-bsa-suite`** (roughlogic IBW tool #21's third output) —
  a possible one-line enhancement to the existing tile, not a v149 tile.
- **The licensed Broselow tape** (length-based pediatric estimation) — not bundled;
  `peds-weight-est` uses only the public APLS age-based formulas.
- **No DICOM, no image read, no auto-dosing decision.** `dose-volume` cross-checks the
  arithmetic of a draw-up; the drug, dose, route, and rate remain clinical decisions of
  the licensed provider and local protocol ([spec-v11](spec-v11.md) §5.3).

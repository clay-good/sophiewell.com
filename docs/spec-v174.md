# spec-v174.md — Behavioral symptoms of dementia & observational delirium screens: Nu-DESC, DOSS, Cornell-CSDD, interRAI ABS, CMAI (+5 tiles)

> Status: **SHIPPED 5 of 5 (2026-06-29).** Second implementation spec of the
> [spec-v172](spec-v172.md) **Long-Term Care & Geriatric Assessment (LTC-GA)**
> program. All five tiles shipped — **`nu-desc`**, **`doss`**, **`cornell-csdd`**,
> **`interrai-abs`**, **`cmai`** — each with its exact item list, per-item range,
> and bands re-fetched and cross-verified against ≥ 2 independent sources
> ([spec-v97](spec-v97.md)). Catalog **740 → 745 (+5)**. Two corrections came out
> of the verification and are recorded in the audit logs: the **`interrai-abs`
> per-item range was corrected from the draft's 0–4 to 0–3 (total 0–12)** against
> the CIHI interRAI job aid, and **`cmai` ships as a frequency quantifier with no
> total severity band** — the CMAI manual explicitly advises against summing a
> severity score, so the tile reports the 29–203 total plus the most-cited
> three-factor subscales (membership varies by population, noted).
>
> Original proposal follows. Feature spec of the
> [spec-v172](spec-v172.md) **Long-Term Care & Geriatric Assessment (LTC-GA)**
> program (§3.2). Adds **5** deterministic LTC instruments that fill confirmed
> gaps: the two nurse-observation delirium screens completed across a shift
> (Nu-DESC, DOSS), the dementia-specific depression scale (Cornell CSDD), and the
> two behavioral-symptom quantifiers (interRAI Aggressive Behavior Scale, CMAI)
> that drive BPSD care plans. None duplicates a live tile.
>
> Catalog effect at v174: **live `UTILITIES.length` + 5** (the catalog-truth gate
> enforces agreement; never a number copied from the umbrella — the running counts
> carry a known off-by-one).
>
> Every prior spec (v4 through v173) remains in force. v174 adds no runtime network
> call and no AI; each tile obeys the [spec-v100](spec-v100.md) §2 doctrine
> (re-binding [spec-v85](spec-v85.md) §2) — including the §2 classification-tile
> clarification (a tile *consumes the clinician's observations and computes a
> class/score*; it does not display a static reference table) — and the
> [spec-v100](spec-v100.md) §6 CI/CD contract. Each passes the
> [spec-v29](spec-v29.md) §3 one-line test, ships its primary citation inline
> ([spec-v54](spec-v54.md)), inherits the [spec-v59](spec-v59.md) output-safety
> contract, renders the [spec-v50](spec-v50.md) §3 clinical-posture note, and
> honors [spec-v11](spec-v11.md) §5.3 (no dosing/treatment order in Sophie's
> voice). **Every weight, band, and item value is re-fetched and cross-verified
> against ≥2 independent sources at implementation** ([spec-v97](spec-v97.md));
> nothing here is implemented from recall.

## 1. Thesis

The catalog already carries the **interview-based** delirium tiles — `cam`,
`cam-icu`, and `4at` — and the general mood screens `gds15` and `phq9`. The
long-term-care floor needs two things those do not provide. First, the
**nurse-observation** delirium screens that a charge nurse completes from what was
seen across an entire shift, not from a structured interview the resident may be
unable to complete: the **Nu-DESC** and the **DOSS**. Second, the
**dementia-specific** behavioral instruments: the **Cornell Scale for Depression
in Dementia**, which is built precisely because `gds15` and `phq9` (self-report
mood scales) are **not valid in moderate-to-severe dementia**, and the two
agitation/aggression quantifiers — the **interRAI Aggressive Behavior Scale** and
the **Cohen-Mansfield Agitation Inventory** — that quantify BPSD severity and
drive the behavioral care plan and its response to intervention.

- **Nu-DESC** — the Nursing Delirium Screening Scale, a 5-item 0–10 shift
  observation, **≥ 2 indicates delirium**.
- **DOSS** — the Delirium Observation Screening Scale, a 13-item 0–13 shift
  observation, **≥ 3 suggests delirium**.
- **Cornell-CSDD** — the Cornell Scale for Depression in Dementia, 19 items rated
  0/1/2 from a clinician interview of both the patient and a caregiver informant,
  0–38, with the probable / definite major-depression bands.
- **interRAI-ABS** — the interRAI Aggressive Behavior Scale, a 4-item 0–12
  published interRAI/MDS-derived scale.
- **CMAI** — the Cohen-Mansfield Agitation Inventory, 29 agitated behaviors each
  rated 1–7 by frequency, summing to 29–203.

## 2. What v174 adds (5 tiles)

### 2.1 `nu-desc` — Nursing Delirium Screening Scale

- **Citation:** Gaudreau JD, Gagnon P, Harel F, Tremblay A, Roy MA. Fast,
  systematic, and continuous delirium assessment in hospitalized patients: the
  nursing delirium screening scale. *J Pain Symptom Manage.* 2005;29(4):368-375.
- **citationUrl:** https://doi.org/10.1016/j.jpainsymman.2004.07.009
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `nursing-general`, `geriatrics`, `palliative-care`.
- **Inputs:** the 5 observed items — disorientation, inappropriate behaviour,
  inappropriate communication, illusions/hallucinations, psychomotor retardation
  — each rated **0–2** by the nurse over the shift.
- **Output:** the **Nu-DESC total (0–10)** with the published threshold
  **≥ 2 indicates delirium**, naming the items counted. Class A. Cross-links
  `cam` and `4at` (the interview-based delirium tiles) and `doss` (the sibling
  shift-observation screen).

### 2.2 `doss` — Delirium Observation Screening Scale

- **Citation:** Schuurmans MJ, Shortridge-Baggett LM, Duursma SA. The Delirium
  Observation Screening Scale: a screening instrument for delirium. *Res Theory
  Nurs Pract.* 2003;17(1):31-50.
- **citationUrl:** https://doi.org/10.1891/rtnp.17.1.31.53169
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `nursing-general`, `geriatrics`, `internal-medicine`.
- **Inputs:** the 13 observed behaviours scored over a nursing shift — items
  spanning consciousness, attention, orientation, communication, perception, and
  psychomotor activity — each rated present/absent (**0 or 1**).
- **Output:** the **DOSS total (0–13)** with the published threshold
  **≥ 3 suggests delirium**, naming the items counted. Class A. Cross-links
  `nu-desc` (the sibling shift-observation screen) and `cam` (the interview
  confirmation route).

### 2.3 `cornell-csdd` — Cornell Scale for Depression in Dementia

- **Citation:** Alexopoulos GS, Abrams RC, Young RC, Shamoian CA. Cornell Scale
  for Depression in Dementia. *Biol Psychiatry.* 1988;23(3):271-284.
- **citationUrl:** https://doi.org/10.1016/0006-3223(88)90038-8
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `psychiatry`, `geriatrics`, `nursing-general`.
- **Inputs:** the 19 items — across mood-related signs, behavioural disturbance,
  physical signs, cyclic functions, and ideational disturbance — each rated
  **0 (absent) / 1 (mild or intermittent) / 2 (severe)** by the clinician,
  integrating an interview of the patient and a separate interview of a caregiver
  informant (an item is scored a (unable to evaluate) where it cannot be rated,
  which does not contribute to the total).
- **Output:** the **Cornell CSDD total (0–38)** with the published bands —
  **> 10 probable major depression, > 18 definite major depression** (verify at
  implementation, [spec-v97](spec-v97.md)) — naming the items counted. Class A.
  Cross-links `gds15` and `phq9` **with the explicit note that those self-report
  mood scales are not valid in moderate-to-severe dementia** — that invalidity is
  the rationale for the Cornell scale, which derives its information from
  observation and an informant rather than self-report.

### 2.4 `interrai-abs` — interRAI Aggressive Behavior Scale

- **Citation:** Perlman CM, Hirdes JP. The Aggressive Behavior Scale: a new scale
  to measure aggression based on the Minimum Data Set. *J Am Geriatr Soc.*
  2008;56(12):2298-2303.
- **citationUrl:** https://doi.org/10.1111/j.1532-5415.2008.02048.x
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `geriatrics`, `nursing-general`, `psychiatry`.
- **Inputs:** the 4 items — verbal abuse, physical abuse, socially inappropriate
  or disruptive behaviour, and resisting care — each rated **0–4** on the
  interRAI/MDS behaviour-frequency scale.
- **Output:** the **ABS total (0–12)** with the published severity bands, naming
  the items counted. Class A — this is the **published interRAI/MDS-derived scale
  (a public scoring method, not the licensed full assessment form)**, so it takes
  **no citation-staleness row**. Cross-links `cmai`.

### 2.5 `cmai` — Cohen-Mansfield Agitation Inventory

- **Citation:** Cohen-Mansfield J, Marx MS, Rosenthal AS. A description of
  agitation in a nursing home. *J Gerontol.* 1989;44(3):M77-M84.
- **citationUrl:** https://doi.org/10.1093/geronj/44.3.M77
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `geriatrics`, `nursing-general`, `psychiatry`.
- **Inputs:** the 29 agitated behaviours (the long-form CMAI), each rated for
  **frequency on a 1 (never) to 7 (several times an hour) scale** over the
  reference period (commonly the prior two weeks).
- **Output:** the **CMAI total (29–203)**, the bounded sum of the 29 frequency
  ratings, naming the contributing behaviours and (where the subtype split is
  shown) the aggressive / physically-non-aggressive / verbally-agitated factor
  groupings. Class A. The CMAI is **free for clinical and research use with
  attribution** — the renderer credits the source. Cross-links `interrai-abs`.

## 3. Per-tile robustness

- **`nu-desc`, `doss`, and `interrai-abs` are bounded weighted sums** mapped to
  published bands — Nu-DESC [0,10] with the ≥ 2 cut, DOSS [0,13] with the ≥ 3 cut,
  ABS [0,12] with its severity bands. Each names which items were counted; a blank
  item scores its zero band and the renderer surfaces which items were left
  unrated rather than fabricating a total.
- **`cornell-csdd` is a 0–38 bounded sum** mapped to the published probable
  (> 10) / definite (> 18) major-depression bands (verify at implementation,
  [spec-v97](spec-v97.md)); the *unable-to-evaluate* (a) response contributes 0
  and is reported as an unrated item, so a partially-completed scale never silently
  inflates or deflates the band. The renderer surfaces the `gds15`/`phq9`
  dementia-invalidity note inline.
- **`cmai`'s 29-item sum is bounded [29, 203]** — the floor is 29 (every behaviour
  rated 1/never), not 0; the renderer states this so a "low" score is not read as
  zero agitation. Each of the 29 frequency ratings is finite- and range-checked
  (1–7); an out-of-range or blank rating returns a surfaced `valid:false` fallback
  rather than a value derived from `NaN`.
- All five flow through the [spec-v59](spec-v59.md) fuzz harness with **zero
  non-finite leaks**; every compute uses `lib/num.js`. None authors a diagnosis,
  a dosing order, or a treatment order in Sophie's voice ([spec-v11](spec-v11.md)
  §5.3) — each reports the score, the band, and the source's interpretation only,
  and each renders the [spec-v50](spec-v50.md) §3 clinical-posture note (the score
  is a screen/quantifier that informs, and does not replace, clinical assessment
  and the local care plan).

## 4. CI/CD & maintenance

Per the [spec-v100](spec-v100.md) §6 contract (re-binding [spec-v85](spec-v85.md)
§6):

- **Maintenance classes (§6.3):** all five — `nu-desc`, `doss`, `cornell-csdd`,
  `interrai-abs`, `cmai` — are **Class A**: fixed scoring methods cited by journal
  + authors. **None takes a `docs/citation-staleness.md` row.** In particular,
  `interrai-abs` is the **published interRAI/MDS-derived scale** (Perlman & Hirdes,
  a journal source), *not* the licensed full interRAI assessment form; its citation
  names authors + journal and does **not** trip `ISSUER_PATTERN`
  ([spec-v92](spec-v92.md)/[spec-v94](spec-v94.md) lesson). The implementing
  session confirms at build time that none of the five citations trips the pattern
  rather than asserting it from this document.
- **Build & gates (§6.1/§6.2):** the five computes live in the new
  `lib/ltcga-v174.js` module (named exports `nuDesc`, `doss`, `cornellCsdd`,
  `interraiAbs`, `cmai`), added to the `test/unit/fuzz-tools.test.js` `MODULES`
  list — `cmai` (29-item bounded sum with the [29,203] floor) and `cornell-csdd`
  (the unable-to-evaluate path) explicitly fuzzed for the range/overflow paths
  (zero non-finite leaks). Renderers live in the new `views/group-v174.js` module;
  its `RV174` export is spread into the `app.js` `RENDERERS` map. Every input
  (the 0–2 / 0–1 / 0–4 selects and the 1–7 CMAI frequency selects) carries a real
  `<label for>`. The catalog count moves on all **13 catalog-truth surfaces**
  ([spec-v46](spec-v46.md)) in the same change, using the **live `UTILITIES.length`
  + 5**; a11y, `mobile-no-hscroll`, `mobile-touch-targets`, and the chromium
  `example-correctness` sweep pass for `views/group-v174.js`.

## 5. Files touched

```
docs/spec-v174.md                        (this file)
app.js                                   (+5 UTILITIES rows, group G; import group-v174 RV174 into RENDERERS)
lib/ltcga-v174.js                        (new module: nuDesc, doss, cornellCsdd, interraiAbs, cmai)
lib/meta.js                              (+5 META entries: inline citation + citationUrl + accessed; cross-links to cam, cam-icu, 4at, gds15, phq9, interrai-abs, cmai)
views/group-v174.js                      (new renderer module: 5 renderers)
docs/clinical-citations.md               (+5 rows for the five sources)
test/unit/nu-desc.test.js, doss.test.js, cornell-csdd.test.js, interrai-abs.test.js, cmai.test.js  (≥3 boundary worked examples each)
test/unit/fuzz-tools.test.js             (add lib/ltcga-v174.js to MODULES)
docs/audits/v12/nu-desc.md, doss.md, cornell-csdd.md, interrai-abs.md, cmai.md  (spec-v11 audit logs)
docs/scope-mdcalc-parity.md              (catalog count live -> live+5; record v174 under the LTC-GA program, §3.2)
CHANGELOG.md                             (Unreleased: v174 entry, +5)
README.md, package.json                  (catalog count live -> live+5; spec-progression line -> v174)
```

## 6. Acceptance criteria

v174 is fully shipped when:

- The implementing session has **re-run the [spec-v85 §6.2](spec-v85.md) collision
  check** and confirmed all five ids (`nu-desc`, `doss`, `cornell-csdd`,
  `interrai-abs`, `cmai`) are absent.
- All 5 tiles in §2 are live (Group G, Class A) with a `META[id]` entry, an inline
  primary citation + `citationUrl` + `accessed`, ≥3 boundary worked examples each
  **with a band-flip** — including a **Nu-DESC 1 → 2 delirium-cut flip**, a
  **DOSS 2 → 3 delirium-cut flip**, a **Cornell CSDD 10 → 11 probable-depression
  flip** (and a 18 → 19 definite-depression flip), an **interRAI ABS severity-band
  boundary**, and a **CMAI floor (29, all-never) plus an upper-range** example —
  a [spec-v11](spec-v11.md) audit log, and a passing [spec-v29](spec-v29.md) §3
  check.
- `cornell-csdd` surfaces the `gds15`/`phq9` dementia-invalidity note;
  `interrai-abs` carries **no** citation-staleness row (published scale, not the
  licensed assessment form); `cmai` states the **29 floor** so a low score is not
  read as zero. Blank inputs render a complete-the-fields fallback.
- Every compute uses `lib/num.js` and is covered by the [spec-v59](spec-v59.md)
  fuzz harness with zero non-finite leaks.
- `UTILITIES.length` is **live count + 5** and all catalog-truth surfaces
  ([spec-v46](spec-v46.md)) agree; `scope-mdcalc-parity.md` records v174 under the
  LTC-GA program (§3.2).
- `npm run lint`, `npm run test`, `npm run sbom`, and `npm run build` all pass.
- The CHANGELOG records v174 with the +5 catalog delta.

## 7. Out of scope for v174

- **No NPI / NPI-Q** (Neuropsychiatric Inventory) — **licensed**, not freely
  redistributable; excluded per [spec-v172](spec-v172.md) §4 / [spec-v100](spec-v100.md)
  §8. The behavioral surface v174 ships is the free interRAI ABS + CMAI pair.
- **No PACSLAC** (Pain Assessment Checklist for Seniors with Limited Ability to
  Communicate) — **licensed**, excluded per [spec-v172](spec-v172.md) §4;
  nonverbal-pain instruments are reserved for [spec-v172](spec-v172.md) §3.3 (v175:
  Abbey, CNPI, DOLOPLUS-2), not duplicated here.
- **No full interRAI assessment form** — the interRAI instrument itself is a
  licensed assessment form (a reference/data-collection table, fails
  [spec-v29](spec-v29.md) §3); v174 ships only the **published derived scale**
  (the Aggressive Behavior Scale), which is reproducible from its journal source.
- **No duplication of the live delirium tiles** — `cam`, `cam-icu`, and `4at` are
  **interview-based** and remain the structured-interview route; `nu-desc` and
  `doss` are the complementary **nurse-observation** screens completed across a
  shift, not re-implementations of the interview tiles. All are cross-linked, all
  kept.
- **No automatic diagnosis or treatment order** — each tile reports the score, the
  band, and the source's interpretation; the decision stays with the clinician and
  the local care plan ([spec-v11](spec-v11.md) §5.3).
```


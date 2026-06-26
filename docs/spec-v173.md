# spec-v173.md — Cognition & dementia staging: BIMS, AD8, GPCOG, Short IQCODE, Reisberg GDS, FAST, CDR-SOB, and the MDS Cognitive Performance Scale (+8 tiles)

> Status: **PROPOSED (2026-06-24).** Feature spec of the [spec-v172](spec-v172.md)
> **Long-Term Care & Geriatric Assessment (LTC-GA)** program — its first
> implementation spec, opening the reserved **v173–v182** band. Adds **8**
> deterministic cognition-screening and dementia-staging instruments that fill
> confirmed gaps in the long-term-care surface. None duplicates a live tile.
>
> Catalog effect at v173: **live count + 8** tiles (the catalog-truth gate
> enforces agreement; the implementing session uses the live `UTILITIES.length`
> + 8, never a number copied from this document).
>
> Every prior spec (v4 through v172) remains in force. v173 adds no runtime
> network call and no AI; each tile obeys the [spec-v100](spec-v100.md) §2
> doctrine (re-binding [spec-v85](spec-v85.md) §2) — including the §2
> **classification-tile clarification** (a tile *consumes the clinician's
> observations and computes a class/score*; it does not display a static
> reference table) — and the [spec-v100](spec-v100.md) §6 CI/CD contract. Each
> passes the [spec-v29](spec-v29.md) §3 one-line test, ships its primary citation
> inline ([spec-v54](spec-v54.md)), and inherits the [spec-v59](spec-v59.md)
> output-safety contract. **Every weight, band, and lookup row is re-fetched and
> cross-verified against ≥2 independent sources at implementation**
> ([spec-v97](spec-v97.md)); nothing in this document is implemented from recall.

## 1. Thesis

`mini-cog` is the only live cognition tile, and it is a 3-minute screen — it does
not stage dementia, it does not capture the informant route, and it is not the
instrument the MDS 3.0 resident assessment mandates. v173 closes the cognition
surface a skilled-nursing facility, geriatric clinic, or hospice runs on:

- **BIMS** — the **Brief Interview for Mental Status** (MDS 3.0 §C), the CMS-
  mandated performance-based cognition interview administered to every able
  nursing-home resident.
- **AD8** and **Short IQCODE** — the two **informant-report** routes, completed by
  a family member or caregiver rather than the resident, that detect decline the
  resident cannot self-report.
- **GPCOG** — a **two-stage** primary-care screen: a brief patient cognitive
  section that, in the indeterminate band, escalates to an informant section.
- **Reisberg GDS** and **FAST** — the two **dementia stagers** (global cognitive/
  functional deterioration, and the functional staging tool) that drive care
  planning and **hospice eligibility** (FAST 7a + a named medical complication is
  a Medicare hospice criterion for dementia).
- **CDR-SOB** — the **Clinical Dementia Rating — Sum of Boxes**, the granular 0–18
  dementia-severity continuum used for staging and longitudinal tracking.
- **MDS-CPS** — the **MDS Cognitive Performance Scale**, the 0–6 cognitive
  hierarchy derived directly from MDS items, the LTC analog to the MMSE that the
  facility already has the data to compute.

Each tile consumes the clinician's (or informant's) observations and returns a
score or stage mapped to the source's published bands. None of the eight authors a
diagnosis in Sophie's voice ([spec-v11](spec-v11.md) §5.3); each renders the
[spec-v50](spec-v50.md) §3 clinical-posture note.

## 2. What v173 adds (8 tiles)

### 2.1 `bims` — Brief Interview for Mental Status (MDS 3.0 §C)

- **Citation:** Saliba D, Buchanan J, Edelen MO, et al. MDS 3.0: brief interview
  for mental status. *J Am Med Dir Assoc.* 2012;13(7):611-617. (MDS 3.0 validation:
  Saliba D, et al. *Med Care.* 2012;50(5):e26-e36.)
- **citationUrl:** https://doi.org/10.1016/j.jamda.2012.06.004 (verify at
  implementation, [spec-v97](spec-v97.md))
- **Group:** Clinical Scoring & Reference (`G`).
- **Specialties:** `geriatrics`, `nursing-general`.
- **Inputs:** repetition of 3 words (sock/blue/bed); temporal orientation (year,
  month, day — each scored); delayed recall of the 3 words, with the published
  partial credit when a category cue / multiple-choice cue is needed.
- **Output:** the **BIMS total 0–15** with the published bands — **13–15
  cognitively intact, 8–12 moderately impaired, 0–7 severely impaired** — naming
  the sub-scores. Class A. Cross-links `mini-cog`.

### 2.2 `ad8` — AD8 Dementia Screening Interview

- **Citation:** Galvin JE, Roe CM, Powlishta KK, et al. The AD8: a brief informant
  interview to detect dementia. *Neurology.* 2005;65(4):559-564.
- **citationUrl:** https://doi.org/10.1212/01.wnl.0000172958.95282.2a (verify at
  implementation, [spec-v97](spec-v97.md))
- **Group:** Clinical Scoring & Reference (`G`).
- **Specialties:** `geriatrics`, `primary-care`.
- **Inputs:** the 8 informant yes/no items — each asks whether there has been a
  change, **due to cognitive (thinking/memory) problems**, in: judgment, reduced
  interest in hobbies/activities, repeating questions/stories, trouble learning to
  use a tool/appliance/gadget, forgetting the correct month or year, trouble
  handling complicated financial affairs, trouble remembering appointments, and
  daily problems with thinking/memory.
- **Output:** the **AD8 total 0–8** with the published cut — **≥ 2 suggests
  cognitive impairment** — naming the endorsed items. Class A. Cross-links
  `mini-cog`, `iqcode-short`.

### 2.3 `gpcog` — General Practitioner Assessment of Cognition

- **Citation:** Brodaty H, Pond D, Kemp NM, et al. The GPCOG: a new screening test
  for dementia designed for general practice. *J Am Geriatr Soc.*
  2002;50(3):530-534.
- **citationUrl:** https://doi.org/10.1046/j.1532-5415.2002.50122.x (verify at
  implementation, [spec-v97](spec-v97.md))
- **Group:** Clinical Scoring & Reference (`G`).
- **Specialties:** `geriatrics`, `primary-care`.
- **Inputs:** **two stages.** Patient cognitive section (≈9 points, verify at
  implementation, [spec-v97](spec-v97.md)) — name & address recall (a 4-component
  address registered then recalled at the end), time orientation (current date),
  clock drawing (numbers placed correctly; hands set to a stated time), and recall
  of a recent news event. Informant section (6 yes/no/don't-know items comparing
  the patient to a few years ago — recall of recent conversations/events,
  word-finding, money/finances management, medication management, transport/
  getting around).
- **Output:** the published two-stage interpretation — **patient score ≥ 9 = no
  significant cognitive impairment; ≤ 4 = cognitive impairment likely; 5–8 = proceed
  to the informant section** (then the informant-section cut determines impairment;
  verify the exact informant threshold at implementation,
  [spec-v97](spec-v97.md)) — naming the contributing items. Class A. Cross-links
  `mini-cog`.

### 2.4 `iqcode-short` — Short Informant Questionnaire on Cognitive Decline in the Elderly (16-item)

- **Citation:** Jorm AF. A short form of the Informant Questionnaire on Cognitive
  Decline in the Elderly (IQCODE): development and cross-validation. *Psychol Med.*
  1994;24(1):145-153.
- **citationUrl:** https://doi.org/10.1017/S003329170002691X (verify at
  implementation, [spec-v97](spec-v97.md))
- **Group:** Clinical Scoring & Reference (`G`).
- **Specialties:** `geriatrics`, `primary-care`.
- **Inputs:** the 16 informant items, each comparing the person now with 10 years
  ago on a 5-point scale — **1 (much improved), 2 (a bit improved), 3 (not much
  change), 4 (a bit worse), 5 (much worse)**.
- **Output:** the **mean score (1–5)** = sum ÷ number of answered items, with the
  published decline cutoff (commonly **~3.3–3.4 indicates cognitive decline**,
  verify the exact threshold at implementation, [spec-v97](spec-v97.md)) — naming
  the item count used. Class A. Cross-links `ad8`.

### 2.5 `global-deterioration-scale` — Reisberg Global Deterioration Scale (GDS)

- **Citation:** Reisberg B, Ferris SH, de Leon MJ, Crook T. The Global
  Deterioration Scale for assessment of primary degenerative dementia. *Am J
  Psychiatry.* 1982;139(9):1136-1139.
- **citationUrl:** https://doi.org/10.1176/ajp.139.9.1136 (verify at
  implementation, [spec-v97](spec-v97.md))
- **Group:** Clinical Scoring & Reference (`G`).
- **Specialties:** `geriatrics`, `neurology`.
- **Inputs:** the clinician selects the described cognitive/functional features —
  the tile **consumes that description and computes the stage** (it does not display
  the seven-stage table for the user to read off; see §3, which satisfies the
  [spec-v100](spec-v100.md) §2 classification-tile clarification). Stage anchors
  span no cognitive decline (Stage 1), very mild / forgetfulness (2), mild /
  early confusional (3), moderate / late confusional (4), moderately severe / early
  dementia (5), severe / middle dementia (6), and very severe / late dementia (7).
- **Output:** the **GDS stage 1–7** with the published stage label and feature
  summary, naming the features that fixed the stage. Class A. (Id intentionally
  distinct from the live `gds15` geriatric-depression tile.) Cross-links
  `fast-dementia`, `cdr-sob`.

### 2.6 `fast-dementia` — Functional Assessment Staging Tool (FAST)

- **Citation:** Reisberg B. Functional assessment staging (FAST).
  *Psychopharmacol Bull.* 1988;24(4):653-659.
- **citationUrl:** https://pubmed.ncbi.nlm.nih.gov/3249767/ (verify at
  implementation, [spec-v97](spec-v97.md))
- **Group:** Clinical Scoring & Reference (`G`).
- **Specialties:** `geriatrics`, `palliative-care`.
- **Inputs:** the clinician selects the highest-numbered FAST stage the patient has
  reached — stages 1–7 with substages **7a–7f** (7a loses ability to speak ~6 or
  fewer intelligible words; 7b a single word; 7c can no longer walk; 7d can no
  longer sit up; 7e can no longer smile; 7f can no longer hold up the head; verify
  the exact substage wording at implementation, [spec-v97](spec-v97.md)).
- **Output:** the **FAST stage 1–7f** with the published functional descriptor.
  The renderer notes the **Medicare hospice-eligibility use**: FAST **stage 7a**
  with the named medical complications (e.g., aspiration pneumonia, pyelonephritis,
  septicemia, multiple stage 3–4 pressure ulcers, recurrent fever, or impaired
  nutrition) is part of the local-coverage dementia hospice guideline — the tile
  reports the stage and surfaces that context; it does not assert eligibility in
  Sophie's voice ([spec-v11](spec-v11.md) §5.3). Class A. (Id intentionally distinct
  from the live `fast` = FAST / BE-FAST stroke tile.) Cross-links
  `global-deterioration-scale`.

### 2.7 `cdr-sob` — Clinical Dementia Rating — Sum of Boxes

- **Citation:** Morris JC. The Clinical Dementia Rating (CDR): current version and
  scoring rules. *Neurology.* 1993;43(11):2412-2414. (SOB staging ranges: O'Bryant
  SE, Waring SC, Cullum CM, et al. *Arch Neurol.* 2008;65(8):1091-1095.)
- **citationUrl:** https://doi.org/10.1212/wnl.43.11.2412-a (verify at
  implementation, [spec-v97](spec-v97.md))
- **Group:** Clinical Scoring & Reference (`G`).
- **Specialties:** `geriatrics`, `neurology`.
- **Inputs:** the **6 boxes** — memory, orientation, judgment & problem-solving,
  community affairs, home & hobbies, personal care — each rated **0 / 0.5 / 1 / 2 /
  3** (personal care has no 0.5 level, verify at implementation,
  [spec-v97](spec-v97.md)).
- **Output:** the **Sum of Boxes 0–18** (the simple sum of the six box scores) with
  the published O'Bryant staging ranges — e.g., **0 none, 0.5–4.0 questionable to
  very mild, 4.5–9.0 mild, 9.5–15.5 moderate, 16.0–18.0 severe dementia** (verify
  the exact range boundaries at implementation, [spec-v97](spec-v97.md)) — naming
  the box scores. Class A. Cross-links `global-deterioration-scale`. (This is the
  Sum-of-Boxes continuum, distinct from the CDR Global Score; the SOB is what v173
  ships.)

### 2.8 `mds-cps` — MDS Cognitive Performance Scale (CPS)

- **Citation:** Morris JN, Fries BE, Mehr DR, et al. MDS Cognitive Performance
  Scale. *J Gerontol.* 1994;49(4):M174-M182.
- **citationUrl:** https://doi.org/10.1093/geronj/49.4.M174 (verify at
  implementation, [spec-v97](spec-v97.md))
- **Group:** Clinical Scoring & Reference (`G`).
- **Specialties:** `geriatrics`, `nursing-general`.
- **Inputs:** the MDS items the CPS hierarchy consumes — comatose (yes/no),
  short-term memory (OK/problem), cognitive skills for daily decision-making
  (independent → severely impaired), making self understood (understood →
  rarely/never), and eating self-performance (for the most-impaired branch).
- **Output:** the **CPS 0–6** via the published decision-tree hierarchy — **0
  intact, 1 borderline intact, 2 mild impairment, 3 moderate impairment, 4
  moderately severe, 5 severe, 6 very severe impairment** — naming the branch that
  fixed the level. Class A. Cross-links `bims`. (CPS is a published interRAI/MDS
  *derived* scale — shippable; the underlying MDS item set / RAI manual is not, see
  §7.)

## 3. Per-tile robustness

- **`bims`, `ad8`, `cdr-sob`, and `mds-cps` are bounded sums or a bounded
  decision-tree** mapped to published bands. `bims` enforces the published partial-
  credit recall scoring and clamps the total to 0–15; `ad8` clamps to 0–8;
  `cdr-sob` sums six 0/0.5/1/2/3 boxes to 0–18; `mds-cps` walks the published
  hierarchy to 0–6. Each names the items/branch that fixed the result.
- **`gpcog` is a two-stage screen.** The patient-section score routes the
  interpretation; only the indeterminate band (5–8) consumes the informant section,
  exactly as the published algorithm specifies. The tile reports which stage drove
  the conclusion.
- **`iqcode-short` is a mean, not a sum** — it divides the item total by the number
  of **answered** items. The denominator is **finite- and positive-guarded**: a
  zero/blank denominator (no items answered) surfaces `valid:false` with a
  complete-the-fields fallback and **never returns `NaN`/`Infinity`**
  ([spec-v59](spec-v59.md)).
- **`global-deterioration-scale` and `fast-dementia` are staging selections** — the
  clinician supplies the described cognitive/functional features and the tile
  **computes the stage** (it does not render a static reference table), satisfying
  the [spec-v100](spec-v100.md) §2 classification-tile clarification. Each names the
  features/substage that fixed the stage; `fast-dementia` surfaces the
  hospice-eligibility context as source-quoted information, not as a Sophie-voiced
  eligibility determination.
- **None authors a diagnosis in Sophie's voice** ([spec-v11](spec-v11.md) §5.3);
  each quotes the source's interpretation and renders the [spec-v50](spec-v50.md) §3
  clinical-posture note. All eight flow through the [spec-v59](spec-v59.md) fuzz
  harness with zero non-finite leaks, computing via `lib/num.js`.

## 4. CI/CD & maintenance

Per the [spec-v100](spec-v100.md) §6 contract (re-binding [spec-v85](spec-v85.md)
§6):

- **Maintenance classes (§6.3):** all eight are **Class A** — each cites a journal +
  authors (BIMS/CPS validation papers, Galvin AD8, Brodaty GPCOG, Jorm IQCODE,
  Reisberg GDS/FAST, Morris CDR + O'Bryant SOB). **The CMS / interRAI sources for
  `bims` and `mds-cps` are public-domain method** (BIMS is the MDS 3.0 §C
  interview; CPS is a published MDS-derived scale): **CMS does not trip
  `ISSUER_PATTERN`** ([spec-v92](spec-v92.md)/[spec-v94](spec-v94.md) lesson), so
  both stay **Class A with no `docs/citation-staleness.md` row**. **`cdr-sob` uses
  the Washington University CDR algorithm** (the canonical CDR scoring rules and
  the Knight ADRC scoring tree are **free, registration-only** at the WashU CDR
  site) — the implementing session cites the journal sources inline and notes the
  WashU CDR algorithm as the scoring authority; it does not redistribute any gated
  WashU material. No tile in v173 trips `ISSUER_PATTERN`, so **v173 adds no
  citation-staleness row.**
- **Build & gates (§6.1/§6.2):** the eight computes live in the new
  **`lib/ltcga-v173.js`** module (named exports `bims`, `ad8`, `gpcog`,
  `iqcodeShort`, `globalDeteriorationScale`, `fastDementia`, `cdrSob`, `mdsCps`),
  added to the `test/unit/fuzz-tools.test.js` `MODULES` list — `iqcode-short` is
  explicitly fuzzed for its mean-denominator division path (zero non-finite leaks).
  Renderers live in the new **`views/group-v173.js`** module; its `RV173` export is
  spread into the `app.js` `RENDERERS` map. Every input carries a real
  `<label for>`. The catalog count moves on all **13 catalog-truth surfaces**
  ([spec-v46](spec-v46.md)) in the same change, using the **live `UTILITIES.length`
  + 8**; a11y, `mobile-no-hscroll`, `mobile-touch-targets`, and the chromium
  `example-correctness` sweep pass for `views/group-v173.js`.
- **Source governance (§5 / [spec-v97](spec-v97.md)):** every band, partial-credit
  rule, and staging anchor is re-fetched and cross-verified against ≥2 independent
  sources at implementation — in particular the BIMS recall partial-credit scoring,
  the IQCODE decline cutoff, the GPCOG patient/informant thresholds, the FAST
  substage wording, the CDR-SOB O'Bryant staging-range boundaries, and the CPS
  decision-tree branches. Any tile whose verified scoring diverges from this draft
  is reconciled to the sources (the [spec-v148](spec-v148.md) source-governance
  pattern), and any tile that fails the ≥2-source bar is deferred with a sourced
  note (the [spec-v148](spec-v148.md) §7.1 pattern).

## 5. Files touched

```
docs/spec-v173.md                        (this file)
app.js                                   (+8 UTILITIES rows, group G; import group-v173 RV173 into RENDERERS)
lib/ltcga-v173.js                        (new module: bims, ad8, gpcog, iqcodeShort, globalDeteriorationScale, fastDementia, cdrSob, mdsCps)
lib/meta.js                              (+8 META entries: inline citation + citationUrl + accessed; cross-links to mini-cog, ad8, iqcode-short, global-deterioration-scale, fast-dementia, cdr-sob, bims)
views/group-v173.js                      (new renderer module: 8 renderers; RV173 export)
docs/clinical-citations.md               (+8 rows for the eight sources)
test/unit/bims.test.js, ad8.test.js, gpcog.test.js, iqcode-short.test.js, global-deterioration-scale.test.js, fast-dementia.test.js, cdr-sob.test.js, mds-cps.test.js  (≥3 boundary worked examples each)
test/unit/fuzz-tools.test.js             (add lib/ltcga-v173.js to MODULES)
docs/audits/v12/bims.md, ad8.md, gpcog.md, iqcode-short.md, global-deterioration-scale.md, fast-dementia.md, cdr-sob.md, mds-cps.md  (spec-v11 audit logs)
docs/scope-mdcalc-parity.md              (catalog count +8; LTC-GA program v173 first spec shipped)
CHANGELOG.md                             (Unreleased: v173 entry, +8)
README.md, package.json                  (catalog count +8; spec-progression line -> v173)
```

## 6. Acceptance criteria

v173 is fully shipped when:

- The implementing session has **re-run the [spec-v85 §6.2](spec-v85.md) collision
  check** and confirmed all eight ids are absent (in particular that
  `global-deterioration-scale` does not collide with the live `gds15`, and
  `fast-dementia` does not collide with the live `fast` stroke tile).
- All 8 tiles in §2 are live (Group G, Class A) with a `META[id]` entry, an inline
  primary citation + `citationUrl` + `accessed`, a [spec-v11](spec-v11.md) audit
  log, and a passing [spec-v29](spec-v29.md) §3 check.
- Each tile has **≥ 3 boundary worked examples, each with a band-flip**, including:
  a **BIMS 7 → 8** (severe → moderate boundary); an **AD8 1 → 2** (negative →
  impairment-suggested flip); a **GPCOG patient-section 8 → 9** (escalate-to-
  informant → no-impairment boundary) and a 4 → 5 (impairment → escalate boundary);
  an **IQCODE mean at the ~3.3–3.4 decline cutoff** (verify the exact value at
  implementation, [spec-v97](spec-v97.md)); a **GDS stage transition** (e.g.,
  4 → 5); a **FAST stage transition** (e.g., 6 → 7a, and a 7a-with-complication
  hospice-context example); a **CDR-SOB very-mild → mild boundary** (e.g., 4.0 →
  4.5, verify the exact O'Bryant boundary at implementation,
  [spec-v97](spec-v97.md)); and an **MDS-CPS 2 → 3** (mild → moderate) branch flip.
- `iqcode-short` guards its mean denominator (zero/blank answered-item count →
  surfaced `valid:false`, never `NaN`); `global-deterioration-scale` and
  `fast-dementia` compute the stage from the supplied features (not a static table);
  blank inputs render a complete-the-fields fallback across all eight.
- Every compute uses `lib/num.js` and is covered by the [spec-v59](spec-v59.md)
  fuzz harness with zero non-finite leaks; `lib/ltcga-v173.js` is in the
  `fuzz-tools.test.js` `MODULES` list.
- No tile trips `ISSUER_PATTERN`, so v173 adds **no `docs/citation-staleness.md`
  row**; the BIMS/CPS CMS-method status and the WashU CDR-algorithm note are
  recorded in the audit logs.
- `UTILITIES.length` is **live count + 8** and all catalog-truth surfaces
  ([spec-v46](spec-v46.md)) agree; `scope-mdcalc-parity.md` records v173 as the
  first shipped spec of the [spec-v172](spec-v172.md) LTC-GA program.
- `npm run lint`, `npm run test`, `npm run sbom`, and `npm run build` all pass.
- The CHANGELOG records v173 with the +8 catalog delta.

## 7. Out of scope for v173

- **No MMSE** — the Mini-Mental State Examination is **licensed by PAR, Inc.** and
  is not redistributable; excluded per [spec-v100](spec-v100.md) §8 /
  [spec-v172](spec-v172.md) §4. `bims` and `mds-cps` are the free, CMS-method
  substitutes for the bedside cognition exam.
- **No MoCA** — the Montreal Cognitive Assessment is behind a **registration +
  mandatory-training gate** and is not redistributable; excluded per
  [spec-v172](spec-v172.md) §4.
- **No full MDS 3.0 item set or RAI User's Manual** — these are **reference tables /
  documentation**, not calculators, and fail the [spec-v29](spec-v29.md) §3 one-line
  test ([spec-v100](spec-v100.md) §2 / [spec-v172](spec-v172.md) §4). v173 ships the
  *derived, computing* instruments (`bims`, `mds-cps`), not the assessment forms.
- **No CDR Global Score box-derivation algorithm as a separate tile** — v173 ships
  the **Sum of Boxes** (`cdr-sob`), the published 0–18 continuum; the CDR Global
  Score's washout/weighting rules are not shipped as a second tile in this spec.
- **No automatic diagnosis or hospice-eligibility determination** — each tile
  reports the score/stage and the source's interpretation; `fast-dementia` surfaces
  the hospice-eligibility *context* as source-quoted information; the clinical
  decision stays with the clinician and local coverage policy
  ([spec-v11](spec-v11.md) §5.3).

# spec-v172.md — Long-Term Care & Geriatric Assessment program: the nursing-home / elder-care deterministic-instrument gap audit (program-of-record)

> Status: **PROPOSED (2026-06-24).** Program-of-record for the **Long-Term Care
> & Geriatric Assessment (LTC-GA)** initiative — a vertical sweep of the
> instruments a **skilled-nursing facility, long-term-care home, assisted-living,
> PACE program, geriatric clinic, or hospice** uses every day that the catalog
> does not yet carry. It answers one question — *"if a nurse, NP, physician,
> pharmacist, dietitian, therapist, or social worker walked into a nursing home
> tomorrow, which deterministic, free, bedside instrument would they reach for
> and not find here?"* — and reserves the implementation band **v173–v182** for
> the gaps that survive the audit in **§3**.
>
> Catalog effect of the whole program: **nominal +54** across ten feature specs
> (from the live spec-v100-complete baseline of **676**, → **730** if every tile
> ships; the catalog-truth gate enforces the live count + delta at each spec).
> v172 itself ships **no tile**; it is the umbrella + the gap audit, in the same
> role [spec-v100](spec-v100.md) plays for Waves 1–8 and [spec-v150](spec-v150.md)
> plays for Post-Parity Coverage.
>
> Every prior spec (v4 through v171) remains in force. No tile in this program
> adds a runtime network call or AI. Each obeys the [spec-v100](spec-v100.md) §2
> doctrine (re-binding [spec-v85](spec-v85.md) §2) — including the §2
> **classification-tile clarification** (a tile *consumes the clinician's
> observations and computes a class/score*; it does not display a static
> reference table) — and the [spec-v100](spec-v100.md) §6 CI/CD contract. Each
> passes the [spec-v29](spec-v29.md) §3 one-line test, ships its primary citation
> inline ([spec-v54](spec-v54.md)), inherits the [spec-v59](spec-v59.md)
> output-safety contract, renders the [spec-v50](spec-v50.md) §3 clinical-posture
> note, and honors [spec-v11](spec-v11.md) §5.3 (no dosing/treatment order in
> Sophie's voice). **Every weight, coefficient, band, and lookup row is re-fetched
> and cross-verified against ≥2 independent sources at implementation**
> ([spec-v97](spec-v97.md)); nothing in this document is implemented from recall.

## 1. Why this program exists

The [spec-v100](spec-v100.md) MDCalc Parity program (complete at 676) and the
proposed [spec-v150](spec-v150.md)–[spec-v171](spec-v171.md) post-parity drafts
were organized around the **acute-care and specialty-clinic** calculator
universe — the ED, the ICU, the cath lab, the operating room, the antenatal
clinic. The catalog already carries the geriatric *spine* of that universe:
`katz-adl`, `barthel`, `lawton-iadl` (function); `braden`, `braden-q`,
`norton-push` (pressure injury); `cam`, `cam-icu`, `4at` (delirium); `mini-cog`
(cognition screen); `gds15`, `phq9`, `phq2-gad2` (mood); `painad`, `cpot`,
`flacc`, `rass`, `sas-riker` (pain/sedation in the nonverbal); `frail-scale`,
`mfi-5`, `mfi-11`, `ves-13`, `carg-toxicity` (frailty / geri-onc); `must-nutrition`,
`nrs2002`, `mnutric`, `nutric` (nutrition risk); `beers-check` (potentially
inappropriate medications); `charlson` (comorbidity); `osteoporosis-prescreen`
(OST/ORAI); `ecog-karnofsky`, `palliative-prognostic-index`,
`palliative-prognostic-score`, `opioid-conversion`, `opioid-mme`, `naranjo`
(palliative / pharmacy); `restraint-timer` (CMS 42 CFR 482.13). The proposed
post-parity drafts further reserve `berg-balance`, `tinetti-poma`, `tug`, and
`pps` (Palliative Performance Scale).

That is a strong acute-and-clinic geriatric surface. **It is not the
long-term-care surface.** The nursing home runs on a different, overlapping set
of standardized instruments — many of them anchored in the **CMS MDS 3.0**
resident assessment, the **interRAI** family, and the **dementia / behavioral /
prognosis** literature — that the acute-care passes never had reason to index.
This program closes that surface. The audit below is the honest accounting of
what is missing and what is deliberately left out.

## 2. Scope discipline (what qualifies)

A candidate ships only if it clears **all** of the [spec-v100](spec-v100.md) §2 +
[spec-v97](spec-v97.md) bars, which for this domain reduce to five tests:

1. **It computes.** It consumes the clinician's observations/findings and returns
   a score, stage, class, index value, or survival/probability band — it is not a
   reference card, a definitions list, or a documentation table
   (fails [spec-v29](spec-v29.md) §3 / [spec-v100](spec-v100.md) §2). *This rules
   out the MDS item-set itself, the RAI manual, the F-tag list, and the Five-Star
   methodology.*
2. **It is deterministic.** Fixed weights / a closed formula / a published lookup
   table — no model, no network, no AI ([spec-v100](spec-v100.md) §2).
3. **It is free and reproducible.** Public-domain (CMS/interRAI-published method,
   government) or a journal-published instrument whose scoring is reproducible
   from ≥2 independent sources ([spec-v97](spec-v97.md)). *Licensed/trademark-gated
   instruments are excluded or deferred — see §4.*
4. **It does not duplicate a live tile** (re-run the [spec-v85](spec-v85.md) §6.2
   collision check at implementation) **or a reserved id in the
   [spec-v150](spec-v150.md)–[spec-v171](spec-v171.md) drafts** (`berg-balance`,
   `tinetti-poma`, `tug`, `pps` are reserved there and are **excluded from this
   program**).
5. **It carries a real clinical decision** in the LTC / elder-care workflow — a
   nurse, prescriber, dietitian, therapist, pharmacist, or social worker actually
   uses it to triage, stage, prognosticate, or decide.

## 3. The gap audit — ten clusters, ~54 instruments

Each cluster becomes one feature spec. Tile counts are nominal; the implementing
session re-runs the collision check and may defer individual tiles on
source-governance grounds ([spec-v97](spec-v97.md)), exactly as
[spec-v148](spec-v148.md) deferred `valproate-correction`.

### 3.1 v173 — Cognition & dementia staging (8)

`bims` (Brief Interview for Mental Status, MDS §C, 0–15), `ad8` (AD8 Dementia
Screening Interview, 0–8), `gpcog` (General Practitioner Assessment of Cognition),
`iqcode-short` (Short IQCODE informant score), `global-deterioration-scale`
(Reisberg GDS, stages 1–7), `fast-dementia` (Functional Assessment Staging Tool,
stages 1–7f — the hospice-eligibility dementia stager; id avoids the live `fast`
stroke tile), `cdr-sob` (Clinical Dementia Rating — Sum of Boxes, 0–18), `mds-cps`
(MDS Cognitive Performance Scale, 0–6). *Why: `mini-cog` is the only live cognition
tile; LTC needs the MDS interview (BIMS), the informant route (AD8, IQCODE), and
the dementia stagers (GDS, FAST, CDR-SOB) that drive hospice eligibility and care
planning.*

### 3.2 v174 — Behavioral symptoms of dementia & observational delirium (5)

`nu-desc` (Nursing Delirium Screening Scale, 0–10), `doss` (Delirium Observation
Screening Scale, 0–13), `cornell-csdd` (Cornell Scale for Depression in Dementia,
0–38), `interrai-abs` (interRAI Aggressive Behavior Scale, 0–12), `cmai`
(Cohen-Mansfield Agitation Inventory, 29-item). *Why: the live delirium tiles
(`cam`, `cam-icu`, `4at`) are interview-based; LTC also needs the
nurse-observation screens completed across a shift (Nu-DESC, DOSS), the
dementia-specific depression scale (CSDD — `gds15`/`phq9` are invalid in moderate
dementia), and the agitation quantifiers that drive BPSD care plans.*

### 3.3 v175 — Pain in the cognitively impaired / nonverbal elder (3)

`abbey-pain` (Abbey Pain Scale, 0–18), `cnpi` (Checklist of Nonverbal Pain
Indicators, 0–10/0–12), `doloplus-2` (DOLOPLUS-2 behavioral pain scale, 0–30).
*Why: `painad` is live but is one of several validated observational scales; LTC
pain protocols frequently mandate Abbey or DOLOPLUS-2, and CNPI covers the
with-movement assessment `painad` does not.*

### 3.4 v176 — Falls risk, balance & gait (6)

`stratify` (St Thomas's Risk Assessment Tool, 0–5), `chair-stand-30s` (30-Second
Chair Stand Test vs CDC STEADI age/sex norms), `four-stage-balance` (4-Stage
Balance Test, timed), `functional-reach` (Functional Reach Test, distance vs
age/sex cut-points), `gait-speed` (4-metre gait speed vs mortality / frailty
cut-points), `steadi-algorithm` (CDC STEADI fall-risk screen → low/moderate/high
pathway). *Why: live falls tiles are `morse-falls` and `hendrich-ii`; the
performance-based battery (chair stand, balance, reach, gait speed) and the CDC
STEADI screening algorithm are the community / LTC standard and are absent.
`berg-balance`, `tinetti-poma`, `tug` are reserved in the v150–v171 drafts and are
excluded here.*

### 3.5 v177 — Frailty & sarcopenia (7)

`clinical-frailty-scale` (Rockwood CFS, 1–9 — **licensing review, see §4**),
`sarc-f` (SARC-F sarcopenia screen, 0–10), `sarc-calf` (SARC-F + calf
circumference), `prisma-7` (PRISMA-7 frailty screen, 0–7), `sof-frailty-index`
(Study of Osteoporotic Fractures index, 0–3), `groningen-frailty-indicator`
(GFI, 0–15), `edmonton-frail-scale` (EFS, 0–17). *Why: the live frailty tiles
(`frail-scale`, `mfi-5/11`, `ves-13`) are deficit-count / self-report screens;
this cluster adds the global clinical-judgment scale (CFS), the sarcopenia
case-finders (SARC-F / SARC-CalF), and the multidomain LTC screens (PRISMA-7,
GFI, EFS, SOF).*

### 3.6 v178 — Geriatric nutrition & dysphagia (6)

`gnri` (Geriatric Nutritional Risk Index — albumin + weight/ideal-weight formula),
`pni-onodera` (Prognostic Nutritional Index = 10·albumin + 0.005·lymphocytes),
`conut` (Controlling Nutritional Status score — albumin + cholesterol +
lymphocytes), `snaq` (Simplified Nutritional Appetite Questionnaire, 0–20),
`eat-10` (Eating Assessment Tool dysphagia screen, 0–40), `determine`
(DETERMINE nutritional-risk checklist, 0–21). *Why: live nutrition tiles
(`must-nutrition`, `nrs2002`, `mnutric`, `nutric`) are general/ICU screens; LTC
adds the lab-based geriatric indices (GNRI, PNI, CONUT — all pure formulas), the
appetite screen (SNAQ), the dysphagia self-screen (EAT-10; `guss` is the
clinician swallow test), and the community-elder checklist (DETERMINE). MNA-SF is
**excluded — Nestlé trademark, see §4**.*

### 3.7 v179 — Geriatric pharmacotherapy & polypharmacy burden (4)

`anticholinergic-burden` (Anticholinergic Cognitive Burden / ACB scale —
per-drug 1–3, summed), `anticholinergic-risk-scale` (ARS — per-drug 1–3, summed),
`drug-burden-index` (DBI = Σ D/(D+δ) across anticholinergic + sedative load),
`medication-regimen-complexity` (MRCI — dosage form + frequency + additional
directions). *Why: `beers-check` flags individual PIMs; LTC deprescribing also
needs the cumulative-burden quantifiers (ACB, ARS, DBI) and the regimen-complexity
index that drives medication-administration risk. STOPP/START is **excluded — a
≈190-criterion checklist with no aggregate score**, per [spec-v148](spec-v148.md)
§7.*

### 3.8 v180 — Older-adult mortality & LTC prognosis (7)

`lee-mortality-index` (Lee 4-year mortality, community older adults),
`schonberg-index` (Schonberg 5-/9-year mortality), `walter-index` (Walter 1-year
post-discharge mortality), `suemoto-index` (Suemoto 10-year mortality),
`mitchell-mri` (Mitchell Mortality Risk Index — 6-month mortality in advanced
dementia, MDS-based), `adept` (Advanced Dementia Prognostic Tool), `chess-scale`
(interRAI/MDS Changes in Health, End-stage disease, Signs & Symptoms scale, 0–5).
*Why: `charlson` and the palliative-prognostic tiles cover comorbidity and
terminal-cancer prognosis; the elder-care / hospice-eligibility decision needs the
validated all-cause life-expectancy indices (Lee, Schonberg, Walter, Suemoto — the
ePrognosis set) and the advanced-dementia prognosis tools (Mitchell MRI, ADEPT)
plus the MDS instability scale (CHESS).*

### 3.9 v181 — LTC infection surveillance & antimicrobial stewardship (2)

`mcgeer-criteria` (Revised McGeer/SHEA 2012 surveillance definitions of infection
in LTC — by body site → meets/does-not-meet), `loeb-minimum-criteria` (Loeb
minimum criteria for initiating antibiotics in LTC residents → meets/does-not-meet
by suspected site). *Why: nursing homes run formal infection surveillance and
antibiotic-stewardship programs (CMS Requirements of Participation, Phase 3); these
two consensus instruments are the field standard and have no catalog presence. A
tight, high-value pair.*

### 3.10 v182 — Continence, caregiver burden & advanced wound assessment (6)

`sandvik-incontinence` (Sandvik Severity Index = frequency × amount), `iciq-ui-sf`
(ICIQ-UI Short Form, 0–21 — **registration note, see §4**),
`modified-caregiver-strain-index` (Modified CSI / Thornton-Travis, 0–26),
`caregiver-strain-index` (Robinson CSI, 0–13), `waterlow` (Waterlow pressure-ulcer
risk score), `bates-jensen` (Bates-Jensen Wound Assessment Tool / BWAT, 13-item
healing score). *Why: continence severity (Sandvik, ICIQ) drives LTC care plans;
caregiver strain (CSI / MCSI) is the assisted-living / home-and-community decision
tool; `braden`/`norton-push` assess pressure-ulcer *risk* and *one* healing scale
(PUSH) — Waterlow adds the alternative risk score and BWAT the full wound-healing
trajectory.*

## 4. Deliberate exclusions & licensing flags

Honesty about what is *not* here is part of the audit:

- **Trademark / licensed instruments — excluded:** **MNA / MNA-SF** (Nestlé
  Nutrition Institute trademark), **MMSE** (PAR, Inc., licensed), **MoCA**
  (registration + training gate; not redistributable), **NPI / NPI-Q**
  (licensed), **PACSLAC**, **Zarit Burden Interview** (Mapi license), **FIM /
  WeeFIM** (UDSMR), **FRAX** (closed, non-public coefficients), **interRAI
  full assessment forms** (the *derived scales* — ABS, CHESS, CPS — are published
  and shippable; the assessment forms are not). These fail the
  [spec-v97](spec-v97.md) free-reproducibility bar and are **out of scope**.
- **Licensing review at implementation (may defer):** **`clinical-frailty-scale`**
  (Rockwood CFS — free for non-commercial education/research; Dalhousie requires a
  permission/license for commercial use; the implementing session must confirm
  redistribution terms or **defer** with `gail-bcrat`/`crib-ii`), and
  **`iciq-ui-sf`** (ICIQ — free to use, but the questionnaire is registered with
  the ICIQ Group, Bristol; ship the *scoring*, link the source, confirm terms).
- **Reference tables, not calculators — out of scope:** the MDS 3.0 item set, the
  RAI User's Manual, the CMS F-tag list, the Five-Star Quality Rating
  methodology, hospice Local Coverage Determinations, and the **PDPM** /
  **RUG-IV** SNF payment classifiers (PDPM is a large CMS classification engine,
  not a bedside formula; if pursued it belongs in **Group B billing** under a
  separate spec, not here). These fail [spec-v29](spec-v29.md) §3 /
  [spec-v100](spec-v100.md) §2.
- **Already live or reserved — not re-shipped:** every tile in §1's live list;
  and `berg-balance`, `tinetti-poma`, `tug`, `pps` reserved in the
  [spec-v150](spec-v150.md)–[spec-v171](spec-v171.md) drafts.

## 5. Program shape & CI/CD contract

Each feature spec (v173–v182) follows the [spec-v148](spec-v148.md) template:

- A new compute module **`lib/ltcga-vNNN.js`** per spec (named exports, one per
  tile), added to the `test/unit/fuzz-tools.test.js` `MODULES` list — every
  division (GNRI, PNI, DBI, Sandvik, mortality logits) and every weighted sum is
  fuzzed for [spec-v59](spec-v59.md) zero-non-finite-leak compliance, computing in
  **odds/log space where a logistic risk model would otherwise saturate to a
  float64 `1.0`** ([spec-v140](spec-v140.md) EOS lesson — the Lee/Schonberg/Walter/
  Suemoto/Mitchell/ADEPT logits are exactly this hazard).
- A new renderer module **`views/group-vNNN.js`** per spec, its `RVNNN` export
  spread into the `app.js` `RENDERERS` map; every input carries a real
  `<label for>`; `mobile-no-hscroll`, `mobile-touch-targets`, a11y, and the
  chromium `example-correctness` sweep pass.
- **Group assignment:** the scores/stages/indices are **Group G** (Clinical
  Scoring & Reference); the pure math conversions that return a value rather than a
  band — **`gnri`, `pni-onodera`, `conut`, `drug-burden-index`, `gait-speed`,
  `sandvik-incontinence`** — are **Group E** (Clinical Math & Conversions).
- **Specialties** are drawn from the closed vocabulary
  (`test/unit/specialty-coverage.test.js`): primarily **`geriatrics`**,
  **`nursing-rehab`**, **`nursing-general`**, **`primary-care`**,
  **`palliative-care`**, **`pharmacy`**, **`nutrition`**,
  **`speech-language-pathology`**, **`physical-therapy`**, **`social-work`**,
  **`wound-care`**, **`urology`**, **`psychiatry`**, **`infectious-disease`**.
  There is no `long-term-care` tag in the vocabulary; LTC tiles tag `geriatrics` +
  `nursing-general`/`nursing-rehab`. (No vocabulary edit is required.)
- **Maintenance class ([spec-v100](spec-v100.md) §6.3):** the journal-formula and
  CMS/interRAI-published tiles are **Class A**; any tile whose citation names a
  **society/consensus issuer that trips `ISSUER_PATTERN`** (e.g., **SHEA** for
  `mcgeer-criteria`, **CDC** for the STEADI battery, **ACR/AGS** if a Beers-adjacent
  source is cited) gets a `docs/citation-staleness.md` row naming the edition,
  `accessed` date, and review cadence ([spec-v92](spec-v92.md)/[spec-v94](spec-v94.md)
  lesson). The implementing session confirms which issuers trip the pattern at
  build time rather than from this document.
- **Catalog-truth:** each spec moves the count on all 13 catalog-truth surfaces
  ([spec-v46](spec-v46.md)) in the same change, using the **live `UTILITIES.length`
  + delta** (never a number copied from this umbrella — the running counts carry a
  known off-by-one that the catalog-truth gate enforces, per the
  [spec-v100](spec-v100.md) program lessons).

## 6. Acceptance criteria (program level)

The LTC-GA program is complete when:

- Each feature spec v173–v182 is shipped or has an explicit, sourced deferral note
  (the [spec-v148](spec-v148.md) §7.1 pattern) for any tile it drops.
- Every shipped tile passes the five §2 tests, has a `META[id]` entry with an
  inline primary citation + `citationUrl` + `accessed`, ≥3 boundary worked examples
  (each with a band-flip), a [spec-v11](spec-v11.md) audit log, and a passing
  [spec-v29](spec-v29.md) §3 check; every compute is covered by the
  [spec-v59](spec-v59.md) fuzz harness with zero non-finite leaks.
- The licensing flags in §4 are resolved (ship-with-terms or deferred) and
  recorded.
- `scope-mdcalc-parity.md` records the LTC-GA program and its final shipped delta;
  `npm run lint`, `npm run test`, `npm run sbom`, and `npm run build` pass at each
  spec; the CHANGELOG records each spec with its catalog delta.

## 7. Files touched (this spec)

```
docs/spec-v172.md          (this file — umbrella + gap audit, no tile)
docs/scope-mdcalc-parity.md (record the LTC-GA program-of-record; band v173-v182 reserved)
CHANGELOG.md               (Unreleased: v172 umbrella entry, +0 tiles)
```

The implementation specs v173–v182 each list their own files-touched block per the
[spec-v148](spec-v148.md) §5 template.

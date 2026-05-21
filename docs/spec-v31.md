# spec-v31.md — Beers-driven deprescribing checker

> Status: proposed (2026-05-21). v31 is a narrow, one-tile spec
> that resolves [spec-v29 §10.4](spec-v29.md#10-open-questions).
> It does not amend any other spec rule and does not change the
> v29 "computes-or-it-is-not-Sophie" one-line test.
>
> Catalog effect at v31 close: **232 + 1 = 233 tiles.**

## 1. Thesis

The v29 prune cut the standalone `beers` reference card (a
searchable list of drugs-to-avoid in older adults). What was
lost was clinically valuable — but the *list as a list* failed
the v29 §3 one-line test. v31 ships the **computed** form: a
medication-list + comorbidity-list intake that emits the
specific Beers Criteria flags the patient triggers, plus the
AGS 2023 deprescribing recommendation per flag.

The v29 footnote on this option already framed it explicitly:
"A v30 candidate is a Beers-driven deprescribing checker that
takes a medication list + age + comorbidity and outputs the
problematic-prescription flags — that would compute, and would
be in scope." v30 deferred it because the data shard (Tables
2-6 of AGS 2023) was scope enough for its own spec. v31 is that
spec.

## 2. What v31 adds (1 tile)

### 2.1 `beers-check` — AGS 2023 Beers PIM + drug-disease + drug-drug deprescribing checker

- **Citation:** 2023 American Geriatrics Society Beers Criteria®
  Update Expert Panel. *American Geriatrics Society 2023 updated
  AGS Beers Criteria® for potentially inappropriate medication
  use in older adults.* J Am Geriatr Soc 2023;71(7):2052-2081.
- **Group:** Medication & Infusion (`F`).
- **Specialties:** `nursing-floor`, `nursing-icu`, `nursing-general`, `geriatrics`, `internal-medicine`, `pharmacy`, `family-medicine`.
- **Inputs:**
  - Patient age in years (gate: tile applies to adults ≥65;
    banner notes "Beers Criteria applies to community-dwelling
    and institutionalised adults aged 65+; AGS 2023 §2").
  - Medication multi-select. The closed vocabulary covers the
    15 highest-impact Beers PIM categories that nurses
    routinely encounter on bedside med-reconciliation:
    - First-generation antihistamines (diphenhydramine,
      hydroxyzine, promethazine, chlorpheniramine).
    - Tricyclic antidepressants (amitriptyline, doxepin >6 mg,
      imipramine, nortriptyline).
    - Skeletal-muscle relaxants (cyclobenzaprine, methocarbamol,
      carisoprodol).
    - Benzodiazepines (any).
    - Z-drug hypnotics (zolpidem, zaleplon, eszopiclone).
    - First-generation antipsychotics and second-generation
      antipsychotics (any).
    - Long-acting sulfonylureas (glyburide, chlorpropamide).
    - Long-term PPI use (>8 weeks).
    - Systemic NSAIDs (chronic use; ibuprofen, naproxen,
      diclofenac, indomethacin, ketorolac).
    - Peripheral α-1 blockers used for HTN (doxazosin,
      prazosin, terazosin).
    - Digoxin > 0.125 mg/day or in heart failure.
    - Centrally-acting α-agonists (clonidine, methyldopa,
      reserpine).
    - Opioids (any chronic).
    - Gabapentinoids (gabapentin, pregabalin).
    - Anticholinergic antimuscarinics for urinary incontinence
      (oxybutynin, tolterodine, fesoterodine, solifenacin).
  - Comorbidity multi-select. The closed vocabulary covers the
    8 highest-impact AGS 2023 Table 3 drug-disease interactions:
    history of falls or fractures, history of syncope, heart
    failure, history of GI bleed, parkinsonism, dementia or
    cognitive impairment, chronic kidney disease (CrCl < 30),
    delirium history.
- **Output:**
  - For each flagged medication: the AGS 2023 PIM rationale
    (one-line) and the deprescribing recommendation (avoid /
    use with caution / dose-cap / time-limit).
  - For each medication × comorbidity drug-disease interaction
    (Table 3): the specific interaction flag with the AGS 2023
    rationale (e.g. "benzodiazepine + history of falls →
    increased fall risk; AGS 2023 strongly recommends avoid").
  - For the opioid + benzodiazepine and opioid + gabapentinoid
    drug-drug combinations from AGS 2023 Table 6: a
    high-severity respiratory-depression flag.
  - A "no Beers flags identified at this med list / comorbidity
    list" message when nothing triggers.
- **Edge inputs:**
  - Age < 65 → banner: "Beers Criteria applies to adults aged
    65+; this med list may still warrant review, but the AGS
    recommendations below are out of band."
  - Empty medication list → "no medications selected."
- **Worked examples (≥3, in the test suite):**
  1. Age 78, meds = [benzodiazepine, opioid], comorbid =
     [history-of-falls] → three flags: benzo PIM (Table 2),
     benzo + falls (Table 3), opioid + benzo (Table 6).
  2. Age 72, meds = [glyburide, diphenhydramine], comorbid = []
     → glyburide PIM (long-acting sulfonylurea, severe
     hypoglycaemia), diphenhydramine PIM (anticholinergic
     burden).
  3. Age 80, meds = [digoxin-high-dose], comorbid =
     [heart-failure] → digoxin PIM (Table 2 dose-cap > 0.125)
     + digoxin + HF flag (Table 3).
  4. Age 70, meds = [], comorbid = [] → no flags.
  5. Age 60, meds = [benzodiazepine], comorbid = [] →
     age-band banner; flags still report for educational use.

## 3. Files touched

```
docs/spec-v31.md                         (this file)
app.js                                   (+1 UTILITIES row)
lib/medication-v4.js                     (+1 export: beersCheck)
lib/meta.js                              (+1 META[id] entry)
views/group-f.js                         (+1 renderer)
test/unit/beers-check.test.js            (new)
docs/audits/v11/beers-check.md           (new)
docs/scope-mdcalc-parity.md              (catalog count 232 -> 233)
CHANGELOG.md                             (Unreleased: v31 entry)
README.md                                (catalog count 232 -> 233)
package.json                             (description count 232 -> 233)
```

The compute function lives in `lib/medication-v4.js` (the v4-era
medication-domain module — Beers is medication-safety scope, not
scoring/risk).

## 4. Acceptance criteria

v31 is fully shipped when:

- This file exists and is linked from
  [docs/spec-v29.md §10](spec-v29.md) (cross-reference noting
  "Resolved by spec-v31").
- The tile in §2 is present: `META[id]` entry, ≥3 worked examples
  in the test suite, primary citation visible inline, spec-v11
  audit log in `docs/audits/v11/`.
- `UTILITIES.length` is 233.
- `npm run lint`, `npm run test`, `npm run sbom`, and
  `npm run build` all pass.
- The CHANGELOG records v31 with the catalog-count delta.

## 5. Out of scope for v31

- The full AGS 2023 Beers Tables 4 (use-with-caution) and 5
  (renal-adjust). The v31 closed vocabulary covers Tables 2, 3,
  and the two highest-severity rows of Table 6. The use-with-
  caution and renal-adjust tables are largely covered by other
  Sophie tiles (the renal-dose adjuster, the antibiotic renal
  ladder) — surfacing them again here would duplicate.
- A complete drug-name index. The closed vocabulary uses *drug
  categories* (e.g. "any benzodiazepine"), not specific NDC
  matching. A full drug-name autocomplete is out of scope per
  spec-v29 §2.1 (NDC and RxNorm lookups are retired).
- A pediatric or non-geriatric variant. AGS Beers is explicitly
  a geriatric tool; the < 65 banner above acknowledges this.

## 6. Open questions resolved

[spec-v29 §10.4](spec-v29.md#10-open-questions) is resolved by
this spec. The remaining v29 §10 items
(patient-facing workflow generators §10.1; audience-chip default
§10.5) are not addressed here and remain open.

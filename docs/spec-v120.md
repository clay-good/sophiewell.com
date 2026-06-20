# spec-v120.md — Epilepsy, headache & vertigo: STESS, 2HELPS2B, MESS first-seizure, POUND, and HINTS (+5 tiles)

> Status: **SHIPPED (2026-06-19).** Feature spec of the [spec-v100](spec-v100.md)
> MDCalc Parity Completion program, **Wave 4 (Neurology / neurosurgery / psychiatry)**.
> Adds **5** deterministic epilepsy, headache, and vertigo decision rules that fill
> confirmed gaps. None duplicates a live tile.
>
> Catalog effect at v120 close: **521 + 5 = 526 tiles** (the running program
> narrative carries a known off-by-one; the live `UTILITIES.length` was 521 at
> v119 close, so v120 lands at 526 — the catalog-truth gate enforces the live
> count). Shipped via new `lib/neuro-v120.js` + `views/group-v120.js` (RV120);
> the MESS per-year recurrence grid is paywalled so the tile reports the
> confirmable risk-group ranges over a 3–5 year window (no fabricated annual
> cells), and 2HELPS2B ships its integer→risk lookup as a compiled constant
> (no render-time model). All five are Class A (no `docs/citation-staleness.md`
> row).
>
> Every prior spec (v4 through v119) remains in force. v120 adds no runtime network
> call and no AI; each tile obeys the [spec-v100](spec-v100.md) §2 doctrine (which
> re-binds the [spec-v85](spec-v85.md) §2 doctrine) and the [spec-v100](spec-v100.md)
> §6 CI/CD contract, passes the [spec-v29](spec-v29.md) §3 one-line test, ships its
> primary citation inline ([spec-v54](spec-v54.md)), and inherits the
> [spec-v59](spec-v59.md) output-safety contract.

## 1. Thesis

The catalog covers stroke and the dementia screens but not the epilepsy-prognosis,
headache-likelihood, and vertigo-localization rules a neurologist or ED clinician uses
daily. Five standard instruments are absent:

- **`stess`** — the Status Epilepticus Severity Score (in-hospital mortality risk).
- **`helps2b`** — the 2HELPS2B score for 72-hour seizure risk on continuous EEG, an
  ML-*derived* rule that ships as a fixed integer→risk **lookup** (deterministic, in
  scope per [spec-v100](spec-v100.md) §11).
- **`mess-first-seizure`** — the MESS rule for seizure-recurrence risk after a first
  or early seizure (id disambiguated from the v109 MESS mangled-extremity score per the
  [spec-v100](spec-v100.md) §4 collision audit).
- **`pound-migraine`** — the POUND mnemonic for bedside migraine likelihood.
- **`hints`** — the HINTS / HINTS-plus exam for central-vs-peripheral acute vestibular
  syndrome.

Each is a published, deterministic instrument a neurology/ED clinician already uses;
v120 brings them onto the page.

## 2. What v120 adds (5 tiles)

### 2.1 `stess` — Status Epilepticus Severity Score

- **Citation:** Rossetti AO, Logroscino G, Bromfield EB. A clinical score for prognosis
  of status epilepticus in adults. *J Neurol.* 2008;255(10):1561-1566.
- **citationUrl:** https://doi.org/10.1007/s00415-008-0989-1
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `neurology`, `neurocritical-care`, `emergency-medicine`, `critical-care`.
- **Inputs:** level of consciousness, worst seizure type, age band, and history of prior
  seizures.
- **Output:** the **STESS total (0–6)** with the source's framing (≥ 3 predicts higher
  in-hospital mortality / lower likelihood of return to baseline). Class A (fixed point
  weights; citation names the journal + authors). Cross-links `helps2b`.

### 2.2 `helps2b` — 2HELPS2B Score

- **Citation:** Struck AF, Ustun B, Ruiz AR, et al. Association of an electroencephalography-
  based risk score with seizure probability in hospitalized patients. *JAMA Neurol.*
  2017;74(12):1419-1424.
- **citationUrl:** https://doi.org/10.1001/jamaneurol.2017.2459
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `neurology`, `neurocritical-care`, `critical-care`, `nursing-neuro`.
- **Inputs:** the clinician's read of the cEEG features — frequency > 2 Hz for any
  periodic/rhythmic pattern, sporadic epileptiform discharges, lateralized periodic
  discharges (LPDs), bilateral independent periodic discharges (BIPDs), generalized
  periodic discharges (GPDs), and brief potentially-ictal rhythmic discharges (B(I)RDs).
- **Output:** the **2HELPS2B total (0–7)** mapped through the **published fixed
  integer→risk lookup** (each integer total maps to a calibrated 72-hour seizure
  probability). Class A. **ML-derivation note:** the score was *derived* by a machine-
  learning method but **ships as a deterministic integer→risk lookup table** computed at
  authoring time — no model runs at render time ([spec-v100](spec-v100.md) §11).
  Cross-links `stess`.

### 2.3 `mess-first-seizure` — MESS First-Seizure Recurrence Rule

- **Citation:** Kim LG, Johnson TL, Marson AG, Chadwick DW; MRC MESS Study Group.
  Prediction of risk of seizure recurrence after a single seizure and early epilepsy:
  further results from the MESS trial. *Lancet Neurol.* 2006;5(4):317-322.
- **citationUrl:** https://doi.org/10.1016/S1474-4422(06)70383-0
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `neurology`, `emergency-medicine`, `internal-medicine`, `nursing-neuro`.
- **Inputs:** the published prognostic-index factors — number of seizures at
  presentation, neurological disorder / EEG abnormality, and the resulting risk-group
  starting points.
- **Output:** the **MESS risk-group classification (low / medium / high)** with the
  source's banded 1-, 3-, and 5-year recurrence risk (treated and untreated). Class A
  (fixed grouping rule). **Id note:** distinct from the v109 `mangled-extremity` MESS.

### 2.4 `pound-migraine` — POUND Mnemonic

- **Citation:** Detsky ME, McDonald DR, Baerlocher MO, Tomlinson GA, McCrory DC, Booth
  CM. Does this patient with headache have a migraine or need neuroimaging? *JAMA.*
  2006;296(10):1274-1283.
- **citationUrl:** https://doi.org/10.1001/jama.296.10.1274
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `neurology`, `headache`, `emergency-medicine`, `internal-medicine`.
- **Inputs:** the five POUND features — Pulsatile quality, hOurs (4–72 h) duration,
  Unilateral location, Nausea/vomiting, Disabling intensity.
- **Output:** the **POUND count (0–5)** with the source's likelihood-ratio framing
  (≥ 4 strongly favors migraine; ≤ 2 makes migraine unlikely). Class A (fixed mnemonic).

### 2.5 `hints` — HINTS / HINTS-plus

- **Citation:** Kattah JC, Talkad AV, Wang DZ, Hsieh YH, Newman-Toker DE. HINTS to
  diagnose stroke in the acute vestibular syndrome: three-step bedside oculomotor
  examination more sensitive than early MRI diffusion-weighted imaging. *Stroke.*
  2009;40(11):3504-3510.
- **citationUrl:** https://doi.org/10.1161/STROKEAHA.109.551234
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `neurology`, `emergency-medicine`, `otolaryngology`, `stroke`.
- **Inputs:** the three HINTS components — Head-Impulse test (normal vs abnormal),
  Nystagmus (direction-fixed vs direction-changing), Test of Skew (absent vs present) —
  plus the optional HINTS-plus new-hearing-loss item.
- **Output:** the **central-vs-peripheral classification** — any "central" pattern
  (normal head impulse, direction-changing nystagmus, skew present, or new hearing loss)
  flags a central/stroke cause requiring imaging. Class A (fixed exam rule). Cross-links
  `nihss`, `cpsss`.

## 3. Per-tile robustness

- **`stess` and `pound-migraine` are bounded point/count sums** (0–6 and 0–5); each is
  re-fetched verbatim from its derivation paper (per the v97 "re-fetch, never recall
  coefficients" lesson), clamped to its published range, with a deterministic band/LR
  lookup.
- **`helps2b` is a fixed integer→risk LOOKUP.** The 0–7 total maps to its published,
  calibrated 72-hour seizure probabilities through a compiled lookup table — fully
  deterministic, **no ML model runs at render time** ([spec-v100](spec-v100.md) §11);
  the total is clamped to 0–7 before the lookup.
- **`mess-first-seizure` and `hints` are classification rules** (risk-group; central-vs-
  peripheral), bounded and deterministic with no overflow-prone arithmetic; each names
  the inputs that drove the verdict.
- All five flow through the [spec-v59](spec-v59.md) fuzz harness with zero non-finite
  leaks, render the [spec-v50](spec-v50.md) §3 clinical posture note, quote the source's
  interpretation, and author no treatment recommendation in Sophie's voice
  ([spec-v11](spec-v11.md) §5.3). Each is mobile-first per [spec-v72](spec-v72.md)
  (44px targets, no 320px horizontal scroll).

## 4. CI/CD & maintenance

Per the [spec-v100](spec-v100.md) §6 contract (re-binding [spec-v85](spec-v85.md) §6):

- **Maintenance classes (§6.3):** all five are **Class A** (fixed point weights /
  mnemonic / classification rule / compiled lookup; each citation names the journal +
  authors, not an issuing society, so none trips the `ISSUER_PATTERN` gotcha) — **no**
  `docs/citation-staleness.md` row.
- **Build (§6.1):** the compute lives in new `lib/neuro-v120.js` (with the `helps2b`
  integer→risk lookup as a compiled constant block); the renderer is new
  `views/group-v120.js` whose `RV120` export is added to the `app.js` `RENDERERS`
  spread; five `UTILITIES` rows (all group G) and five `META` entries (inline citation +
  `citationUrl` + `accessed`).
- **Gates (§6.2):** `lib/neuro-v120.js` is added to the `test/unit/fuzz-tools.test.js`
  `MODULES` list (zero non-finite leaks); each `META` example is pinned by the chromium
  `example-correctness` sweep; the catalog count moves on all **13 catalog-truth
  surfaces**; a11y, `mobile-no-hscroll`, and 44px touch-target checks pass for
  `views/group-v120.js`.

## 5. Files touched

```
docs/spec-v120.md                        (this file)
app.js                                   (+5 UTILITIES rows, group G; import group-v120 renderers into RENDERERS as RV120)
lib/neuro-v120.js                        (new module: stess, helps2b, messFirstSeizure, poundMigraine, hints; helps2b integer->risk lookup compiled constants)
lib/meta.js                              (+5 META entries: inline citation + citationUrl + accessed; cross-links to nihss, cpsss)
views/group-v120.js                      (new renderer module: 5 renderers)
docs/clinical-citations.md               (+ rows for the five sources)
test/unit/stess.test.js, helps2b.test.js, mess-first-seizure.test.js, pound-migraine.test.js, hints.test.js  (≥3 boundary worked examples each)
test/unit/fuzz-tools.test.js             (add lib/neuro-v120.js to MODULES)
docs/audits/v12/stess.md, helps2b.md, mess-first-seizure.md, pound-migraine.md, hints.md  (spec-v11 audit logs)
docs/scope-mdcalc-parity.md              (catalog count 522 -> 527; running v100 program ledger)
CHANGELOG.md                             (Unreleased: v120 entry, +5)
README.md, package.json                  (catalog count 522 -> 527; spec-progression line -> v120)
```

## 6. Acceptance criteria

v120 is fully shipped when:

- The implementing session has **re-run the §6.2 collision check** and confirmed all
  five ids are absent (`mess-first-seizure` distinct from the v109 `mangled-extremity`).
- All 5 tiles in §2 are live in Group G with a `META[id]` entry, an inline primary
  citation + `citationUrl` + `accessed`, ≥3 boundary worked examples each (including a
  `stess` ≥3 mortality-band flip, a `helps2b` integer→risk lookup at two totals, a
  `mess-first-seizure` low-vs-high group, a `pound-migraine` ≥4 migraine-likely flip,
  and a `hints` peripheral-vs-central exam flip), a [spec-v11](spec-v11.md) audit log,
  and a passing [spec-v29](spec-v29.md) §3 check.
- `helps2b` ships its risk lookup as a compiled constant table (no render-time model)
  and clamps the 0–7 total before lookup; partial inputs render a complete-the-fields
  fallback.
- Every compute function uses `lib/num.js` and is covered by the
  [spec-v59](spec-v59.md) fuzz harness with zero non-finite leaks.
- All five are **Class A** — no `docs/citation-staleness.md` row.
- `UTILITIES.length` is **527** (or the then-current live count + 5 if specs land out
  of order) and all catalog-truth surfaces ([spec-v46](spec-v46.md)) agree.
- `npm run lint`, `npm run test`, `npm run sbom`, and `npm run build` all pass.
- The CHANGELOG records v120 with the +5 catalog delta.

## 7. Out of scope for v120

- **No EEG/imaging signal analysis.** `helps2b` takes the clinician's read of the named
  cEEG patterns as input; `hints` takes the bedside exam findings; v120 parses no EEG
  waveform, no DICOM, and no report.
- **No render-time machine-learning model** — `helps2b` ships only the published fixed
  integer→risk lookup ([spec-v100](spec-v100.md) §11); the derivation model is not
  re-run on the page.
- **No auto-treatment, auto-antiepileptic, or auto-imaging order** — each tile reports
  the score/classification and the source's stated framing; the treat/admit/image
  decision stays with the clinician and local protocol ([spec-v11](spec-v11.md) §5.3).

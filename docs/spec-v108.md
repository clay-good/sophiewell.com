# spec-v108.md — Trauma severity scores: TRISS, NISS, TASH, RABT, GCS-Pupils, and NEXUS Chest CT (+6 tiles)

> Status: **PROPOSED (2026-06-17).** Feature spec of the [spec-v100](spec-v100.md)
> MDCalc Parity Completion program, **Wave 2 — Emergency / trauma / toxicology /
> environmental** ([spec-v106](spec-v106.md)–[spec-v111](spec-v111.md)). Adds **6**
> deterministic trauma severity scores and decision rules that fill confirmed gaps.
> None duplicates a live tile.
>
> Catalog effect at v108 close: **468 + 6 = 474 tiles** (v107 closed at 468).
>
> Every prior spec (v4 through v107) remains in force. v108 adds no runtime network
> call and no AI; each tile obeys the [spec-v100](spec-v100.md) §2 doctrine (which
> re-binds the [spec-v85](spec-v85.md) §2 doctrine verbatim) and the
> [spec-v100](spec-v100.md) §6 CI/CD contract, passes the [spec-v29](spec-v29.md) §3
> one-line test, ships its primary citation inline ([spec-v54](spec-v54.md)), and
> inherits the [spec-v59](spec-v59.md) output-safety contract.

## 1. Thesis

The catalog carries `iss-rts` (ISS + Revised Trauma Score) and `abc-mtp` (the ABC
massive-transfusion rule), but six standard trauma instruments are absent, and each
answers a distinct trauma-bay question:

- **No TRISS.** The probability-of-survival model combining age, RTS, ISS, and
  blunt/penetrating mechanism — the benchmark trauma-outcome calculation — has no
  tile, even though its inputs (ISS, RTS) are already computed elsewhere.
- **No NISS.** The New Injury Severity Score (sum of squares of the three worst
  AIS, any region) outperforms ISS in several cohorts and is absent.
- **No TASH score.** The logistic massive-transfusion probability — the
  continuous companion to the binary ABC rule already shipped — is missing.
- **No RABT score.** The simpler 0–4 MT-prediction rule (shock index, pelvic
  fracture, penetrating mechanism, positive FAST) is absent.
- **No GCS-Pupils.** The GCS-P index (GCS minus a pupil-reactivity penalty,
  1–15) used in TBI prognosis is missing; the catalog has GCS but not the
  pupil-adjusted form.
- **No NEXUS Chest CT.** The 7-criterion rule-out for chest CT in blunt trauma is
  absent.

Each is a published, deterministic instrument a clinician already uses; v108
brings them onto the page.

## 2. What v108 adds (6 tiles)

### 2.1 `triss` — Trauma and Injury Severity Score

- **Citation:** Boyd CR, Tolson MA, Copes WS. Evaluating trauma care: the TRISS
  method. Trauma Score and the Injury Severity Score. *J Trauma.*
  1987;27(4):370-378.
- **citationUrl:** https://doi.org/10.1097/00005373-198704000-00005
- **Group:** Clinical Math & Conversions (`E`) with a Clinical Scoring framing
  (`G`); homed in `E` (a probability computation), cross-linked from `G`.
- **Specialties:** `trauma-surgery`, `emergency-medicine`, `critical-care`,
  `nursing-er`.
- **Inputs:** age (dichotomized < 55 / ≥ 55 per the model), Revised Trauma Score
  (coded RTS), Injury Severity Score, and mechanism (blunt vs penetrating, which
  selects the coefficient set).
- **Output:** the **probability of survival Ps = 1/(1 + e^−b)** with the published
  blunt and penetrating coefficient sets (b = b₀ + b₁·RTS + b₂·ISS + b₃·AgeIndex),
  reported as a percent. Class A (fixed 1987 coefficients). **Near-neighbor:**
  `iss-rts` (live) *produces* the ISS and RTS this tile *consumes* — cross-linked,
  both kept (different jobs).

### 2.2 `niss` — New Injury Severity Score

- **Citation:** Osler T, Baker SP, Long W. A modification of the injury severity
  score that both improves accuracy and simplifies scoring. *J Trauma.*
  1997;43(6):922-925.
- **citationUrl:** https://doi.org/10.1097/00005373-199712000-00009
- **Group:** Clinical Math & Conversions (`E`).
- **Specialties:** `trauma-surgery`, `emergency-medicine`, `nursing-er`.
- **Inputs:** the three highest AIS severities (1–6) **regardless of body region**
  (the NISS departure from ISS, which requires three different regions).
- **Output:** the **sum of squares of the three worst AIS** (range up to 75, with
  any AIS-6 forcing the maximal score per AIS convention), naming the three
  values used. Class A. Cross-links `iss-rts` (the ISS that requires three
  *distinct* regions) as the contrasting model.

### 2.3 `tash-score` — Trauma-Associated Severe Hemorrhage Score

- **Citation:** Yücel N, Lefering R, Maegele M, et al. Trauma Associated Severe
  Hemorrhage (TASH)-Score: probability of mass transfusion as surrogate for life
  threatening hemorrhage after multiple trauma. *J Trauma.* 2006;60(6):1228-1236.
- **citationUrl:** https://doi.org/10.1097/01.ta.0000220386.84012.bf
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `trauma-surgery`, `emergency-medicine`, `critical-care`,
  `nursing-er`.
- **Inputs:** the weighted variables — systolic BP bands, hemoglobin bands, base
  excess bands, heart rate ≥ 120, FAST-positive abdomen, clinically unstable
  pelvic fracture, open/dislocated femur fracture, and male sex.
- **Output:** the **point total** converted to the **logistic probability of
  massive transfusion** (p = 1/(1 + e^−(−4.9 + 0.3·TASH))), reported as a percent,
  naming the total. Class A. Cross-links the existing `abc-mtp` (the binary rule)
  and `rabt-score`.

### 2.4 `rabt-score` — Revised Assessment of Bleeding and Transfusion Score

- **Citation:** Joseph B, Khan M, Truitt M, et al. Massive transfusion: the
  revised assessment of bleeding and transfusion (RABT) score. *World J Surg.*
  2018;42(11):3702-3708.
- **citationUrl:** https://doi.org/10.1007/s00268-018-4674-y
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `trauma-surgery`, `emergency-medicine`, `nursing-er`.
- **Inputs:** shock index > 1 (+1), pelvic fracture (+1), penetrating mechanism
  (+1), and positive FAST (+1).
- **Output:** the **total (0–4)** with the published MT-activation threshold
  (≥ 2 predicts massive transfusion), naming the contributing items. Class A.
  Cross-links `abc-mtp` and `tash-score`.

### 2.5 `gcs-pupils` — Glasgow Coma Scale–Pupils Score (GCS-P)

- **Citation:** Brennan PM, Murray GD, Teasdale GM. Simplifying the use of
  prognostic information in traumatic brain injury. Part 1: the GCS-Pupils score.
  *J Neurosurg.* 2018;128(6):1612-1620.
- **citationUrl:** https://doi.org/10.3171/2017.12.JNS172780
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `trauma-surgery`, `critical-care`, `emergency-medicine`,
  `nursing-icu`.
- **Inputs:** the total Glasgow Coma Scale (3–15) and the number of pupils
  unreactive to light (0, 1, or 2).
- **Output:** the **GCS-P index = GCS − Pupil Reactivity Score** (1–15, where the
  pupil penalty is 0/1/2), naming both components. Class A. Cross-links the
  existing GCS tile (`gcs-pupils` extends it with the pupil penalty).

### 2.6 `nexus-chest-ct` — NEXUS Chest CT decision instrument

- **Citation:** Rodriguez RM, Langdorf MI, Nishijima D, et al. Derivation and
  validation of two decision instruments for selective chest CT in blunt trauma:
  a multicenter prospective observational study (NEXUS Chest CT). *PLoS Med.*
  2015;12(10):e1001883.
- **citationUrl:** https://doi.org/10.1371/journal.pmed.1001883
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `trauma-surgery`, `emergency-medicine`, `nursing-er`.
- **Inputs:** the 7 criteria — abnormal chest x-ray, distracting injury, chest
  wall/sternum/thoracic-spine/scapula tenderness, rapid-deceleration mechanism,
  age > 60, intoxication, and abnormal alertness/mental status — each yes/no.
- **Output:** a **chest CT can be deferred if all negative vs CT may be indicated**
  verdict, naming which criterion/criteria flagged. Class A.

## 3. Per-tile robustness

- **`triss` and `tash-score` guard their logistic math.** Each uses an
  overflow-safe `1/(1 + e^−x)` with the exponent clamped to a finite range, so a
  fuzz-extreme ISS or TASH total returns a surfaced `valid:false` fallback rather
  than a probability from `Infinity`. `triss` selects the blunt vs penetrating
  coefficient set explicitly and renders which set applied.
- **`niss` clamps each AIS to 1–6** and applies the AIS-6 → maximal-score
  convention; it sums squares of the three highest (regardless of region) and
  names the three values, distinguishing it from ISS in the derivation.
- **`gcs-pupils` bounds the index to 1–15** (the pupil penalty cannot drive the
  index below 1) and rejects an out-of-range GCS; `rabt-score` and
  `nexus-chest-ct` are bounded integer/any-positive rules.
- All six flow through the [spec-v59](spec-v59.md) fuzz harness with zero
  non-finite leaks, render the [spec-v50](spec-v50.md) §3 clinical posture note,
  and quote the source's interpretation; none authors a transfusion, CT, or
  trauma-bay order in Sophie's voice ([spec-v11](spec-v11.md) §5.3).

## 4. CI/CD & maintenance

Per the [spec-v100](spec-v100.md) §6 contract (re-binding [spec-v85](spec-v85.md) §6):

- **Maintenance classes (§6.3):** all six tiles are **Class A** — each cites a
  fixed derivation paper (J Trauma, World J Surg, J Neurosurg, PLoS Med) by
  **journal + authors**, not an issuing society, so none trips `ISSUER_PATTERN`
  and **none gets a `docs/citation-staleness.md` row.**
- **Module & gates (§6.2):** the compute module is **`lib/trauma-v108.js`**
  (exports `triss`, `niss`, `tashScore`, `rabtScore`, `gcsPupils`, `nexusChestCt`),
  added to the `test/unit/fuzz-tools.test.js` `MODULES` list (zero non-finite
  leaks; the TRISS and TASH logistics explicitly fuzzed for overflow). The
  renderer module is **`views/group-v33.js`**; its `RV33` export is added to the
  `app.js` `RENDERERS` spread. Each `META` example is pinned by the chromium
  `example-correctness` sweep; the catalog count moves on all **13 catalog-truth
  surfaces**; a11y, `mobile-no-hscroll`, and 44px touch-target checks pass for
  `views/group-v33.js`.

## 5. Files touched

```
docs/spec-v108.md                        (this file)
app.js                                   (+6 UTILITIES rows, groups E/G; import group-v33 renderers (RV33) into RENDERERS)
lib/trauma-v108.js                       (new module: triss, niss, tashScore, rabtScore, gcsPupils, nexusChestCt)
lib/meta.js                              (+6 META entries: inline citation + citationUrl + accessed; cross-links to iss-rts, abc-mtp, gcs)
views/group-v33.js                       (new renderer module: 6 renderers)
docs/clinical-citations.md               (+6 rows for the six sources)
test/unit/triss.test.js, niss.test.js, tash-score.test.js, rabt-score.test.js, gcs-pupils.test.js, nexus-chest-ct.test.js  (≥3 boundary worked examples each)
test/unit/fuzz-tools.test.js             (add lib/trauma-v108.js to MODULES)
docs/audits/v12/triss.md, niss.md, tash-score.md, rabt-score.md, gcs-pupils.md, nexus-chest-ct.md  (spec-v11 audit logs)
docs/scope-mdcalc-parity.md              (catalog count 468 -> 474; Wave 2 progress in the running ledger)
CHANGELOG.md                             (Unreleased: v108 entry, +6)
README.md, package.json                  (catalog count 468 -> 474; spec-progression line -> v108)
```

## 6. Acceptance criteria

v108 is fully shipped when:

- The implementing session has **re-run the §6.2 collision check** and confirmed
  all six ids are absent (`triss`, `niss`, `tash-score`, `rabt-score`,
  `gcs-pupils`, `nexus-chest-ct`).
- All 6 tiles in §2 are live with a `META[id]` entry, an inline primary citation +
  `citationUrl` + `accessed`, ≥3 boundary worked examples each including a
  **band-flip per tile** (TRISS: blunt vs penetrating coefficient set on the same
  inputs giving different Ps; NISS: an AIS-6 forcing the maximal score; TASH:
  total crossing into a high MT-probability; RABT: total crossing 2 into the
  activation band; GCS-P: one unreactive pupil dropping the index by 1; NEXUS:
  one positive criterion flipping defer→CT), a [spec-v11](spec-v11.md) audit log,
  and a passing [spec-v29](spec-v29.md) §3 check.
- `triss` and `tash-score` guard their logistic exponents; `niss` clamps AIS and
  applies the AIS-6 convention; `gcs-pupils` bounds the index to 1–15; partial
  inputs render a complete-the-fields fallback.
- Every compute function uses `lib/num.js` and is covered by the
  [spec-v59](spec-v59.md) fuzz harness with zero non-finite leaks.
- No Class B tile in this spec → **no `docs/citation-staleness.md` row** (all six
  cite journal + authors).
- `UTILITIES.length` is **474** (or the then-current live count + 6 if specs land
  out of order) and all catalog-truth surfaces ([spec-v46](spec-v46.md)) agree.
- `npm run lint`, `npm run test`, `npm run sbom`, and `npm run build` all pass.
- The CHANGELOG records v108 with the +6 catalog delta.

## 7. Out of scope for v108

- **No AIS coding engine** — `niss` and `triss` take the clinician's AIS/ISS/RTS
  values; the tile does not assign AIS severities from an injury description.
- **No ISS/RTS duplication** — `iss-rts` (live) *produces* the ISS and RTS that
  `triss` *consumes*. Cross-linked, both kept.
- **No transfusion-protocol activation or CT order** — each tile reports the
  rule's score/probability/verdict and the source's stated interpretation; the
  MTP-activation, imaging, and operative decisions stay with the clinician and
  local protocol.

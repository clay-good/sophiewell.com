# spec-v153.md — Urology & men's-health patient-reported scores: IPSS/AUA-SI, IIEF-5 (SHIM), and OABSS (+3 tiles)

> Status: **PROPOSED (2026-06-23).** Feature spec of the
> [spec-v150](spec-v150.md) **Post-Parity Coverage** program. Adds **3**
> deterministic urology symptom-score PROs that fill a confirmed gap — the
> catalog has the urologic oncology math (`psa-density`, `psa-velocity`,
> `psa-doubling-time`, `prostate-volume`, `gleason-grade-group`,
> `damico-prostate-risk`, `capra-score`) and stone scores, but **none of the
> symptom-score instruments** that drive benign-disease management. None
> duplicates a live tile.
>
> Catalog effect at v153 close: **live count + 3** (catalog-truth gate enforces).
>
> Every prior spec (v4 through v152) remains in force. v153 adds no runtime
> network call and no AI; each tile obeys the [spec-v100](spec-v100.md) §2
> doctrine, passes the [spec-v29](spec-v29.md) §3 one-line test, ships its primary
> citation inline ([spec-v54](spec-v54.md)), and inherits the
> [spec-v59](spec-v59.md) output-safety contract. Item scoring and bands are
> re-fetched and cross-verified to ≥2 sources at implementation
> ([spec-v97](spec-v97.md)).

## 1. Thesis

Benign urologic disease — BPH/LUTS, erectile dysfunction, overactive bladder — is
managed by validated symptom scores, none of which the catalog carries. The three
below are the standard, free, self-administered instruments: the IPSS (identical to
the AUA Symptom Index plus a quality-of-life item), the abbreviated IIEF-5 (SHIM)
for ED, and the OABSS for overactive bladder. Each is a bounded item sum with
published severity bands.

## 2. What v153 adds (3 tiles)

### 2.1 `ipss` — International Prostate Symptom Score (IPSS / AUA-SI)

- **Citation:** Barry MJ, Fowler FJ Jr, O'Leary MP, et al. The American Urological
  Association symptom index for benign prostatic hyperplasia. *J Urol.*
  1992;148(5):1549-1557.
- **citationUrl:** https://doi.org/10.1016/S0022-5347(17)36966-5 (verify at
  implementation)
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `urology`, `primary-care`, `family-medicine`.
- **Inputs:** **7 symptom questions** each **0–5** (incomplete emptying, frequency,
  intermittency, urgency, weak stream, straining, nocturia) plus the separate
  **quality-of-life / bother** item **0–6**.
- **Output:** **IPSS 0–35** = sum of the 7 items, with bands **0–7 mild, 8–19
  moderate, 20–35 severe**; the QoL item is reported alongside (not summed into the
  symptom total). Class A.

### 2.2 `iief5` — IIEF-5 / Sexual Health Inventory for Men (SHIM)

- **Citation:** Rosen RC, Cappelleri JC, Smith MD, et al. Development and
  evaluation of an abridged 5-item version of the International Index of Erectile
  Function (IIEF-5) as a diagnostic tool for erectile dysfunction. *Int J Impot
  Res.* 1999;11(6):319-326.
- **citationUrl:** https://doi.org/10.1038/sj.ijir.3900472 (verify at
  implementation)
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `urology`, `primary-care`, `family-medicine`.
- **Inputs:** **5 items** each scored **1–5** (with the no-attempt option scoring 0
  on the relevant item per the validated form).
- **Output:** **IIEF-5 total 5–25** with bands **22–25 no ED, 17–21 mild, 12–16
  mild-to-moderate, 8–11 moderate, 5–7 severe** erectile dysfunction. Class A.

### 2.3 `oabss` — Overactive Bladder Symptom Score (OABSS)

- **Citation:** Homma Y, Yoshida M, Seki N, et al. Symptom assessment tool for
  overactive bladder syndrome — overactive bladder symptom score. *Urology.*
  2006;68(2):318-323.
- **citationUrl:** https://doi.org/10.1016/j.urology.2006.02.042 (verify at
  implementation)
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `urology`, `primary-care`, `geriatrics`.
- **Inputs:** **4 items** — daytime frequency (0–2), nighttime frequency/nocturia
  (0–3), urgency (0–5), urgency incontinence (0–5).
- **Output:** **OABSS 0–15** = sum, with the **urgency item ≥2 required** for an OAB
  diagnosis and bands **≤5 mild, 6–11 moderate, ≥12 severe**. Class A. The
  urgency-gate is surfaced (a high total without urgency ≥2 is flagged as
  not meeting the symptom definition).

## 3. Per-tile robustness

- All three are **bounded item sums** over fixed-range selects; every item is
  finite-checked, the maximum is fixed, and the [spec-v59](spec-v59.md) fuzz
  harness confirms no `NaN`/`undefined` band.
- **IPSS** keeps the QoL item **out of** the symptom total (a common scoring error);
  a unit test asserts the 7-item total is independent of the QoL value.
- **OABSS urgency-gate** is explicit: the renderer states when the diagnostic
  criterion (urgency ≥2) is not met, rather than implying OAB from the total alone.
- **IIEF-5** band boundaries (the 21/22 "no ED" cutoff and the 7/8 severe cutoff)
  are exercised; the no-attempt 0-scoring item is handled so an incomplete form
  renders a surfaced `valid:false` fallback.
- All three render the [spec-v50](spec-v50.md) §3 posture note (self-reported
  symptoms over the recall window) and defer the management decision to the
  clinician ([spec-v11](spec-v11.md) §5.3).

## 4. CI/CD & maintenance

Per the [spec-v100](spec-v100.md) §6 contract:

- **Maintenance class (§6.3):** all three are **Class A** — fixed published
  instruments cited by journal/authors; none trips `ISSUER_PATTERN`; **no
  `citation-staleness.md` row.**
- **Build & gates (§6.1/§6.2):** the three computes live in the new
  `lib/urology-v153.js` module (`ipss`, `iief5`, `oabss`), added to
  `fuzz-tools.test.js` `MODULES`. Renderers live in the new `views/group-v153.js`;
  its `RV153` export is spread into `app.js` `RENDERERS`. The catalog count moves
  on all **13 catalog-truth surfaces**; a11y, `mobile-no-hscroll`,
  `mobile-touch-targets`, and the chromium `example-correctness` sweep pass.

## 5. Files touched

```
docs/spec-v153.md                        (this file)
app.js                                   (+3 UTILITIES rows, group G; import group-v153 RV153 into RENDERERS)
lib/urology-v153.js                      (new module: ipss, iief5, oabss)
lib/meta.js                              (+3 META entries: inline citation + citationUrl + accessed; cross-links to prostate-volume, capra-score)
views/group-v153.js                      (new renderer module: 3 renderers)
docs/clinical-citations.md               (+ rows for the three sources)
test/unit/ipss.test.js, iief5.test.js, oabss.test.js                 (≥3 boundary worked examples each)
test/unit/fuzz-tools.test.js             (add lib/urology-v153.js to MODULES)
docs/audits/v12/ipss.md, iief5.md, oabss.md                          (spec-v11 audit logs)
docs/scope-post-parity.md                (catalog ledger; advance the v150 running count)
CHANGELOG.md                             (Unreleased: v153 entry, +3)
README.md, package.json                  (catalog count + spec-progression line -> v153)
```

## 6. Acceptance criteria

v153 is fully shipped when:

- The implementing session has re-run the [spec-v85 §6.2](spec-v85.md) collision
  check and confirmed all three ids are absent.
- All 3 tiles are live with a `META[id]` entry, inline primary citation +
  `citationUrl` + `accessed`, ≥3 boundary worked examples each (including an **IPSS
  7/8 mild→moderate boundary with the QoL item excluded**, an **IIEF-5 21/22 no-ED
  boundary**, and an **OABSS urgency-gate-not-met** case), a [spec-v11](spec-v11.md)
  audit log, and a passing [spec-v29](spec-v29.md) §3 check.
- Every compute uses `lib/num.js` and is covered by the [spec-v59](spec-v59.md)
  fuzz harness with zero non-finite leaks.
- `UTILITIES.length` is live count + 3 and all catalog-truth surfaces agree.
- `npm run lint`, `npm run test`, `npm run sbom`, and `npm run build` all pass; the
  CHANGELOG records v153 with the +3 delta.

## 7. Out of scope for v153

- **No full 15-item IIEF** — the abbreviated IIEF-5 (SHIM) is the bedside standard;
  the full instrument's licensed multi-domain text is excluded.
- **No ICIQ/SNOT-style licensed PROs** — instruments with copyrighted item text are
  intentionally omitted ([spec-v150](spec-v150.md) §2).
- **No prostate-volume / PSA re-implementation** — those live tiles stand; v153
  cross-links to them.

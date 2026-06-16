# spec-v96.md — Psychiatry rating scales: HAM-D, HAM-A, MADRS, MDQ, Y-BOCS, and PCL-5 (+6 tiles)

> Status: **PROPOSED (2026-06-16).** Wave 2 feature spec of the
> [spec-v85](spec-v85.md) Advanced Clinical Calculators program. Adds **6**
> deterministic psychiatry rating scales — the clinician-rated severity scales and
> the bipolar/PTSD screens used to **measure** depression, anxiety, OCD, and PTSD
> severity and to **track treatment response** over time. The catalog ships the
> brief self-report screeners (`phq9`, `gad7`, `cssrs`, `gds15`, `epds`,
> `auditc`) but none of the clinician-administered rating scales a psychiatrist
> uses to quantify severity at intake and at follow-up. None duplicates an
> existing tile.
>
> Catalog effect at v96 close: **412 + 6 = 418 tiles.**
>
> Every prior spec (v4 through v95) remains in force. v96 adds no runtime network
> call and no AI; each tile obeys the [spec-v85](spec-v85.md) §2 doctrine and §6
> CI/CD contract, passes the [spec-v29](spec-v29.md) §3 one-line test, ships its
> primary citation inline ([spec-v54](spec-v54.md)), and inherits the
> [spec-v59](spec-v59.md) output-safety contract.
>
> **Licensing (per [spec-v85](spec-v85.md) §9 / [scope-mdcalc-parity §4](scope-mdcalc-parity.md)):**
> all six instruments shipped here are public-domain or free-to-use
> clinician-rated / patient-rated scales (confirmed in §7). The program's
> copyrighted/licensed instruments — MoCA, SLUMS, BDI-II — are **excluded** for
> licensing and are not shipped.

## 1. Thesis

The catalog already carries the brief, validated **self-report screeners** a nurse
or primary-care clinician hands a patient: `phq9` and `gad7` for depression and
anxiety, `cssrs` for suicide risk, `gds15` for late-life depression, `epds` for
perinatal depression, and `auditc` for hazardous drinking. What it has **no** tile
for is the layer above the screen — the **clinician-rated rating scales** that
*measure* severity and track change on treatment:

- **HAM-D and HAM-A are the rated standards.** The Hamilton Depression and Anxiety
  Rating Scales are the clinician-administered instruments depression and anxiety
  trials are powered on and that a psychiatrist uses to put a number on severity at
  intake and again at week 6. A `phq9` is what the patient says; the HAM-D is what
  the clinician rates.

- **MADRS is the change-sensitive depression scale.** Montgomery and Åsberg designed
  the MADRS specifically to be sensitive to *change* with treatment — the scale a
  clinic uses to decide whether an antidepressant is working.

- **MDQ and PCL-5 are the screens the catalog is missing.** The Mood Disorder
  Questionnaire is the bipolar-spectrum screen (a positive screen is a three-gate
  rule, not a simple count); the PTSD Checklist for DSM-5 is the standard
  patient-rated PTSD severity measure with a provisional-diagnosis cutoff and the
  DSM-5 B/C/D/E symptom-cluster structure.

- **Y-BOCS is the OCD severity standard.** The Yale-Brown Obsessive Compulsive Scale
  is the instrument every OCD trial and clinic uses to grade obsession and
  compulsion severity and to track response.

Each is a published, deterministic instrument — a fixed set of anchored items
summed to a total with the source's own severity bands (or, for the MDQ, a fixed
gate rule). A clinician should not be summing seventeen HAM-D items by hand or
recalling the MDQ three-gate logic at the bedside. v96 brings them onto the page,
one rung above the screeners already there.

## 2. What v96 adds (6 tiles)

### 2.1 `hamd` — Hamilton Depression Rating Scale (HAM-D / HDRS, 17-item)

- **Citation:** Hamilton M. A rating scale for depression. *J Neurol Neurosurg
  Psychiatry.* 1960;23(1):56-62.
- **citationUrl:** https://doi.org/10.1136/jnnp.23.1.56
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `psychiatry`, `primary-care`, `nursing-psych`.
- **Inputs:** the **17 clinician-rated items** (mixed anchors — items 1–3, 7–11,
  15 score 0–4; items 4–6, 12–14, 16–17 score 0–2 per Hamilton's original
  weighting).
- **Output:** the **total score (0–52)** with severity bands — **no/none 0–7**,
  **mild 8–16**, **moderate 17–23**, **severe ≥24** — naming the band the total
  lands in. **Class A** (fixed item weighting). **Cross-links** `phq9` (the
  self-report counterpart).

### 2.2 `hama` — Hamilton Anxiety Rating Scale (HAM-A, 14-item)

- **Citation:** Hamilton M. The assessment of anxiety states by rating. *Br J Med
  Psychol.* 1959;32(1):50-55.
- **citationUrl:** https://doi.org/10.1111/j.2044-8341.1959.tb00467.x
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `psychiatry`, `primary-care`.
- **Inputs:** the **14 clinician-rated items**, each **0–4**.
- **Output:** the **total score (0–56)** with severity bands — **mild <17**,
  **mild-to-moderate 18–24**, **moderate-to-severe 25–30** — quoting the source's
  band structure and naming the band. **Class A.** **Cross-links** `gad7`.

### 2.3 `madrs` — Montgomery-Åsberg Depression Rating Scale (10-item)

- **Citation:** Montgomery SA, Åsberg M. A new depression scale designed to be
  sensitive to change. *Br J Psychiatry.* 1979;134:382-389.
- **citationUrl:** https://doi.org/10.1192/bjp.134.4.382
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `psychiatry`.
- **Inputs:** the **10 items**, each **0–6**.
- **Output:** the **total score (0–60)** with severity bands — **normal 0–6**,
  **mild 7–19**, **moderate 20–34**, **severe ≥35** — naming the band. **Class A.**
  Cross-links `phq9` / `hamd` as the change-sensitive depression counterpart.

### 2.4 `mdq` — Mood Disorder Questionnaire (bipolar-spectrum screen)

- **Citation:** Hirschfeld RM, Williams JB, Spitzer RL, et al. Development and
  validation of a screening instrument for bipolar spectrum disorder: the Mood
  Disorder Questionnaire. *Am J Psychiatry.* 2000;157(11):1873-1875.
- **citationUrl:** https://doi.org/10.1176/appi.ajp.157.11.1873
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `psychiatry`, `primary-care`.
- **Inputs:** the **13 yes/no symptom items** (Question 1), the **co-occurrence
  item** (Question 2 — did several of these happen during the same period?), and the
  **functional-impairment level** (Question 3 — none / minor / moderate / serious).
- **Output:** the **positive screen** determination, which requires **all three
  gate conditions**: **≥7 of the 13 symptom items answered YES**, **AND**
  co-occurrence answered **YES**, **AND** impairment rated **moderate or serious**.
  The output names which gate(s) failed when the screen is negative (e.g.
  "6 of 13 symptoms — below the 7-item threshold"), so a near-miss is auditable
  rather than a bare "negative." **Class A.** Cross-links `phq9` / `cssrs`.

### 2.5 `ybocs` — Yale-Brown Obsessive Compulsive Scale (Y-BOCS, 10-item)

- **Citation:** Goodman WK, Price LH, Rasmussen SA, et al. The Yale-Brown
  Obsessive Compulsive Scale. I. Development, use, and reliability. *Arch Gen
  Psychiatry.* 1989;46(11):1006-1011.
- **citationUrl:** https://doi.org/10.1001/archpsyc.1989.01810110048007
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `psychiatry`.
- **Inputs:** the **10 items**, each **0–4** — the **5 obsession** items (1–5) and
  the **5 compulsion** items (6–10).
- **Output:** the **total score (0–40)** with severity bands — **subclinical 0–7**,
  **mild 8–15**, **moderate 16–23**, **severe 24–31**, **extreme 32–40** — naming
  the band, and surfacing the **obsession subtotal (0–20)** and **compulsion
  subtotal (0–20)** in the derivation. **Class A.** Cross-links `cssrs`.

### 2.6 `pcl5` — PTSD Checklist for DSM-5 (PCL-5, 20-item)

- **Citation:** Blevins CA, Weathers FW, Davis MT, et al. The Posttraumatic Stress
  Disorder Checklist for DSM-5 (PCL-5): development and initial psychometric
  evaluation. *J Trauma Stress.* 2015;28(6):489-498.
- **citationUrl:** https://doi.org/10.1002/jts.22059
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `psychiatry`, `primary-care`, `social-work`.
- **Inputs:** the **20 items**, each **0–4** (mapped to DSM-5 clusters: items 1–5 =
  Cluster B re-experiencing, 6–7 = Cluster C avoidance, 8–14 = Cluster D negative
  cognitions/mood, 15–20 = Cluster E arousal).
- **Output:** the **total score (0–80)**; the **provisional-PTSD screen** against
  the **published cutoff range (commonly ≥31–33)** — presented as the source's
  **range**, not a single hard threshold (§3 / §4); and the **DSM-5 symptom-cluster
  tallies** (B / C / D / E item-positive counts, where an item is "endorsed" at a
  rating ≥2 per the source's symptom-cluster scoring convention). **Class A
  (public domain — PCL-5 is a US-government instrument).** Cross-links `phq9` /
  `cssrs`.

## 3. Per-tile robustness

- **Item clamping.** Every item is clamped to its own anchor range before summing —
  HAM-D items to their mixed 0–4 / 0–2 anchors, HAM-A / MADRS / Y-BOCS / PCL-5 items
  to 0–4 / 0–6 / 0–4 / 0–4 respectively. A value outside the anchor range never
  reaches the total; the compute surfaces a `valid:false` fallback rather than a
  silently-wrong sum.

- **Partial instruments refuse a band.** Following the [spec-v57](spec-v57.md)
  screener treatment, a band is **refused** from a partially-completed instrument:
  if any required item is blank, the tile renders **"(complete all N items)"** and
  does not emit a severity band from a truncated sum (an unanswered HAM-D item is not
  a zero). The total-so-far may be shown, but the *band* is withheld until the
  instrument is complete. (No instrument here permits a partial band; PCL-5 cluster
  tallies are likewise withheld until all 20 items are present.)

- **The MDQ requires all three gates.** `mdq` is a fixed boolean gate rule, not an
  arithmetic sum. A positive screen requires the **symptom count ≥7 AND
  co-occurrence YES AND impairment moderate/serious** — all three. The tile never
  reports positive on the symptom count alone, and it names the failing gate(s) so a
  near-miss is auditable rather than a bare negative.

- **PCL-5 cutoff is a range, not a hard threshold.** The provisional-PTSD
  determination is presented as the **source's cutoff range (commonly ≥31–33)**,
  quoted with the source, **not** as a single hard number the tile invents. The
  output frames a total within or above the range as "at or above the commonly
  cited provisional cutoff (≥31–33)" and quotes that the optimal cutpoint varies by
  population — never "PTSD: yes."

- **Output-safety + fuzz.** Every compute function uses `lib/num.js` and joins the
  [spec-v59](spec-v59.md) fuzz harness on import; zero non-finite leaks across
  fuzzed inputs is a merge gate (no division, √, or ln here — these are bounded
  integer sums — but the harness still proves no `undefined`/`NaN` reaches the DOM).

- **Posture note ([spec-v50](spec-v50.md) §3 / [spec-v11](spec-v11.md) §5.3).**
  Every tile renders the clinical posture note: these are **clinician-rated or
  patient-rated instruments, not a diagnosis**. The tile quotes the **source's own
  severity bands / cutoff** and attributes the interpretation to the cited authority
  and the user's ratings; it does not diagnose, does not author treatment advice in
  Sophie's voice, and does not replace the clinician's judgment or a structured
  diagnostic interview.

## 4. CI/CD & maintenance

This spec instantiates the [spec-v85](spec-v85.md) §6 CI/CD contract.

- **All six are Class A ([spec-v85](spec-v85.md) §6.3) — no staleness rows.** Every
  instrument here is a **fixed, published scale with fixed item anchors and fixed
  author-defined severity bands** (Hamilton 1959/1960, Montgomery-Åsberg 1979,
  Hirschfeld 2000, Goodman 1989, Blevins 2015). The item weights and bands do not
  change on a society calendar, so **no `docs/citation-staleness.md` row is required**
  and `check-citations.mjs` is satisfied without one. The bands change only if the
  source paper is superseded/retracted, which the routine citation re-verification
  pass catches.

- **The PCL-5 cutoff is quoted as the source's range.** The provisional-PTSD
  cutpoint is presented as the published **range (commonly ≥31–33)** with the
  citation, **not** as a single hard threshold the catalog asserts — consistent with
  §3 above. Because it is quoted as a documented range rather than a society-revised
  threshold, it carries no Class B staleness obligation; if a later validation
  narrows the recommended cutpoint, that is a reviewed `META`/audit edit, not a
  ledger row.

- **Merge gates ([spec-v85](spec-v85.md) §6.2).** Each tile passes `eslint`,
  `grep-check.mjs`, `check-output-safety.mjs`, `check-citations.mjs`,
  `check-catalog-truth.mjs` (the **13 enforced catalog-count surfaces** all equal
  `UTILITIES.length` = **418**), `a11y-check.mjs`, the Playwright `all-tools` /
  `smoke` boot, the Playwright `example-correctness` (chromium) **verbatim**-`META`
  example pin (flake-prone under CPU load — CI `retries:2`; rerun isolated to
  confirm), and `mobile-no-hscroll` + `mobile-touch-targets`.

- **Fuzz MODULES add.** `lib/psych-v96.js` is added to the
  [`test/unit/fuzz-tools.test.js`](../test/unit/fuzz-tools.test.js) `MODULES`
  list on import (zero non-finite leaks gate).

- **No build-script change.** A `UTILITIES` row + `lib/meta.js` `META` entry +
  `views/group-v22.js` renderer is all `npm run build` needs; `data:verify` is
  unchanged (no `data/` touched — these are compiled-in item/band constants, not a
  bundled dataset, per [spec-v85](spec-v85.md) §5).

## 5. Files touched

```
docs/spec-v96.md                         (this file)
app.js                                   (+6 UTILITIES rows, group G; import group-v22 renderers into RENDERERS)
lib/psych-v96.js                         (new module: hamd, hama, madrs, mdq, ybocs, pcl5)
lib/meta.js                              (+6 META entries: inline citation + citationUrl + accessed; cross-links to phq9, gad7, cssrs)
views/group-v22.js                       (new renderer module: 6 renderers — item rows clamped to anchors, partial-instrument fallback, MDQ three-gate, PCL-5 cluster tallies)
docs/clinical-citations.md               (+6 rows for the six psychiatry rating-scale sources)
test/unit/hamd.test.js                   (new; ≥3 boundary worked examples incl. severity-band edges + partial-instrument fallback)
test/unit/hama.test.js                   (new; ≥3 incl. band edges)
test/unit/madrs.test.js                  (new; ≥3 incl. band edges)
test/unit/mdq.test.js                    (new; ≥3 incl. the three-gate positive + each failing-gate case)
test/unit/ybocs.test.js                  (new; ≥3 incl. band edges + obsession/compulsion subtotals)
test/unit/pcl5.test.js                   (new; ≥3 incl. the cutoff-range edge + cluster tallies)
test/unit/fuzz-tools.test.js             (add lib/psych-v96.js to MODULES)
docs/audits/v12/hamd.md, hama.md, madrs.md, mdq.md, ybocs.md, pcl5.md  (spec-v11 audit logs)
docs/scope-mdcalc-parity.md              (catalog count 412 -> 418; append to the running ledger)
CHANGELOG.md                             (Unreleased: v96 entry, +6)
README.md, package.json                  (catalog count 412 -> 418; spec-progression line -> v96)
```

## 6. Acceptance criteria

v96 is fully shipped when:

- All 6 tiles in §2 are live in group `G` with a `META[id]` entry, an inline primary
  citation + `citationUrl` + `accessed`, ≥3 boundary worked examples in the unit test
  (including the band-flip / gate cases below), a [spec-v11](spec-v11.md) audit log,
  and a passing [spec-v29](spec-v29.md) §3 scope check.
- **`hamd`** returns the correct band at each **HAM-D severity edge** — total 7
  (no/none) vs 8 (mild), 16 (mild) vs 17 (moderate), 23 (moderate) vs 24 (severe) —
  and refuses a band when any of the 17 items is blank ("(complete all 17 items)").
- **`hama`** returns the correct band across the HAM-A bands (e.g. <17 mild;
  18–24 mild-to-moderate; 25–30 moderate-to-severe).
- **`madrs`** returns the correct **MADRS band** at each edge — 6 (normal) vs 7
  (mild), 19 (mild) vs 20 (moderate), 34 (moderate) vs 35 (severe).
- **`mdq`** returns a **positive screen** only when all three gates are met
  (≥7 symptoms YES + co-occurrence YES + moderate/serious impairment), and a negative
  screen that **names the failing gate** for each single-gate-miss case (6 symptoms;
  co-occurrence NO; impairment minor).
- **`ybocs`** returns the correct band at the **Y-BOCS band** edges (7 vs 8, 15 vs
  16, 23 vs 24, 31 vs 32) and reports the obsession/compulsion subtotals.
- **`pcl5`** computes the total (0–80), reports the **provisional cutoff** result
  framed as the **source's range (≥31–33)** (a total of 30 below, 33 at/above), and
  reports the B/C/D/E cluster tallies.
- The **partial-instrument fallback** is pinned in at least one unit test per
  summed-item tile (blank item → "(complete all N items)", no band emitted).
- Every compute function uses `lib/num.js` and is covered by the
  [spec-v59](spec-v59.md) fuzz harness with **zero non-finite leaks**.
- `UTILITIES.length` is **418** and all catalog-truth surfaces
  ([spec-v46](spec-v46.md)) agree (the 13 enforced surfaces + the `grep-check`
  README/index/package strings).
- `npm run lint`, `npm run test`, `npm run test:e2e`, `npm run sbom`, and
  `npm run build` all pass.
- The CHANGELOG records v96 with the **+6** catalog delta (412 → 418).

## 7. Out of scope for v96

- **Copyrighted / licensed instruments are excluded for licensing**
  ([spec-v85](spec-v85.md) §9 / [scope-mdcalc-parity §4](scope-mdcalc-parity.md)):
  the **MoCA** and **SLUMS** cognitive screens and the **BDI-II** (Beck Depression
  Inventory, commercially licensed by Pearson) are **not** shipped. All six
  instruments in §2 are confirmed **public-domain or free-to-use**: HAM-D, HAM-A,
  MADRS, MDQ, and Y-BOCS are freely usable clinician-/patient-rated scales, and the
  **PCL-5 is US-government public domain** (US Department of Veterans Affairs National
  Center for PTSD).
- **No diagnosis.** These instruments **measure severity** (HAM-D, HAM-A, MADRS,
  Y-BOCS, PCL-5) or **screen** (MDQ, PCL-5 provisional cutoff); none diagnoses a
  disorder. A positive MDQ screen or an at-cutoff PCL-5 is a prompt for a structured
  diagnostic interview, not a diagnosis ([spec-v11](spec-v11.md) §5.3).
- **No auto-treatment.** No tile recommends or titrates a medication, suggests
  hospitalization, or authors management advice in Sophie's voice; each reports the
  score, the source's band/cutoff, and the clinical posture note. The treat /
  refer / admit decision stays with the clinician.
- **No bundled symptom/item corpus as a browsable index.** The item anchors and band
  tables are compiled constants the compute reads, not a searchable reference the
  [spec-v29](spec-v29.md) §3 test prohibits.
- **No additional psychiatry scales in this spec.** Other rated instruments (PANSS,
  YMRS, the CAPS-5 structured interview) are deferred — PANSS/YMRS to a future spec
  if confirmed free-to-use, and CAPS-5 is a clinician-administered interview, not a
  one-line-test calculator.
```
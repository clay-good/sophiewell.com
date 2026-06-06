# spec-v57.md — Brief screeners, decision rules, and triage scores (14 tiles)

> Status: proposed (2026-06-05). v57 is a multi-tile scoring/risk
> spec. It adds **14** deterministic screeners, validated
> decision rules, and triage scores that fill confirmed gaps in
> Sophie's Clinical Scoring & Risk surface (Group G) — the
> ultra-brief screeners a nurse uses as a pre-gate to the full
> instrument, the imaging/discharge decision rules that keep the
> bedside team out of unnecessary CT, and the chest-pain /
> syncope / PE pathways that complement the HEART, Wells, and
> ASCVD tiles already shipped. None duplicates an existing tile
> (checked against the v52-close catalog of 255 plus the v55–v56
> additions). Every tile passes the [spec-v29](spec-v29.md) §3
> one-line test.
>
> Catalog effect at v57 close: **281 + 14 = 295 tiles.**
>
> Every prior spec (v4 through v56) remains in force. v57 adds no
> runtime network call and no AI; each tile ships its primary
> citation inline ([spec-v54](spec-v54.md)) and inherits the
> [spec-v53](spec-v53.md) input/output-safety contract. Sophie's
> eight commitments ([spec-v50](spec-v50.md) §3) are preserved.

## 1. Thesis

Group G is Sophie's largest surface (59+ tiles) but has three
specific holes a bedside team hits routinely:

- **Ultra-brief screeners as pre-gates.** PHQ-9, GAD-7, AUDIT-C,
  and the full CAGE ship, but the two-item PHQ-2 and GAD-2 (the
  pre-screens that decide whether to administer the full
  instrument), the full 10-item AUDIT, the DAST-10 drug-use
  screen, and the Geriatric Depression Scale (the age-appropriate
  alternative to PHQ-9) do not.
- **Decision rules that prevent imaging/admission.** Ottawa Ankle
  ships; the Ottawa **Knee** rule, NEXUS **Chest**, the San
  Francisco and Canadian **Syncope** rules, and the STONE score
  (which predicts a ureteral stone and reduces CT) do not. These
  are the rules that turn "automatic CT" into "rule-out at the
  bedside."
- **Chest-pain, PE, pharyngitis, and trauma pathways.** HEART,
  TIMI, GRACE, Wells, and Centor ship; the EDACS accelerated
  chest-pain pathway, the YEARS PE algorithm, the FeverPAIN
  pharyngitis score, and the trauma-scoring pair (Injury Severity
  Score + Revised Trauma Score) and the pediatric shock-index
  (SIPA) do not.

Each is a published, deterministic instrument the nurse or
clinician already uses; v57 brings them onto the page.

## 2. What v57 adds (14 tiles)

### 2.1 `phq2-gad2` — PHQ-2 / GAD-2 ultra-brief screeners

- **Citation:** Kroenke K, Spitzer RL, Williams JBW. Med Care.
  2003;41(11):1284-1292 (PHQ-2); Kroenke K, et al. Ann Intern
  Med. 2007;146(5):317-325 (GAD-2). Positive cutoff ≥3 each.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `nursing-floor`, `nursing-ed`,
  `family-medicine`, `psychiatry`.
- **Inputs:** two depression items + two anxiety items (0–3
  each).
- **Output:** PHQ-2 (0–6) and GAD-2 (0–6) totals with the ≥3
  "positive — proceed to PHQ-9 / GAD-7" flag (Sophie's existing
  full instruments are linked from the result text).

### 2.2 `audit-full` — AUDIT (10-item Alcohol Use Disorders Identification Test)

- **Citation:** Saunders JB, et al. (WHO AUDIT). Addiction.
  1993;88(6):791-804; Babor TF, et al. *AUDIT Manual*, WHO, 2001.
  Risk zones at 8 / 16 / 20.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `nursing-floor`, `addiction-medicine`,
  `family-medicine`, `social-work`.
- **Inputs:** ten items (0–4 each) per the WHO AUDIT.
- **Output:** total (0–40) with the WHO risk-zone bands
  (low-risk, hazardous, harmful, likely dependence) and the
  corresponding brief-intervention level. Complements the briefer
  AUDIT-C already shipped.

### 2.3 `dast10` — DAST-10 Drug Abuse Screening Test

- **Citation:** Skinner HA. Addict Behav. 1982;7(4):363-371
  (DAST); 10-item short form, Yudko E, et al. J Subst Abuse
  Treat. 2007.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `addiction-medicine`, `nursing-floor`,
  `social-work`, `psychiatry`.
- **Inputs:** ten yes/no items (item 3 reverse-scored).
- **Output:** total (0–10) with the severity bands (none, low,
  moderate, substantial, severe) and the "assess / intensive
  assessment indicated" guidance.

### 2.4 `gds15` — Geriatric Depression Scale (short form)

- **Citation:** Sheikh JI, Yesavage JA. Clin Gerontol. 1986;5:
  165-173 (GDS-15 short form, derived from Yesavage 1982).
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `geriatrics`, `nursing-floor`,
  `family-medicine`, `palliative-care`.
- **Inputs:** fifteen yes/no mood items (mixed scoring
  direction).
- **Output:** total (0–15) with the bands (normal 0–4, mild
  depression 5–8, moderate 9–11, severe 12–15); the age-
  appropriate alternative to PHQ-9 in older adults, less
  confounded by somatic items.

### 2.5 `ottawa-knee` — Ottawa Knee Rule

- **Citation:** Stiell IG, et al. Ann Emerg Med. 1995;26(4):
  405-413; Ann Emerg Med 1997 validation.
- **citationUrl:** https://doi.org/10.1016/S0196-0644(95)70106-0
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `emergency-medicine`, `nursing-ed`,
  `orthopedics`, `urgent-care`.
- **Inputs:** five criteria (age ≥55, isolated patellar
  tenderness, fibular-head tenderness, inability to flex 90°,
  inability to bear weight 4 steps both immediately and in the ED).
- **Output:** "knee x-ray indicated" if **any** criterion is
  positive, else "x-ray can be safely deferred" — companion to
  the Ottawa Ankle Rule already shipped.

### 2.6 `nexus-chest` — NEXUS Chest (blunt chest trauma imaging)

- **Citation:** Rodriguez RM, et al. PLoS Med. 2015;12(10):
  e1001883 (NEXUS Chest CT decision instrument).
- **citationUrl:** https://doi.org/10.1371/journal.pmed.1001883
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `emergency-medicine`, `nursing-ed`,
  `trauma-surgery`.
- **Inputs:** seven criteria (abnormal CXR, distracting injury,
  chest-wall/sternal/thoracic-spine tenderness, age >60, rapid
  deceleration, intoxication, altered alertness).
- **Output:** "imaging may be deferred" only if all criteria
  absent, else "chest imaging indicated," with the sensitivity
  note for major thoracic injury.

### 2.7 `sfsr` — San Francisco Syncope Rule

- **Citation:** Quinn JV, et al. Ann Emerg Med. 2004;43(2):
  224-232 ("CHESS": CHF, Hematocrit <30%, ECG abnormal, Shortness
  of breath, SBP <90).
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `emergency-medicine`, `nursing-ed`,
  `cardiology`.
- **Inputs:** five CHESS criteria (boolean).
- **Output:** "high-risk — any criterion present → admit /
  workup," else "low risk for 7-day serious outcome," with the
  validation-caveat note.

### 2.8 `canadian-syncope` — Canadian Syncope Risk Score

- **Citation:** Thiruganasambandamoorthy V, et al. CMAJ. 2016;
  188(12):E289-E298.
- **citationUrl:** https://doi.org/10.1503/cmaj.151469
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `emergency-medicine`, `nursing-ed`,
  `cardiology`.
- **Inputs:** nine weighted items (predisposition to vasovagal,
  heart disease, SBP extremes, troponin, abnormal QRS axis, QRS
  >130 ms, QTc >480 ms, ED diagnosis of vasovagal vs cardiac
  syncope).
- **Output:** total (−3 to +11) with the 30-day serious-outcome
  risk band (very low → very high) and the disposition guidance.

### 2.9 `edacs` — Emergency Department Assessment of Chest pain Score

- **Citation:** Than M, et al. Emerg Med Australas. 2014;26(1):
  34-44 (EDACS / EDACS-ADP).
- **citationUrl:** https://doi.org/10.1111/1742-6723.12164
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `emergency-medicine`, `nursing-ed`,
  `cardiology`.
- **Inputs:** age, sex, risk factors / known CAD, and six
  symptom features; plus the two-troponin + non-ischemic-ECG ADP
  gate.
- **Output:** EDACS score, and the EDACS-ADP low-risk
  determination (score <16 **and** non-ischemic ECG **and**
  0/2-hour troponins negative → low risk, early-discharge
  candidate). Complements HEART.

### 2.10 `years-pe` — YEARS algorithm for pulmonary embolism

- **Citation:** van der Hulle T, et al. Lancet. 2017;390(10091):
  289-297 (YEARS study).
- **citationUrl:** https://doi.org/10.1016/S0140-6736(17)30885-1
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `emergency-medicine`, `nursing-ed`,
  `pulmonology`, `hematology`.
- **Inputs:** three YEARS items (clinical signs of DVT,
  hemoptysis, PE most likely diagnosis) and the D-dimer value.
- **Output:** the YEARS determination — 0 items + D-dimer
  <1000 ng/mL, or ≥1 item + D-dimer <500 ng/mL → PE excluded
  without CTPA; otherwise CTPA indicated. The variable D-dimer
  threshold is the whole point and is shown explicitly.

### 2.11 `feverpain` — FeverPAIN Score (streptococcal pharyngitis)

- **Citation:** Little P, et al. BMJ. 2013;347:f5806 (FeverPAIN);
  NICE NG84 endorses it.
- **citationUrl:** https://doi.org/10.1136/bmj.f5806
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `family-medicine`, `nursing-floor`,
  `urgent-care`, `pediatrics`.
- **Inputs:** five items (Fever in 24 h, Purulence, Attend
  rapidly ≤3 days, severely Inflamed tonsils, No cough/coryza).
- **Output:** total (0–5) with the streptococcal-likelihood band
  and antibiotic-strategy guidance (no/delayed/immediate);
  complements Centor/McIsaac already shipped.

### 2.12 `stone-score` — STONE Score (uncomplicated ureteral stone)

- **Citation:** Moore CL, et al. BMJ. 2014;348:g2191 (STONE
  score for predicting uncomplicated ureteral stone).
- **citationUrl:** https://doi.org/10.1136/bmj.g2191
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `emergency-medicine`, `nursing-ed`,
  `urology`.
- **Inputs:** Sex, Timing of pain onset, Origin (race), Nausea/
  vomiting, Erythrocytes (hematuria) — the weighted STONE items.
- **Output:** total with the low / moderate / high probability
  bands for an uncomplicated ureteral stone, framed as
  CT-reduction decision support (high probability + no red flags
  → stone likely).

### 2.13 `iss-rts` — Injury Severity Score + Revised Trauma Score

- **Citation:** Baker SP, et al. J Trauma. 1974;14(3):187-196
  (ISS); Champion HR, et al. J Trauma. 1989;29(5):623-629 (RTS).
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `trauma-surgery`, `emergency-medicine`,
  `nursing-ed`, `critical-care`.
- **Inputs:** ISS — the three highest AIS region scores (0–6
  each); RTS — GCS, systolic BP, respiratory rate (coded bands).
- **Output:** ISS (sum of squares of the three highest AIS,
  0–75; any region = 6 → automatic 75) with the major-trauma
  ≥16 flag, and the coded RTS (0–7.84) physiologic score.
  Companion to the MGAP/GAP/BIG trauma tiles already shipped.

### 2.14 `sipa` — Shock Index, Pediatric Age-Adjusted

- **Citation:** Acker SN, et al. J Pediatr Surg. 2015;50(2):
  331-334 (SIPA); age-specific elevated cutoffs (1.22 / 1.0 /
  0.9 for 4–6, 7–12, 13–16 yr).
- **citationUrl:** https://doi.org/10.1016/j.jpedsurg.2014.08.009
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `pediatric-surgery`, `emergency-medicine`,
  `nursing-peds`, `nursing-ed`.
- **Inputs:** age (yr), heart rate (bpm), systolic BP (mmHg).
- **Output:** shock index (HR/SBP) compared to the age-specific
  elevated threshold → "elevated SIPA — higher injury severity /
  transfusion risk" vs "within age-adjusted range." Distinct from
  the adult shock-index tile because the cutoff is age-banded.

## 3. Per-tile robustness

- Every screener clamps item inputs to their declared range and
  refuses to produce a band from a partially-completed instrument
  unless the instrument itself permits it; the renderer shows
  "(complete all N items)" via `fmt()` rather than a misleading
  partial total.
- The decision rules (Ottawa Knee, NEXUS Chest, syncope rules,
  YEARS) are boolean/threshold logic with no division; they still
  flow through the [spec-v53](spec-v53.md) fuzz harness to confirm
  no `undefined`/`NaN` reaches the DOM.
- `years-pe` and `edacs` surface their **conditional thresholds**
  (D-dimer cutoff that varies with item count; troponin/ECG ADP
  gate) explicitly so the user sees *why* the determination
  flipped.
- `sipa` and `iss-rts` import the shared `lib/num.js` helpers;
  HR/SBP=0 returns `null` → fallback string.

## 4. Files touched

```
docs/spec-v57.md                         (this file)
app.js                                   (+14 UTILITIES rows, group G)
lib/scoring-v5.js                        (new module: 14 compute exports)
lib/meta.js                              (+14 META entries, inline citations + accessed)
views/group-v9.js                        (new renderer module: 14 renderers)
app.js                                   (import group-v9 renderers into RENDERERS)
docs/citation-staleness.md               (+ rows for guideline-endorsed tiles: feverpain (NICE NG84))
test/unit/phq2-gad2.test.js              (new)
test/unit/audit-full.test.js             (new)
test/unit/dast10.test.js                 (new)
test/unit/gds15.test.js                  (new)
test/unit/ottawa-knee.test.js            (new)
test/unit/nexus-chest.test.js            (new)
test/unit/sfsr.test.js                   (new)
test/unit/canadian-syncope.test.js       (new)
test/unit/edacs.test.js                  (new)
test/unit/years-pe.test.js               (new)
test/unit/feverpain.test.js              (new)
test/unit/stone-score.test.js            (new)
test/unit/iss-rts.test.js                (new)
test/unit/sipa.test.js                   (new)
test/integration/fuzz-tools.spec.js      (import lib/scoring-v5.js for coverage)
docs/audits/v11/phq2-gad2.md ... sipa.md (14 new audit logs)
docs/scope-mdcalc-parity.md              (catalog count 281 -> 295)
CHANGELOG.md                             (Unreleased: v57 entry, +14)
README.md                                (catalog count 281 -> 295)
package.json                             (description count 281 -> 295)
```

## 5. Acceptance criteria

v57 is fully shipped when:

- This file exists.
- All 14 tiles in §2 are present: each has a `META[id]` entry, a
  primary citation visible inline, ≥3 boundary worked examples in
  its unit test (including the threshold-flip cases for
  `years-pe`/`edacs` and the age-band boundaries for `sipa`), and
  a [spec-v11](spec-v11.md) audit log.
- Partial-instrument inputs render a "(complete all items)"
  fallback, never a misleading partial band (pinned by tests).
- Every compute function uses `lib/num.js` and is covered by the
  spec-v53 fuzz harness with zero non-finite leaks.
- Guideline-endorsed tiles carry `accessed` + a
  `docs/citation-staleness.md` row ([spec-v54](spec-v54.md)).
- `UTILITIES.length` is 295 and all catalog-truth surfaces
  ([spec-v46](spec-v46.md)) agree.
- `npm run lint`, `npm run test`, `npm run sbom`, and
  `npm run build` all pass.
- The CHANGELOG records v57 with the +14 catalog delta.

## 6. Out of scope for v57

- Auto-disposition or order-set generation from any score — every
  tile reports the band and the guideline's stated guidance; the
  admit/discharge/image decision stays with the clinician and
  local protocol.
- The full AIS code tables behind ISS — `iss-rts` takes the user's
  AIS region scores; a searchable AIS dictionary would be a
  reference lookup and fails the v29 §3 scope test.
- COVID-era and other rapidly-moving severity scores (4C, etc.) —
  deferred pending a stable governing edition.
- Copyrighted/licensed instruments (MoCA, SLUMS) — excluded for
  licensing, consistent with prior scope decisions.
- SAD PERSONS — explicitly excluded by [spec-v45](spec-v45.md) §5
  (weaker validation than C-SSRS, which already ships).

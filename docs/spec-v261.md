# spec-v261.md — Acute abdomen & emergency general-surgery risk: the RIPASA appendicitis score, the PULP peptic-ulcer-perforation score, and the Emergency Surgery Score (+3 tiles)

> Status: **SHIPPED (2026-07-09, 1115 → 1118).** First feature spec of the **Bedside Acute-Care
> Instruments** program (§1.1). Adds **3** deterministic instruments a surgical or
> emergency team reaches for at the acute-abdomen decision point — is this appendicitis,
> how lethal is this perforation, how high is this emergency operation's risk. **Each id
> was verified absent by a fixed-string scan of the extracted `app.js` id/name list**
> ([spec-v85 §6.2](spec-v85.md)): the catalog carries `alvarado`, `air-score`,
> `pediatric-appendicitis`, `mannheim-peritonitis`, `boey`, `possum`, and `p-possum`, but
> **not** the RIPASA score, the PULP score, or the Emergency Surgery Score.
>
> Catalog effect: **live `UTILITIES.length` + 3** — enforced by the catalog-truth
> gate ([spec-v46](spec-v46.md)) at build time; no number is copied here.
>
> Every prior spec remains in force. v261 adds no runtime network call and no AI; each
> tile obeys the [spec-v100](spec-v100.md) §2 doctrine, passes the
> [spec-v29](spec-v29.md) §3 one-line test, ships its citation inline
> ([spec-v54](spec-v54.md)), inherits the [spec-v59](spec-v59.md) output-safety
> contract, renders the [spec-v50](spec-v50.md) §3 posture note, and honors
> [spec-v11](spec-v11.md) §5.3 (**no operative, imaging, admission, or discharge order in
> Sophie's voice** — these compute a probability or a risk category; the decision to
> operate stays with the surgeon). **Every item, point weight, and threshold is re-fetched
> and cross-verified against ≥2 independent open sources at implementation**
> ([spec-v97](spec-v97.md)); uncertain values carry an explicit *(verify at
> implementation, [spec-v97](spec-v97.md))* tag. The implementing session **re-runs the
> [spec-v85 §6.2](spec-v85.md) collision check** first.

## 1. Thesis

The catalog carries two appendicitis scores (Alvarado, AIR), the pediatric appendicitis
score, and the general peritonitis/surgical-risk engines (Mannheim, Boey, POSSUM,
P-POSSUM). It does **not** carry the appendicitis score derived and validated to lift
sensitivity in populations where Alvarado underperforms, nor the perforated-peptic-ulcer
mortality model that outperforms Boey, nor the single best-validated **emergency
general-surgery** mortality/morbidity engine. Each is a transparent, externally-validated
instrument, freely reproducible from open sources, and each is decision support — **never
an operative, imaging, admission, or discharge order**.

### 1.1 Program: Bedside Acute-Care Instruments

v261–v263 add nine deterministic instruments that a clinician reaches for at an
acute-care decision point — operate or observe, admit or discharge, escalate or watch.
Each is Class A, freely reproducible from open sources, and absent from the catalog at
draft. The program adds no new module theme beyond the existing Group G (clinical scoring
& risk) surface and no runtime dependency. It succeeds the completed **Advanced
Risk-Stratification Instruments** program ([spec-v258](spec-v258.md) §1.1).

## 2. What v261 adds (3 tiles)

### 2.1 `ripasa` — RIPASA score (Raja Isteri Pengiran Anak Saleha Appendicitis)

- **Citation:** Chong CF, Adi MI, Thien A, et al. Development of the RIPASA score: a new
  appendicitis scoring system for the diagnosis of acute appendicitis. *Singapore Med J.*
  2010;51(3):220-225.
- **citationUrl:** https://pubmed.ncbi.nlm.nih.gov/20428744/
- **Group:** G. **Specialties:** `emergency-medicine`, `surgery`, `internal-medicine`.
- **Inputs — 15 weighted items in half-point increments** *(each weight is transcribed
  verbatim from the primary paper at implementation, [spec-v97](spec-v97.md))*:
  demographics — male (+1) / female (+0.5), age ≤ 40 (+1) / > 40 (+0.5); symptoms — right
  iliac fossa (RIF) pain (+0.5), migration of pain to RIF (+0.5), anorexia (+1), nausea &
  vomiting (+1), symptom duration < 48 h (+1) / > 48 h (+0.5); signs — RIF tenderness
  (+1), guarding (+2), rebound tenderness (+1), Rovsing's sign (+2), fever 37-39 °C (+1);
  investigations — raised WBC (+1), negative urinalysis (+1); plus the foreign-NRIC
  demographic item (+1).
- **Output:** the **RIPASA total** mapped to the four-band probability of appendicitis —
  **< 5 unlikely, 5-7 low/moderate (observe/image), 7.5-11.5 high probability (the 7.5
  optimal diagnostic cutoff, ~ 88 % sensitivity / 67 % specificity in the derivation
  cohort), ≥ 12 very high** *(the exact bands are transcribed at implementation,
  [spec-v97](spec-v97.md))* — naming the contributing features. Framed as the
  higher-sensitivity alternative to Alvarado in populations where Alvarado misses; **it
  reports a probability band, never an operative decision** ([spec-v11](spec-v11.md)
  §5.3). Class A. Cross-links `alvarado`, `air-score`, `pediatric-appendicitis`.

### 2.2 `pulp` — Peptic Ulcer Perforation (PULP) score

- **Citation:** Møller MH, Engebjerg MC, Adamsen S, Bendix J, Thomsen RW. The Peptic Ulcer
  Perforation (PULP) score: a predictor of mortality following peptic ulcer perforation.
  A cohort study. *Acta Anaesthesiol Scand.* 2012;56(5):655-662.
- **citationUrl:** https://doi.org/10.1111/j.1399-6576.2011.02609.x
- **Group:** G. **Specialties:** `surgery`, `emergency-medicine`, `critical-care`,
  `internal-medicine`.
- **Inputs — eight variables** *(each weight is transcribed verbatim from the primary
  paper at implementation, [spec-v97](spec-v97.md))*: age > 65 (+3); active malignancy or
  AIDS (+1); liver cirrhosis (+2); concomitant steroid use (+1); time from perforation to
  admission > 24 h (+1); shock on admission, SBP < 100 mmHg (+1); serum creatinine
  > 130 µmol/L (+2); and the ASA class term — ASA 2 (+1) / ASA 3 (+3) / ASA 4 (+5) / ASA 5
  (+7).
- **Output:** the **PULP total (0-18)** with the **≤ 7 = low risk (< 25 % 30-day
  mortality) vs 8-18 = high risk (> 25 %)** dichotomy, naming the driving items. Framed as
  the perforated-peptic-ulcer mortality model that outperforms the Boey score and ASA
  alone (derivation AUC ≈ 0.83); **it reports a mortality-risk band, never an operative or
  disposition order** ([spec-v11](spec-v11.md) §5.3). Class A. Cross-links `boey`,
  `mannheim-peritonitis`, `p-possum`.

### 2.3 `emergency-surgery-score` — Emergency Surgery Score (ESS)

- **Citation:** Sangji NF, Bohnen JD, Ramly EP, et al. Derivation and validation of a
  novel Emergency Surgery Acuity Score (ESAS). *J Trauma Acute Care Surg.*
  2016;81(2):213-220.
- **citationUrl:** https://doi.org/10.1097/TA.0000000000001059
- **Group:** G. **Specialties:** `surgery`, `emergency-medicine`, `critical-care`,
  `anesthesiology`.
- **Inputs — 22 preoperative variables across three domains** *(the full weighted table
  is transcribed verbatim from the primary paper at implementation,
  [spec-v97](spec-v97.md); the demographic-domain race term is a derivation coefficient
  reproduced as published, not a clinical recommendation)*: **demographic** — age > 60
  (+2), transfer from an outside ED (+1), transfer from an acute-care inpatient facility
  (+1); **comorbidity** — ascites, BMI < 20, dyspnea, functional dependence, COPD,
  hypertension, steroid use, and > 10 % weight loss in 6 months (each +1), with
  disseminated cancer and ventilator dependence within 48 h preoperatively each +3;
  **laboratory** — albumin < 3.0, alkaline phosphatase > 125, BUN > 40, INR > 1.5,
  platelets < 150k, AST > 40, sodium > 145, and the abnormal-WBC bands (each +1), with
  creatinine > 1.2 and WBC > 25k each +2.
- **Output:** the **ESS total (0-29)** mapped to the predicted 30-day mortality, which
  rises monotonically across the range (≈ 0 % at the low end through the high-30s % at
  mid-range to near-uniform lethality at the top) *(the score→probability lookup is
  transcribed at implementation, [spec-v97](spec-v97.md); intermediate percentages differ
  by external cohort — the tile reports the derivation gradient)*, naming the dominant
  contributors. Framed as the best-validated emergency-general-surgery mortality engine
  (derivation c-statistic ≈ 0.86); the companion ESS morbidity model (Nandan 2017) is
  noted but **out of scope here**. **It reports a mortality band, never an operative
  order** ([spec-v11](spec-v11.md) §5.3). Class A. Cross-links `possum`, `p-possum`,
  `pulp`.

## 3. Per-tile robustness

- **Every compute routes through `lib/num.js` and is finite-guarded.** RIPASA is a bounded
  half-point sum, PULP a bounded 0-18 integer sum, ESS a bounded 0-29 sum — each renders a
  "complete the fields" fallback for a missing item rather than a `NaN`, and clamps
  probabilities to [0, 100] %.
- **Each tile reports which items fired and the resulting band**
  ([spec-v59](spec-v59.md)) — the RIPASA probability zone, the PULP dichotomy, the ESS
  mortality gradient — so a result is never read without its basis.
- **All three render a category, not an order** — none authors an operative, imaging,
  admission, or discharge order in Sophie's voice ([spec-v11](spec-v11.md) §5.3); each
  renders the [spec-v50](spec-v50.md) §3 posture note.
- **All three flow through the [spec-v59](spec-v59.md) fuzz harness with zero non-finite
  leaks**, fuzzed at the RIPASA 7.5/12 band edges, the PULP ≤ 7 / > 7 cutoff, and the
  ESS 0-29 range.

## 4. CI/CD & maintenance

- **Maintenance classes (§6.3):** all three are **Class A** — fixed item/point models,
  each cited by journal + authors. The implementing session confirms whether any citation
  trips `ISSUER_PATTERN` ([spec-v92](spec-v92.md)/[spec-v94](spec-v94.md)) and adds a
  `docs/citation-staleness.md` row only if the live pattern matches.
- **Build & gates (§6.1/§6.2):** the three computes live in a new
  `lib/acute-abdomen-v261.js`, added to `test/unit/fuzz-tools.test.js` `MODULES`.
  Renderers live in a new `views/group-v261.js`; its `RV261` export is spread into the
  `app.js` `RENDERERS` map. The transcribed ESS weight table lives as a named constant with
  the source table cited in a comment. Every input carries a real `<label for>`. The
  catalog count moves on all catalog-truth surfaces using the **live `UTILITIES.length`
  + 3**; a11y, `mobile-no-hscroll`, `mobile-touch-targets`, and the chromium
  `example-correctness` sweep pass.
- **Specialties** are drawn from the closed vocabulary; all tags used here already exist in
  `ALLOWED_SPECIALTIES`.
- **MCP exposure (post-ship):** all three are Class A deterministic computes and are
  **routinely MCP-adaptable** — a follow-up MCP wave exposes them as deterministic agent
  tools per the [spec-v85](spec-v85.md) recipe, self-describing the fired items and band so
  the numeric round-trip passes.

## 5. Files touched

```
docs/spec-v261.md                        (this file)
app.js                                   (+3 UTILITIES rows; import group-v261 RV261 into RENDERERS)
lib/acute-abdomen-v261.js                (new: ripasa, pulp, emergencySurgeryScore + transcribed ESS weight constant)
lib/meta.js                              (+3 META entries: inline citation + citationUrl + accessed; cross-links to alvarado, boey, possum)
views/group-v261.js                      (new renderer module: 3 renderers)
docs/clinical-citations.md               (+3 rows)
test/unit/ripasa.test.js, pulp.test.js, emergency-surgery-score.test.js   (>=3 worked examples each)
test/unit/fuzz-tools.test.js             (add lib/acute-abdomen-v261.js to MODULES)
docs/scope-post-parity.md                (catalog count live -> live+3; record the v261 delta)
CHANGELOG.md, README.md, package.json    (catalog count live -> live+3; spec-progression line)
```

## 6. Acceptance criteria

v261 is fully shipped when:

- The implementing session has **re-run the [spec-v85 §6.2](spec-v85.md) collision check**
  and confirmed all three ids are absent (as verified at draft).
- All 3 tiles in §2 are live (Class A) with a `META[id]` entry, inline citation +
  `citationUrl` + `accessed`, and ≥ 3 worked examples each — including a **RIPASA crossing
  the 7.5 diagnostic cutoff**, a **PULP crossing the ≤ 7 / > 7 mortality dichotomy with an
  ASA-class contribution**, and an **ESS spanning a mortality range (a low-score and a
  high-score case)**.
- The transcribed RIPASA half-point weights, PULP eight-variable weights, and ESS
  22-variable table are reproduced from the primary sources and re-verified against ≥ 2
  independent references at implementation ([spec-v97](spec-v97.md)).
- Every compute is finite-guarded, routes through `lib/num.js`, clamps probabilities to
  [0, 100] %, and is covered by the [spec-v59](spec-v59.md) fuzz harness with **zero
  non-finite leaks**.
- `UTILITIES.length` is **live + 3** and all catalog-truth surfaces agree.
- `npm run lint`, `npm run test`, `npm run sbom`, and `npm run build` all pass; the
  CHANGELOG records v261 with the +3 delta.

## 7. Out of scope for v261

- **No operative / imaging / admission / discharge order** — the tiles compute a
  probability or risk band; the decision to operate, scan, admit, or discharge stays with
  the surgeon ([spec-v11](spec-v11.md) §5.3).
- **No proprietary or non-reproducible variant** — the ESS morbidity/complication model
  (Nandan 2017) and locally-refitted appendicitis pathways are deferred; this slice adds
  only the three canonical, openly-published instruments. If any weight table cannot be
  reproduced from ≥ 2 open, fetchable sources at implementation, that tile is parked (not
  approximated), per [spec-v97](spec-v97.md) and the [spec-v259](spec-v259.md) precedent.

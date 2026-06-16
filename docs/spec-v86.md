# spec-v86.md — Toxicology decision rules: serotonin toxicity, salicylate poisoning, and the toxic-alcohol osmolar gap (+3 tiles)

> Status: **PROPOSED (2026-06-16).** First feature spec of the
> [spec-v85](spec-v85.md) Advanced Clinical Calculators program. Adds **3**
> deterministic toxicology decision rules that fill confirmed gaps in the catalog's
> high-acuity surface: the bedside diagnostic rule for serotonin toxicity, the
> evidence-based dialysis-indication rule for salicylate poisoning, and the
> osmolar-gap-plus-treatment-indication rule for suspected toxic-alcohol ingestion.
> The catalog ships `acetaminophen-nomogram` (F) and `co-cn-antidote` (I) but none
> of these three — the other emergencies every ED and ICU runs. None duplicates an
> existing tile.
>
> Catalog effect at v86 close: **366 + 3 = 369 tiles.**
>
> Every prior spec (v4 through v85) remains in force. v86 adds no runtime network
> call and no AI; each tile obeys the [spec-v85](spec-v85.md) §2 doctrine, passes
> the [spec-v29](spec-v29.md) §3 one-line test, ships its primary citation inline
> ([spec-v54](spec-v54.md)), and inherits the [spec-v59](spec-v59.md) output-safety
> contract.

## 1. Thesis

Toxicology is where deterministic decision rules matter most and where the catalog
is thinnest. Three rules are textbook, validated, and currently absent:

- **Serotonin toxicity is a decision rule, not a gestalt.** The Hunter Serotonin
  Toxicity Criteria (Dunkley 2003) replaced the older Sternbach criteria precisely
  because they are an explicit, reproducible decision rule (sensitivity 84%,
  specificity 97% against a toxicologist's diagnosis). In the presence of a
  serotonergic agent, the diagnosis follows a fixed branch on clonus, agitation,
  diaphoresis, tremor, hyperreflexia, and temperature. A clinician should be able
  to run the branch at the bedside, not recall it.

- **Salicylate dialysis is an EXTRIP threshold, not a vibe.** The discredited Done
  nomogram is still reached for; the current standard is the EXTRIP Workgroup's
  evidence-based recommendation, which makes hemodialysis a function of the
  salicylate level, the pH, kidney function, mental status, and whether standard
  therapy is failing. The whole value is showing *which threshold tripped*.

- **Toxic-alcohol workup turns on the osmolar gap and a treatment indication.** The
  osmolal gap (the catalog already computes it) is the bridge; the actionable
  question is whether the AACT fomepizole-indication criteria are met for suspected
  methanol or ethylene-glycol ingestion. The tile computes the ethanol-corrected
  osmolar gap and applies the indication rule, with the explicit caveat that a
  *normal* gap late in the course does not exclude the diagnosis.

Each is a published, deterministic instrument a physician already uses; v86 brings
them onto the page.

## 2. What v86 adds (3 tiles)

### 2.1 `serotonin-toxicity` — Hunter Serotonin Toxicity Criteria

- **Citation:** Dunkley EJC, Isbister GK, Sibbritt D, Dawson AH, Whyte IM. The
  Hunter Serotonin Toxicity Criteria: simple and accurate diagnostic decision rules
  for serotonin toxicity. *QJM.* 2003;96(9):635-642.
- **citationUrl:** https://doi.org/10.1093/qjmed/hcg109
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `emergency-medicine`, `toxicology`, `critical-care`,
  `psychiatry`, `nursing-ed`.
- **Inputs:** a required precondition — *the patient has taken a serotonergic
  agent* — then the clinical findings: spontaneous clonus; inducible clonus;
  ocular clonus; agitation; diaphoresis; tremor; hyperreflexia; hypertonia;
  temperature > 38 °C.
- **Output:** "**meets Hunter criteria for serotonin toxicity**" if **any** of the
  five decision branches is satisfied —
  (1) spontaneous clonus; or
  (2) inducible clonus **and** (agitation **or** diaphoresis); or
  (3) ocular clonus **and** (agitation **or** diaphoresis); or
  (4) tremor **and** hyperreflexia; or
  (5) hypertonia **and** temperature > 38 °C **and** (ocular clonus **or** inducible
  clonus) —
  otherwise "**does not meet Hunter criteria.**" The output names the branch that
  fired, and gates on the serotonergic-agent precondition (no agent → "criteria not
  applicable; the rule assumes a serotonergic exposure"). The result text notes the
  rule is more specific than Sternbach and quotes the published operating
  characteristics.

### 2.2 `salicylate-toxicity` — Salicylate poisoning severity + EXTRIP hemodialysis indication

- **Citation:** Juurlink DN, Gosselin S, Kielstein JT, et al; EXTRIP Workgroup.
  Extracorporeal Treatment for Salicylate Poisoning: Systematic Review and
  Recommendations From the EXTRIP Workgroup. *Ann Emerg Med.* 2015;66(2):165-181.
- **citationUrl:** https://doi.org/10.1016/j.annemergmed.2015.03.031
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `emergency-medicine`, `toxicology`, `nephrology`,
  `critical-care`.
- **Inputs:** serum salicylate level (mg/dL or mmol/L, with unit toggle); arterial
  pH; presence of altered mental status; presence of new hypoxemia requiring
  supplemental oxygen (ARDS picture); impaired kidney function (yes/no); and whether
  standard therapy (fluids, urinary alkalinization) is failing or unavailable.
- **Output:** the **EXTRIP hemodialysis recommendation** — recommended when **any**
  cited threshold is met: salicylate > 100 mg/dL (7.2 mmol/L) in acute poisoning;
  > 90 mg/dL with impaired kidney function; altered mental status; new hypoxemia
  requiring oxygen; or arterial pH ≤ 7.20 despite optimal care; **suggested** when
  standard therapy fails — with the **specific criterion that tripped** named in the
  output, plus the severity framing (mild / moderate / severe by level and clinical
  features). Dialysis modality preference (intermittent HD) is quoted from the
  source. **Explicitly excludes the discredited Done nomogram** (§6). Companion to
  `acetaminophen-nomogram`.

### 2.3 `toxic-alcohol` — Osmolar gap + AACT fomepizole indication (methanol / ethylene glycol)

- **Citation:** Osmolar-gap formula — Smithline N, Gardner KD. Gaps — anionic and
  osmolal. *JAMA.* 1976;236(14):1594-1597. Treatment indication — Barceloux DG, et
  al (American Academy of Clinical Toxicology). AACT practice guidelines on the
  treatment of methanol poisoning (*J Toxicol Clin Toxicol.* 2002;40(4):415-446) and
  ethylene glycol poisoning (*J Toxicol Clin Toxicol.* 1999;37(5):537-560).
- **citationUrl:** https://doi.org/10.1081/CLT-120006745
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `emergency-medicine`, `toxicology`, `nephrology`,
  `critical-care`.
- **Inputs:** measured serum osmolality (mOsm/kg); serum sodium, glucose, BUN; serum
  ethanol level (to correct the calculated osmolality); arterial pH and bicarbonate;
  and the clinical context (suspected ingestion, time since ingestion).
- **Output:** the **calculated osmolality** (2·Na + glucose/18 + BUN/2.8 +
  ethanol/3.7) shown as a derivation, the **osmolar gap** (measured − calculated),
  and the **AACT fomepizole-indication** determination: treat when a documented
  plasma methanol or ethylene glycol concentration > 20 mg/dL is known; **or** when
  there is a recent-ingestion history with an osmolar gap > 10 mOsm/kg; **or** a
  strong clinical suspicion with at least two of (arterial pH < 7.3, serum
  bicarbonate < 20 mEq/L, osmolar gap > 10). The output names which limb met, and
  carries the hard caveat that a **normal osmolar gap does not exclude** toxic
  alcohol once the parent has been metabolized to its acids — at which point the
  **anion gap** rises instead (links `anion-gap-dd`). **Near-neighbor:**
  `osmolal-gap` (E) computes the gap alone; this tile adds the treatment rule and is
  cross-linked, both kept.

## 3. Per-tile robustness

- **`serotonin-toxicity` is pure boolean branch logic** with no arithmetic; it still
  flows through the [spec-v59](spec-v59.md) fuzz harness to confirm no `undefined`
  reaches the DOM, and it refuses to render a verdict without the serotonergic-agent
  precondition (returns a surfaced "criteria not applicable" string, never a
  silent false negative).
- **`salicylate-toxicity` surfaces the tripping criterion explicitly** so the
  determination is auditable; the level is unit-aware (mg/dL ↔ mmol/L via
  `lib/num.js`), and pH/level inputs are range-clamped. A blank level with positive
  clinical criteria still yields the clinical-criterion recommendation (the rule
  does not require the number when AMS/hypoxemia/pH already qualify).
- **`toxic-alcohol` guards its arithmetic:** the calculated osmolality divides by
  fixed nonzero constants only; ethanol defaults to 0 when not entered (and the
  derivation shows the term dropping out). The osmolar gap can be negative — the
  tile reports the signed value and does **not** clamp it to zero, because a
  strongly negative gap is itself a measurement-error flag the source notes.
- All three render the [spec-v50](spec-v50.md) §3 clinical posture note and quote
  the source's interpretation; none authors a treatment recommendation in Sophie's
  voice ([spec-v11](spec-v11.md) §5.3).

## 4. Files touched

```
docs/spec-v86.md                         (this file)
app.js                                   (+3 UTILITIES rows, group G; import group-v12 renderers into RENDERERS)
lib/tox-v86.js                           (new module: serotoninToxicity, salicylateToxicity, toxicAlcohol)
lib/meta.js                              (+3 META entries: inline citation + citationUrl + accessed; cross-links to osmolal-gap, anion-gap-dd, acetaminophen-nomogram)
views/group-v12.js                       (new renderer module: 3 renderers; serotonin checklist, salicylate criteria + level, toxic-alcohol osmolar-gap derivation)
docs/citation-staleness.md               (+ rows: EXTRIP salicylate recommendation (2015), AACT methanol/ethylene-glycol guidelines)
docs/clinical-citations.md               (+ rows for the three bedside toxicology sources)
test/unit/serotonin-toxicity.test.js     (new; ≥3 boundary worked examples incl. each decision branch + the no-agent gate)
test/unit/salicylate-toxicity.test.js    (new; ≥3 incl. the >100 level limb, the pH ≤7.20 limb, and the AMS clinical limb)
test/unit/toxic-alcohol.test.js          (new; ≥3 incl. ethanol-corrected gap, the >20 mg/dL level limb, and the normal-gap-late caveat case)
test/unit/fuzz-tools.test.js             (add lib/tox-v86.js to MODULES)
docs/audits/v12/serotonin-toxicity.md, salicylate-toxicity.md, toxic-alcohol.md  (spec-v11 audit logs)
docs/scope-mdcalc-parity.md              (catalog count 366 -> 369; append to the running ledger)
CHANGELOG.md                             (Unreleased: v86 entry, +3)
README.md, package.json                  (catalog count 366 -> 369; spec-progression line -> v86)
```

## 5. Acceptance criteria

v86 is fully shipped when:

- All 3 tiles in §2 are live in their stated group with a `META[id]` entry, an
  inline primary citation + `citationUrl` + `accessed`, ≥3 boundary worked examples
  in the unit test (including each fired decision branch and the
  precondition/caveat gates), a [spec-v11](spec-v11.md) audit log, and a passing
  [spec-v29](spec-v29.md) §3 scope check.
- `serotonin-toxicity` returns "meets criteria" for spontaneous clonus alone and for
  the tremor + hyperreflexia branch, "does not meet" when only a single non-
  qualifying finding is present, and "not applicable" without a serotonergic agent.
- `salicylate-toxicity` recommends hemodialysis at a level > 100 mg/dL, at pH ≤ 7.20
  regardless of level, and on altered mental status alone, naming the tripped
  criterion each time; it never references the Done nomogram.
- `toxic-alcohol` computes the ethanol-corrected calculated osmolality and signed
  osmolar gap, flags the fomepizole indication on a documented level > 20 mg/dL and
  on history + gap > 10, and surfaces the normal-gap-does-not-exclude caveat.
- Every compute function uses `lib/num.js` and is covered by the
  [spec-v59](spec-v59.md) fuzz harness with zero non-finite leaks.
- The revisable guideline thresholds (EXTRIP, AACT) carry `accessed` + a
  `docs/citation-staleness.md` row.
- `UTILITIES.length` is **369** and all catalog-truth surfaces
  ([spec-v46](spec-v46.md)) agree.
- `npm run lint`, `npm run test`, `npm run sbom`, and `npm run build` all pass.
- The CHANGELOG records v86 with the +3 catalog delta.

## 6. Out of scope for v86

- **The Done nomogram is excluded** by name. It is discredited (it misclassifies
  chronic poisoning and post-acute levels); `salicylate-toxicity` ships the current
  EXTRIP recommendations instead, consistent with the [scope-mdcalc-parity §4](scope-mdcalc-parity.md)
  bar against superseded instruments.
- **No bundled serotonergic-drug database.** The serotonergic-agent precondition is
  a user attestation, not a searchable formulary — that would be the reference-index
  the [spec-v29](spec-v29.md) §3 test prohibits.
- **No antidote dosing in this spec.** `toxic-alcohol` flags the *indication* for
  fomepizole; the fomepizole/ethanol loading-and-maintenance dose, and the
  N-acetylcysteine/bicarbonate regimens, are dosing tiles that would live in Group F
  and are deferred. (`co-cn-antidote` already covers the CO/cyanide antidotes.)
- **No auto-disposition.** The tiles report the rule's verdict and the source's
  stated guidance; the decision to dialyze, treat, or admit stays with the clinician
  and local toxicology/poison-control consultation.

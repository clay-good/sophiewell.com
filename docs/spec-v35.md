# spec-v35.md — Pediatric ICU iatrogenic-withdrawal companion: SOS

> Status: proposed (2026-05-21). v35 is a narrow, single-tile
> spec that closes out the pediatric ICU iatrogenic-withdrawal
> surface by adding the Sophia Observation withdrawal Symptoms
> scale (SOS; Ista 2009) as the validated companion to WAT-1
> shipped in spec-v34. It does not amend any other spec rule and
> rides under the spec-v11 audit floor and the spec-v12 §5
> shipping contract.
>
> Catalog effect at v35 close: **242 + 1 = 243 tiles.**

## 1. Thesis

v34 closed the bedside pediatric sedation triad (COMFORT-B,
SBS) and shipped WAT-1 as the iatrogenic-withdrawal monitor.
v34 §5 explicitly named SOS as a candidate "if both prove
useful in side-by-side practice." In the year since v34
shipped, PICU practice has continued to use SOS and WAT-1
side-by-side (the two scales measure overlapping but distinct
symptom profiles — WAT-1 is leaner and stimulus-driven; SOS
is longer and observation-window driven), and several large
PICU networks document both at every shift. Shipping SOS lets
a bedside nurse pick whichever scale her unit's protocol calls
for without leaving Sophie.

SOS is a 15-item observation-window scale with each item scored
binary 0 (absent) or 1 (present) over the prior 4-hour window.
Total 0-15. The Ista 2009 derivation flagged ≥4 as clinically
relevant iatrogenic withdrawal. It is a single ordinal-sum
calculator with a banded interpretation that the nurse acts on
at the bedside — it passes the v29 §3 one-line test.

## 2. What v35 adds (1 tile)

### 2.1 `sos` — Sophia Observation withdrawal Symptoms scale (Ista 2009)

- **Citation:** Ista E, van Dijk M, de Hoog M, Tibboel D,
  Duivenvoorden HJ. *Construction of the Sophia Observation
  withdrawal Symptoms-scale (SOS) for critically ill children.*
  Intensive Care Med 2009;35(6):1075-1081.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `nursing-picu`, `nursing-nicu`, `nursing-peds`, `nursing-general`, `pediatrics`, `anesthesiology`, `pain-medicine`.
- **Inputs:** 15 binary items (each 0 absent / 1 present)
  observed over the prior 4-hour window: tachycardia,
  tachypnea, fever (>38.4 °C), sweating, agitation, anxiety,
  grimacing, sleeplessness, hallucinations, motor disturbance
  / movement disorder, hypertonia / increased muscle tone,
  tremor, vomiting, diarrhea, inconsolable crying.
- **Bands:** Total 0-15. ≥4 indicates clinically relevant
  iatrogenic withdrawal per Ista 2009 (the derivation paper's
  Youden-optimal cutoff).

## 3. Files touched

```
docs/spec-v35.md                         (this file)
app.js                                   (+1 UTILITIES row)
lib/scoring-v4.js                        (+1 export: sos)
lib/meta.js                              (+1 META[id] entry)
views/group-g.js                         (+1 renderer)
test/unit/sos.test.js                    (new)
docs/audits/v11/sos.md                   (new)
docs/scope-mdcalc-parity.md              (catalog count 242 -> 243)
docs/spec-v34.md                         (§5 cross-reference back-link: "Resolved by spec-v35")
CHANGELOG.md                             (Unreleased: v35 entry)
README.md                                (catalog count 242 -> 243)
package.json                             (description count 242 -> 243)
```

## 4. Acceptance criteria

v35 is fully shipped when:

- This file exists.
- The tile in §2 is present: `META[id]` entry, ≥3 boundary
  worked examples in the test suite, primary citation visible
  inline, spec-v11 audit log in `docs/audits/v11/`.
- `UTILITIES.length` is 243.
- `npm run lint`, `npm run test`, `npm run sbom`, and
  `npm run build` all pass.
- The CHANGELOG records v35 with the catalog-count delta.

## 5. Out of scope for v35

- COMFORT (original, with HR/BP/muscle items) — superseded
  clinically by COMFORT-B (shipped v34); carried forward from
  v34 §5: not shipped.
- Self-report pain scales (NRS, VAS, Wong-Baker FACES). Carried
  forward from v32 §5, v33 §5, and v34 §5: not calculators.
- RASS, SAS, and other adult sedation scales — already shipped
  (v13); no v35 amendment.
- A consolidated "PICU withdrawal scorecard" tile combining
  WAT-1 and SOS in a single view. Each scale is validated
  against its own derivation; co-displaying them risks
  implying equivalence the literature does not support.

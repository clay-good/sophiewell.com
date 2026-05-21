# spec-v34.md — Pediatric ICU bedside extensions: COMFORT-B, WAT-1, SBS

> Status: proposed (2026-05-21). v34 is a narrow, three-tile
> spec that completes the pediatric-ICU nurse-bedside sedation
> and iatrogenic-withdrawal surface. It does not amend any
> other spec rule and rides under the spec-v11 audit floor and
> the spec-v12 §5 shipping contract.
>
> Catalog effect at v34 close: **239 + 3 = 242 tiles.**

## 1. Thesis

v33 closed out the non-self-report pain catalog (CPOT, BPS,
FLACC, PAINAD, NIPS, N-PASS, CRIES) and the opioid-sedation
monitor for adults (POSS). What remains is the *pediatric ICU*
sedation and iatrogenic-withdrawal surface — the three tools a
PICU / cardiac-ICU nurse reaches for at the bedside that are
not interchangeable with their adult or neonatal counterparts.
v33 §5 explicitly defers COMFORT and COMFORT-B. v34 ships
COMFORT-B (the modern behavioral form), WAT-1 (the most-cited
pediatric iatrogenic-withdrawal scale), and SBS (the pediatric
state-behavioral scale used as the *anchor* for COMFORT-B and
WAT-1 in the published validation studies).

Each is a small ordinal sum or single-picker scale with a banded
interpretation that the nurse acts on at the bedside; each
consumes structured inputs and produces a computed result; each
passes the v29 §3 one-line test.

## 2. What v34 adds (3 tiles)

### 2.1 `comfort-b` — COMFORT-B Behavioral Scale (van Dijk 2005)

- **Citation:** van Dijk M, Peters JWB, van Deventer P, Tibboel D.
  *The COMFORT Behavior Scale: a tool for assessing pain and
  sedation in infants.* Am J Nurs 2005;105(1):33-36.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `nursing-picu`, `nursing-nicu`, `nursing-peds`, `nursing-general`, `pediatrics`, `anesthesiology`.
- **Inputs:** 6 ordinal pickers, each 1-5: Alertness; Calmness /
  Agitation; Respiratory response (ventilated) OR Crying
  (non-ventilated); Physical movement; Muscle tone; Facial
  tension.
- **Bands:** Total 6-30. <11 over-sedation; 11-22 adequate
  sedation; >22 inadequate sedation / distress
  (van Dijk 2005 target band 11-22).

### 2.2 `wat-1` — Withdrawal Assessment Tool, version 1 (Franck 2008)

- **Citation:** Franck LS, Harris SK, Soetenga DJ, Amling JK,
  Curley MAQ. *The Withdrawal Assessment Tool-1 (WAT-1): an
  assessment instrument for monitoring opioid and benzodiazepine
  withdrawal symptoms in pediatric patients.* Pediatr Crit Care
  Med 2008;9(6):573-580.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `nursing-picu`, `nursing-peds`, `nursing-general`, `pediatrics`, `anesthesiology`, `pain-medicine`.
- **Inputs:** 11 ordinal items aggregating to 0-12: prior 12 h
  (loose stools 0-1, vomiting/retching 0-1, temp >37.8 °C 0-1);
  2-min pre-stimulus observation (SBS state >0 0-1, tremor 0-1,
  sweating 0-1, uncoordinated/repetitive movement 0-1, yawning/
  sneezing 0-1); 1-min stimulus observation (startle to touch
  0-1, increased muscle tone 0-1); post-stimulus recovery
  (time to regain calm: <2 min = 0, 2-5 min = 1, >5 min = 2).
- **Bands:** Total 0-12. ≥3 indicates iatrogenic withdrawal
  per Franck 2008 (sensitivity 0.87, specificity 0.88 at the
  ≥3 cutoff).

### 2.3 `sbs` — State Behavioral Scale (Curley 2006)

- **Citation:** Curley MAQ, Harris SK, Fraser KA, Johnson RA,
  Arnold JH. *State Behavioral Scale (SBS): a sedation
  assessment instrument for infants and young children
  supported on mechanical ventilation.* Pediatr Crit Care Med
  2006;7(2):107-114.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `nursing-picu`, `nursing-nicu`, `nursing-peds`, `nursing-general`, `pediatrics`, `anesthesiology`.
- **Inputs:** 1 ordinal picker (single 6-level scale): −3
  unresponsive; −2 responsive to noxious stimuli; −1 responsive
  to gentle touch / voice; 0 awake and able to calm; +1 restless
  and difficult to calm; +2 agitated.
- **Bands:** −3 / −2 indicate deeper-than-target sedation; −1 /
  0 indicate target sedation in most PICU protocols; +1 / +2
  indicate inadequate sedation or active distress (Curley 2006).

## 3. Files touched

```
docs/spec-v34.md                         (this file)
app.js                                   (+3 UTILITIES rows)
lib/scoring-v4.js                        (+3 exports: comfortB, wat1, sbs)
lib/meta.js                              (+3 META[id] entries)
views/group-g.js                         (+3 renderers)
test/unit/comfort-b.test.js              (new)
test/unit/wat-1.test.js                  (new)
test/unit/sbs.test.js                    (new)
docs/audits/v11/comfort-b.md             (new)
docs/audits/v11/wat-1.md                 (new)
docs/audits/v11/sbs.md                   (new)
docs/scope-mdcalc-parity.md              (catalog count 239 -> 242)
docs/spec-v33.md                         (§5 cross-reference back-link: "Resolved by spec-v34")
CHANGELOG.md                             (Unreleased: v34 entry)
README.md                                (catalog count 239 -> 242)
package.json                             (description count 239 -> 242)
```

## 4. Acceptance criteria

v34 is fully shipped when:

- This file exists.
- All three tiles in §2 are present: `META[id]` entries, ≥3
  boundary worked examples in the test suite, primary citation
  visible inline, spec-v11 audit log in `docs/audits/v11/`.
- `UTILITIES.length` is 242.
- `npm run lint`, `npm run test`, `npm run sbom`, and
  `npm run build` all pass.
- The CHANGELOG records v34 with the catalog-count delta.

## 5. Out of scope for v34

- COMFORT (original, with HR/BP/muscle items) — superseded
  clinically by COMFORT-B for most PICU contexts; not shipped.
- SOS (Sophia Observation withdrawal Symptoms; Ista 2009) —
  alternative to WAT-1; candidate for a future spec if both
  prove useful in side-by-side practice. **Resolved by
  [spec-v35](spec-v35.md):** SOS ships in v35 wave 35-1.
- RASS and SAS adult sedation scales — already shipped (v13).
- Self-report pain scales (NRS, VAS, Wong-Baker FACES). Carried
  forward from v32 §5 and v33 §5: not calculators.

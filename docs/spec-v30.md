# spec-v30.md — Thermal-emergency decision tiles: re-admit Swiss hypothermia and heat-illness staging as decisions, not references

> Status: proposed (2026-05-21). v30 is a narrow, two-tile spec
> that resolves [spec-v29 §10.3](spec-v29.md#10-open-questions).
> It does not amend any other spec rule and does not change the
> v29 "computes-or-it-is-not-Sophie" one-line test.
>
> Catalog effect at v30 close: **230 + 2 = 232 tiles.**
>
> The two retired reference cards (`hypothermia`, `heat-illness`,
> deleted in spec-v29 wave 29-2 §2.3) return — but as **decision
> trees that emit a bedside action**, not as staging tables. The
> v29 §3 one-line test is satisfied: each tile consumes structured
> inputs and produces a computed rewarming-algorithm or
> cooling-algorithm choice.

## 1. Thesis

Hypothermia and heat-illness are exactly the kind of field
medicine Sophie should cover: time-critical, threshold-driven,
and the wrong call kills people. The v29 cut removed the static
staging reference tables (correctly — a labelled grid is not
computation). What was missing, and is added here, is the
*algorithm pinned to the staging*: given the staging inputs,
which rewarming or cooling action is indicated next, and what is
the EMS / ECMO referral threshold?

## 2. What v30 adds (2 tiles)

### 2.1 `hypothermia-rewarm` — Swiss staging → rewarming algorithm

- **Citation (primary):** Durrer B, Brugger H, Syme D. *The medical
  on-site treatment of hypothermia: ICAR-MEDCOM recommendation.*
  High Alt Med Biol 2003;4(1):99-103.
- **Citation (modern):** Brown DJ, Brugger H, Boyd J, Paal P.
  *Accidental hypothermia.* N Engl J Med 2012;367(20):1930-1938.
- **Citation (ERC):** Lott C, Truhlář A, Alfonzo A, et al.
  *European Resuscitation Council Guidelines 2021: Cardiac
  arrest in special circumstances.* Resuscitation
  2021;161:152-219 (§4 hypothermia).
- **Group:** EMS & Field Medicine (`I`).
- **Specialties:** `emergency-medicine`, `ems`, `wilderness-medicine`, `critical-care`, `nursing-er`, `nursing-icu`.
- **Inputs:**
  - Core temperature in °C (one decimal).
  - Consciousness / shivering picker (alert+shivering / impaired
    consciousness, vital signs present / unconscious, vital signs
    present / cardiac arrest or apparent death).
  - Asystole / lethal-injury / chest non-compressible flag (binary —
    if any, ECPR-not-indicated per ERC 2021).
  - Serum potassium if measured (mmol/L; optional). ERC 2021 §4.6
    cut-off: K⁺ > 12 mmol/L indicates death prior to cooling,
    ECPR not indicated.
- **Output:**
  - Swiss stage HT I / II / III / IV per Durrer 2003.
  - Recommended rewarming pathway:
    - HT I → passive external rewarming + warm sweet fluids PO.
    - HT II → active external + minimally invasive (forced air,
      warm IV); avoid jostling.
    - HT III → active internal (warm IV, body-cavity lavage,
      consider ECMO/CPB if cardiovascularly unstable).
    - HT IV → ECPR (VA-ECMO or CPB) is first-line per ERC 2021
      §4.7 unless the asystole / lethal-injury / K⁺ > 12
      / chest-non-compressible flag is set.
  - Banner: "do not declare death until rewarmed to ≥32°C" per
    ERC 2021 §4.7.
- **Edge inputs:** Temperature < 13.7°C is the lowest reported
  survival (Gilbert 2000) — banner notes survival is still
  possible.
- **Worked examples (≥3, in the test suite):**
  1. 33.5°C, alert, shivering → HT I, passive external.
  2. 30°C, impaired consciousness, breathing → HT II, active
     external + minimally invasive.
  3. 26°C, unconscious, has pulse → HT III, active internal;
     consider ECMO.
  4. 22°C, no signs of life, no lethal injury, K⁺ unknown → HT
     IV, ECPR indicated.
  5. 22°C, no signs of life, K⁺ 14 → HT IV, ECPR not indicated
     per ERC K⁺ cut-off.

### 2.2 `heatstroke-decision` — Bouchama framework → cooling algorithm

- **Citation (primary):** Bouchama A, Knochel JP. *Heat stroke.*
  N Engl J Med 2002;346(25):1978-1988.
- **Citation (modern):** Hifumi T, Kondo Y, Shimizu K, Miyake Y.
  *Heat stroke.* J Intensive Care 2018;6:30.
- **Citation (Wilderness Medical Society):** Lipman GS, Gaudio FG,
  Eifling KP, et al. *Wilderness Medical Society Clinical Practice
  Guidelines for the Prevention and Treatment of Heat Illness:
  2019 Update.* Wilderness Environ Med 2019;30(4S):S33-S46
  (CWI cooling-rate target ≥0.15 °C/min).
- **Group:** EMS & Field Medicine (`I`).
- **Specialties:** `emergency-medicine`, `ems`, `sports-medicine`, `wilderness-medicine`, `nursing-er`.
- **Inputs:**
  - Core (rectal) temperature in °C.
  - CNS dysfunction picker (none / mild confusion / altered LOC,
    seizure, or coma).
  - Sweating present (binary). Anhidrotic classic heat stroke vs
    sweating exertional heat stroke (per Bouchama 2002 Table 1)
    informs the differential banner only; the cooling algorithm
    is identical.
  - Setting flag (field / pre-hospital vs in-hospital). Drives
    whether cold-water immersion (CWI) or evaporative + ice-pack
    is the preferred modality.
- **Output:**
  - Stage: heat exhaustion (≤40°C, no CNS dysfunction) vs heat
    stroke (>40°C **or** CNS dysfunction, per Bouchama 2002).
  - Recommended action:
    - Heat exhaustion → rest, oral / IV rehydration, passive
      cooling, monitor for progression.
    - Heat stroke, field setting → CWI to 38.9°C (102°F) target
      core temp; cool-first, transport-second per WMS 2019;
      target rate ≥0.15 °C/min.
    - Heat stroke, in-hospital setting → CWI preferred if
      available; otherwise evaporative + ice packs to groin /
      axilla / neck. Stop active cooling at 38.9°C to avoid
      overshoot hypothermia.
  - Banner: "exertional heat stroke survival is ~100% if core
    temp lowered below 40°C within 30 minutes" (Casa 2007).
  - Banner: anticoagulation / DIC / rhabdomyolysis surveillance
    if heat stroke confirmed.
- **Worked examples (≥3, in the test suite):**
  1. 39.5°C, no CNS dysfunction, sweating, field → heat
     exhaustion; oral rehydration + passive cooling.
  2. 41.2°C, mild confusion, sweating, field → exertional heat
     stroke; CWI to 38.9°C; cool-first-transport-second.
  3. 41.0°C, coma, anhidrotic, in-hospital → classic heat
     stroke; CWI preferred; evaporative + ice-pack acceptable.
  4. 40.0°C exactly, no CNS dysfunction, sweating, field → heat
     exhaustion (boundary; Bouchama 2002 defines >40°C as the
     stroke threshold).
  5. 39.0°C, frank seizure, sweating, field → heat stroke (CNS
     dysfunction independent of temperature per Bouchama 2002).

## 3. What v30 does *not* re-introduce

- The static **staging tables** for Swiss HT I-IV labelling or
  for the heat exhaustion / heat stroke definition: those remain
  embedded inside the new decision tiles. There is no separate
  reference tile.
- The toxidrome table, DOT ERG lookup, NIOSH Pocket Guide, TCCC
  reference, ACLS / PALS wallet cards, hypothermia / heat-illness
  staging cards: all still cut per [spec-v29 §2.3](spec-v29.md).
  v30 only re-admits the two thermal staging *decisions*, not the
  general field-medicine reference cards.
- The Beers Criteria deprescribing checker
  ([spec-v29 §10.4](spec-v29.md#10-open-questions)) is deferred
  to a future spec — it requires a data shard of the AGS 2023
  Beers tables (Tables 2-6) plus a drug-disease cross-matcher,
  which is enough scope to merit its own spec doc.
- The audience-chip default ([spec-v29 §10.5](spec-v29.md#10-open-questions))
  remains `Nurse`. No change.
- The patient-facing workflow generators
  ([spec-v29 §10.1](spec-v29.md#10-open-questions)) remain in
  scope. v30 makes no decision; v31+ may re-evaluate.

## 4. Files touched

```
docs/spec-v30.md                         (this file)
app.js                                   (+2 UTILITIES rows)
lib/scoring-v4.js                        (+2 exports: hypothermiaRewarm, heatstrokeDecision)
lib/meta.js                              (+2 META[id] entries)
views/group-i.js                         (+2 renderers)
test/unit/hypothermia-rewarm.test.js     (new)
test/unit/heatstroke-decision.test.js    (new)
docs/audits/v11/hypothermia-rewarm.md    (new)
docs/audits/v11/heatstroke-decision.md   (new)
docs/scope-mdcalc-parity.md              (catalog count 230 → 232)
CHANGELOG.md                             (Unreleased: v30 entry)
README.md                                (catalog count 230 → 232)
package.json                             (description count 230 → 232)
```

## 5. Acceptance criteria

v30 is fully shipped when:

- This file exists and is linked from
  [docs/spec-v29.md §10](spec-v29.md) (cross-reference inline
  near §10.3 noting "resolved by spec-v30").
- Both tiles in §2 are present: `META[id]` entries, ≥3 worked
  examples in the test suite, primary citation visible inline,
  spec-v11 audit log in `docs/audits/v11/`.
- `UTILITIES.length` is 232.
- `npm run lint`, `npm run test`, `npm run sbom`, and
  `npm run build` all pass.
- The CHANGELOG records v30 with the catalog-count delta from §4.

## 6. Out of scope for v30

Anything not in §2. The Beers checker and the patient-generator
audit explicitly wait; the audience-chip default is not changed.

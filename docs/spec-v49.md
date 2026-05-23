# spec-v49.md — Clinical pathway tiles: deterministic scenario sequencing

> Status: proposed (2026-05-22). v49 is a feature spec that adds
> a new tile category — **Pathways** — and ships the first five
> pathway tiles. A pathway tile is scope-compliant per
> [spec-v29](spec-v29.md) §3: its inputs are a scenario selector
> and the patient values relevant at each step, and its computed
> output is the **ordered sequence of catalog tiles to consult
> next**, with deterministic gates derived from named clinical
> guidelines. Pathways are *navigation aids over Sophie's
> existing catalog*, not original clinical recommendations and
> not order sets.
>
> Catalog effect at v49 close: **254 + 5 = 259 tiles.**
>
> Every prior spec (v4 through v48) remains in force.

## 1. Why v49 exists

Sophie is 254 calculators in a catalog. The bedside reality is
that real clinical scenarios *chain* calculators — the ED
physician evaluating chest pain reaches for HEART, then PERC,
then Wells, then D-dimer-interpretation; the floor RN screening
sepsis reaches for SIRS, then qSOFA, then SOFA if escalated,
then a bundle-clock; the rapid-response team running a stroke
code reaches for CPSS, then LAMS, then ROSIER, then NIHSS, then
the tPA exclusion checklist. The chain is published in named
guidelines (ACC/AHA, SCCM, AHA stroke, ACOG, SAMHSA). Sophie
already implements every step of every chain individually. What
Sophie does *not* do today is show the user **which step is
next**.

A pathway tile fills that gap deterministically:

- The user selects a scenario.
- Sophie shows step 1 of the published chain, inline (or as a
  deep-link into the existing tile in another group).
- The user fills in the inputs for step 1.
- Sophie evaluates the gate condition published in the
  guideline ("if HEART ≥ 4, proceed to PERC; if HEART ≤ 3 and
  age < 50, PE clinically ruled out").
- Sophie shows step 2, or terminates the pathway with the
  guideline-documented endpoint.
- At every step the rationale quotes the guideline verbatim,
  with the guideline citation.

The pathway never *recommends* a treatment, an order, or a
disposition. It recommends *which Sophie tile to reach for
next* to keep the chain on the published rails. That distinction
is what keeps the pathway tile within Sophie's scope:
deterministic, citation-anchored, computed-output. It is not
clinical decision support; it is *catalog navigation* shaped by
the guideline.

This is, plainly, the move that turns Sophie from a catalog into
a usable decision-support kit. Per the maintainer's framing on
2026-05-22, it is the highest-leverage spec available without
breaking the static architecture or the
input-→-computed-output scope test.

## 2. Non-goals

- **No clinical recommendation outside the cited guideline.** A
  pathway tile may show only steps and gates that appear in the
  named guideline. No maintainer judgment, no "we think you
  should also check X."
- **No diagnosis, no treatment, no disposition.** The pathway
  terminates at "consult this Sophie tile" or "per guideline,
  PE is clinically ruled out at this step" — never at "give
  heparin," "admit," or "discharge."
- **No new clinical content not already in Sophie.** Every step
  in a pathway must reference an existing Sophie tile or
  terminate. v49 does not add new tiles to satisfy a pathway
  chain; if the guideline references a step Sophie does not yet
  implement, that step is marked "(not yet in Sophie — see
  citation)" and is not used as a gate.
- **No branching beyond a directed acyclic graph.** Pathways are
  DAGs: each step has 0 or more downstream steps based on the
  evaluated gate; cycles are forbidden.
- **No persistence of pathway state.** Refresh = restart, per
  the v10 "no accounts" budget.

## 3. The pathway DSL

A new module [lib/pathway.js](../lib/pathway.js) exports the
pathway runtime. A pathway is:

```js
{
  id: 'ed-chest-pain',
  name: 'ED chest pain workup (ACC/AHA 2021)',
  citation: 'Gulati M et al. 2021 AHA/ACC/...',
  guidelineQuote: '...verbatim quote from the guideline section that authorizes this chain...',
  steps: [
    {
      id: 'heart',
      tileRef: 'heart-score',         // existing Sophie tile ID
      gateRationale: 'verbatim quote from guideline naming HEART as the entry instrument',
      next: [
        {
          when: ({ heart }) => heart <= 3,
          target: 'TERMINAL',
          terminalText: 'verbatim guideline endpoint: "HEART ≤ 3 patients have <2% 30-day MACE..."',
        },
        {
          when: ({ heart }) => heart >= 4,
          target: 'perc',
          rationale: 'verbatim guideline quote authorizing PERC as the next step at this gate',
        },
      ],
    },
    {
      id: 'perc',
      tileRef: 'perc',
      ...
    },
    ...
  ],
}
```

The runtime exposes:

- `evaluatePathway(pathway, inputs) → { currentStep, history, terminal? }`
- `nextStep(pathway, currentStepId, stepOutput) → nextStepId | 'TERMINAL'`

Pure functions, deterministic, no side effects. Unit-testable
without the DOM.

## 4. The five pathways shipped at v49

Each pathway is a tile in the new Group P. Each step references
an existing Sophie tile that already exists at v45 close.

### 4.1 `pw-ed-chest-pain` — ED chest pain workup

- **Citation:** Gulati M, Levy PD, Mukherjee D, et al. 2021
  AHA/ACC/ASE/CHEST/SAEM/SCCT/SCMR Guideline for the Evaluation
  and Diagnosis of Chest Pain. *Circulation*. 2021;144(22):e368-e454.
- **Steps:** HEART → (≥4) TIMI → (≥2) Wells PE → (high or D-dimer+) D-dimer interpretation → terminal: "consider CTPA per guideline §X.Y."
- **Terminal branches:** HEART ≤ 3 (low-risk, guideline ruled-out language); TIMI 0–1 + negative serial troponins (low-risk per guideline); Wells PE low + PERC negative (PE clinically ruled out per ACEP / ACC guidance referenced by the chest-pain guideline).

### 4.2 `pw-sepsis-screen` — Adult sepsis screening & escalation

- **Citation:** Evans L, Rhodes A, Alhazzani W, et al. Surviving
  Sepsis Campaign: International Guidelines for Management of
  Sepsis and Septic Shock 2021. *Crit Care Med.* 2021;49(11):e1063-e1143.
- **Steps:** SIRS → (≥2) qSOFA → (≥2) SOFA → bundle-clock → MAP target / lactate clearance.
- **Terminal branches:** SIRS = 0 (no screen positive); qSOFA = 0–1 with low clinical suspicion (per guideline screen-negative endpoint); SOFA + lactate normalization (per guideline resuscitation-target endpoint).

### 4.3 `pw-stroke-triage` — Acute stroke triage (prehospital + ED)

- **Citation:** Powers WJ, Rabinstein AA, Ackerson T, et al.
  Guidelines for the Early Management of Patients with Acute
  Ischemic Stroke: 2019 Update. *Stroke*. 2019;50(12):e344-e418.
  Powell, et al. Mission: Lifeline Stroke 2020 statement.
- **Steps:** CPSS → (positive) LAMS / RACE → (LVO-suspect) ROSIER (ED) → NIHSS → tPA exclusion checklist.
- **Terminal branches:** CPSS 0/3 (no FAST positive); RACE < 5 (no LVO suspicion per guideline); NIHSS 0 + ROSIER 0 (no stroke per ED rule).

### 4.4 `pw-pph-staging` — Postpartum hemorrhage staging & escalation

- **Citation:** ACOG Practice Bulletin No. 183: Postpartum
  Hemorrhage. *Obstet Gynecol.* 2017;130(4):e168-e186, reaffirmed
  2023.
- **Steps:** estimated blood loss (EBL) entry → MEOWS → stage assignment per ACOG (stage 0 / 1 / 2 / 3) → escalation gate (anesthesia / OR / massive transfusion protocol — *named per guideline only*, not ordered by Sophie).
- **Terminal branches:** Stage 0 (no PPH per ACOG threshold); Stage 3 (terminal: "ACOG stage 3 — institutional MTP and OR per guideline").

### 4.5 `pw-opioid-overdose-response` — Adult opioid overdose response

- **Citation:** SAMHSA Opioid Overdose Prevention Toolkit, 2023
  update (HHS Publication No. PEP23-03-00-001) + the AHA 2020
  Guidelines for CPR and ECC §11 (Opioid Overdose).
- **Steps:** RR + GCS + pupil + responsiveness inputs → naloxone dose / route decision tile (already in Sophie) → re-check interval per AHA → re-dose gate.
- **Terminal branches:** RR ≥ 12 + GCS 15 (no overdose response indicated per toolkit); persistent unresponsiveness past re-dose threshold (terminal: "transport / advanced airway per AHA §11").

## 5. UI surface

A new group **P** ("Pathways") in the existing group navigation,
rendered like the other groups. Each pathway tile renders as a
vertical sequence:

- Step card: shows the current step's inputs inline (using the
  same input components as the underlying catalog tile) and the
  step's gate rationale verbatim from the guideline.
- On every input change, the runtime evaluates the gate and
  either reveals the next step card or shows the terminal
  endpoint.
- A "show full tile" link on each step deep-links to the
  full catalog tile in its native group (e.g., HEART in Group G)
  for users who want the full input surface and citation.
- Print stylesheet (a future spec) will be aware of pathway
  layout; v49 does not require print support.

## 6. Files touched (Wave 49-1)

```
docs/spec-v49.md                          (this file)
lib/pathway.js                            (new: pathway runtime)
lib/meta.js                               (+ 5 pathway META entries with `kind: 'pathway'`)
app.js                                    (+ Group P; +5 UTILITIES rows)
views/group-p.js                          (new: pathway renderer)
test/unit/pathway.test.js                 (new: runtime + per-pathway evaluation tests)
docs/audits/v11/<pathway-id>.md           (per-pathway audit log: citation re-verify, step-by-step rule re-verify)
docs/scope-mdcalc-parity.md               (catalog count 254 → 259)
CHANGELOG.md                              (Unreleased: v49 entry)
README.md                                 (catalog count 254 → 259; +1 sentence on Pathways)
package.json                              (description count 254 → 259)
```

Wave 49-1 ships the five pathways above as a single set. Future
waves (49-2, 49-3...) add additional pathways: ACS NSTEMI
management, AKI workup, AMS workup, alcohol-withdrawal CIWA →
escalation, pediatric DKA, etc. Each future pathway is a separate
spec wave with its own audit log.

## 7. Acceptance criteria

v49 wave 49-1 is fully shipped when:

- This file exists.
- `lib/pathway.js` exports `evaluatePathway` and `nextStep` and
  is fully covered by unit tests.
- The 5 pathways listed in §4 are present in `META`, registered
  in Group P, render correctly through `views/group-p.js`, and
  each has ≥ 3 boundary worked examples in
  `test/unit/pathway.test.js` covering: low/terminal-branch,
  high/terminal-branch, mid-path gate evaluation.
- Each pathway has an audit log in `docs/audits/v11/`.
- `UTILITIES.length` is 259.
- `npm run lint`, `npm run test`, `npm run sbom`, and
  `npm run build` all pass.
- The catalog-truth check from [spec-v46](spec-v46.md) is green
  with the new count.
- The CHANGELOG records v49 with the +5 delta.

## 8. Out of scope for v49

- **Pathways that do not have a published guideline.** Sophie's
  pathways are guideline scaffolds, not original chains. A
  scenario without a citation cannot ship as a pathway.
- **Pathways that recommend interventions Sophie does not
  compute.** "Administer 1L NS" is an intervention. Sophie's
  pathway may *name* the intervention as the guideline-quoted
  next-step text, but the tile itself does not become an order
  set.
- **EHR integration.** Out of scope per the v10 dependency
  budget; Sophie remains a static, client-side site.
- **Conditional pathways that require time-series inputs**
  (e.g., trending lactate every 2 hours). Pathways are evaluated
  at a single point in time; multi-timepoint trending is a
  future spec.
- **Pediatric and neonatal pathway tiles.** Future spec waves
  may extend Group P into pediatrics; v49 ships adult pathways
  only.
- **Cross-pathway navigation** ("from the stroke pathway, jump
  to the chest-pain pathway when MI is suspected"). Each pathway
  is independent in v49.

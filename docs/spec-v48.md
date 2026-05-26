# spec-v48.md — Derivation layer: per-tile "where does this come from?"

> Status: proposed (2026-05-22). v48 is a feature spec that
> turns Sophie into a teaching reference without leaving
> deterministic ground. It adds **zero new tiles** but adds an
> optional structured `derivation` field to every tile's
> `META[id]` entry, plus a renderer that turns it into a
> collapsed "where does this come from?" block under the
> calculator. For tiles whose math is additive (Wells, NEWS2,
> qSOFA, CHA₂DS₂-VASc, HEART, HAS-BLED, etc.) the renderer
> evaluates the current inputs and shows the *step-by-step
> derivation* of the result. That evaluation is itself a
> computed output, so the scope test ([spec-v29](spec-v29.md)
> §3) is preserved.
>
> Catalog effect at v48 close: **254 tiles unchanged.**
>
> Every prior spec (v4 through v47) remains in force.

## 1. Why v48 exists

Sophie cites its sources. Today every tile carries a primary
citation in `META[id].citation` and a per-spec-v11 audit log in
`docs/audits/v11/<tile-id>.md`. That answers *where* the math
lives. It does not answer *what the math is* without the user
opening the cited paper.

The audiences Sophie now serves include:

1. **The CCRN / CEN / PCCN nurse studying for certification.** The
   exam asks for both the score *and* the boundary table that
   defines the bands. The boundary table lives in the paper, not
   on Sophie.
2. **The medical or nursing student.** Sees a number, doesn't
   yet have the intuition for what it means; the citation is a
   paywall hop.
3. **The clinician auditing a surprising result.** Sees Wells
   score 4 when she expected 3; needs to see which sub-score
   contributed what without re-deriving on paper.
4. **The educator at a residency program.** Wants a deterministic
   reference she can put on a slide; "see Sophie's derivation
   panel" is a stronger artifact than "see the paper."

v48 turns Sophie from an answer-spitter into a teaching
reference. The derivation block is collapsed by default
(zero impact on bedside-shift speed) and quotes verbatim from the
citation (no editorial paraphrase). When the user has entered
inputs, the block also expands to show how those specific inputs
sum to the displayed result — the *computed* half.

## 2. Non-goals

- **No clinical interpretation drift.** Derivation text quotes
  verbatim from the citation or the official tool publication.
  No paraphrase, no editorial gloss, no "in plain English"
  rewrite that could subtly diverge from the source.
- **No new tiles.** v48 extends every existing tile; it does
  not add a tile category.
- **No LaTeX or MathJax.** Plain-text math notation only
  (e.g., `eGFR = 175 × (Scr)^-1.154 × (Age)^-0.203 × 0.742 (if female)`).
  Sophie's dependency budget ([spec-v10](spec-v10.md) §2.2)
  forbids the bundled-math-rendering path.
- **No collapsible nesting beyond depth 1.** One `<details>`
  block per tile; no sub-collapses inside it. Keeps the read
  surface flat.
- **No retroactive enforcement.** Backfill is per-wave; a tile
  without a derivation block still ships. Eventually every tile
  should have one, but v48 does not block existing waves on it.

## 3. The `derivation` schema

A new optional field on `META[id]`:

```js
derivation: {
  formula: string,       // verbatim formula or threshold table from the citation
  components?: Array<{   // ONLY for additive-scoring tiles; see §4
    inputKey: string,    // matches the input field name in the tile
    label: string,       // verbatim sub-criterion text from the citation
    points: number | ((value) => number),  // contribution
  }>,
  bands?: Array<{        // ONLY for tiles with banded interpretation
    range: [number, number] | { op: '>=' | '<=' | '<' | '>', value: number },
    label: string,       // band name verbatim from citation
    action?: string,     // verbatim guidance from citation, if any
  }>,
  population: string,    // who the original study cohort was
  units: Record<string, string>,  // unit per variable in formula
  validity: string,      // limits of validity verbatim from citation
  source: string,        // re-quoted from citation; not paraphrased
}
```

Every field except `components` and `bands` is required when
`derivation` is present.

## 4. The renderer

A new helper `renderDerivation({ meta, currentInputs, computedResult })`
in [lib/derivation.js](../lib/derivation.js) (new file). Picks up
`META[id].derivation` if present and emits, below the result block:

```html
<details class="tile-derivation">
  <summary>Where does this come from?</summary>
  <section>
    <h4>Formula</h4>
    <pre>{formula}</pre>
    <h4>Original population</h4>
    <p>{population}</p>
    <h4>Limits of validity</h4>
    <p>{validity}</p>
    <h4>Source</h4>
    <blockquote>{source}</blockquote>
  </section>
  <!-- if components present and currentInputs filled: -->
  <section class="tile-derivation-steps" aria-live="polite">
    <h4>Your inputs</h4>
    <ol>
      <li>+3 — clinical signs of DVT (input: yes)</li>
      <li>+1.5 — alternative diagnosis less likely (input: yes)</li>
      ...
      <li><strong>Total: 4.5 → high-probability band per Wells 2003</strong></li>
    </ol>
  </section>
</details>
```

The step-by-step section is the **computed output** half of v48:
it consumes the current inputs and the canonical components from
META, and produces the per-step contribution list. The list is
re-rendered on every input change via the existing `aria-live`
plumbing.

The block is closed by default (`<details>` without `open`),
which means zero pixels added to the bedside-shift surface
unless the user expands it.

## 5. Backfill plan

v48 ships in waves; backfill is mechanical and parallelizable.

### Wave 48-1 — Schema + renderer + first 12 tiles

Land the schema, the renderer, the test infrastructure, and the
first 12 backfilled tiles (chosen for high cross-audience use):

1. Wells DVT                 *(shipped 48-1b)*
2. Wells PE                  *(shipped 48-1a)*
3. PERC                      *(shipped 48-1b)*
4. HEART                     *(shipped 48-1b)*
5. TIMI (UA/NSTEMI)          *(shipped 48-1b)*
6. CHA₂DS₂-VASc              *(shipped 48-1b)*
7. HAS-BLED                  *(shipped 48-1b)*
8. qSOFA                     *(shipped 48-1a — qSOFA half of the `qsofa-sofa` tile)*
9. NEWS2                     *(shipped 48-1c — context-aware callbacks for SpO2 Scale 1/2)*
10. SOFA                     *(shipped 48-1c — second derivation block on the `qsofa-sofa` tile via `derivationSofa`)*
11. Glasgow Coma Scale       *(shipped 48-1a)*
12. MELD-Na                  *(shipped 48-1c — MELD-3.0 on `meld-childpugh`, formula-only block)*

Each of these has a published additive scoring table, so the
`components` field is populated and the step-by-step renderer
is exercised end-to-end.

#### Wave 48-1a (shipped 2026-05-25) — Infrastructure + 3 pilot tiles

Landed the schema, the renderer (`lib/derivation.js`), the
in-process test harness (`test/unit/derivation.test.js`), and
populated `META.derivation` + a per-tile provenance log
(`docs/audits/v48/<id>.md`) for **3** tiles drawn from the §5
list: `wells-pe`, `gcs`, and the qSOFA half of `qsofa-sofa`.
Each pilot has components that sum to the existing computed
score at three boundary points, bands that match the published
cutoffs, and a verbatim source quote. The renderer is wired
into `views/group-g.js` for these three tiles only; the
remaining nine tiles in the §5 list retain their existing
META/views and are backfilled in wave 48-1b.

Wave 48-1b will backfill: Wells DVT, PERC, HEART, TIMI,
CHA₂DS₂-VASc, HAS-BLED, NEWS2, the SOFA half of `qsofa-sofa`,
and MELD-Na. The infrastructure is unchanged between 1a and 1b;
1b is a mechanical extension.

#### Wave 48-1b (shipped 2026-05-25) — 6 additive-boolean tiles

Backfilled six tiles from the §5 list whose scoring is purely
additive-boolean (or additive with per-component banded
integers, in the HEART case): `wells-dvt`, `chads`
(CHA₂DS₂-VASc), `hasbled`, `perc`, `timi`, and `heart`. Each
landed META.derivation entry has components matching the
published point table, bands matching the published cutoffs,
verbatim source quote, and a corresponding audit log under
`docs/audits/v48/<id>.md`. Renderer is wired into
`views/group-g.js` for all six. Twenty-seven additional unit
tests in `test/unit/derivation.test.js` assert
components-sum-equals-computed-score at two or three boundary
points per tile (including the −2 subtractive criterion in
Wells DVT and the per-component clamping in HEART).

NEWS2, SOFA (the second half of `qsofa-sofa`), and MELD-Na are
deferred to wave 48-1c because each needs an infrastructure
extension that is out of scope for the mechanical backfill:
- **NEWS2** uses per-variable banded points (RR < 8 → 3 pts,
  9-11 → 1 pt, 12-20 → 0 pts, …) — the current
  `lib/derivation.js scoreComponent` passes only the value to
  the `points` callback, so the scale-2 SpO₂ branch (which
  depends on `onO2`) cannot be expressed without a renderer
  change to pass the full inputs object as a second argument.
- **SOFA** is additive (each of 6 organs contributes 0-4
  points), but the existing `qsofa-sofa` derivation block only
  describes qSOFA; surfacing a second block on the same tile
  needs a `derivations: [...]` array in META and a small
  renderer change to walk it.
- **MELD-Na** is a log-based regression formula, not additive.
  It can ship as a formula-only block (no `components`) once
  wave 48-1c lands.

#### Wave 48-1c (shipped 2026-05-25) — NEWS2, SOFA, MELD-3.0; closes wave 48-1

Closes the §5 wave-48-1 list. Three small infrastructure
extensions land first, then the three remaining tiles:

- `lib/derivation.js scoreComponent(c, value, inputs)`:
  callbacks now receive the full inputs object as the second
  argument. Pre-existing single-arg callbacks (wave 48-1a + 1b)
  are unaffected — they ignore the second parameter.
- `META.<id>.derivationSofa` pattern: a second derivation block
  on a single tile is delivered via a sibling field (no schema
  change to the `derivation` block itself). The view layer
  calls `renderDerivation({ derivation: META[id].derivationSofa })`
  for the second block.
- Formula-only blocks: the renderer already no-oped when
  `components` was missing; wave 48-1c is the first wave to
  ship a tile (MELD-3.0) that uses that branch in production.

Tiles backfilled in 48-1c:
- **NEWS2** — full components with banded per-variable
  callbacks. The SpO2 callback reads `scale2` and `onO2` from
  the inputs object to choose between Scale 1 and Scale 2 with
  the supplemental-O2 modifier per RCP 2017 Table 1.
- **SOFA** — second derivation block on `qsofa-sofa` via
  `derivationSofa`. Six organ systems, each accepting a
  pre-graded 0-4 value (clamped on the way in).
- **MELD-3.0** — formula-only block on `meld-childpugh`. Kim
  2021 log-linear regression in `formula` text; no components
  because the formula is not additive.

Twenty additional unit tests in `test/unit/derivation.test.js`
verify components-sum-equals-computed-score at boundary points
including the Scale-2 SpO2 / on-O2 path for NEWS2 and the
clamped 0-4 path for SOFA, plus a schema test asserting
MELD-3.0 ships as formula-only.

Wave 48-1 is now complete (all 12 §5 tiles backfilled).
Subsequent v48 waves (48-2 acute-care, 48-3 nursing-floor,
48-4+ long-tail) backfill the remaining catalog per §5.

### Wave 48-2 — Acute care / ICU bedside extension

Backfill another ~30 tiles in the ICU / ED / acute-care surface:
APACHE-II (where applicable), CIWA-Ar, RASS, CAM-ICU, PADIS-pain
proxies, FOUR Score, Centor / McIsaac, PSI/PORT, CURB-65, etc.

#### Wave 48-2a (shipped 2026-05-25) — CURB-65, Centor/McIsaac, CIWA-Ar, FOUR Score

Opens wave 48-2 with four widely-used acute-care tiles. All
land as derivation blocks with components matching the
published point tables, including the second-block pattern
for the Centor tile (Centor 1981 + McIsaac 1998 age modifier
via `derivationMcisaac`). 16 new unit tests at three boundary
points each, plus the age-modifier path on McIsaac.

Subsequent wave 48-2 waves (48-2b, 48-2c…) will continue the
acute-care backfill: RASS, CAM-ICU, PADIS-pain proxies, APACHE-II
(where additive), Ranson / BISAP, GUSS, COWS, etc.

#### Wave 48-2b (shipped 2026-05-25) — BISAP, COWS, ICDSC, 4AT

Four additive screens. BISAP lands as the primary `derivation`
block on `ranson-bisap` (the contemporary 24-h bedside score;
Ranson's two-time-point 11-criterion structure stays as the
existing checkbox UI math, with `derivationRanson` as a
candidate for a later wave). COWS, ICDSC, and 4AT each ship as
straight additive blocks — COWS with per-item anchor levels
(0/1/2/4, 0/3/5, etc.), ICDSC with 8 binary items, 4AT mixing
binary 0/4 items with two 0/1/2 callbacks for AMT4 and
attention.

20 new unit tests at multiple boundary points per tile. No
infrastructure changes.

Wave 48-2 remains open. Subsequent waves continue the
acute-care backfill (CAM-ICU as algorithm-only, APACHE-II where
additive, etc.).

#### Wave 48-2c (shipped 2026-05-25) — PSI, CPOT, BPS, GUSS

Four more acute-care tiles. Mix of additive (CPOT 0-2 × 4
behaviors, BPS 1-4 × 3 behaviors), additive-with-callbacks
(PSI: 19 components including sex-aware age and 7 optional-lab
callbacks), and formula-only (GUSS, staged dysphagia screen).

- `lib/meta.js`: derivation blocks for `psi` (PSI/PORT — adds
  the sex-aware age callback via the second-argument-to-
  callbacks pattern from wave 48-1c, plus 7 optional-lab
  callbacks that early-return 0 when input is null), `cpot`,
  `bps`, and `guss` (formula-only following the MELD-3.0
  precedent because GUSS's staged gating is not faithfully
  representable in an additive components array).
- `views/group-g.js`: renderer wired into all four tile views.
- `docs/audits/v48/psi.md`, `cpot.md`, `bps.md`, `guss.md`:
  per-tile provenance logs.
- `test/unit/derivation.test.js`: +14 cases including the
  sex-aware age callback (M=age, F=age−10) and the
  optional-lab null-handling on PSI.

### Wave 48-3 — Nursing-floor / rehab / behavioral extension

Backfill the Braden, Morse Falls, Barthel, Katz, Lawton, MEOWS,
PHQ-9, GAD-7, C-SSRS, CAM, NIHSS, ROSIER, CPSS, LAMS, RACE, GUSS
surfaces.

#### Wave 48-3a (shipped 2026-05-25) — Braden, Morse Falls, Lawton IADL, Katz ADL

Four nursing / geriatric assessment tiles opening wave 48-3.
All ship as additive derivation blocks; no infrastructure
changes.

- **Braden** (Bergstrom 1987): 6 ordinal items, range 6-23.
  The friction component uniquely clamps to 1-3 (not 1-4);
  the Sophie callback enforces this.
- **Morse Falls** (Morse 1989): 6 weighted items including
  three string-valued callbacks for tri-level select inputs
  (ambulatory aid, gait, mental status).
- **Lawton IADL** (Lawton & Brody 1969): 8 binary items
  (modern unisex form; the original 1969 sex-stratified
  variant is NOT implemented by design).
- **Katz ADL** (Katz 1963): 6 binary items. Sophie collapses
  the original A-G letter grading into the contemporary
  discharge-planning stratification.

11 new unit tests covering multiple boundary points per tile,
including the Braden friction clamp and Morse Falls'
tri-level string callbacks.

Wave 48-3 remains open. PHQ-9 / GAD-7 (which use the
`renderScreener` helper rather than the per-tile-renderer
pattern) are candidates for a later wave that touches
`lib/screener.js`.

#### Wave 48-3b (shipped 2026-05-25) — Barthel, ROSIER, CPSS, LAMS

Four more rehab / stroke-recognition tiles. All ship as
additive blocks; no infrastructure changes.

- **Barthel Index** (Mahoney 1965 + Shah 1989 bands): 10
  weighted ADL items with published closed-value sets per
  item (0/5/10 or 0/5/10/15); total 0-100.
- **ROSIER** (Nor 2005): 7 binary items with mixed +1 / −1
  weights (2 stroke-mimic items subtract; 5 focal-deficit
  items add). Range −2 to +5.
- **CPSS** (Kothari 1999): 3 binary items; "score" is the
  count of abnormal items (positive screen at ≥1). The
  derivation block's components sum equals
  `cpss().abnormalCount` (the function returns
  `abnormalCount`, not `score`).
- **LAMS** (Llanes 2004 + Nazliel 2008 threshold): 3 motor
  items (range 0-5), LVO threshold ≥4.

13 new unit tests covering boundary points per tile,
including the ROSIER mimic-subtraction path.

#### Wave 48-3c (shipped 2026-05-26) — NIHSS, RACE, MEOWS, SOS

Four more tiles. Mix of additive and formula-only.

- **NIHSS** (Brott 1989): 13 components in the Sophie tile
  (motor arm L+R and motor leg L+R are entered as per-side
  sums). Range 0-42.
- **RACE** (Pérez de la Ossa 2014): 5 NIHSS-derived items,
  range 0-9, LVO threshold ≥5.
- **MEOWS** (Singh 2012): formula-only — track-and-trigger
  with per-parameter yellow/red flags and OR/AND trigger
  logic (not faithfully representable as additive sum).
- **SOS** (Ista 2009): 15 binary symptom items over the prior
  4-hour window, range 0-15, withdrawal cutoff ≥4.

18 new unit tests covering boundary points per tile.

#### Wave 48-3d (shipped 2026-05-26) — PHQ-9, GAD-7, CAM, C-SSRS

Four more behavioral / cognitive screens with infrastructure
work on the screener side. Closes the additive-screen portion
of wave 48-3; remaining work is mostly long-tail catalog tiles
under wave 48-4+.

- **lib/screener.js**: `renderScreener` now accepts an optional
  `opts.onUpdate(answers, score, band)` callback. The
  PHQ-9 / GAD-7 tile views use it to update the derivation
  steps every time a radio toggles, without re-rendering the
  whole `<details>` block (preserving the user's open/closed
  state).
- **PHQ-9** (Kroenke 2001): 9 items × 0-3 = range 0-27, 5
  severity bands. Component `inputKey`s are the item *index*
  as a string (`'0'`-`'8'`) — the tile converts the screener's
  numeric-indexed answers array into a keyed input object for
  the derivation renderer.
- **GAD-7** (Spitzer 2006): 7 items × 0-3 = range 0-21, 4
  severity bands.
- **CAM** (Inouye 1990): formula-only — algorithmic
  `(F1 AND F2) AND (F3 OR F4)`, not additive.
- **C-SSRS Screener** (Posner 2011): formula-only — logic-based
  band stratification (HIGH/MODERATE/LOW/NONE), not additive.

4 new provenance logs under `docs/audits/v48/`. 12 new unit
tests including the screener-indexed component sums for PHQ-9
and GAD-7 and formula-only schema asserts for CAM and C-SSRS.

### Wave 48-4+ — Long-tail

Backfill the remaining tiles in subsequent maintenance waves. A
tile without `derivation` is *legal* (the renderer no-ops) but
the maintainer dashboard surfaces an "% derivation-backfilled"
metric so the long tail does not get lost.

#### Wave 48-4a (shipped 2026-05-26) — ATRIA Bleeding, Hendrich II, FLACC, AUDIT-C

Opens wave 48-4 (long-tail backfill) with four additive tiles
that round out the major bedside-decision surfaces (alongside
the AF / fall / pediatric-pain / addiction-screen instruments
already shipped in earlier waves):

- **ATRIA Bleeding** (Fang 2011): 5 weighted criteria, range
  0-10, companion to HAS-BLED and ORBIT (other Sophie tiles).
- **Hendrich II Fall Risk** (Hendrich 2003): 8 weighted items
  including a string-valued get-up-and-go callback (able / 
  pushes-up / needs-help / unable → 0 / 1 / 3 / 4). Companion
  to Morse Falls (wave 48-3a).
- **FLACC** (Merkel 1997): 5 behaviors × 0-2; pediatric pain
  for nonverbal kids. Companion to PAINAD (adult dementia).
- **AUDIT-C** (Bush 1998): screener-based, 3 items × 0-4,
  range 0-12. Sex-specific cutoff documented in bands.

15 new unit tests covering boundary points per tile, including
the Hendrich II tri-level get-up-and-go callback and the
AUDIT-C screener-indexed sums.

#### Wave 48-4b (shipped 2026-05-26) — ORBIT Bleeding, PAINAD, CAGE, Mini-Cog

Four more long-tail tiles spanning bleeding / pain / addiction /
cognition. No infrastructure changes.

- **ORBIT Bleeding** (O'Brien 2015): 5 weighted criteria,
  range 0-7. Bleeding-risk companion to ATRIA / HAS-BLED.
- **PAINAD** (Warden 2003): 5 behaviors × 0-2 = range 0-10.
  Adult-dementia analog of FLACC; same 0/1-3/4-6/7-10 bands.
- **CAGE** (Ewing 1984): screener-based, 4 binary items,
  range 0-4. Mnemonic CAGE; cutoff ≥2.
- **Mini-Cog** (Borson 2000): 2 components — 3-word recall
  (0-3) + clock-draw (0 or 2); total 0-5; cutoff <3 positive.

13 new unit tests covering boundary points per tile.

#### Wave 48-4c (shipped 2026-05-26) — EPDS, MEWS, COMFORT-B, WAT-1

Four more long-tail tiles spanning perinatal mental health,
early-warning vitals, and pediatric ICU sedation / withdrawal.

- **EPDS** (Cox 1987): screener-based, 10 items × 0-3, range
  0-30. Perinatal depression screen; Q10 self-harm is a
  critical-action flag.
- **MEWS** (Subbe 2001): 5 banded per-parameter callbacks
  (SBP / pulse / RR / temp / AVPU). Predecessor to NEWS2.
- **COMFORT-B** (van Dijk 2005): 6 items × 1-5 = range 6-30.
  PICU sedation; minimum aggregate 6 because every item starts
  at 1.
- **WAT-1** (Franck 2008): 10 binary items + 1 banded-recovery-
  minutes callback (<2 → 0, 2-5 → 1, >5 → 2). Range 0-12;
  cutoff ≥3.

20 new unit tests including parameterized loops over the MEWS
AVPU callback and the WAT-1 recovery-minutes callback.

#### Wave 48-4d (shipped 2026-05-26) — STOP-BANG, 4Ts, ABCD2, RCRI

Four more long-tail tiles spanning preoperative / acute-care
risk stratification. No infrastructure changes.

- **STOP-BANG** (Chung 2008 / 2012): 8 binary items, range 0-8.
  Preoperative OSA screen widely used by perioperative nursing
  and anesthesia teams.
- **4Ts** (Lo 2006): 4 domains × 0-2, range 0-8. Pretest
  probability score for heparin-induced thrombocytopenia;
  callback-clamped to mirror `fourTsClamp` in `lib/scoring-v4.js`.
- **ABCD2** (Johnston 2007): 5 features, range 0-7. TIA stroke
  risk. The B (blood-pressure) component reads `inputs.dbp` via
  the second-arg-to-callback pattern (wave 48-1c) so the
  SBP≥140 OR DBP≥90 rule fires on either limb.
- **RCRI** (Lee 1999): 6 binary risk factors, range 0-6.
  Preoperative cardiac risk index for major noncardiac surgery;
  Class I-IV bands map to the published major-cardiac-event
  rates (0.4%, 0.9%, 6.6%, ≥11%).

14 new unit tests covering boundary points per tile, including
the ABCD2 DBP-alone-meets-threshold path and the 4Ts 0-2 clamp.

## 6. Testing requirements

For every tile with a `derivation` block, the test suite asserts:

1. **Schema completeness.** All required fields present, types
   correct.
2. **Citation source-quote.** The `source` field is checked to
   be a substring of the tile's audit log or of an inline string
   in the test file (the maintainer's verification trail).
3. **Components sum.** For tiles with `components`, the sum of
   the per-input contributions on the canonical worked example
   equals the computed score.
4. **Renderer no-leak.** Toggling open / closed does not modify
   any input value or computed result.
5. **A11y.** The `<details>`/`<summary>` pair is announced by
   the existing a11y harness; `aria-live="polite"` on the steps
   list is present.

## 7. Files touched (across waves)

```
docs/spec-v48.md                          (this file; wave 48-1)
lib/derivation.js                         (new: renderer)
lib/meta.js                               (+ derivation field per backfilled tile)
views/group-*.js                          (+ derivation render call)
test/unit/derivation.test.js              (new: schema + renderer tests)
test/unit/<tile>.test.js                  (+ derivation cases per backfilled tile)
docs/audits/v48/<tile-id>.md              (new: per-tile derivation provenance log; mirrors v11 audits)
CHANGELOG.md                              (Unreleased: v48 wave entries)
README.md                                 (one-line note: derivation layer)
```

## 8. Acceptance criteria

v48 wave N is fully shipped when:

- This file exists (wave 48-1 only).
- `lib/derivation.js` exports `renderDerivation` and is imported
  by every group view that owns a backfilled tile.
- The wave's backfilled tiles each have a complete `derivation`
  block in `META`, a corresponding `docs/audits/v48/<id>.md`
  provenance log, and the §6 test cases.
- `npm run lint`, `npm run test`, `npm run sbom`, and
  `npm run build` are all green.
- The CHANGELOG records the wave with the per-tile list.

## 9. Out of scope for v48

- **Paraphrased or simplified explanations.** Sophie does not
  ship clinician-voiced "plain English" rewrites of validated
  formulas. The derivation is the citation, verbatim.
- **Rendered formulas with mathematical typesetting.** Plain text
  only. A future spec may add a build-step LaTeX→PNG fallback
  if a maintainer commits to the dependency budget impact; v48
  does not.
- **Tile lineage / "this score is descended from X."** Useful but
  separate; out of scope.
- **Population-level derivation** (e.g., the original ROC analysis
  that picked the cutoff). The `source` field can quote a
  cutoff-derivation paragraph if it appears in the primary
  citation, but Sophie does not re-derive cutoffs from cohort
  data.
- **Per-input rationale popovers** (hovering over "alternative
  diagnosis less likely" to see how Wells defined it). Useful
  but a separate spec; not in v48.

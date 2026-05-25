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

1. Wells DVT
2. Wells PE                  *(shipped 48-1a)*
3. PERC
4. HEART
5. TIMI (UA/NSTEMI)
6. CHA₂DS₂-VASc
7. HAS-BLED
8. qSOFA                     *(shipped 48-1a — qSOFA half of the `qsofa-sofa` tile)*
9. NEWS2
10. SOFA
11. Glasgow Coma Scale       *(shipped 48-1a)*
12. MELD-Na

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

### Wave 48-2 — Acute care / ICU bedside extension

Backfill another ~30 tiles in the ICU / ED / acute-care surface:
APACHE-II (where applicable), CIWA-Ar, RASS, CAM-ICU, PADIS-pain
proxies, FOUR Score, Centor / McIsaac, PSI/PORT, CURB-65, etc.

### Wave 48-3 — Nursing-floor / rehab / behavioral extension

Backfill the Braden, Morse Falls, Barthel, Katz, Lawton, MEOWS,
PHQ-9, GAD-7, C-SSRS, CAM, NIHSS, ROSIER, CPSS, LAMS, RACE, GUSS
surfaces.

### Wave 48-4+ — Long-tail

Backfill the remaining tiles in subsequent maintenance waves. A
tile without `derivation` is *legal* (the renderer no-ops) but
the maintainer dashboard surfaces an "% derivation-backfilled"
metric so the long tail does not get lost.

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

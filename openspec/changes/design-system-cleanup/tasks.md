# Tasks — design-system cleanup

Presentation-only. No task may change a computed value, threshold, citation, example,
MCP adapter, catalog count, or deep-link hash. After every wave: `npm run lint`,
`npm test`, `npm run test:mobile`, and confirm byte-identical reproduction.

## 0. Guard rails first (ship before any migration)

- [x] 0.1 Add `design-conformance-probe.spec.js` (non-asserting finder): list every raw
      `<input type="file">` not inside a `.dropzone`, every interpretation band rendered as
      color-only, every inline `style=` attribute in a view, and every spacing/radius value in
      `styles.css` that is not a token. This sizes the later waves.
- [x] 0.2 `scripts/check-design-system.mjs` (in `npm run lint`, asserting): views emit no
      inline `style=` and no per-tile `<style>`, no file input sits off the dropzone card, and
      no view hand-builds a status chip. All three were clean when it landed.
- [x] 0.3 `test/unit/design-components.test.js`: `statusChip()` carries the band word, and a
      band authoring a severity with no label renders no chip rather than a wordless one.
      The gate above keeps `.chip--status` reachable only through that builder.

## 1. Shared component classes in `styles.css` (tokens only, no view touched)

- [x] 1.1 `.chip` base + modifiers: `.chip--filter` (toggle, `aria-pressed`), `.chip--status`
      (severity tokens), `.chip--input` (removable, ✕), `.chip--assist`. Pill radius, ≥44px tap,
      teal hover, focus ring. Generalize the existing `.hero-chip` onto the base.
- [x] 1.2 `.segmented` radiogroup control: 2–4 options, one row at 320px, `role=radiogroup`.
- [x] 1.3 `.stat` grid: big value + caption cells; primary value largest; wraps at 320px.
- [x] 1.4 `.dropzone` card: dashed border, icon, hint, `drop-active`, file-chip list; wraps the
      native input.
- [x] 1.5 Shared states: `.skeleton`/progress, `.empty-state`, field error pattern
      (`aria-invalid` + live-region line). Severity tokens added to `:root` + light theme, AA in both.
- [x] 1.6 Done one level down instead, in the two shared renderers (`lib/result-copy.js`,
      `lib/screener.js`), so a tile opts in where it already builds its result and
      `renderToolView` stays untouched.

## 2. File readers → `.dropzone` (archetype B)

- [x] 2.1 `views/upload-workbench.js`: render the dropzone card around the existing input;
      worker-parse path, column confirmation, and 50 MB limit unchanged.
- [x] 2.2 `views/intake.js` / `views/home-files.js`: the drop front door uses the same dropzone
      surface and file-chip list; folder/zip routing unchanged.
- [x] 2.3 Migrate the ~9 upload tiles (`views/group-v15xx.js`, the X12 readers, HPT/TiC/file
      checks) to the shared dropzone. Add the determinate parse-progress state (D6).
- [x] 2.4 Confirm no upload tile keeps a bare native input (probe 0.1 clean for file inputs).
      Clean as of wave 2b: the probe reports 0 raw file inputs and 0 inline styles in views.

## 3. Calculators → modern components (archetype A)

- [x] 3.1 Band-outputting tiles (starter set shipped; rollout continues per tile): show `.chip--status` on the answer card using the band the tile
      already computes (D4). No new thresholds. Text label always present.
      Chip batch 4 takes the cleanest remaining shape: a compute that already returns an
      ordinal `tier` at its published cut, so the view maps that tier to a severity token and
      authors nothing. Six tiles (Heckerling, ORT, AUSDRISK, Pederson, Loe-Silness, ISI). Where
      the tile also printed the tier as a `Risk:`/`Severity:` list row, the chip takes that row
      over rather than saying it twice -- safe because each band sentence already states the
      tier word, so the copy payload still carries it. `test/unit/chip-severity-maps.test.js`
      holds every map to its compute's tier set: a missed tier renders NO chip for exactly the
      patients in it and nothing else fails, so it needs a gate rather than a reading.
      `check-design-system.mjs` now also counts the chips authored on a band item, which it had
      been reporting as absent (9 direct; 18 in total).
      Chip batch 5 took the same shape to 14 more (K6, PHQ-15, SAD PERSONS, McMahon, BEWE, OSI,
      Cobb angle, HHIE-S, SMAST, MELD 3.0, qCSI, elemental iron, phi, Forrest), 32 chips in all.
      The token comes from the tier's RANK inside its own instrument, not from matching the
      tier's word to a token of the same name: a four-tier instrument uses all four tokens so
      its own levels stay distinguishable, and the chip's label always states the authored word
      verbatim, so nothing is restated or reinterpreted. Two of the fourteen read the tier off
      `category` rather than `tier`, which the guard now checks against the compute: a lookup on
      a field the compute never fills renders no chip on every band at once.
      Not taken: ABC scale (its `high` tier is GOOD -- high physical functioning -- so a rank
      token would color a reassuring answer as severe), effective osmolality (abnormal in both
      directions, which four ordered tokens cannot say), the Edmonton Frail Scale (five tiers,
      so a collapse is a judgment call) and MIPI (the `tier` in its shared lib belongs to a
      different function in the same module).
      Chip batch 6 worked the probe's new chip list (37 calls over 21 files) and took the 7 that
      are ordinal severities: the Penetration-Aspiration Scale, revised Atlanta, the Agatston
      calcium burden, the Elderly Mobility Scale, Reimers migration, MNA-SF and the Silness-Loe
      plaque index. 39 chips in all. The rest of the list is a CATEGORY, not a severity, and a
      severity chip would invent a claim: a hazardous-waste generator class (by volume), Boston
      criteria for CAA (diagnostic certainty), Spaulding device classes (reprocessing level),
      Bethesda cytology I-VI (six tiers), the HINTS pattern, ARC-HBR's per-criterion major/minor
      weights, and Caton-Deschamps (alta/normal/baja -- abnormal in both directions). PECARN is
      ordinal but already states its tier as the answer heading, so a chip would only repeat it.
      Chip batch 7 opens the next shape: a compute with no `tier` field at all, but whose own band
      helper assigns an ordered severity WORD (`label: 'low risk'`, `stage: '2'`). Keying on that
      is the same authoring the first Wells chip used, and 24 libs have it. Four shipped: the
      USC/VNPI, the Rassi score, PROPKD and Sarnat staging. The guard takes an optional fourth
      entry naming the lib field whose literals are the tier set, so it still holds each map to
      its compute. Left in this shape: the instruments with an UNASSIGNED state (global ARDS
      severity can be "none assigned", SNOT-22 has no named band below 8, GAGS leaves 39
      unassigned) -- a chip there must be absent for exactly those answers, which needs a per-tile
      reading rather than a sweep.
      **Where the rollout stops, and why it is an owner call.** The mechanical shapes are spent:
      every compute that hands the view an ordinal tier, and the four whose band helper assigns an
      ordered severity word with no unassigned state, now carry a chip. What is left needs a
      judgment about the INSTRUMENT, not about the code, and each one read differently when
      checked:
      - SNOT-22 and GAGS are chippable but need the guard to accept a DELIBERATELY unmapped value.
        Both model their gap honestly already (SNOT-22 returns a distinct band below 8 marked
        `named: false` and says it is "NOT the mild band"; GAGS returns `band: null` at exactly 39,
        where the published table assigns none), so the lookup yields no chip on its own. The
        guard cannot currently tell an intentional omission from a missed tier, which is the whole
        point of it, so it would need an explicit per-tile opt-out with the reason stated.
      - Global ARDS was left alone on purpose. Its own lib header says it is "a DEFINITION for
        identifying a syndrome, not a severity score", two of its four categories carry no grade
        at all, and it warns that patients move between categories during an illness. A severity
        chip on that answer argues against the tile's own copy.
      The remaining ~1,400 banded answers have no tier field, so a chip means reading a published
      cut per tile and authoring it -- the pass the owner deferred, and the one where a wrong
      colour states a clinical claim the instrument does not make.
- [x] 3.2 Short mutually-exclusive enums (sex, two-way formula toggles): convert the `<select>`
      to `.segmented` (D3). Leave long/open lists as selects. Canonical-first-option invariant kept.
- [x] 3.3 Multi-output tiles: render the secondary numbers as a `.stat` grid (D5).
      `statGrid()` + the `{ stats: true }` opt-in on `resultRow`; 30 tiles shipped over three
      batches, rollout continues per tile. The probe counts what is left; a candidate qualifies
      only when EVERY labeled row is a number (a criteria checklist or a yes/no flag is not a
      stat cell). Batch 3 also fixed the probe that sizes this wave: it read each `resultRow`
      call through a fixed 40-line window, so a single-line call never terminated and borrowed
      the `label:` rows of the tiles below it -- reporting 218 candidates where 133 existed, and
      flagging one-row calls. It now balances parentheses, and a second line applies this task's
      own bar (every labeled row a number) so a wave is pickable without hand-reading all of
      them: 122 three-row calls remain, 27 of them pickable.
      The classifier was then wrong twice, both found by reading its own list: `NUMERIC` matched
      `age` inside `stage`, and the name test only looked at a bare `r.x`, so a value carrying
      its prose in the property names, both halves read from word-valued properties, left no
      literal word behind to catch. Names are now matched by camelCase segment, and every read in the value is tested.
      That takes the pickable list from 27 to **3**, and those three are judged, not pending: the
      enoxaparin panel mixes conditional text rows into its numbers, the naloxone doses are
      strings ("0.4 mg IV") behind neutrally-named reads, and a Fazekas grade is an ordinal
      printed as a digit. Checked for the opposite error too -- stripping the opt-in off four
      shipped tiles brings all four back onto the list, so nothing real is being hidden. **The
      stat-grid rollout is complete**; what is left is the judgment calls above.
- [x] 3.4 Already held by older machinery, kept as is: the "enter a weight to calculate" line
      sits inside the answer card (a shared `.empty-state` card there would be a card in a card),
      and out-of-range input already pairs `aria-invalid` with an `aria-describedby` message in a
      polite region (spec-v1022). `.field-error` stays the pattern for new code.

## 4. Formatting-defect sweep

- [x] 4.1 The probe's two actionable categories are clean (0 inline styles, 0 raw file inputs) and
      heading order has its own chromium sweep. The 56 hex literals left in `styles.css` are
      tracked by the probe, not blocking.
- [x] 4.2 `mobile-no-hscroll` walks every tile in the sitemap at 320px and passes, which is the
      confirmation this asks for.

## 5. Specialized workbenches + turn guards on

- [x] 5.1 `pa-lint` (wave 2b) and `rx-match-workbench` (wave 2) are on the shared dropzone;
      `record-panel` already composed the shared table-scroll and card classes, so it had no
      bespoke chrome to retire.
- [x] 5.2 Inline presentation is asserted by `check-design-system.mjs` (0.2). The new
      components joined the mobile sample shapes: stat grid, segmented control and status chip
      in `mobile-no-hscroll`, and segmented options plus the dropzone's remove chip in
      `mobile-touch-targets` (both verified to fail when the component shrinks).
- [x] 5.3 `check-design-system.mjs` runs in `npm run lint`, which `release:check` runs. The shipped
      requirements are folded into [docs/spec-v1688.md](../../../docs/spec-v1688.md).

## Verification checklist (every wave)

- [x] Lint, unit (18,611), and the e2e sweeps green; `test:mobile` green at 320/360px.
- [x] Byte-identical reproduction: example-correctness and deep-link round-trip green on each wave.
- [x] MCP round-trip unchanged: 494 MCP tests green, no adapter touched.
- [x] Catalog count unchanged (check-catalog-truth, 2,362 across 13 surfaces); check-tile-copy clean.
- [x] Light and dark both pass, measured composited rather than token-on-token -- which is how
      five sub-AA pairings were found and fixed (see docs/spec-v1688.md).

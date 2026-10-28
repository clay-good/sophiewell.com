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
- [x] 3.2 Short mutually-exclusive enums (sex, two-way formula toggles): convert the `<select>`
      to `.segmented` (D3). Leave long/open lists as selects. Canonical-first-option invariant kept.
- [x] 3.3 Multi-output tiles: render the secondary numbers as a `.stat` grid (D5).
      `statGrid()` + the `{ stats: true }` opt-in on `resultRow`; 19 tiles shipped over two
      batches, rollout continues per tile. The probe counts what is left; a candidate qualifies
      only when EVERY labeled row is a number (a criteria checklist or a yes/no flag is not a
      stat cell).
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

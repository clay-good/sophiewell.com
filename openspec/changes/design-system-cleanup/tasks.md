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
- [ ] 1.6 Add the status-chip + stat-grid helpers to `app.js` `renderToolView` (optional;
      a tile opts in by passing its band/outputs — no behavior change for tiles that don't).

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
- [ ] 3.4 Zero/partial input: use the shared empty-state and error patterns; keep the
      `answer-said-once` and `one-disclaimer` guarantees.

## 4. Formatting-defect sweep

- [ ] 4.1 From probe 0.1, fix overlapping/cramped text, headings out of `h2`/`h3` order, and
      spacing/radius that bypasses the token scale, on the flagged views.
- [ ] 4.2 Wide/preview tables (X12, CSV, lookup) all sit in `.table-scroll`; confirm no view
      side-scrolls at 320px.

## 5. Specialized workbenches + turn guards on

- [ ] 5.1 `views/pa-lint.js`, `views/rx-match-workbench.js`, `views/record-panel.js`: compose the
      shared chips/cards/dropzone; retire any bespoke chrome.
- [ ] 5.2 Flip `no-inline-style.spec.js` (0.2) to asserting; add the new components to
      `mobile-no-hscroll` / `mobile-touch-targets` sample shapes.
- [ ] 5.3 Add `design-system-cleanup` to `release:check`; fold the shipped requirements back into
      a `docs/spec-v*.md` per the living-spec convention.

## Verification checklist (every wave)

- [ ] Lint, unit, and e2e green; `test:mobile` green at 320/360px.
- [ ] Byte-identical reproduction: every `META.example` and deep-link hash yields the same result.
- [ ] MCP round-trip unchanged (adapters untouched).
- [ ] Catalog count unchanged; no reader-facing house vocabulary introduced.
- [ ] Light and dark both pass contrast on any new colored element.

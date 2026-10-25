# Design system — sophiewell.com

The single source of truth for how every tool and view looks and behaves. When a
view disagrees with this file, the view is wrong. When a new pattern is needed,
add it here first, then build it.

This doc describes the system as it is shipped (tokens in `styles.css`, structure
in `app.js` `renderToolView`, the two reusable view shells) and the small set of
*modern* card/chip patterns we are standardizing on. The program that brings the
whole catalog up to this bar is `openspec/changes/design-system-cleanup/`.

## 1. Principles

- **Instrument, not chatbot.** A reader comes for one number or one answer, checks
  the inputs and the source, and leaves. Every screen reads calm and clinical at
  rest, with one cheerful teal accent reserved for the payoff and for touch.
- **Answer first, inputs second, proof collapsed.** The computed answer sits at the
  top on a tinted card; the fields are below it; citations and derivation live in a
  collapsed block. (spec-v751–v759.)
- **One shared surface.** Both interface archetypes mount through one renderer and
  one stylesheet. A fix to a shared component lifts every tile at once; per-tile
  CSS is a smell.
- **Never scroll sideways.** No view may scroll horizontally at 320px. Long,
  unbreakable tokens (DOIs, gene notations, camelCase field keys) wrap with
  `overflow-wrap: anywhere`; wide tables pan inside their own `.table-scroll` box.
- **Offline, deterministic, no framework.** Plain semantic DOM built with
  `lib/dom.js` `el()`. No runtime network, no client framework, no build-time CSS
  pipeline. Keep it that way.
- **Every control is a comfortable tap.** Primary controls are ≥44px (WCAG 2.5.5).

## 2. Tokens

All color, spacing, radius, and type values come from CSS custom properties on
`:root` in `styles.css`. Dark is the default; `[data-theme="light"]` overrides the
same names. **Never hard-code a hex, px radius, or raw spacing value in a view or a
component rule — use a token.** If a value you need is missing, add a token.

| Group | Tokens | Notes |
|---|---|---|
| Surfaces | `--bg-primary` `--bg-secondary` `--bg-tertiary` | primary = page, secondary = raised card, tertiary = inset/field |
| Text | `--text-primary` `--text-secondary` `--text-muted` | muted is for captions/receipts only, never body |
| Lines | `--border` `--border-light` | light = hover/focus border |
| Sober accent | `--accent` `--accent-hover` | monochrome chrome + focus; stays calm |
| Live accent | `--accent-pop` `--accent-pop-strong` `--accent-pop-tint` `--accent-pop-glow` | the teal; the answer, source links, hovers, success |
| Focus | `--focus-ring` (`#4d90fe`) | every focusable control shows `2px solid var(--focus-ring)` offset 2px |
| Radius | `--radius` (8) `--radius-card` (14) `--radius-pill` (999) | field/button = radius; card = radius-card; chip/badge = pill |
| Spacing | `--space-1`..`--space-7` (4/8/12/16/24/32/48) | the only spacing scale; no magic margins |
| Type | `--font-body` (system) `--font-mono` | base 17px on `html`; everything in rem so one line moves the whole scale |
| Tints/shadow | `--tint-*` `--shadow-soft` `--shadow-strong` `--logo-glow*` | |

Contrast: the teal is darker in light mode (`#0d9488`) than dark mode (`#2dd4bf`) so
chip/link text keeps AA on a near-white background. Any new colored text must pass
AA in both themes.

## 3. The two archetypes (and one variant)

Every tile is one of these. They share the `renderToolView` shell: breadcrumb →
`.tool-title-row` (h1 + "Report a problem") → `.clinical-notice` → `#tool-body` →
`.tool-meta` (example, citations, interpretation bands, related tools).

### A. Calculator — numbers, text, and dropdowns in, an answer out
- **In:** labeled inputs; numeric values paired with a unit `<select>` via
  `unitField()`/`unitNum()` in a `.unit-field-row` (first option is canonical).
  Enum/binary choices are a `<select>` today; see §5 for the segmented-control and
  filter-chip upgrades.
- **Out:** the shared `#q-results` live region renders the answer card — large bold
  value line, then context. It hides when empty and never shows a result while an
  `.ask-card` is asking for a required value.
- **Proof:** `.tool-meta` holds the worked example, citations, interpretation bands,
  and related-tool chips.

### B. File reader — drag/drop a file or folder, see output
- **In:** `uploadWorkbench()` (`views/upload-workbench.js`) for local-file intake,
  or the drop front door `views/intake.js` / `views/home-files.js`. Files are parsed
  in a worker and never leave the tab.
- **Out:** a parse receipt (`views/receipt.js`), a preview table in `.table-scroll`,
  and downloads. Same answer-card conventions apply to any computed summary line.
- **Target:** the raw native `<input type="file">` is the system's most dated
  element. §5 defines the dropzone card that replaces it.

### C. Specialized workbench (variant, not a third archetype)
A few tiles use purpose-built panels — `views/pa-lint.js`, `views/rx-match-workbench.js`,
`views/record-panel.js`. They must compose the shared components below, not invent new
chrome.

## 4. Component vocabulary (shipped)

These exist today and are the canonical building blocks. Reuse before you add.

| Component | Class | Role |
|---|---|---|
| Answer card | `#q-results:not(:empty)` | the payoff: tinted surface, left teal rule, big value line |
| Ask card | `.ask-card` / `.ask-q` / `.ask-form` | asks for one missing required value in words |
| Pick card | `.pick-card` / `.pick` | 2–3 plain-language disambiguation choices |
| Clinical notice | `.clinical-notice` | the "math aid, not a decision" line; one per tile |
| Callout | `.notice`, `.warn`, `.denial-route`, `.completeness` | structured guidance; left accent bar for flags |
| Meta block | `.tool-meta` | example, citations, interpretation/action bands, source stamp |
| Result card / list | `.result-card`, `.result-list` | grouped secondary outputs |
| Suggestion chip | `.hero-chip` | tappable example queries on the home box; pill, teal hover lift |
| Badge pill | `.all-tools-badge` `.credit-badge` `.gh-badge` | footer/nav pills |
| Related-tool chips | `.related-list` / `.related-link` | curated graph links, wrap at 320px |
| Copy button | `.copy-btn` | teal success flash on copy |
| Field + unit | `.unit-field-row` | number input flexes, unit select sizes to content |
| Table scroll | `.table-scroll` + `.lookup-table` | wide tables pan inside their box |
| Code/handoff | `pre`, `.sbar-output`, `.tile-derivation-formula` | mono, wraps, never side-scrolls |
| Disclosure | `<details>`/`summary` | collapsed proof; opens for print |

## 5. Modern card/chip set we are adopting

A restrained, Material-3-aligned chip/card taxonomy — enough to feel current, not so
much that the instrument turns decorative. Each entry says what it is and where it is
allowed. Build these as shared classes in `styles.css`, tokens only.

### Chips
| Chip | Purpose | Where | Status |
|---|---|---|---|
| **Suggestion chip** | prefill an example | home box, "try:" rows | shipped (`.hero-chip`) — make the base class reusable |
| **Filter chip** (toggle) | filter a catalog/list by one facet; multi-select | `/tools` specialty filter, long result lists | **new** `.chip--filter`, `aria-pressed` |
| **Segmented control** | pick one of 2–4 mutually exclusive options | binary/short enums (sex M/F, formula variant) in place of a `<select>` | **new** `.segmented`, radiogroup semantics |
| **Status / severity chip** | name a result band at a glance (low / moderate / high / critical) | beside the answer value when a tile outputs a band | **new** `.chip--status`, color by severity token, text label never color-only |
| **Input chip** (removable) | one dropped/added file or token, with a remove ✕ | file reader after drop; multi-file lists | **new** `.chip--input` |
| **Assist chip** | a suggested next action (e.g. "open related calculator") | under the answer card | **new**, sparingly; curated only |

Rules: chips are pills (`--radius-pill`), ≥44px tap height, teal on hover/active,
focus ring always. A **status chip never signals by color alone** — it carries a word.
Filter/segmented chips carry `aria-pressed` / radiogroup semantics so the state is
announced.

### Cards
| Card | Purpose | Notes |
|---|---|---|
| **Answer card** | the computed result | shipped; standardize the big-value + optional status-chip header |
| **Metric/stat tile** | a single labeled number in a small grid | **new** `.stat`, for multi-output tiles; big value, caption, optional delta |
| **Dropzone card** | drag/drop target for the file reader | **new** `.dropzone`: dashed border, icon, hint, `drop-active` teal state, input-chip file list — replaces the raw `<input type=file>` |
| **Choice / pick card** | disambiguation | shipped (`.pick-card`) |
| **Disclosure card** | collapsed proof (citations, derivation, receipt) | shipped; keep `<details>` open-on-print |

### States (new, shared)
- **Skeleton / progress.** Synchronous calculators need none (the answer is instant).
  The **file reader** parses in a worker, so it gets a determinate progress or
  skeleton state while parsing — never a spinner with no end.
- **Empty state.** A card with a one-line explanation and a next step (the
  zero-result "did you mean" recovery is the model), not a blank region.
- **Error state.** `aria-invalid` on the field plus a plain-language line naming what
  is wrong, in the live region; red reserved, never color-only.

## 6. Motion

Calm by default. Transitions are short (0.16–0.18s ease) and limited to color,
border, background, and a small `translateY` lift on chips/buttons. The answer region
**does not animate** — it updates on every keystroke and motion there is noise.
Buttons dip on `:active` (`translateY(1px) scale(0.985)`). Every motion rule has a
`@media (prefers-reduced-motion: reduce)` fallback that removes transforms.

## 7. Accessibility (enforced, not aspirational)

| Rule | Gate |
|---|---|
| No horizontal scroll at 320/360px, SPA + static | `mobile-no-hscroll.spec.js`, `static-pages-mobile.spec.js` |
| Primary controls ≥44px | `mobile-touch-targets.spec.js` |
| Skip link focuses `#main` | `skip-link.spec.js` |
| One answer heading, no duplicate result sentence | `answer-said-once.spec.js` |
| Exactly one clinical disclaimer per tile | `one-disclaimer.spec.js` |
| Proof prints (details open on `beforeprint`) | `print-details.spec.js` |
| Native controls match theme | `theme-color-scheme.spec.js` |
| Contrast / a11y audit | `scripts/a11y-check.mjs`, `.lighthouserc.json` |

Single `<h1>` per tool (from `renderToolView`); section headings are `<h2>`/`<h3>` in
order. Every focusable control shows the focus ring. Live regions carry results and
validation only — never static explanation.

## 8. Do / Don't

- **Do** reuse a shared class; **don't** write per-tile CSS or inline styles.
- **Do** use a token for every color/space/radius; **don't** hard-code a value.
- **Do** put the answer first on the tinted card; **don't** bury it under the fields.
- **Do** wrap long tokens and pan wide tables; **don't** let any view side-scroll.
- **Do** carry a word on every status chip; **don't** signal by color alone.
- **Do** keep motion short and reduced-motion-safe; **don't** animate the answer.
- **Do** keep house vocabulary ("tile", "catalog", spec numbers) out of reader-facing
  copy.

# spec-v8.md — sophiewell.com: minimal-tile contract + prompt-first front door

> Status: proposed. Extends spec-v5, spec-v6, and spec-v7 without
> amending their hard rules. Collapses the per-tile surface to four
> regions (title / description / inputs with example values /
> references with citations) and removes every affordance that implies
> persistence, social sharing, or bundle-style portability. Sharpens
> the front-door prompt bar into the single dominant entry point.
> Mirrors a parallel simplification on roughlogic.com (see §9).

## 1. Purpose

v6 added the task hero. v7 added artifact-first routing, the synonym
table, and the collapsed tile grid. v8 finishes the simplification
arc: it strips every per-tile control that is not load-bearing on
"answer the question the user came here with," and it commits the
front-door to a single prompt entry point.

The thesis is the same one driving the roughlogic.com cleanup: this
is a **public utility with no persistent storage and no accounts**.
Affordances that imply otherwise (pin-to-home, copy-share-link,
copy-bundle-URL, download-bundle, load-bundle, print-this-calculator,
field-notes scratchpads, after-this-you-might-want recommendation
strips) all signal a stateful, app-shaped product Sophie is not and
will not become. v8 removes them.

What remains, per tile, is what the user actually came for:

1. **Title** — what the tool is.
2. **Description** — one or two sentences on what it does.
3. **Inputs, with example values** — the working form, pre-filled
   from `META[id].example` so the empty state is never empty.
4. **References, with citations** — the formula or table the result
   came from, with the source line from `META[id].citation`.

Nothing else. No share button. No print button. No pin. No bundle.
No scratchpad. No recommendation strip.

## 2. What v8 inherits from v5, v6, v7 (non-negotiable)

Every hard rule from spec-v5, spec-v6, and spec-v7 binds v8 without
exception. The relevant ones, restated for clarity:

1. No live-data dependencies. No external API calls at runtime.
2. No ETL pipelines. Datasets are small, static, hand-maintained.
3. No AI of any kind, including local in-browser models.
4. Deterministic from input alone.
5. Pure-function math and routing in `lib/*.js`, separated from DOM
   renderers in `views/*.js`.
6. Citations on every formula in the `META` entry.
7. Test-with-example on every tile, wired through `META[id].example`.
8. Offline-first single static page. No new CSP `connect-src` entries.
9. **No localStorage, sessionStorage, cookies, or IndexedDB.** v8
   sharpens this: also no URL-hash state that survives across tiles
   for the purpose of "remembering" the user. The hash routes to a
   tile and optionally pre-fills inputs from a deep-link example;
   that is its entire job.
10. The tile grid is not removed; it stays one click away.

## 3. The minimal tile contract

### 3.1 Four regions, in order

Every tile detail view, regardless of group, renders exactly four
regions in this order:

```
+-----------------------------------------------------------+
|  Tool title                                               |
|  One- or two-sentence description.                        |
+-----------------------------------------------------------+
|  Inputs                                                   |
|    [field 1]  (example: 72)                               |
|    [field 2]  (example: 1.4 mg/dL)                        |
|    ...                                                    |
|  Result                                                   |
+-----------------------------------------------------------+
|  References                                               |
|  • Source line from META[id].citation                     |
|  • Optional second line for a table or dataset stamp      |
+-----------------------------------------------------------+
|  Disclaimer band (site-wide, unchanged)                   |
+-----------------------------------------------------------+
```

The site-wide disclaimer band stays as a fourth visual band but is
not a per-tile region; it is rendered by the shell.

### 3.2 What is removed from the tile detail

The following controls are removed from every tile detail view and
**must not be reintroduced** without amending this spec:

- **Pin / Unpin** buttons and the entire `Pinned` home section.
  Sophie has no user identity to pin against. The hash-based pin
  list (spec-v2 §4.1) ships zero value to first-time visitors, who
  are the dominant audience, and clutters every tile and the home
  view for return visitors who can bookmark.
- **Copy share link** / "share this configured tile" affordances.
  The browser URL bar is the share affordance. Adding a button
  duplicates a function the OS already provides and implies the
  link is more than a URL.
- **Copy bundle URL**, **Download bundle**, **Load bundle**.
  Bundles assume a multi-tool session worth packaging. Sophie's
  tiles are single-question utilities; cross-tile bundles invent a
  workflow the user did not ask for.
- **Print this calculator** as a per-tile button. The browser print
  command (`Cmd-P` / `Ctrl-P`) covers this; CSS print rules continue
  to render a clean printable view, but the per-tile button is
  removed.
- **Field notes / scratchpad** textareas (in any form: URL-hash,
  localStorage, IndexedDB). Sophie does not persist text the user
  types. A scratchpad that round-trips through the URL hash is
  technically stateless but reads as a notebook and invites users
  to treat it as one.
- **"After this, you might want: <other tool>"** recommendation
  strips at the bottom of the tile detail. v8 deletes these in
  every group view. Tile-to-tile discovery happens via the front
  door (prompt bar + collapsed grid + audience chips), not at the
  end of a tile.

### 3.3 What the example-value contract guarantees

`META[id].example` is the load-bearing escape from an empty form.
v8 tightens the existing v5 rule:

- Every tile **must** ship a working `example` that fills every
  input the tile reads. A tile that opens with empty inputs ships
  broken.
- The example pre-fills inputs on first visit by default. The user
  is invited to overwrite each field; there is no "use example"
  button because the form is already the example.
- Example values appear inline as muted helper text next to each
  input (e.g., `(example: 72)`), so the user can recover the
  example after overwriting it.

### 3.4 What the citation contract guarantees

`META[id].citation` is the only References content. v8 forbids
"Further reading," "Related tools," and "About this calculator"
copy blocks. References are:

- The formula source (textbook, standard, journal article, agency
  publication) for computed tiles.
- The table source plus its bundled snapshot date for lookup tiles.
- Nothing else.

## 4. The front-door prompt bar (sharpened)

### 4.1 Header

The topbar contains the brand mark and the theme toggle only. **No
search input in the header.** The home view's task hero is the only
search/prompt surface; the header search would compete with it for
user attention and split the test surface in two. (Current header
already complies; v8 codifies this.)

### 4.2 The single prompt bar

The home view shows one prompt input, full-width on mobile and
roughly half-width on desktop (paired with the v7 dropzone where
that lands). It is the v6 task hero + v7 synonym router, retained.

```
What do you need to decode?
[__________________________________________________________]
Try: my medical bill, my lab results, my insurance card,
     my medication list, my denial letter, my EOB.
```

The example strip under the input is part of the contract, not
decoration. It is the user's first exposure to the vocabulary the
prompt understands.

### 4.3 The "really good" search/prompt function

v8 promotes the prompt from "fuzzy search with synonyms" to a
deterministic three-pass matcher. All three passes are pure
functions in `lib/prompt.js`, run client-side, no AI.

**Pass 1 — synonym table (spec-v7 §3.2).** Hand-curated
`data/synonyms.json` maps patient-phrasings to tile IDs. Exact and
substring matches against the normalized query (lowercase, strip
punctuation, collapse whitespace, strip leading "my "/"a "/"the ").
First-match wins; ties broken by audience-chip filter.

**Pass 2 — token ranker over tile metadata.** For every tile, build
a search document from `name + desc + audiences + group + tags`
(tags are a new optional `META[id].tags` array, additive, defaults
to empty). Tokenize on whitespace and dashes. Score each tile by:

- exact phrase match in `name`: +10
- exact phrase match in `desc`: +5
- per-token match in `name`: +3 each
- per-token match in `desc`: +1 each
- per-token match in `audiences`/`tags`: +1 each
- audience-chip alignment: +2 if the tile's primary audience matches
  the current chip; -2 if it explicitly does not.

Top result above a fixed threshold becomes the routed tile on Enter.

**Pass 3 — single-edit-distance fallback.** If passes 1 and 2 both
miss, retry pass 1 against each synonym entry with a single-edit
Levenshtein neighbor of each token. Catches "discharg" → "discharge"
and "medicaiton" → "medication" without dragging in a fuzzy library.

**No remote calls. No model. No index build at runtime** beyond the
synonym/tags load. The matcher is 100% testable from a `query →
tile-id` fixture set.

### 4.4 Prompt UX details

- Show the matched synonym phrase as a breadcrumb (spec-v7 §3.2
  already does this; v8 keeps it).
- On Enter with a confident match, route to the tile.
- On Enter with no confident match, the prompt does not error; it
  expands the collapsed grid below and scrolls to it, with the
  query left in the input so the user sees what they typed.
- Live-filter the collapsed grid as the user types (debounced 120 ms).
- No autocomplete dropdown. The example strip below the input is the
  discovery surface; a dropdown competes with both the example strip
  and the tile grid.

### 4.5 Audience chips

v6's audience filter chips (`All / Patient / Biller and Coder /
Nurse and Clinician / EMS and Field / Educator`) stay below the
prompt bar, unchanged. They modulate pass 2's scoring, not the
visible tile set unless the user actively expands the grid.

### 4.6 The collapsed tile grid

The full tile catalog stays collapsed behind a `browse all <N>
tools ▾` disclosure (spec-v7 §3.4). v8 commits the **default-closed**
posture spec-v7 deferred. Typing in the prompt bar opens the
disclosure (existing behavior). Direct deep links to a tile
(`#tile-id`) bypass the grid entirely.

## 5. Engineering profile

### 5.1 New / changed files

- `lib/prompt.js` — pure-function three-pass matcher. Inputs:
  `(query, tiles, synonyms, audience)`. Output: `{tileId, why}` or
  `null`. Replaces the ad-hoc ranker currently in `app.js`.
- `data/synonyms.json` — existing, extended with v8 entries from
  the audit in §6.
- `META[id].tags` — optional new field per tile, defaults to `[]`.
  Additive; no existing tile needs to change to keep working.
- `app.js` — wire prompt bar to `lib/prompt.js`; remove pin section,
  pin buttons, scratchpad mount, and any recommendation-strip code
  paths if/when introduced.
- `views/*.js` — remove "After this, you might want" rendering
  blocks anywhere they appear.
- `index.html` — confirm topbar contains brand + theme toggle only;
  remove any pin-related markup; ensure prompt bar markup matches
  §4.2.
- `styles.css` — remove `.pinned-section`, `.pin-btn`, scratchpad
  rules, and any `.recommendation-strip` style blocks.

### 5.2 Tests

- Unit tests for `lib/prompt.js` against a fixture file of
  `(query, audience) → tile-id` rows. Cover synonym hit, token-rank
  hit, edit-distance recovery, and the no-match fallthrough.
- E2E test: typing a phrase from the example strip routes to the
  expected tile on Enter.
- E2E test: typing nonsense expands the grid and leaves the query
  visible.
- E2E test: tile detail view contains exactly the four regions in
  §3.1 and none of the removed controls in §3.2.
- E2E regression: no `#pinned` section renders on the home view; no
  per-tile Pin button exists in the DOM.

### 5.3 Migration

The pin removal is the only user-visible reversal of an existing
feature on sophiewell.com. Existing `#pin=<id>,<id>` hash links
silently become no-ops; the router ignores unknown hash params, so
old bookmarks still resolve to the home view rather than erroring.

## 6. Synonym table audit

Before v8 ships, run a one-pass audit of `data/synonyms.json` for
the example-strip phrases:

- "my medical bill" → eob-decoder or bill-decoder (whichever lands
  first under v7).
- "my lab results" → lab-explainer.
- "my insurance card" → insurance-card-decoder.
- "my medication list" → pill-bottle-decoder or medication-recon.
- "my denial letter" → denial-letter-decoder.
- "my EOB" → eob-decoder.

If a target tile does not exist yet, the synonym entry waits. The
example strip text is updated in lockstep with the synonyms file so
the front door never advertises a phrase that does not resolve.

## 7. Acceptance criteria

A v8 release is shippable when:

- Every tile detail view contains exactly the four regions in §3.1.
- No tile detail contains a Pin button, share-link button, bundle
  control, print button, scratchpad textarea, or "after this you
  might want" strip.
- The home view's only search/prompt surface is the task hero. The
  topbar carries brand + theme toggle only.
- The tile grid defaults closed.
- `lib/prompt.js` passes its fixture set with zero misroutes on
  phrases drawn from the example strip.
- Typing in the prompt bar opens the disclosure and live-filters
  the grid.
- No new `connect-src` entry, no storage API used, no telemetry.
- Existing deep links to tile IDs continue to work.

## 8. What v8 does not promise

- The prompt matcher is not exhaustive. New synonyms land as
  one-line PRs against `data/synonyms.json`.
- The matcher is not "intelligent." It does not infer intent across
  multiple turns. It maps one query to one tile.
- v8 does not pre-judge whether the v7 dropzone ships before, with,
  or after the v8 simplification. The two are independent; both
  obey the §2 hard rules.

## 9. Parallel cleanup on roughlogic.com

v8's tile contract is a sibling of an in-flight simplification on
roughlogic.com. To keep the two utilities visually and conceptually
aligned, the same removals land on roughlogic.com in a separate PR:

- Remove `Copy share link`, `Copy bundle URL`, `Download bundle`,
  `Load bundle`, `Print this calculator`, and `Pin to home /
  Unpin from home` buttons from the tile detail header row.
- Remove the `After this, you might want:` recommendation block at
  the bottom of every tile detail.
- Remove the Field Notes scratchpad (v3 utility 185) entirely:
  the DOM mount in `app.js`, the `.scratchpad-*` CSS, the README
  reference, and any test selectors that target it.
- Update roughlogic.com's README to drop "field notes scratchpad"
  from the list of platform affordances.

The roughlogic.com changes are not part of the sophiewell.com
release gate. They are tracked here so the rationale (public
utility, no persistent storage, minimal per-tile surface) is shared
between the two repositories.

---

Every page on sophiewell.com continues to carry the standard
disclaimer band: *reference information, not medical / legal /
financial advice; does not replace clinician judgment, professional
billing review, or legal counsel.*

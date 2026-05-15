# spec-v9.md — sophiewell.com: inline-citation completion and example-first inputs

> Status: spec-v9 complete (2026-05-15). All four waves landed; both
> coverage assertions are in **hard** mode. spec-v8 §3.3
> (example-value contract) and §3.4 (citation contract) are now
> CI-enforced for every home-grid tile.
>
> Wave 1: render touch-ups (§3.1, §3.2, §3.3, §3.4) and soft-mode
> coverage assertions (§4.4) shipped.
>
> Wave 2: citation backfill complete — **178/178 tiles** carry
> `META[id].citation`; assertion in **hard** mode.
>
> Waves 3a-3d: example backfill complete. Every input-bearing tile
> carries `META[id].example` with non-empty `fields` and an
> `expected` line; the example-coverage assertion is in **hard**
> mode. Pure-reference and decision-tree tiles live in
> `NO_INPUTS_TILES` with per-entry rationale; the screener tiles
> (`phq9`, `gad7`, `auditc`, `cage`, `epds`) pre-fill via their own
> `exampleAnswers` in [lib/scoring-v4.js](../lib/scoring-v4.js) +
> [lib/screener.js](../lib/screener.js), which were updated to the
> v9 contract (auto-fill on first paint, "Reset to example" link
> instead of the old "Test with example" button).
>
> Wave 4 (cleanup) — audit any remaining `Source:` / `Citation:`
> strings in renderers and any user-facing copy that still points
> at `docs/data-sources.md` or `docs/clinical-citations.md`.
> Outstanding.

## 1. Why this spec exists

spec-v8 already mandates the end state:

- Every tile renders a **References** region driven by
  `META[id].citation` (v8 §3.4), with nothing else in it.
- Every tile renders a working **Inputs** region pre-filled from
  `META[id].example` so the empty state is never empty (v8 §3.3).

The infrastructure for both lives in `lib/meta.js` and
`renderMetaBlock` in `app.js`. The gap, as of 2026-05-15, is:

| Metric                                            | Tools | %    |
|---------------------------------------------------|------:|-----:|
| Total tiles                                       |   178 | 100% |
| Have a `META[id]` entry                           |   178 | 100% |
| Have `META[id].citation`                          |   131 |  74% |
| Have `META[id].source` (dataset stamp)            |    60 |  34% |
| Have `META[id].example` (pre-fillable inputs)     |    51 |  29% |

The user-facing symptoms today are:

1. The tile detail still renders a generic
   *"See docs/data-sources.md and docs/clinical-citations.md…"*
   footer block ([app.js:752-755](../app.js#L752-L755)) that points
   the visitor at a GitHub path they will not visit.
2. Tiles with a `source` stamp display *"Source: CMS / NCHS ICD-10-CM,
   fetched 2026-05-07"* near the top and then nothing in the v8
   References region for that lookup, so the citation surface is
   split into two places (top stamp + bottom doc pointer) instead of
   a single References block.
3. 127 tiles open with empty inputs because `META[id].example` is
   absent. Users see a form with no demonstration of the expected
   format (the exact friction the user called out: "have an example
   pre-loaded so they can see what it looks like and know what
   format to use").
4. A handful of renderers print their own hardcoded `Source: …` line
   inside the tool body (six occurrences in `views/group-a.js`,
   `views/group-f.js`, `views/group-i.js`), duplicating whatever the
   meta block above already says.

v9 closes all four gaps without amending the v8 contract.

## 2. Non-goals

- No new tile contracts, no new META keys beyond what v8 already
  named (`citation`, `source`, `example`).
- No redesign of the prompt bar, audience chips, or grid.
- No changes to `docs/data-sources.md` or
  `docs/clinical-citations.md` themselves — they remain the
  developer-facing source catalog. The user-facing experience just
  no longer points at them.
- No new tests beyond extending the existing `test/unit/meta.test.js`
  fixtures so the audit numbers in §1 become CI-enforced.

## 3. Render changes (small, mechanical)

Four edits, all in shared shell code; no per-tile renderer touch is
required for the render-side work.

### 3.1 Remove the generic doc-pointer footer

In [app.js:752-755](../app.js#L752-L755), the block that appends
*"Data sources … See docs/data-sources.md and
docs/clinical-citations.md"* is deleted. The References region per
v8 §3.1 is the meta block already rendered by `renderMetaBlock`
above the tool body; a second placeholder block below dilutes it.

### 3.2 Move the meta block below the tool body (References-as-footer)

Today `renderMetaBlock` is appended *above* the tool body
([app.js:721-722](../app.js#L721-L722)), which puts the dataset
stamp before the inputs. v8 §3.1 orders the regions as
`title → description → inputs → references`. v9 moves the meta
block to appear *after* the tool body so the on-screen order matches
the spec.

The meta block keeps its current contents (citation line, dataset
stamp, "Test with example" button, "Copy all" button). Inputs come
first; References, with citation **and** the dataset stamp on
adjacent lines, come last. This is the consolidation the user
asked for: one block, fetch date + citation together, no second
"see the docs" pointer.

### 3.3 Auto-fill examples on first paint

Today `META[id].example` only fires when the user clicks the
"Test with example" button. v8 §3.3 says the inputs should be
pre-filled by default and the example values should appear inline
as muted helper text. v9 implements that:

1. When `renderMetaBlock` mounts a tile that has `META[id].example`,
   schedule an immediate `applyExample(util)` call after the
   renderer finishes (use the same microtask pattern as
   `applyHashState`/`trackHashState`).
2. If the URL hash carries explicit state (`#tool?...`), the hash
   state wins; the example only fills inputs the hash did not touch.
   This preserves deep links.
3. Replace the "Test with example" **button** with an inline
   "Reset to example" **link** in the meta block. The form is
   already the example; the affordance the user actually needs is
   "put it back."
4. For each input the example covers, render a muted
   `(example: <value>)` annotation next to the input label.
   Renderers that build inputs through `lib/form.js` get this for
   free; ad-hoc renderers get a one-line helper
   (`annotateExample(id, value)`) in `lib/meta.js` they can call
   after appending each field.

### 3.4 Delete the six hardcoded per-renderer source lines

These six lines duplicate what the meta block now renders, so they
are removed:

- [views/group-a.js:127](../views/group-a.js#L127) — *Source: CMS / NCHS public-domain ICD-10-CM tabular list.*
- [views/group-a.js:139](../views/group-a.js#L139) — *Source: CMS public-domain HCPCS Level II.*
- [views/group-f.js:278](../views/group-f.js#L278) — *Source: Ashton manual (public).*
- [views/group-f.js:300](../views/group-f.js#L300) — *Source: FDA labels via DailyMed…*
- [views/group-i.js:62](../views/group-i.js#L62) — *Source: FDA labeling and standard prehospital pediatric resuscitation literature.*
- [views/group-v6.js:67](../views/group-v6.js#L67) — *Source: ${result.source}* (lab-result-source line; per-result, not per-tile — keep this one, see §3.4.1)

§3.4.1: `views/group-v6.js:67` is a *per-result* attribution inside
the lab-result interpreter (each looked-up lab has its own source),
not a tile-level stamp. It is retained.

For each removed line, the equivalent content is verified to exist
in that tool's `META[id].citation` or `META[id].source`, and the
citation is rewritten if the removed line said more than meta did.

## 4. Data coverage (the bulk of the work)

This is the per-tile content work. It is mechanical but it has to
be done by hand: each citation must be sourced from
`docs/clinical-citations.md` or `docs/data-sources.md` (or a
primary reference if neither covers the tile), and each example
must be a working, plausible input set that actually produces a
result when fed to the tile's renderer.

### 4.1 Target end state

For every one of the 178 tiles:

- `META[id].citation` is present and points to the **primary** source
  (formula reference for computed tiles; table/dataset source for
  lookup tiles). For tiles whose underlying dataset is already
  attributed via `META[id].source`, `citation` carries the
  formula/regulation citation (not the dataset label).
- `META[id].example` is present unless the tile has no inputs
  (a small minority — e.g., pure reference tables with no filter).
  Each `example.fields` value fills every required input on the
  renderer; `example.expected` is a one-line string a tester can
  eyeball against the rendered output.

### 4.2 Citation-source mapping (developer-facing)

For each tile missing a citation, the contributor picks the citation
text from one of these in priority order:

1. The matching subsection of
   [docs/clinical-citations.md](clinical-citations.md) for clinical
   formulas and clinical reference ranges.
2. The matching dataset entry in
   [docs/data-sources.md](data-sources.md) for lookup/table tiles.
3. The matching subsection of
   [docs/field-medicine-citations.md](field-medicine-citations.md)
   for EMS/field tiles (group I and v5).
4. The primary regulation or CFR citation for regulatory tiles
   (NSA, ACA SEP, HIPAA RoA, COBRA, etc.) — these are already
   present and serve as the style template.

Citations follow the existing pattern in [lib/meta.js](../lib/meta.js):
one sentence, primary author or agency + journal/year for clinical;
CFR or USC for regulatory; agency + file name for datasets. No URLs
(they rot, and citations get printed). No "See [link]" — if the doc
catalog has more, the contributor inlines the primary citation here.

### 4.3 Example values (developer-facing)

Each example must satisfy:

- It actually renders a non-empty result when fed to the tile.
- It uses **plausible** values, not edge cases. The point is
  to demonstrate format, not to stress-test.
- `expected` is a copy-pasteable string a contributor can match
  against the rendered output during review. It can be approximate
  for floating-point math (`~`, `≈`).
- For lookup tiles backed by a dataset, the example query must be a
  row that actually exists in the shipped dataset shards.

The existing 51 examples in `lib/meta.js` are the style template.

### 4.4 Tracking the audit in CI

[test/unit/meta.test.js](../test/unit/meta.test.js) is extended with
two coverage assertions:

1. **Citation coverage**: every `id` in `UTILITIES` has either
   `META[id].citation` or `META[id].source` (or both). This is
   already true for all 178 tiles, but the test pins it.
2. **Example coverage**: every `id` in `UTILITIES` that takes inputs
   has `META[id].example`. An allowlist
   (`NO_INPUTS_TILES = new Set([...])`) lists the tiles that have no
   inputs (pure tables). The allowlist is the contributor's
   pressure-release valve; adding to it is a code-review event.

The two assertions start in *soft* mode (log-only) for the first wave
and flip to *hard* mode (test failure) once the rollout hits its
coverage target for that wave.

## 5. Rollout waves

Sized so each wave is one focused PR and can be reviewed against the
running site without merge conflicts. Order is "highest user impact
per tile."

### Wave 1 — Render touch-ups (one PR, mechanical, no per-tile content)

- §3.1 delete the doc-pointer footer.
- §3.2 move meta block below the tool body.
- §3.3 auto-fill examples; add `annotateExample` helper; replace
  "Test with example" button with "Reset to example" link.
- §3.4 delete the six hardcoded per-renderer source lines.
- Extend [test/unit/meta.test.js](../test/unit/meta.test.js) with the
  citation- and example-coverage assertions in **soft** mode.

Ships behind no flag; the visible change is purely additive (existing
51 examples now pre-fill) plus the removal of the docs pointer.

### Wave 2 — Citation backfill (47 tiles)

Fill `citation` for every tile that lacks one. Group by source
catalog page so a reviewer can hold one page of
`docs/clinical-citations.md` open and check off the tiles that draw
from it. Flip the citation-coverage assertion to **hard** at the end
of the wave.

### Wave 3 — Example backfill, group-by-group (127 tiles)

Split into sub-waves by group letter so PRs stay reviewable
(roughly 20-30 tiles per sub-wave):

- 3a: Group A (code lookups) and Group C (patient tools).
- 3b: Group E (clinical math) and Group F (medication math).
- 3c: Group G (clinical scoring), Group H (workflow), Group I
  (field/EMS).
- 3d: Group J, Group K-O, v5 and v6 extensions.

Each sub-wave updates `lib/meta.js` plus the `NO_INPUTS_TILES`
allowlist for genuinely input-less tiles. Flip the
example-coverage assertion to **hard** at the end of wave 3d.

### Wave 4 — Cleanup

- Audit each renderer for stray `Source:` / `Citation:` strings that
  the meta block now covers; delete duplicates.
- Audit `docs/data-sources.md` and `docs/clinical-citations.md`
  cross-references inside the codebase (`grep -rn "data-sources.md\|clinical-citations.md" .`)
  and remove any user-facing copy that still pushes the visitor at
  the GitHub docs. The docs themselves remain for contributors.

## 6. Out of scope (deliberate)

- **No copy edit to the docs.** v9 surfaces the inline citation; the
  source-catalog docs do not need to change shape.
- **No new "expand citations" UI.** The References region renders
  the primary citation only. Visitors who need the full catalog
  follow the contributor path; v9's whole point is that the
  primary citation, inline, is enough.
- **No localStorage / no remembered examples.** The example fills
  on every visit. v8's no-persistence rule is unaffected.

## 7. Open questions to resolve before wave 2

1. For tiles whose primary source is a textbook (e.g., *West JB.
   Respiratory Physiology*), is a short-form citation
   (author, title, edition-agnostic) acceptable as the only
   reference, or should it pair with a journal article for the
   specific equation? Default: short-form acceptable, matches the
   existing `aa-gradient` entry.
2. For regulatory tiles where the agency form is the source
   (CMS-R-131, CMS-1500, UB-04), is the CFR citation the primary,
   or the form number? Default: form number plus governing CFR,
   matches existing `insurance` and `abn-explainer` entries.

These do not block wave 1.

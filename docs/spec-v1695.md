# spec-v1695 — The page that answers "what is left" could not see one of them

> Status: **SHIPPED (2026-11-07)**. No tile. The generated unbuilt index now collects tools specified
> only as an openspec change. Follows [spec-v1694](spec-v1694.md), whose new guard found this.

## The gap

`docs/unbuilt-tools.md` is the one page that answers "what is specified but not built, and what would
unblock it". It is generated: it reads the tool headings out of every `docs/spec-v*.md`, compares them
with the catalog, and quotes each spec's own reason. Its blurb says "**Across every spec**", and that
was exactly true — and narrower than it reads.

A tool specified only as an **openspec change**, with no spec-v document naming it, has no heading for
the generator to find. `tpa-eligibility` has been in that position: a high-stakes thrombolysis
checklist, **nine open tasks, zero done, and no row on the page that lists what is left.**

The new gate guard from spec-v1694 asserts that every tool in the index has a row in
`data/build-gates.json`. Writing that guard surfaced the inverse immediately — a gated tool with no
index row at all.

## What shipped

`collectOpenspec()` walks `openspec/changes/*/` and keys on the convention those changes already use:
before building, the tasks file greps the catalog for the id's absence
(`grep -c "id: 'tpa-eligibility'" app.js`). So **an id written as `id: '...'` anywhere in the change,
and missing from the catalog, is a specified-but-unbuilt tool**.

Across all fifteen changes that key names exactly one id and nothing else, which is why it was chosen:
a looser key — any backticked token — pulls in file names and prose. The rows land in their own table
with the change's own gate sentence, its open-task count, and a link to the change:

| Tool | Change | Open tasks | What has to happen first |
|---|---|---|---|
| `tpa-eligibility` | openspec/changes/tpa-eligibility | 9 | Before building, re-verify every time window, exclusion criterion, and threshold against the AHA/ASA 2026 guideline … |

The blurb now says how many are in that position instead of implying there are none.

## Proof

- `test/unit/unbuilt-index.test.js` — unchanged and still passing: it regenerates the page and compares
  byte for byte, so the committed page and the sources cannot drift.
- `test/unit/build-gates.test.js` — reads **both** of the index's tables now, so a gate row is required
  for an openspec-only tool too; and a new case asserts the openspec-only table lists
  `tpa-eligibility`, which is the regression that would mean the generator stopped collecting them.
- The generator's own line reports the split: "12 tool(s) specified but not built, plus 1 specified
  only as an openspec change".
- 18,768 unit tests, 494 MCP tests, lint and build green.

## One row corrected by this

`data/build-gates.json`'s `tpa-eligibility` note, written an hour earlier, said the tool was **not** in
`docs/unbuilt-tools.md`. That is no longer true, and the row now says where it appears instead. A note
about a generated page is itself a dated claim.

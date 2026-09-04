# spec-v753.md — Registry-driven prefill for the whole catalog

> Status: **SHIPPED (2026-08-20).** Part of [scope-one-box](scope-one-box.md).
> New parsing module + one build artifact. No tile added, no compute changed. Catalog stays **1564**.

## Why

`lib/query-compute.js` turns a plain-language query into filled inputs, and it works. It covers
**22 tiles**. The catalog has 1564.

Every one of those 22 is a hand-written template: a regex for the tile's phrasing, a hand-picked
parser per field, a hand-built `inputs` object. At that rate the other 1400 are never getting done,
so `crcl 72F 68 kg cr 1.4` lands on a prefilled tile and `wells score, hr 110, previous DVT` lands
on an empty form. Which one a nurse gets is luck.

The templates are hand-written because the field metadata they encode looks like it lives in 628
view files. It does not. It already exists, in one machine-readable place: every MCP adapter
declares a flat `fields` list with `dom`, `arg`, `kind`, `unit`, `required`, `label`, and `values`.
That is **7,919 field descriptors across 636 adapters** — the type of every input, its unit, and
its human label, for 1540 of the 1564 tiles. It is exactly what an extractor needs, and nothing
reads it in the browser today.

## What it does

A new `lib/query-fill.js` exports one function:

```
queryFill(query, fields) -> { filled: {dom: value}, missing: [dom], unmatched: [fragment] }
```

Given a query and a tile the router already chose, it fills what it can and reports what it could
not. It never computes and never routes — v754 and v755 own those.

| Step | Rule |
|---|---|
| **1. Normalize** | Rewrite the compound forms a nurse writes as one token into the long form the matcher reads: `120/80` → `systolic 120 mmhg diastolic 80 mmhg`, `5'10` → `height 177.8 cm`. A slash pair only reads as a pressure inside plausible bounds. |
| **2. Number fields** | Find `<field name> <number> <unit?>` using terms derived from the field's label lead plus chart shorthand (`creatinine` → `cr`, `scr`). Name-then-value wins outright; the reverse order is consulted only if nothing matched, because in a run of labs `na 140 cl 104` it manufactures a false hit for every analyte. Convert to the field's unit, or refuse. |
| **3. Enum fields** | Numeric and single-letter values need the field's own name beside them (`liver stage 2`, `LA grade B`) — a bare `2` or `B` is not a value. Word-valued enums match directly, with a small alias table for codes (`M`/`F` ← male/woman). |
| **4. Bool fields** | Fill `true` only when the label's own distinctive words appear, nothing negates them, and — if the label states a threshold — the number satisfies it. Never fill `false` from absence: an unmentioned criterion is unknown, and the unchecked box already says so. |
| **5. Ambiguity veto** | One field with two readings, or one fragment claimed by two fields, fills **neither** — unless one reading is strictly better corroborated. Wrong prefill is worse than no prefill. |
| **6. Missing** | Every `required` field left unfilled is reported in `missing`, in declaration order, so v755 can ask for the first one. |

Everything is deterministic table lookup and regex. No model, no network, no storage.

## The field index

`mcp/` is a local stdio server and is not a browser target; the app cannot import 636 adapter
modules at runtime. A build step emits a compact index instead.

`scripts/build-field-index.mjs` reads every adapter and writes short-keyed rows
(`{ d, k, u, r, l, v }`) for **1540 tiles / 7919 fields**.

**Bucketed by the tile id's first letter**, after measuring both alternatives:

| Shape | Cost |
|---|---|
| One file | 171 KB gzip to download, for a file never needed whole |
| One file per tile | 439 B to download, but **1540 generated files in the repo**, churning every diff |
| **26 buckets** (shipped) | a few KB to download, 26 files, largest 16.7 KB gzip on `s` |

Routing picks the tile before anything wants its fields, so the browser computes
`data/fields/<first letter>.json` from the id with no manifest fetch. `lib/field-bucket.js`
holds that one rule, imported by both the writer and the reader so they cannot disagree.

Lazy: fetched on first use, cached per session, never at first paint. Guardrailed per bucket
at 24 KB gzip, a build failure rather than a warning. If a bucket outgrows it, split on two
letters rather than raising it.

**`kind` is normalized on the way in.** 90 fields across ~14 adapters declare `'boolean'`
where `mcp/fields.js` only recognizes `'bool'`. The index writes `'bool'` for both. (The
underlying inconsistency is pre-existing — see *Not in scope*.)

## The 22 templates stay

`queryCompute` keeps its 22 tiles and keeps winning where it fires. It carries something the
generic path cannot: a verified expected value per template, covered by unit tests. `queryFill` is
the fallback for the other 1400+, and never overrides a template hit.

Folding the templates into the general path is a later question, worth asking only once the
general path has its own test corpus and has proven equal on all 22.

## Where it lives

- `lib/query-fill.js` — new. `queryFill()`, `normalizeQuery()`, `boolHit()`, `labelThreshold()`,
  the unit tables, the negation window, and `loadFields()`.
- `lib/field-bucket.js` — new. `bucketFor()`, shared by the writer and the reader.
- `scripts/build-field-index.mjs` — new build step.
- `scripts/build.mjs` — wired in before `build-sbom`.
- `test/fixtures/queries.txt` — new. Checked-in phrasings, one per line, with the tile and fields
  each should produce. This is the corpus the extractor is measured against, and it replaces any
  temptation to log what real users type.

## What shipped differently

- **`lib/query-compute.js` was not touched.** Reusing its parsers meant importing five
  functions and matching their assumptions; rewriting the compound forms as a query
  *normalization* pass (`120/80` → `systolic 120 mmhg diastolic 80 mmhg`, `5'10` →
  `height 177.8 cm`) was smaller and left the tested templates alone.
- **Labels are trimmed to their first sentence before terms are derived**, with `splitLead`
  and the same 4-character floor the tool pages use. Registry labels double as guidance
  (*"Serum creatinine. Above 2 adds 1 to ACEF and 2 to ACEF II."*), and the guidance is full
  of the SOURCE's numbers. Digits are stripped from labels for the same reason.
- **Boolean criteria got a rule the plan did not anticipate, and it is the most important
  one here.** A label that states a threshold — *"Heart rate > 100"* — is a question about a
  number, not about whether the words appear. Matching on words alone ticked the box for
  both `heart rate 110` and `heart rate 80`. `labelThreshold()` now pulls the comparison out
  of the label and evaluates it; no number, or a number that fails it, means no fill.
- **Ties are broken by corroboration, not refused outright.** "previous DVT" matches `dvt`
  for both *Clinical signs of DVT* and *Prior PE or DVT*; only the second also matches
  `prior`. A strictly better-supported reading wins; equal scores stay vetoed.
- **Two-letter tokens never fill a criterion.** "wells score for PE" would otherwise assert
  that PE is the most likely diagnosis — the reader named the tool, not the finding.

## Measured

Every tile's own worked example, re-phrased as a query and fed back through the extractor —
1337 tiles, 4953 fields:

| | |
|---|---|
| Tiles with **every** value recovered | **1161 (86.8%)** |
| Tiles with some recovered | 123 (9.2%) |
| Tiles with none | 53 (4.0%) |
| **Fields recovered** | **4464 / 4953 (90.1%)** |
| **Tiles with a WRONG value** | **2 (0.1%)** |

The last row is the one that matters, and both cases are artifacts of the synthetic query
(enum values that are substrings of each other, joined into one string). The veto rules hold:
across 4953 fields the extractor either got it right or left it blank.

The 4% that fill nothing are mostly repeated-item scales — OSDI asks twelve questions phrased
identically — where every field matches every fragment and the veto correctly refuses all of
them.

## Gotchas

- **Negation is the sharp edge.** `no hemoptysis`, `denies chest pain`, `without dizziness`, and
  `hemoptysis: no` must never set a criterion true. Where the negation window is uncertain, fill
  nothing. A false positive on a scoring criterion silently changes a risk band.
- **Unit strings in the registry are not normalized.** `×10⁹/L`, `x10^9/L`, and `×10³/µL` all
  appear. The compatibility table keys on a canonicalized form; write the canonicalizer first and
  test it against the actual distinct unit strings in the adapters, not against an idealized list.
- `years` is a unit on 131 fields, and age also arrives as `72 yo` / `72 year old`. Route both
  through `parseAge` so the two spellings cannot produce two candidates and trip the ambiguity veto.
- US customary is the happy path: `lb`, `in`, `°F` are the pre-selected units, but the canonical
  unit is `kg`, `cm`, `°C`. `queryFill` returns **canonical** values, matching what a deep-link
  hash carries, so `applyExample`'s unit-select reset stays correct.
- Adding a summary or label is not free — the search corpus sits against a gzip budget. This spec
  adds no adapter text, but do not "improve" labels while in there.

## Not in scope

`mcp/fields.js` recognizes `kind: 'bool'` and not `kind: 'boolean'`, so 90 fields are published to
agents with `type: "string"` and skipped by `validateInputs` entirely. Scoring is unaffected — the
lib functions use their own `truthy()` helper, which correctly rejects the string `"false"`
(verified against `conley-fall-risk`, `interchest`, `manning-ibs`, `downton-fall-risk`,
`framingham-hf-criteria`). It is a schema-accuracy bug in the agent contract, pre-existing and
unrelated to this program. This spec works around it in the index build and leaves the fix alone.

## Proof

- `test/unit/query-fill.test.js` — **18 tests, green.** Unit folding and conversion; label
  lead extraction; the negation window; the compound-form rewrites; `labelThreshold`; the
  threshold criterion deciding on the number (`110` ticks, `80` does not, no number does
  not); silence never filling `false`; both veto directions; corroboration breaking a tie;
  a bare number filling nothing; `missing` order; every shard parsing with a recognized
  kind; and the corpus below.
- `test/fixtures/queries.txt` — 24 phrasings including the safety cases. This replaces query
  telemetry: the home page says *no tracking*, so the ledger is a file, not a log.
- `node scripts/check-mcp-catalog.mjs` (it runs inside `npm run lint`; there has never
  been a `check:mcp-catalog` script) unchanged — 1540 adapters, the index is derived, never
  authoritative.
- Full chain green: `lint`, `test:unit` (11444, up from 11426), `test:mcp` (395), `test:a11y`.

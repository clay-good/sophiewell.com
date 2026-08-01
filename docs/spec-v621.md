# spec-v621 — Reverse lookup: find calculators by the data you already have

**Status:** proposal. No code changed. Written 2026-07-31. Part of the v620 program.

## What this does for you

An agent (or a clinician) often starts from data, not from a calculator name: *"I have the patient's age,
serum creatinine, and sex — what can I compute?"* Today the only way to answer that is to read the schema of
each candidate calculator and check by hand. This spec adds one deterministic tool, `find_calculator_by_inputs`,
that takes a set of available data points and returns the calculators you can run **now**, plus the ones you
could run with one or two more values.

This is the single most-requested capability a competing server has that we lack, and it turns the catalog
from a name-lookup into a data-driven index.

## Why we can't do it today

Adapter fields (`mcp/fields.js`) bridge three names — `dom` (the browser input id), `arg` (the lib argument),
and a human `label`. None of these is a **shared concept** across calculators. `scr`, `creat`, and
`serum-cr` might all mean serum creatinine in different adapters, so there is nothing to match "creatinine"
against uniformly. A reverse lookup needs a fourth, canonical name.

## The design

**1. Add an optional `concept` to field descriptors.** A small controlled vocabulary of canonical clinical
inputs — `age`, `sex`, `weight_kg`, `serum_creatinine`, `serum_sodium`, `heart_rate`, `map`, `platelets`,
and so on. A field tags itself:

```js
{ dom: 'ck-scr', arg: 'scr', kind: 'number', concept: 'serum_creatinine', unit: 'mg/dL', ... }
```

`concept` is **optional and additive**: a field without one simply does not participate in reverse lookup,
so this rolls out incrementally, highest-traffic concepts first, with zero risk to existing behavior.

**2. Keep the vocabulary in one reviewed file** (`mcp/concepts.js`): each concept has a canonical id, a
display label, a unit family, and a short synonym list ("creatinine", "cr", "scr" → `serum_creatinine`).
This is small and bounded — a few dozen high-frequency inputs, not one per field. A gate rejects any
`concept:` on a field that is not declared here, so the vocabulary can't sprawl silently.

**3. The tool.**

```
find_calculator_by_inputs({ have: ["age", "creatinine", "sex"], limit })
  -> {
       runnable:   [ { id, name, uses: ["age","serum_creatinine","sex"] }, ... ],   // every required concept present
       almost:     [ { id, name, missing: ["serum_sodium"] }, ... ],                // 1–2 required concepts short
       unmatched:  ["creatinine" resolved to serum_creatinine],                     // how each input was read
     }
```

`have` entries are resolved through the concept synonym list, so "creatinine" and "scr" both land on
`serum_creatinine`. A calculator is **runnable** when every one of its *required* fields that carries a
concept is covered; **almost** when it is one or two short. Sorting is deterministic (runnable before almost,
then by count of matched concepts, then by id).

**4. A "did you mean" on unknown input keys.** Separately, `compute_calculator` today rejects an unknown
input key with a bare message. When the unknown key matches a known concept synonym for that calculator
(e.g. an agent sends `creatinine` where the field `dom` is `ck-scr`/concept `serum_creatinine`), append the
correct key to the error: `Unknown input "creatinine". Did you mean "ck-scr"?`. This is the ergonomic slice
of a full parameter-matcher, without a fuzzy-matching thesaurus to maintain.

## Site synergy

The same concept map lets the search bar answer data-first queries ("what can I calculate from a BMP?") and
is the join key v624 uses for related calculators. One vocabulary, three surfaces.

## Scope and guards

- **Deterministic and network-free**, like every other tool. Pure set operations over the registry.
- **Additive only.** No field is required to declare a concept; nothing breaks if most never do. Report
  coverage (`N of M exposed calculators have at least one concept-tagged field`) the way `list_calculators`
  reports MCP coverage — honest, live, never hardcoded.
- **Vocabulary gated.** `scripts/check-mcp-catalog.mjs` gains a check: every `concept` on a field is declared
  in `mcp/concepts.js`; every concept synonym is unique across the vocabulary.
- **Tool count.** Adds exactly one tool (4 → 5).

## What not to do

- Do **not** infer concepts automatically from `arg`/`dom` strings — collisions (`na` = sodium or
  not-applicable?) make that unsafe. Concepts are declared, reviewed, and gated.
- Do **not** let the vocabulary grow per-field. If a concept is used once, it does not belong in the shared
  vocabulary; leave that field untagged.

## Files (when built)

`mcp/concepts.js` (new), `mcp/fields.js` (accept + validate `concept`), `mcp/tools.js`
(`find_calculator_by_inputs` + did-you-mean), `mcp/server.js` (register), `scripts/check-mcp-catalog.mjs`
(vocabulary gate), `test/mcp/*` (reverse-lookup + did-you-mean tests), `mcp/README.md` / `docs/mcp-coverage.md`
(surface it — generated per v625).

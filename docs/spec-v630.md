# spec-v630 — The three capabilities agents can't reach

**Status:** proposal. No code changed. Written 2026-07-31. Part of the v627 program.

Some things a site user does are not "pick a calculator and run it." Three of them are reachable in the
browser but invisible over MCP. Each is deterministic, each reuses a tested `lib/` function verbatim, and
each is one tool or one field.

## 1. `answer_query` — one-shot natural-language answer

On the site, typing `bmi 180 lb 5'10"` or `map 120/80` returns a computed answer inline, then opens the tile
with the values prefilled. That whole parse-route-compute path is `queryCompute` in `lib/query-compute.js`
(21 templates: BMI, BSA, MAP, anion gap, corrected calcium/sodium, IBW, Cockcroft-Gault, eAG, QTc, A-a
gradient, shock index, maintenance fluids, P/F, Winters, Mentzer, CKD-EPI eGFR, delta gap, retic index,
TSAT, FENa). It parses embedded values, never guesses (a missing field returns `null`), and reuses each
tile's own compute so the number matches the tile.

An agent has none of this. It can call `find_calculator` (which returns *candidates*, not an answer) or
`compute_calculator` (which needs the id and structured inputs already parsed). The single most agent-friendly
entry point — "here's a sentence, give me the number" — is missing.

**Tool:** `answer_query({ query })` → calls `queryCompute(query)` and returns its
`{ tile, label, value, text, unit, inputs }`; when it resolves, optionally pipe `inputs` through the existing
`computeCalculator` to return the full structured result + citation + disclaimer. On no match, return an empty
result with a hint to use `find_calculator`. Pure; no new logic.

## 2. `convert_units` — lab and vitals conversion

The basic weight/volume/temperature converter is already exposed. The **lab SI conversions users actually
need every day — mg/dL ↔ mmol/L, HbA1c % ↔ IFCC, mmHg ↔ kPa, and the rest — live only in the
`unit-converter-v4` tile**, which v629 exposes as a calculator. That covers it, but conversion is a primitive
an agent reaches for constantly, and making it hunt for a tile id is poor ergonomics.

**Tool (recommended):** `convert_units({ kind, value, direction })` over `lib/unit-convert.js` —
`labConvert(kind, value, direction)` across the `LAB` table plus `a1cPctToIfcc`/`a1cIfccToPct`,
`mmHgToKpa`/`kpaToMmHg`, `fToC`/`cToF`, `inchesToCm`/`cmToInches`, `feetInToCm`, `lbToKg`/`kgToLb`. It returns
the converted value with units.

**Tradeoff, stated honestly:** exposing the `unit-converter-v4` tile (v629) already makes conversion
*possible*; `convert_units` makes it *easy*. Given how foundational unit conversion is to agent workflows, the
convenience tool earns its place — but if we are minimizing surface, the tile exposure alone is the floor.

## 3. `related` on `describe_calculator` — the graph we already have

`META[id].related` already lists sibling tiles and **1115 tiles carry it**; the site renders these as
"Related tools" links. `describe_calculator` returns a fixed field set that omits `related`, so agents can't
traverse the curated relatedness graph a user sees.

**Fix:** add one line — `related: e.related` — to `describeCalculator`. The data is already joined into the
registry via `META`. This is the concrete, ship-today first step of the fuller relatedness graph in v624;
because the curated data already exists, v624's automatic-edge work becomes an *enhancement* of real data
rather than a build-from-scratch.

## Guards

- **All three are deterministic and network-free**; identical input → identical output.
- **No new parsing or math** — every tool delegates to an existing, tested `lib/` function. `answer_query`
  adds no template; extending coverage means adding a `queryCompute` template, which is its own program.
- **Tool count.** Adds two tools (`answer_query`, `convert_units`); `related` is a field, not a tool. Surface
  stays small and capability-oriented.

## What not to do

- Do **not** let `answer_query` fall back to a fuzzy guess when `queryCompute` returns `null`. No match means
  no answer plus a pointer to `find_calculator` — never a maybe.
- Do **not** duplicate the conversion tables in `convert_units`; import `lib/unit-convert.js`. One source.

## Files (when built)

`mcp/tools.js` (`answer_query`, `convert_units`, `related` field, `TOOL_DEFS`, `dispatch`), `mcp/server.js`
(registration is shared), `test/mcp/*` (parse/convert/related + determinism), `docs/mcp-coverage.md`.

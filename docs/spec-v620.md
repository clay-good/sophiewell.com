# spec-v620 — MCP agent-ergonomics: what the field already knows

**Status:** proposal (program umbrella). No code changed. Written 2026-07-31 at catalog 1468 / MCP 1405.

We surveyed a mature competing medical-calculator MCP server — a well-tested, evidence-cited service
covering ~150 calculators — and read its architecture against ours. The good news first: **our core
decisions match theirs, and on the two decisions that matter most we are already ahead.** This spec records
what the comparison confirmed, the handful of capabilities they have that we do not, and the order in which
the follow-on specs (v621–v626) close the gap. Every item below reuses the pure `lib/*.js` computes and the
existing adapter registry, stays deterministic and network-free, and costs nothing to run.

## What the comparison confirmed (keep doing this)

| Their pattern | Ours | Verdict |
|---|---|---|
| A **consolidated tool surface** (6 tools, not one-per-calculator) | 4 tools (`list_/find_/describe_/compute_calculator`) | **We are ahead.** One-tool-per-tile would flood an agent's context with 1,405 tool schemas. A fixed, small surface is the right call and we made it first. |
| Two-level lookup: precise id + exploratory discovery | `id` (precise) + `find_calculator` (ranked, plain-language) | Parity. |
| `get_tool_schema` / `calculate` split | `describe_calculator` / `compute_calculator` | Parity. |
| Layered validation, output safety | field validation + non-finite output guard | Parity. |
| Evidence-cited, heavy test coverage | 10,691 unit tests + e2e + MCP round-trip gate; every tile cited | Parity. |
| Single source of truth, generated to avoid drift | computes in `lib/`, meta in `lib/meta.js`, catalog in `app.js` | Parity in the code; **not yet in the docs** — see v625. |

The single most important shared lesson: **the tool surface must not scale with the catalog.** They hold it
at 6, we hold it at 4, and nothing in this program raises that count above a small, fixed number.

## What they have that we do not (the gaps this program closes)

| Gap | Their capability | Our fix | Spec |
|---|---|---|---|
| **Reverse lookup** — "I have age, creatinine, sex; what can I compute?" | `find_tools_by_params` | `find_calculator_by_inputs` over a canonical parameter vocabulary layered on adapter fields | **v621** |
| **Input safety** — our published JSON Schema carries no ranges, so an agent can send age = 900 and get an answer | literature-backed boundary validation | optional `min`/`max` in the schema + non-blocking plausibility `warnings[]` (never reject) | **v622** |
| **Batch** — an agent assembling a workup pays one round-trip per calculator | `calculate_batch` | `compute_batch` over the same dispatch | **v623** |
| **Relatedness** — no "what else applies here?" | `get_related_tools` (graph over shared params/specialty/context) | deterministic `related` edges reusing v621's vocabulary + curated companion pairs; surfaced in `describe_calculator` and on the site | **v624** |
| **Doc drift** — their catalog docs are generated; our 39 KB `mcp/README.md` is hand-kept and **already stale** (`mcp/README.md:81` reads "1279 of 1109 … exposed", a count that never existed) | generated catalog docs | generate the coverage ledger; close the last clinical coverage gap | **v625** |
| **Reach** — their server runs remotely (SSE/HTTP); ours is stdio-only, so an agent must clone and run it | remote transports | *optional* zero-cost remote MCP on the Cloudflare Workers free tier, reusing a build-time registry | **v626** |

## Deliberately not adopted

- **REST/SSE/api as first-class modes.** stdio (local, zero egress) is the trust anchor and stays primary.
  v626 adds *only* the remote transport an agent actually benefits from, and only on a free tier.
- **A fuzzy parameter matcher with a hand-maintained alias thesaurus.** v621 gives a small, reviewed
  canonical vocabulary and a "did you mean" on unknown input keys. That captures the ergonomic win without a
  60-entry alias table to keep honest.
- **Structured PMID/DOI on every tile now.** Machine-verifiable identifiers are a real strength worth
  having, but retrofitting 1,405 tiles is a data program, not an ergonomics fix. Every tile already carries
  `citationUrl` + access date. Track this as a where-available enrichment, not a blocker.
- **Guideline-to-calculator mapping.** Nice for completeness discovery; `specialties` already covers most of
  the need. Defer.

## Ordering

1. **v621 (reverse lookup + parameter vocabulary)** — foundational: the canonical vocabulary it introduces
   is also what v624 needs. Do it first.
2. **v622 (ranges + plausibility)** — independent, high safety value, small.
3. **v623 (batch)** — small, independent.
4. **v624 (related)** — depends on v621's vocabulary.
5. **v625 (generated ledger + close the gap)** — independent; fixes a live drift bug.
6. **v626 (optional remote MCP)** — last, and optional; nothing else depends on it.

## Invariants every spec in this program must hold

- **Determinism.** Identical inputs → byte-identical output. No clock, no randomness, no network in the hot
  path. (v626's transport is network; its *compute* is not.)
- **One compute, two surfaces.** The site and the MCP server call the same `lib/*.js`. No capability may
  fork the math.
- **The MCP subtree stays optional and deletable.** `mcp/` absent → `npm run lint` and the build stay green
  (spec-v183 §3). New gates must no-op when `mcp/` is gone.
- **The tool count stays small and fixed.** This program adds at most `find_calculator_by_inputs`,
  `compute_batch`, and `related_calculators` — three tools, taking the surface from 4 to at most 7, and never
  one-per-tile.

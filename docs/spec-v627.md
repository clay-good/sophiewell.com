# spec-v627 — Full MCP coverage: every tool a user gets, an agent gets

**Status:** proposal (program umbrella). No code changed. Written 2026-07-31 at catalog 1468 / MCP 1405.

The goal is one sentence: **anything a person can do on the site, an AI agent can do over MCP.** Today 1405
of 1468 tiles are exposed and three whole capabilities (one-shot query answers, lab-unit conversion, the
related-tool graph) are reachable in the browser but not over MCP. This program closes every gap that should
be closed, and — the part that makes it stick — turns "everything is exposed or accountably waived" into a
build-enforced invariant so coverage can never silently regress.

This extends the v620 agent-ergonomics program; the two compose and do not conflict.

## The complete accounting (audited 2026-07-31)

Every one of the 1468 tiles is classified, plus the non-tile capabilities:

| Bucket | Count | Disposition | Spec |
|---|---|---|---|
| **Exposed today** (clinical calculators) | 1405 | keep | — |
| **Clinical, ready or near-ready** — `preg-dating` (composite of existing lib fns), `insulin-drip` (trivial lib extraction), 4 workflow timers | 6 | **expose** (timers take explicit time inputs, never a clock) | **v628** |
| **Non-clinical computations** — MPFS/claim-edit/E&M/drug/identifier/deadline billing + coding engines and converters, all with lib fns + examples | 40 | **expose** behind an admin-domain disclaimer | **v629** |
| **Non-clinical interactive lookups** — `prior-auth`, `ems-doc`, `specialty-visit` (+`prep` after it gets a citation/example) | 4 | **expose** as deterministic lookup tools | **v629** |
| **Clinical decision trees** — `tetanus`, `rabies-pep`, `bbp-exposure` (traversals over `data/*.json`) | 3 | **expose** via a decision-tool shape, output framed as the source's algorithm, not an order | **v631** |
| **Clinical static reference** — `sti-screening`, `co-cn-antidote` (no inputs) | 2 | **expose** read-only as reference, or waive | **v631** |
| **Template generators** — appeal/HIPAA/ROI/discharge/wallet/SBAR letter fills | 7 | **waive** (an LLM writes boilerplate natively); optionally expose the 3 CFR completeness *lints* | **v632** |
| **Document linter** — `pa-lint` (binary file upload) | 1 | **waive** (wrong input modality for typed fields) | **v632** |

Plus three **non-tile capabilities** an agent can't reach today:

| Capability | Backing (reuse verbatim) | Fix | Spec |
|---|---|---|---|
| One-shot NL answer ("bmi 180 lb 5'10\"" → computed) | `queryCompute`, `lib/query-compute.js` (21 templates) | `answer_query` tool | **v630** |
| Lab-unit conversion (mg/dL ↔ mmol/L, A1c, kPa) | `lib/unit-convert.js` | `convert_units` tool + expose the `unit-converter-v4` tile | **v629/v630** |
| Related-calculator graph | `META[id].related` — already on **1115 tiles** | add `related` to `describe_calculator` (the concrete first step of v624) | **v630** |

## The end state, in numbers

- **Exposable now or with an adapter: 1405 + 6 + 44 + 5 = ~1460 tiles**, plus 3 capability tools.
- **Accountably waived: 8 tiles** (7 generators + `pa-lint`), each with a written reason — not silent gaps.
- **Coverage becomes self-enforcing** (v632): the build fails if anyone adds a computational tile without an
  adapter or a waiver. "Full coverage" stops being a number someone has to chase and becomes an invariant.

## Ordering

1. **v628** — the 6 clinical calculators. Small, high-value, no policy change.
2. **v629** — the 44 non-clinical tiles. The biggest single jump; needs the fence + admin disclaimer.
3. **v630** — the 3 capability tools. Independent.
4. **v631** — decision trees + reference. New tool shape; do after the calculator work.
5. **v632** — the accountability gate + waiver ledger. Capstone; encodes every disposition above.

## Invariants (inherited from spec-v183 and the v620 program)

- **Determinism.** Identical inputs → byte-identical output. No clock, no randomness, no network in any
  compute. The timers (v628) are made deterministic by taking time as an explicit input.
- **One compute, two surfaces.** The site and MCP call the same `lib/*.js`. No capability forks the math.
- **`mcp/` stays optional and deletable.** Every new gate no-ops when `mcp/` is absent.
- **Small, fixed, capability-oriented tool surface — never one-per-tile.** After this program plus v620 the
  surface is roughly a dozen tools (discovery, describe, compute, batch, reverse-lookup, related,
  answer_query, convert_units, decision-tool). That is the point: ~1460 calculators behind ~12 tools.

## Hosting posture — reaffirmed

The MCP server is **local stdio only and is not, and will not be, hosted.** Confirmed this session: the only
`fetch` handler in the repo is the browser service worker (`sw.js`); the only HTTP server is the local dev
server (`scripts/serve.mjs`); `wrangler.toml` deploys static `./dist` assets and no Worker; `mcp/` is never
copied into `dist/`. Agents run `node mcp/server.js` on their own machine — the compute happens there, at
**zero hosting cost to the project.** Nothing in v628–v632 changes this. (The one item that would — a hosted
remote endpoint — is the deliberately opt-in, unbuilt spec-v626, and this program does not depend on it.)

# spec-v183.md — Optional stdio MCP server: expose the calculator catalog as deterministic tools for AI agents (no hosting; website unchanged)

> Status: **SHIPPED (first wave, 2026-06-30).** 21 clinical calculators across
> 4 `lib` modules (tox-v86, hep-v124, acidbase-v129, cardio-v90) exposed over a
> local stdio MCP server (`mcp/`); `UTILITIES.length` unchanged (no tile delta);
> root `package.json` `dependencies` still `{}` (the SDK is pinned in
> `mcp/package.json`). Two implementation notes vs this charter: the MCP unit
> tests live in **`test/mcp/`** (not `test/unit/`) so the site `test:unit` glob
> is untouched and the delete-`mcp/`-and-site-stays-green invariant (§3) holds
> literally; and `scripts/check-mcp-catalog.mjs` is a **clean no-op when `mcp/`
> is absent**, so it can sit in the `lint` chain without breaking that same
> invariant. Charter below preserved as written.
>
> Standalone charter — **not** part of
> the [spec-v100](spec-v100.md) MDCalc-Parity program (complete at 676), the proposed
> [spec-v150](spec-v150.md)–v171 gap-closure drafts, or the
> [spec-v172](spec-v172.md) LTC-GA program (v173–v182). v183 adds a **second,
> optional consumption surface** for the calculators that already exist: a local
> **stdio** Model Context Protocol (MCP) server that lets an AI agent call the
> vetted, cited compute functions as deterministic tools — a "deterministic linter"
> for the agent's own clinical arithmetic.
>
> **The website remains the product.** v183 adds **zero** browser code, **zero**
> runtime dependencies to the site, **zero** changes to `app.js` / `views/` /
> `index.html` / the `dist` build, and **zero** new tiles (`UTILITIES.length` is
> unchanged). The MCP server is a sibling tool that *imports* the existing pure
> compute modules; it never alters how the site renders or builds.
>
> **No hosting. No network. No AI.** The server runs as a local subprocess over
> stdio (the same model as the `openlore mcp` server already wired into this repo).
> There is no deployment, no Cloudflare Worker, no Pages change, no remote endpoint,
> and no telemetry. The agent that wants it spawns it locally; everyone else is
> unaffected. Remote/HTTP transport is explicitly **out of scope** (§7).
>
> Every prior spec (v4 through v182/proposed) remains in force. v183 inherits the
> [spec-v100](spec-v100.md) §2 doctrine (re-binding [spec-v85](spec-v85.md) §2), the
> [spec-v11](spec-v11.md) §5.3 / [spec-v50](spec-v50.md) §3 clinical-posture
> contract, the [spec-v54](spec-v54.md) inline-citation rule, and the
> [spec-v59](spec-v59.md) output-safety contract — now enforced on a JSON tool
> surface instead of the DOM.

## 1. Thesis

LLMs are unreliable at exactly the two things this catalog is reliable at: **exact
arithmetic** and **recalling published coefficients/thresholds**. An agent drafting
clinical content will cheerfully miscompute a MELD score or invent a CHA₂DS₂-VASc
weighting. The 676 tiles in `UTILITIES` are pure, bounded, source-governed functions
([spec-v100](spec-v100.md) §5: re-fetched-and-verified constants) with inline
citations. Wrapping them as MCP tools turns *"the model guesses the score"* into
*"the model calls a deterministic tool and gets the right number plus the source to
cite."* That is the canonical reason tool-use exists, and it is a better use of this
data than the website alone.

v183 builds that surface with three design commitments:

1. **Website-first.** The MCP server is additive and isolated. It imports the
   existing pure `lib/*.js` computes and `lib/meta.js` citations; it does not touch
   the browser app, the build, or the site's zero-runtime-dependency posture. If the
   MCP subtree were deleted, the site would build and pass CI unchanged.
2. **Single source of truth.** Compute logic stays in `lib/*.js`. Citations,
   examples, specialties, and interpretation framing stay in `lib/meta.js`. The MCP
   server **reuses** them; it never re-types a coefficient, a citation, or an
   expected value. A lint gate ([§4](#4-cicd--maintenance)) makes divergence from
   `UTILITIES` / `META` a build failure.
3. **stdio, no hosting.** Distribution is "clone the repo (or `npx` it) and add a
   four-line block to your MCP client config." The compute happens locally on the
   caller's machine. We host nothing, run nothing, and see nothing — which is the
   right privacy posture for clinical inputs.

## 2. What v183 adds

### 2.1 A local stdio MCP server (`mcp/`)

- A Node entry, `mcp/server.js`, built on the official
  **`@modelcontextprotocol/sdk`** using `StdioServerTransport`. It speaks MCP over
  stdin/stdout only. **No HTTP, no SSE, no socket, no network egress of any kind.**
- The subtree carries its **own** `mcp/package.json` (`"type": "module"`, exact-
  pinned SDK, `engines` matching the root `.nvmrc`, and a `bin` entry so it can run
  via `npx`). This keeps the **root** `package.json` `dependencies` at `{}` — the
  site gains no runtime dependency. The MCP SDK is the MCP tool's dependency, not the
  website's.
- Distribution is GitHub-only (no npm publish required): users either clone and run
  `node mcp/server.js`, or `npx github:clay-good/sophiewell.com <bin>` once the `bin`
  is published. `mcp/README.md` documents the exact client-config snippet to paste
  (the stdio `command`/`args` block), mirroring the `openlore` entry already in
  `.claude/settings.json`.
- The server is **stateless and side-effect-free**: no filesystem writes, no
  persistence, no logging of inputs, no telemetry. Idempotent across runs.

### 2.2 Three dispatch tools (not 676)

Exposing one tool per calculator would flood every client's tool list and context.
v183 exposes a **fixed three-tool surface** with dynamic dispatch over the catalog:

1. **`list_calculators`** — discovery. Optional filters `{ group?, specialty?,
   query? }`. Returns lightweight rows `{ id, name, group, specialties, summary }`
   plus a **coverage line** (`"<N> of <M> catalog tiles exposed"` — see §2.4). No
   computation. `query` is a substring/keyword match over id + name + specialties.
2. **`describe_calculator`** — `{ id }` → the full contract for one calculator:
   `{ id, name, group, specialties, inputSchema (JSON Schema), example, citation,
   citationUrl, citationAccessed, interpretationNote }`. `inputSchema` is the
   machine-readable input contract (§2.3); `example`, `citation*`, and
   `interpretationNote` are pulled verbatim from `META[id]`.
3. **`compute_calculator`** — `{ id, inputs }` → the deterministic result:
   `{ id, result, citation, citationUrl, disclaimer }`, where `result` is the
   structured return of the underlying `lib` function (score, bands, derived values,
   notes). Inputs are validated against `inputSchema` first; invalid input returns a
   structured `{ valid: false, message }` (never a thrown stack, never a non-finite
   number). `disclaimer` carries the [spec-v50](spec-v50.md) §3 clinical-posture
   note; high-stakes tiles (e.g. `opioid-conversion`) additionally carry the
   [spec-v11](spec-v11.md) §5.3 independent-second-check caveat sourced from `META`.

Each tool ships a precise MCP input schema and a one-paragraph description so an
agent can route correctly without trial calls.

### 2.3 The adapter registry (`mcp/catalog.js` + `mcp/adapters/*.js`)

The one artifact that does **not** already exist is a **machine-readable per-tile
input schema**. Today each tile's input contract lives *inside* its DOM renderer
(`views/group-*.js`: `numField`/`pickField`/`checkField` calls reading
`document.getElementById`), tangled with the browser and not reusable in Node. The
`META[id].example.fields` map is keyed by **DOM input id**, and the `lib` compute
functions take **bespoke structured argument objects** (e.g.
`ballard({ neuromuscular:[...], physical:[...] })`). There is an impedance mismatch
between the three, and no existing structure bridges it.

v183 introduces a thin **adapter** per exposed tile, grouped by source module under
`mcp/adapters/<module>.js`. Each adapter entry declares:

```
{
  id,                       // must exist in UTILITIES (gate-verified, §4)
  summary,                  // one-line plain-language description
  inputSchema,             // JSON Schema for { inputs } — types, ranges, enums, required
  toArgs(inputs),           // map validated inputs -> the lib function's argument object
  compute,                  // the imported pure lib export (e.g. M.ballard)
  formatResult(raw),        // normalize the lib return to the JSON result contract
}
```

`name`, `group`, `specialties`, `citation*`, `example`, and `interpretationNote`
are **not** declared in the adapter — they are read at load time from `UTILITIES`-
mirrored values and from `META[id]`, so there is exactly one source for each. The
adapter contributes only the input schema and the two pure mapping functions. This
keeps the new surface area minimal and the data single-sourced.

`mcp/catalog.js` assembles the registry by importing every `mcp/adapters/*.js`, then
joins each entry with its `META[id]` record and validates (at load) that the id is
present and that `example` round-trips (§4). The server imports only `mcp/catalog.js`
and the pure compute modules — **never** `app.js`, **never** `views/*`, **never** a
DOM-coupled `lib` (`dom.js`, `result-copy.js`, etc.).

### 2.4 Coverage is explicit and honest (`docs/mcp-coverage.md`)

Adapting 676 tiles is incremental work. v183 refuses to imply more coverage than it
ships ([spec-v100](spec-v100.md) "no silent caps" discipline):

- `docs/mcp-coverage.md` is the **coverage ledger**: every catalog id marked
  `exposed` or `not-yet-adapted` (with a one-word reason for deferrals). The lint
  gate asserts the ledger matches the live adapter set exactly.
- `list_calculators` reports the live coverage count, so an agent always knows the
  exposed fraction.
- **First-wave acceptance** ([§6](#6-acceptance-criteria)) requires a proof-of-
  pattern slice — **at least 20 clinical calculators across ≥ 3 `lib` modules** —
  fully adapted, schema-described, example-verified, and gated end-to-end.
  Subsequent waves (their own follow-on specs) extend coverage module-by-module
  against the same contract.
- MVP scope is **clinical compute tiles** (`clinical: true`). The Group A/B billing
  and coding tiles (`clinical: false`) are eligible later but are **not** in the
  first wave (§7).

## 3. Architecture & robustness

- **Node-importability (verified).** `lib/meta.js` and the compute modules
  (`lib/scoring-v6.js`, `lib/rheum-v148.js`, …) import only `./num.js` and pure
  helpers — no `document`/`window`, no `views/*`. The MCP server runs them unchanged
  under Node. A gate-time smoke check (§4) imports every adapter's `compute` module
  in a bare Node context and fails on any DOM/global reference, so a future tile that
  accidentally couples compute to the DOM cannot silently break the server.
- **Determinism.** Identical `{ id, inputs }` → byte-identical `result`. No
  `Date.now()`, no `Math.random()`, no network, no AI, no hidden state. This is the
  property that makes the server usable as a linter.
- **Output safety ([spec-v59](spec-v59.md)).** Every `compute_calculator` result is
  run through the same `lib/num.js` discipline the DOM uses; the server asserts the
  serialized result contains **no** `NaN`/`Infinity`/`null`-from-overflow before
  returning. Invalid or incomplete inputs yield a structured
  `{ valid: false, message }`, never a thrown error object or a non-finite value. The
  existing [spec-v59](spec-v59.md) fuzz harness is extended to drive every adapter
  through `compute_calculator` (zero non-finite leaks on the JSON surface).
- **Clinical posture ([spec-v11](spec-v11.md) §5.3, [spec-v50](spec-v50.md) §3).**
  `describe_calculator` and `compute_calculator` carry the source's interpretation
  and a disclaimer that the value is a computed quantity, not a treat/escalate/
  prescribe order; the decision stays with the clinician and local protocol. High-
  stakes tiles surface their `META` second-check caveat. The server authors nothing
  in "Sophie's voice."
- **Citations ([spec-v54](spec-v54.md)).** Every `describe`/`compute` response
  returns `citation` + `citationUrl` + `citationAccessed` from `META[id]` so an agent
  can cite the primary source. Maintenance class and any
  `docs/citation-staleness.md` row of the underlying tile are inherited unchanged —
  v183 introduces no new citation and no new staleness row.
- **Isolation from the site.** The MCP subtree is import-acyclic with the browser
  app: `mcp/* → lib/<pure>` only. Deleting `mcp/` leaves `npm run build`,
  `npm run lint`, and `npm run test` green. The site's CI jobs do not depend on the
  MCP tests, and the MCP tests do not run the Playwright/site build.

## 4. CI/CD & maintenance

- **New gate `scripts/check-mcp-catalog.mjs`** (added to the `lint` script chain),
  asserting:
  1. every adapter `id` exists in `UTILITIES` (parsed with the same id regex
     `scripts/check-catalog-truth.mjs` already uses — no runtime import of `app.js`);
  2. every exposed id is `clinical: true` (or on an explicit allowlist);
  3. `docs/mcp-coverage.md` matches the live adapter set exactly (every id is
     accounted for as `exposed` or `not-yet-adapted`);
  4. every adapter's `META[id].example` round-trips: feeding `example.fields` through
     `toArgs → compute → formatResult` reproduces a result consistent with
     `META[id].example.expected` (server-side reuse of the e2e example-correctness
     contract);
  5. no adapter `compute` module references a DOM global (bare-Node import smoke
     check);
  6. each adapter declares a valid JSON Schema and a `summary`.
- **New `test:mcp` npm script** (`node --test test/unit/mcp-*.test.js`) covering: the
  three tools' input/output contracts, JSON-Schema input validation (valid + invalid
  + incomplete), determinism (same input → same output across repeated calls), the
  structured-error shape, the disclaimer/citation presence on every `describe`/
  `compute`, and at least three worked `compute_calculator` calls per first-wave
  module. Wired into CI as an **independent** job; it does not gate, and is not gated
  by, the site build/e2e.
- **Catalog-truth surface ([spec-v46](spec-v46.md)).** `docs/mcp-coverage.md`
  becomes a tracked surface for `check-mcp-catalog.mjs` only; it is **not** added to
  the existing 13 catalog-truth count surfaces (the MCP coverage count is a subset
  count, distinct from `UTILITIES.length`, and must not be conflated with it).
- **Maintenance class.** The server is a pure wrapper (**Class A** posture): it adds
  no formula and no constant. Source freshness is governed entirely by the underlying
  tiles' existing classes and staleness rows. The SDK pin is bumped deliberately
  (same dogfooding discipline as the `openlore` pin).
- **Dependency isolation.** `@modelcontextprotocol/sdk` is pinned exact in
  **`mcp/package.json`** only. The root `package.json` `dependencies` stays `{}`; the
  `sbom`/site build are unaffected. (If a single-lockfile policy is preferred, the
  SDK may instead live in the **root** `devDependencies`; either way it never becomes
  a site runtime dependency — the implementing session picks one and records it.)

## 5. Files touched

```
docs/spec-v183.md                         (this file)
mcp/server.js                             (new: stdio MCP entry — official SDK, StdioServerTransport, 3 tools)
mcp/catalog.js                            (new: assemble registry from adapters + META; load-time validation)
mcp/adapters/<module>.js                  (new: per-module adapters — first wave, ≥3 modules, ≥20 tiles)
mcp/package.json                          (new: type=module, exact-pinned @modelcontextprotocol/sdk, engines, bin)
mcp/README.md                             (new: stdio client-config snippet; no-hosting/no-network/privacy note)
scripts/check-mcp-catalog.mjs             (new gate: id⊆UTILITIES, clinical-only, ledger-accurate, example round-trip, no-DOM, schema valid)
docs/mcp-coverage.md                      (new: coverage ledger — exposed vs not-yet-adapted)
test/unit/mcp-tools.test.js               (new: 3-tool contracts, schema validation, determinism, error shape, disclaimer/citation)
test/unit/mcp-compute.test.js             (new: ≥3 worked compute calls per first-wave module)
test/unit/fuzz-tools.test.js              (extend: drive each adapter through compute_calculator — zero non-finite leaks)
package.json                              (add test:mcp script; add check-mcp-catalog.mjs to the lint chain; root dependencies stay {})
README.md                                 (add an "MCP server (optional)" section; spec-progression line -> v183)
CHANGELOG.md                              (Unreleased: v183 — optional stdio MCP surface, no tile delta)
.github/workflows/*.yml                   (add an independent mcp test job; site jobs unchanged)
```

**Not touched** (the website): `app.js`, `views/*`, `index.html`, `styles.css`,
`sw.js`, the `dist` build, `lib/*` compute modules, `lib/meta.js`. v183 *reads* the
last two; it does not edit them. `UTILITIES.length` is unchanged.

## 6. Acceptance criteria

v183 is fully shipped when:

- A local MCP client (e.g. Claude Code via a stdio `command`/`args` block, per
  `mcp/README.md`) can connect to `mcp/server.js`, and `list_calculators` /
  `describe_calculator` / `compute_calculator` all respond over stdio with **no**
  network access (verifiable offline).
- The **first wave** exposes **≥ 20 clinical calculators across ≥ 3 `lib` modules**,
  each with: a valid `inputSchema`, an `example` that round-trips through the adapter
  to `META[id].example.expected`, a citation+url+accessed echoed from `META`, and a
  clinical-posture disclaimer on `compute`. `opioid-conversion` (if in-wave) also
  returns the second-check caveat.
- `compute_calculator` is deterministic (repeated identical calls are byte-identical)
  and **never** emits `NaN`/`Infinity`; invalid/incomplete inputs return a structured
  `{ valid: false, message }`. The extended [spec-v59](spec-v59.md) fuzz harness
  reports zero non-finite leaks across every exposed adapter.
- `docs/mcp-coverage.md` accurately lists every catalog id as `exposed` or
  `not-yet-adapted`, and `list_calculators` reports the matching coverage count.
- `scripts/check-mcp-catalog.mjs` passes (id⊆`UTILITIES`, clinical-only, ledger-
  accurate, example round-trip, no-DOM smoke, schema valid), and is part of
  `npm run lint`.
- `npm run test:mcp` passes as an independent CI job.
- **The website is provably unaffected:** `npm run lint`, `npm run test`,
  `npm run sbom`, and `npm run build` are green with the MCP subtree present, **and**
  green if `mcp/` is removed; root `package.json` `dependencies` is still `{}`;
  `UTILITIES.length` is unchanged; no `app.js` / `views/` / `dist` diff.
- `README.md` documents the optional MCP server (install, the stdio config snippet,
  the no-hosting/no-network/privacy posture), and the CHANGELOG records v183 with a
  **zero** tile delta.

## 7. Out of scope for v183

- **No hosting and no remote transport.** stdio only. No HTTP/SSE/Streamable-HTTP
  server, no Cloudflare Worker, no Pages change, no deployed endpoint, no auth. If
  browser-based/remote agents (claude.ai connectors) are wanted later, that is a
  separate spec that adds a Worker transport over the *same* `mcp/catalog.js` — it is
  not built here.
- **No website behavioral change.** No new tiles, no renderer edits, no build/output
  change, no new browser runtime dependency. The site stays the product.
- **No AI and no network in the server.** Pure local compute; no model calls, no
  fetches, no telemetry, no input logging or persistence.
- **No billing/coding tiles in the first wave.** Group A/B (`clinical: false`) tiles
  are eligible in a later wave but excluded from MVP to keep the proof-of-pattern
  focused on clinical calculators.
- **No proprietary/licensed instruments** beyond what the catalog already ships — the
  MCP exposes only existing tiles and inherits every [spec-v100](spec-v100.md) §8
  exclusion (methadone/buprenorphine conversion, PPS/MNA, STOPP/START, etc.).
- **No automatic ordering.** Every `compute`/`describe` reports the value and the
  source's interpretation; it never authors a dosing/treatment/escalation order
  ([spec-v11](spec-v11.md) §5.3). The decision stays with the clinician and local
  protocol.
- **No per-calculator MCP tools.** The dispatch surface is fixed at three tools;
  growth happens in the adapter registry and the coverage ledger, not the tool count.

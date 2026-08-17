# Sophie Well calculators — optional stdio MCP server (spec-v183)

A local [Model Context Protocol](https://modelcontextprotocol.io) server that
exposes Sophie Well's deterministic, source-cited clinical calculators as tools
an AI agent can call. LLMs are unreliable at exact arithmetic and at recalling
published coefficients; these calculators are reliable at both. Wrapping them as
MCP tools turns *"the model guesses the score"* into *"the model calls a
deterministic tool and gets the right number plus the source to cite."*

**The website ([sophiewell.com](https://sophiewell.com)) is the product.** This
server is an optional, isolated second consumption surface for the calculators
that already exist. It adds zero browser code and zero runtime dependencies to
the site.

## No hosting · no network · no AI

- **stdio only.** The server speaks MCP over stdin/stdout. There is no HTTP, no
  SSE, no socket, and no network egress of any kind.
- **Local.** The agent that wants it spawns it as a subprocess on your machine.
  We host nothing, run nothing, and see nothing — the right privacy posture for
  clinical inputs.
- **Deterministic.** Identical `{ id, inputs }` always returns a byte-identical
  result. No `Date.now()`, no `Math.random()`, no model calls, no hidden state.
- **Stateless.** No filesystem writes, no persistence, no input logging, no
  telemetry.

## Install

Requires Node `>=20.18.1 <21` (matches the repo `.nvmrc`).

```sh
git clone https://github.com/clay-good/sophiewell.com.git
cd sophiewell.com/mcp
npm install        # installs @modelcontextprotocol/sdk into this subtree only
```

The MCP SDK is pinned in `mcp/package.json`. The website's root `package.json`
keeps `dependencies: {}` — installing the server here never adds a runtime
dependency to the site.

### Smoke test (optional)

Confirm the server answers before wiring a client. From `sophiewell.com/mcp`:

```sh
printf '%s\n%s\n' \
  '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"smoke","version":"1"}}}' \
  '{"jsonrpc":"2.0","id":2,"method":"tools/list"}' | node server.js
```

You should see an `initialize` result carrying the server `instructions`, then a
`tools/list` result listing the eight tools.

## Wire it into an MCP client

The server is a local stdio process — the same shape as any local MCP server.

**Claude Code (one line):**

```sh
claude mcp add sophiewell-calculators -- node /absolute/path/to/sophiewell.com/mcp/server.js
```

**Project-scoped `.mcp.json`** (checked into a repo, so your team shares it):

```json
{
  "mcpServers": {
    "sophiewell-calculators": {
      "command": "node",
      "args": ["/absolute/path/to/sophiewell.com/mcp/server.js"]
    }
  }
}
```

The same `command` + `args` block works for Claude Desktop, VS Code, Cursor, and
any other MCP client — only the surrounding config file differs.

## Tools

A fixed eight-tool surface with dynamic dispatch over the catalog (exposing one
tool per calculator would flood the client's tool list). Every tool is
annotated read-only, idempotent, and closed-world, and returns both a text block
and typed `structuredContent`.

| Tool | Input | Returns |
|---|---|---|
| `find_calculator` | `{ query, limit?, group?, specialty? }` | Discovery by plain-language intent: the same deterministic ranker the browser prompt bar uses (synonym table + token ranker, no AI) ranks the exposed calculators and returns the top-N candidates `{ id, name, group, specialties, summary, why }`. Use it when a substring `query` would miss (e.g. "stroke risk afib"). |
| `list_calculators` | `{ group?, specialty?, query?, limit?, offset?, fields? }` | Paginated rows plus a live coverage line and `catalogVersion`. Default page 50, max 200; read `total`, `count`, and `nextOffset` to page. `fields:"compact"` returns id/name/group only. `query` is a substring test. No computation. |
| `get_catalog_manifest` | `{}` | A one-shot compact index of **every** exposed calculator `{ id, name, group, specialties }` plus coverage counts and `catalogVersion`. Fetch once to reason about the whole catalog instead of paging. |
| `describe_calculator` | `{ id }` | The full contract: `inputSchema` (JSON Schema), a worked `example`, `citation` + `citationUrl` + `citationAccessed`, the source interpretation bands, `related` calculator ids, and the clinical-posture disclaimer. |
| `compute_calculator` | `{ id, inputs }` | The deterministic `result` (score, bands, derived values, source note), the citation, and the disclaimer. Invalid or incomplete input returns `{ valid: false, code, field?, message }` — never a thrown error and never a non-finite number. |
| `compute_batch` | `{ calculations: [{ id, inputs }, ...] }` | Runs up to 25 calculators in one call for a workup. Results come back in request order, each the same shape as `compute_calculator`; one invalid element does not fail the others. No combined interpretation. |
| `answer_query` | `{ query }` | One-shot answer: parses a sentence that already carries its values ("bmi 80kg 180cm", "map 120/80") and returns the computed value with its citation. `matched:false` / `NO_MATCH` when no template applies — then use `find_calculator`. |
| `convert_units` | `{ kind, value, direction? }` | Deterministic lab + vitals unit conversion (mg/dL ↔ mmol/L, HbA1c % ↔ IFCC, mmHg ↔ kPa, degF ↔ degC, in ↔ cm, lb ↔ kg). `kind` is a lab analyte or a1c/pressure/temperature/length/weight. |

`inputs` are keyed exactly as `describe_calculator` reports them (and exactly as
each calculator's documented example). Numbers may be sent as numbers or numeric
strings; booleans as `true`/`false`; enums by their listed string values.

**Errors carry a stable `code`** (and `field` where input-specific) alongside the
English `message`, so you can branch without parsing prose: `UNKNOWN_TOOL`,
`UNKNOWN_ID`, `BAD_ARGS`, `UNKNOWN_INPUT`, `MISSING_INPUT`, `INVALID_TYPE`,
`INCOMPLETE`, `COMPUTE_ERROR`, `NO_MATCH`.

**`catalogVersion`** (`{ contentHash, tileCount, exposedCount, deterministic,
cacheable }`) rides on the discovery tools. Because compute is deterministic, you
may cache a result keyed by `(id, inputs, contentHash)` and invalidate only when
`contentHash` changes. A retired `id` resolves to its successor with a
`deprecatedId`/`canonicalId` notice (see `data/id-aliases.json`).

**`domain`** on `describe`/`compute` is `clinical` or `administrative`. Most tiles
are clinical decision-support and carry the clinical disclaimer; administrative
tiles (billing, coding, identifier and format checks) carry an administrative
disclaimer instead — a computed figure is not a guarantee of payment, coverage, or
compliance. Both are deterministic and cited the same way.

### Example session

```
find_calculator { "query": "stroke risk afib" }
  -> { query: "stroke risk afib", count: 3,
       candidates: [ { id: "chads", name: "CHA2DS2-VASc", why: "synonym", ... }, ... ] }

list_calculators { "specialty": "hepatology", "limit": 50 }
  -> { coverage: "<N> of <M> catalog tiles exposed ...", total: <T>, count: <=50,
       nextOffset: <int|null>, catalogVersion: { contentHash: "...", ... },
       calculators: [ { id: "meld-xi", ... }, ... ] }

describe_calculator { "id": "meld-xi" }
  -> { inputSchema: { ... mx-bili, mx-creat ... }, citation: "Heuman DM ... Liver Transpl 2007", ... }

compute_calculator { "id": "meld-xi", "inputs": { "mx-bili": 2.0, "mx-creat": 1.5 } }
  -> { valid: true, result: { score: 18, band: "MELD-XI 18 ...", note: "..." },
       citation: "Heuman DM ...", disclaimer: "This is a computed quantity for decision support, not ..." }

compute_calculator { "id": "meld-xi", "inputs": {} }
  -> { id: "meld-xi", valid: false, code: "MISSING_INPUT", field: "mx-bili", message: "..." }
```

The live coverage fraction is whatever `list_calculators` reports at call time;
it is never hardcoded here.

## Coverage

Coverage is incremental and explicit, and never hardcoded here. `list_calculators`
and `get_catalog_manifest` report the live fraction (`"<N> of <M> catalog tiles
exposed"`) on every call, and `docs/mcp-coverage.md` is the authoritative ledger
of exactly which calculators are exposed (`scripts/check-mcp-catalog.mjs` fails the
build if the ledger and the live adapter set diverge). Not every catalog tile is a
calculator; the non-computational tiles (reference tables, document generators) are
tracked as accountable exceptions rather than exposed. See `docs/mcp-coverage.md`
for the current set and the per-tile rationale.

## Design

- **Single source of truth.** Compute logic stays in `lib/*.js`; citations,
  examples, and interpretation stay in `lib/meta.js`; the tile's name/group/
  clinical flag stay in `app.js`. An adapter (`mcp/adapters/*.js`) contributes
  only the input schema and two pure mapping functions (`toArgs`,
  `formatResult`). `scripts/check-mcp-catalog.mjs` fails the build if an
  adapter diverges from `UTILITIES` / `META`, if the ledger drifts, or if an
  example stops round-tripping.
- **Isolation.** The subtree imports only `mcp/* -> lib/<pure>`. It never
  imports `app.js`, `views/*`, or any DOM-coupled module. Deleting `mcp/` leaves
  the site's `npm run build`, `npm run lint`, and `npm run test` green.
- **Clinical posture.** Every `describe`/`compute` carries the source's
  interpretation and a disclaimer that the value is a computed quantity, not a
  treat/escalate/prescribe order. The decision stays with the clinician and
  local protocol. The server authors nothing in "Sophie's voice."

## Not in scope

No hosting, no remote/HTTP transport, no auth, no website change, no new tiles,
no AI, no network. See `docs/spec-v183.md` §7.

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

## Wire it into an MCP client

Add a stdio server block to your client config (the same shape as any local MCP
server). For Claude Code / Claude Desktop:

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

## Tools

A fixed three-tool surface with dynamic dispatch over the catalog (exposing one
tool per calculator would flood the client's tool list):

| Tool | Input | Returns |
|---|---|---|
| `list_calculators` | `{ group?, specialty?, query? }` | Lightweight rows `{ id, name, group, specialties, summary }` plus a live coverage line. No computation. |
| `describe_calculator` | `{ id }` | The full contract: `inputSchema` (JSON Schema), a worked `example`, `citation` + `citationUrl` + `citationAccessed`, the source interpretation bands, and the clinical-posture disclaimer. |
| `compute_calculator` | `{ id, inputs }` | The deterministic `result` (score, bands, derived values, source note), the citation, and the disclaimer. Invalid or incomplete input returns `{ valid: false, message }` — never a thrown error and never a non-finite number. |

`inputs` are keyed exactly as `describe_calculator` reports them (and exactly as
each calculator's documented example). Numbers may be sent as numbers or numeric
strings; booleans as `true`/`false`; enums by their listed string values.

### Example session

```
list_calculators { "specialty": "hepatology" }
  -> { coverage: "39 of 772 catalog tiles exposed ...", calculators: [ { id: "meld-xi", ... }, ... ] }

describe_calculator { "id": "meld-xi" }
  -> { inputSchema: { ... mx-bili, mx-creat ... }, citation: "Heuman DM ... Liver Transpl 2007", ... }

compute_calculator { "id": "meld-xi", "inputs": { "mx-bili": 2.0, "mx-creat": 1.5 } }
  -> { valid: true, result: { score: 18, band: "MELD-XI 18 ...", note: "..." },
       citation: "Heuman DM ...", disclaimer: "This is a computed quantity for decision support, not ..." }
```

## Coverage

Coverage is incremental and explicit. `docs/mcp-coverage.md` is the ledger of
which calculators are exposed; `list_calculators` always reports the live
fraction. The first wave exposed 21 clinical calculators across 4 `lib` modules
as a proof of pattern; a second wave adds 18 more across 4 modules (pulmonary
function, hemorrhagic stroke, metabolic / endocrine, and perioperative risk),
for 39 across 8 modules today. Later waves extend it module by module against the
same contract.

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

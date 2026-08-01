# spec-v634 — Speak the rest of the MCP dialect

**Status:** proposal. No code changed. Written 2026-07-31. Part of the v633 program.

The server implements the minimum of MCP: it lists tools and calls them. The SDK (`@modelcontextprotocol/sdk`
1.29.0, already installed) supports three more things that directly help an agent use these tools correctly.
All three are additive, backward-compatible, and need no dependency bump. Two protocol features are
deliberately declined.

## 1. Server `instructions` — adopt

`mcp/server.js` constructs the `Server` with a name, version, and `{ capabilities: { tools: {} } }` — no
`instructions`. The SDK reads `options.instructions` and returns it in the initialize response, where the
client shows it to the model. We give the model no orientation; it must infer the whole workflow from four
tool descriptions.

**Add a ~150-word `instructions` string** (a `const` in `server.js` or exported beside `DISCLAIMER` in
`catalog.js`) that teaches, in one authoritative place:

- **What this is** — ~1,400 deterministic, individually cited clinical calculators as **read-only** tools; no
  network, no model, no writes; identical inputs return byte-identical output, so results are cacheable.
- **The workflow** — `find_calculator` for plain-language intent, `list_calculators` to browse by
  group/specialty, `describe_calculator` to get the input schema + example + citation *before* computing,
  `compute_calculator` to run it (invalid input returns `{valid:false,…}`, never a throw).
- **The posture** — every result carries a source citation and a disclaimer; a computed band is
  decision-support, not an order. Surface the citation; keep the decision with the clinician.

It is prepended to context every session, so keep it tight.

## 2. Tool annotations — adopt (all four current tools)

MCP tool defs accept an `annotations` object; ours have none. All the tools are read-only, side-effect-free,
deterministic, and closed-world:

| tool | `title` | `readOnlyHint` | `idempotentHint` | `openWorldHint` |
|---|---|:--:|:--:|:--:|
| `list_calculators` | List clinical calculators | true | true | false |
| `find_calculator` | Find calculators by intent | true | true | false |
| `describe_calculator` | Describe a calculator | true | true | false |
| `compute_calculator` | Compute a calculator | true | true | false |

`destructiveHint` is omitted (the schema notes it is meaningful only when `readOnlyHint` is false).

**Why it helps an agent:** `readOnlyHint:true` lets clients that gate mutating tools auto-approve these
without a confirmation prompt — a direct UX win in guarded environments. `readOnly` + `idempotent` license
result caching and safe retries. `openWorldHint:false` tells the agent the domain is a fixed catalog, so a
`find_calculator` "no match" is authoritative, not a transient miss. Apply the same annotations to every tool
the v620/v627 programs add (all are equally read-only).

## 3. `structuredContent` + `outputSchema` — adopt (structuredContent unconditionally; schema on the stable tools)

Today every result is `content:[{type:'text', text: JSON.stringify(result)}]` — the agent must string-parse.

**Part A (do unconditionally, one line):** also return the parsed object as `structuredContent`:
`return { content:[…text…], structuredContent: result }`. Agents get a typed object; clients that ignore
`structuredContent` still get the text. This is the bulk of the benefit.

**Part B (declare `outputSchema` on the stable-envelope tools):** the *envelopes* are uniform (built in
`tools.js`, not the adapters), even though each calculator's inner `result` object varies. Declare an
`outputSchema` for `list_calculators`, `describe_calculator`, and `find_calculator` typing the envelope
fields, with the variable `result` left as an open `{ type: 'object' }`. For `compute_calculator`, use the
same loose envelope (`result: {type:'object'}`) or rely on `structuredContent` alone.

**Feasibility (confirmed against the SDK):** because the server uses the **low-level `Server`** (not the
high-level `McpServer`), there is **no automatic validation** of `structuredContent` against `outputSchema` —
a loose `result` type carries zero risk of the SDK rejecting a per-calculator shape. One caveat: a tool that
*declares* an `outputSchema` should return `structuredContent` on **every** result including
`{valid:false,…}` errors — which Part A already guarantees.

## Declined — resources and prompts

- **Resources:** `describe_calculator` already returns per-calculator reference cards (schema, example, bands,
  citation, disclaimer) and `list_calculators` enumerates the catalog. Re-exposing the same content as
  `resources://` URIs duplicates the tool surface for no new capability. Skip.
- **Prompts:** pre-authored workflow templates ("assess this patient's VTE risk") push a deterministic
  *calculator* surface toward *clinical workflow authoring*, which collides with the "not an order" posture
  and adds a template layer that drifts from a 1,400-tile catalog. The no-AI, no-editorial stance is stronger
  without it. Skip.

## Guards

- **Backward compatible.** The text `content` block stays; `structuredContent`, `annotations`, and
  `instructions` are additions. No existing client breaks.
- **`mcp/`-deletable unchanged.** These are all inside `mcp/`.
- A test asserts every tool declaring an `outputSchema` returns `structuredContent` on both success and error.

## Files (when built)

`mcp/server.js` (instructions; structuredContent in the result envelope), `mcp/tools.js` (annotations +
outputSchema on `TOOL_DEFS`), `mcp/catalog.js` (optional `SERVER_INSTRUCTIONS` const), `test/mcp/*`.

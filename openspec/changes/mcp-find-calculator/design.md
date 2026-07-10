# Design — MCP find_calculator

## Context

`mcp/tools.js` keeps tool logic SDK-free (pure functions; `server.js` wires them to a
`StdioServerTransport`), so a fourth tool is: one handler, one `TOOL_DEFS` entry, one
`dispatch` case, plus tests. The registry (`mcp/catalog.js`) already joins adapters, META, and
UTILITIES — every row carries `name`, `summary`, `specialties`, `group`, and META gives
`example.expected` and interpretation bands. `lib/prompt.js` is pure and importable from Node
today (the proposal's misroute table was measured exactly this way).

## Decisions

**D1 — One ranker, one corpus assembler, two surfaces.** Extract a small pure module (e.g.
`lib/search-doc.js`) that builds a per-tile ranking row from `{ name, group, audiences,
specialties, summary?, what?, when?, expected?, bands? }`. The browser feeds it
UTILITIES + META + the fetched corpus; the MCP handler feeds it registry rows + META directly
(no fetch — the server already imports both). Parity between surfaces becomes a unit test:
same query, same corpus fields, same top id.

**D2 — Handler semantics.** `findCalculator({ query, limit = 5, group, specialty })`:
run `resolvePromptRanked` over the (optionally group/specialty-prefiltered) rows with the
synonym table loaded from `data/synonyms.json`; return at most `limit` (hard cap 20) rows
shaped like `list_calculators` rows plus `why` (synonym phrase or matched tokens). No scores
in the output — they're rubric-internal and would invite brittle client behavior. Stable id
tie-break. Empty/blank query → `{ valid: false, message }` steering to `list_calculators`.

**D3 — No-match is a hint, not an error.** Above-threshold nothing → `{ count: 0,
candidates: [], hint }` where the hint suggests `list_calculators` with a broader filter.
Deterministic, never a throw (consistent with the server's error posture).

**D4 — `list_calculators` untouched.** Its substring `query` stays byte-for-byte; existing
agent scripts keep working. `find_calculator`'s description points agents at it for exhaustive
enumeration, and vice versa ("for a natural-language query, prefer find_calculator").

**D5 — Governance.** spec-v183's "three dispatch tools" clause is superseded, not amended
silently: the build session authors the `docs/spec-v*.md` successor recording the fourth tool
and the unchanged rationale (no per-tile flood, stdio-only, stateless, deterministic, no AI).

## Risks

- **Ranking drift between surfaces.** Mitigated by D1's shared assembler plus a parity unit
  test over the proposal's fixture queries.
- **Synonym table loading.** The server must read `data/synonyms.json` from the repo tree
  (path-relative, like catalog assets); a missing file degrades to ranker-only, mirroring the
  browser's accelerator semantics.
- **Token-cost creep for clients.** `limit` default 5 / cap 20 and lightweight rows keep
  responses small; `describe_calculator` remains the detail hop.
- **check-mcp-catalog / test:mcp.** The ledger and round-trip tests key off adapters and ids —
  a new dispatch tool must not disturb them; add `find_calculator` worked-query blocks to
  `test/mcp/` instead.

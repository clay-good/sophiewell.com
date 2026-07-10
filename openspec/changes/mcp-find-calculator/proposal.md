# Change: MCP discovery — a ranked find_calculator tool

## Why

The MCP server deliberately exposes a fixed three-tool surface (spec-v183 §2.2:
`list_calculators`, `describe_calculator`, `compute_calculator`) so 1,044 registry entries
don't flood a client's tool list. But its only discovery affordance is `list_calculators`'
`query` — a single lowercase **substring** test over `id + name + summary + specialties`
(`mcp/tools.js:35-44`). A natural query like "stroke risk afib" matches nothing (no one
substring spans those words), so agents either page through the full registry or guess ids.

Meanwhile the `plain-language-search` change gives the *browser* a deterministic
question-router (`lib/prompt.js` is already pure, DOM-free, and Node-importable). The same
investment should serve agents: one ranker, two surfaces. This change deliberately re-opens
the spec-v183 fixed-three-tool fence to add a **fourth, read-only, deterministic** tool — it
does not touch the "no AI" posture (the ranker is the same reviewed token/synonym machinery,
no model anywhere).

## What Changes

- **New tool `find_calculator`**: `{ query, limit?, group?, specialty? }` → ranked candidate
  rows `{ id, name, group, specialties, summary, why }`, top-N (default 5, capped), backed by
  the shared ranked resolver from `plain-language-search` (`resolvePromptRanked` + the synonym
  table + the same corpus fields, assembled Node-side from the registry and META).
- **A shared corpus-row assembler** so the browser and the MCP server rank over identical
  per-tile text (one pure module both import), keeping routing parity testable.
- **`list_calculators` unchanged** — existing clients keep their exact substring semantics.
- **Registration + docs:** `TOOL_DEFS` and `dispatch` gain the fourth tool (`mcp/tools.js`);
  `mcp/README.md` and `docs/mcp-coverage.md` document the new surface; a `docs/spec-v*.md`
  successor to spec-v183 records the re-opened fence.

## Impact

- Affected specs (folded in at build): **mcp-discovery** (new capability); supersedes the
  spec-v183 §2.2 "exactly three tools" clause (three dispatch tools → four; still no per-tile
  tool flood).
- Affected code: `mcp/tools.js`, `mcp/README.md`, `docs/mcp-coverage.md`,
  `test/mcp/` (new worked-query tests), plus the shared assembler module in `lib/`.
- **Untouched:** the three existing tools and their schemas, all adapters, the round-trip
  contract, `mcp/server.js` transport (stdio-only, stateless, no telemetry), the browser app
  and `dist/` (MCP-only waves leave e2e/mobile sweeps unaffected).
- **Depends on:** `plain-language-search` (ranked resolver + synonym expansion). Buildable
  against adapter summaries alone if the corpus asset is absent.
- Docs-only proposal (propose-first); a later session builds it.

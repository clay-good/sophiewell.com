# spec-v635 — Payload ergonomics: stop blowing the context window

**Status:** proposal. No code changed. Written 2026-07-31. Part of the v633 program.

## The footgun (measured)

`list_calculators({})` returns **every** exposed calculator — 1405 rows of `{id,name,group,specialties,
summary}` — with no cap and no pagination. Serialized on the wire it is **~230,000 tokens**, larger than a
whole 200K context window. It is also the most natural call an agent makes ("show me what's available"), and
nothing warns it. Even filtered, the largest group returns ~177K tokens and the largest specialty ~35K.

Two other measurements frame the fix:
- The wire format is pretty-printed (`JSON.stringify(result, null, 2)`), a **~13–15% token tax on every
  payload** for indentation no agent needs.
- `describe_calculator` (worst case ~3.8K tokens) and `find_calculator` (worst ~3.2K at limit 20) are
  **well-sized — leave them alone.** The problem is `list_calculators` specifically.

## The fixes (priority order)

**1. Cap + paginate `list_calculators`.** Add `limit` (default ~50, hard max ~200) and `offset`. Return the
page plus the total match `count` and a `nextOffset` (or a truncation flag) so an agent can page
deterministically. This alone removes the context-window blowout. Localized to `listCalculators`.

**2. Add a compact mode.** The `summary` field is ~88% of a row's bytes; dropping it shrinks a row ~8×. Add a
`fields: 'compact'` (id + name + group only) vs `'full'` option. Given the size math, an uncapped or large
result should default to compact.

**3. Expose a one-shot catalog manifest.** An agent that wants to reason about the whole catalog once
shouldn't pay 230K tokens. The material already exists: `data/search-corpus/corpus.json` is keyed by all 1468
tile ids with name/group/specialties. Add a lightweight `get_catalog_manifest` tool that returns a compact
id → name → group → specialties index (whole catalog ≈ 24–64K tokens depending on fields — 3.6× smaller than
today's uncapped list, and fetched once). It is a thin projection of an existing artifact, **not** a new
source of truth. Pair it with the `catalogVersion` from v637 so the agent knows when its cached manifest is
stale (the manifest tool is the natural home for that version block).

**4. Drop pretty-printing on the wire.** Change `JSON.stringify(result, null, 2)` to `JSON.stringify(result)`
in `mcp/server.js`. A free ~13–15% reduction on every single payload, no API change. Raw transport is for
machines; humans read `describe_calculator`, not the wire.

## Deliberately not done

- **No opaque-cursor pagination machinery.** The catalog is static and deterministic; simple `limit`/`offset`
  is sufficient and far simpler than MCP's cursor convention. Don't over-build.
- **No change to `describe_calculator` / `find_calculator` sizing.** They are already right. `find_calculator`
  remains the primary discovery path — an agent that trusts it never needs a full enumeration at all, which is
  why capping `list_calculators` costs nothing in real workflows.

## Guards

- **Determinism.** A given `(limit, offset, filters, fields)` returns a byte-identical page; ordering stays
  the existing id sort so pages are stable.
- **Coverage honesty preserved.** The `coverage`/`exposed`/`catalogTotal` summary fields still ride on the
  response; pagination changes how many *rows* come back, never the reported totals.
- **`get_catalog_manifest` reads the committed corpus/manifest**, degrading to the live registry if the corpus
  is absent (same accelerator-not-dependency contract `find_calculator` already uses).

## Files (when built)

`mcp/tools.js` (`listCalculators` limit/offset/fields + `count`/`nextOffset`; `get_catalog_manifest` +
`TOOL_DEFS` + `dispatch`), `mcp/server.js` (drop `, null, 2`), `test/mcp/*` (pagination determinism, compact
sizing, manifest projection), `docs/mcp-coverage.md`.

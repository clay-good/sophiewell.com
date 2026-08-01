# spec-v633 — MCP agent experience: from reachable to easy

**Status:** proposal (program umbrella). No code changed. Written 2026-07-31 at catalog 1468 / MCP 1405.

Two programs already made the MCP surface **complete** (v627–v632: every deterministic tool is exposed or
accountably waived) and **capable** (v620–v626: reverse lookup, ranges, batch, related, generated ledger).
This program is about a different question the earlier ones never asked: **once every tool is reachable, is
it actually easy and reliable for an agent to find, install, call, parse, and depend on?**

A four-dimension audit says: mostly no, and for reasons that have nothing to do with coverage.

## What the audit found (all measured this session)

| Dimension | The problem | Spec |
|---|---|---|
| **Protocol** | The server speaks a fraction of MCP's dialect: no server `instructions`, no tool `annotations` (so a client can't tell these are read-only/cacheable), and results are free JSON *text* with no `structuredContent` or `outputSchema` — agents string-parse and hope. | **v634** |
| **Payload** | `list_calculators({})` serializes to **~230,000 tokens** — larger than a whole context window — uncapped and unpaginated. It's the natural "show me everything" call and it's a footgun. Every payload is also pretty-printed (a free ~13–15% tax). | **v635** |
| **Distribution** | The `mcp/` subtree isn't self-contained (it text-parses `../app.js` and imports 522 `../../lib/*` modules), `package.json` is `private:true`, and there are no `.mcp.json` / `claude mcp add` / quickstart snippets. "Easy agent use" today means "clone the whole 10 MB repo first." | **v636** |
| **Reliability** | Every failure is an un-coded English string; tile ids are the public API with no alias/deprecation reachable over MCP; there's no content-version an agent can pin or cache against — despite a deterministic hash already being built each release. | **v637** |

The compute layer itself is genuinely solid — deterministic, output-safe, heavily tested. The gaps are all
in the **contract around it**.

## The four fixes, in one line each

- **v634 — Protocol completeness.** Add the server `instructions` string, tool `annotations`
  (`readOnlyHint`/`idempotentHint`/`openWorldHint`), and `structuredContent` + a loose `outputSchema` on the
  stable-envelope tools. All additive, no SDK bump. Decline resources and prompts (scope creep).
- **v635 — Payload ergonomics.** Cap + paginate `list_calculators`, add a compact mode, expose a one-shot
  catalog manifest (a thin projection of the corpus index we already build), and stop pretty-printing the
  wire.
- **v636 — Distribution & onboarding.** Fix the three stale doc numbers, replace the 400-line frozen
  changelog with a pointer, ship copy-paste client configs + a quickstart + a smoke test, and — the one real
  engineering item — an esbuild bundle so `npx sophiewell-mcp` runs with zero clone (publishing to npm is
  free; it is not hosting).
- **v637 — Reliability contract.** Add a stable `code` + `field` to every error, an `id-aliases.json` with
  machine-readable deprecation, and a `catalogVersion` (content hash) an agent can cache against.

## How this composes with v620–v632 (no duplication)

The audit deliberately checked for overlap. Where a fix touches an existing spec, this program **extends**,
not re-proposes:

- v637's `OUT_OF_RANGE` error code is the machine-readable envelope for the plausibility flags **v622**
  already designed — v637 supplies the `code`, v622 supplies the ranges.
- v637's `UNKNOWN_INPUT` + `didYouMean` field is the structured form of the "did you mean" **v621** already
  proposed.
- v637's `catalogVersion` is the natural companion to the generated coverage ledger in **v625** — same
  manifest, one more field.
- v636's npx bundle shares its "self-contained artifact" enabler with the optional build-time registry in
  **v626**.

## Ordering

1. **v634** — highest leverage for lowest cost; pure additions to `server.js`/`tools.js`.
2. **v635** — removes the context-window footgun; do early.
3. **v637** — the reliability envelope; small and self-contained.
4. **v636** — docs fixes first (immediate), the npx bundle last (the only item needing a build step).

## Invariants (unchanged from spec-v183 and the prior programs)

- **Determinism.** Identical inputs → byte-identical output. Nothing here adds a clock, randomness, or
  network. (v637 makes this promise *machine-readable* so agents can cache; it does not change it.)
- **One compute, two surfaces.** No fix forks the math.
- **`mcp/` stays optional and deletable.** Every new gate/field no-ops when the subtree is absent.
- **Small, fixed, capability-oriented tool surface.** This program adds at most one discovery/manifest tool;
  the rest are fields, annotations, and schemas on existing tools. Never one-per-tile.
- **Local, zero-cost.** stdio only. v636 makes install easier (npm publish is free); it does **not** host
  anything. The only hosted option remains the opt-in, unbuilt v626.

# spec-v636 — Distribution & onboarding: from "clone the repo" to one line

**Status:** proposal. No code changed. Written 2026-07-31. Part of the v633 program.

The owner's goal is that agents *easily* use this. Today the shortest path is: clone a 10 MB repo, `cd mcp`,
`npm install`, then hand-write a client config with an absolute path. This spec shortens it — first with
free documentation fixes, then with the one real engineering item that enables zero-clone `npx`.

## Tier 1 — documentation (do now, zero code, high ROI)

**Fix the three stale numbers.** The audit found:
- `mcp/README.md:81` — the example session shows `"1279 of 1109 catalog tiles exposed"`, which is impossible
  (exposed > total) and wrong. Live value is `1405 of 1468`.
- Root `README.md:8` — headline still says "1145 free healthcare calculators" while a machine-checked comment
  ten lines down says 1468. Self-contradictory.
- `mcp/server.js:7` — a code comment still says "fixed three-tool surface"; there are four tools.

Prefer wiring these to the generated ledger (v625) so they can't rot again, rather than re-typing them.

**Replace the frozen changelog.** ~400 of `mcp/README.md`'s 516 lines are a wave-by-wave build narrative
frozen at 1240 tiles / 356 modules (the file even carries `catalog-truth:historical` markers admitting it).
It reads as an internal log, not agent onboarding. Cut it down to a one-line pointer at the live
`list_calculators` count and `docs/mcp-coverage.md`. The top ~90 lines (what it is, install, wire-in, tools)
are good — keep and tighten those.

**Add copy-paste onboarding** to the top of `mcp/README.md`:
- The `claude mcp add` one-liner:
  `claude mcp add sophiewell-calculators -- node /absolute/path/to/sophiewell.com/mcp/server.js`
- A project-scoped `.mcp.json` example (and note the Claude Desktop / VS Code / Cursor equivalents are the
  same `command`+`args` shape).
- A 4-step quickstart (clone → `cd mcp && npm install` → paste config → ask the agent "compute MELD-XI").
- A one-command smoke test to confirm the server answers before wiring a client.

**Add a discoverability callout.** The root README links `mcp/` only as a buried one-liner under "More," and
the pitch never mentions agents. Add a short "For AI agents (MCP)" section near the top of the root README
pointing at the quickstart.

## Tier 2 — the structural item: a self-contained, publishable server

**The real blocker to easy use is structural, not textual.** `mcp/` is not self-contained: at runtime the
server text-parses `../app.js` and imports **522 `../../lib/*` modules** through its 521 adapters, plus
optional `../data/*`. So it only runs inside the full repo, and `package.json` is `private:true`. Flipping
`private` alone would publish a package that crashes on load, because those `../` paths don't exist inside a
`mcp/`-only tarball.

**Proposed: an esbuild bundle step that produces one self-contained artifact.** Bundle `server.js` and its
entire import graph into a single file, inlining the two asset reads that aren't plain JS — the `app.js`
text-parse (better: replace it at build time with a pre-extracted catalog JSON) and the `data/*.json` reads.
Then set `files` to the bundle, flip `private:false`, and publish, so:

```
npx sophiewell-mcp        # zero clone; runs the bundled stdio server
```

Notes that make this safe and cheap:
- **Publishing is not hosting.** The npm registry is free and the execution model is unchanged — the agent
  still runs the server locally over stdio, on its own machine, at zero cost to the project. This does not
  touch the "no hosting" posture at all.
- **Shared enabler with v626.** The pre-extracted catalog JSON this bundle needs is the same **build-time
  registry** the optional remote server (v626) needs. Build it once; both consume it. Coordinate the two so
  there is a single `scripts/build-mcp-registry.mjs`, not two.
- **Determinism and deletability preserved.** The bundle is a build output; source stays as-is, `mcp/` stays
  deletable, and the bundled server computes identically to the source server (assert with a parity test:
  the bundle's `dispatch` output equals the source's for a sample of ids).
- **Keep the local-clone path too.** Some operators want to read the source they run; the clone path stays a
  first-class, documented option alongside npx.

## Guards

- **A published bundle must round-trip.** A CI/parity test computes a sample across the bundle and the
  in-repo server and asserts byte-identical results before any publish.
- **Version the published package meaningfully** (coordinate with v637's `catalogVersion`) so `npx` users can
  tell what catalog snapshot they're running.
- **No secrets, no postinstall network.** The package is pure JS + data; installation runs nothing.

## Files (when built)

Tier 1: `mcp/README.md`, root `README.md`, `mcp/server.js` (comment), coordinated with `docs/spec-v625.md`.
Tier 2: `scripts/build-mcp-registry.mjs` (shared with v626), an esbuild bundle script, `mcp/package.json`
(`files`, `private:false`, `bin` already present), a bundle-parity test, `docs/mcp-coverage.md`.

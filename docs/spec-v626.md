# spec-v626 — Optional zero-cost remote MCP (Cloudflare Workers free tier)

**Status:** proposal (optional; nothing else in the v620 program depends on it). No code changed. Written
2026-07-31.

## The reach problem

Our MCP server is stdio-only. That is the right *trust anchor* — local, single-user, zero network egress of
any kind, deletable — and it stays primary. But it means an agent can only use our calculators if its
operator has cloned the repo and wired up a local process. A surveyed competing server runs remotely, so any
agent can reach it. That reach is the one thing stdio can't give.

This spec proposes an **optional** remote MCP endpoint that keeps the two things the user cares about: it
costs nothing to run, and it forks none of the math.

## Why this can be genuinely zero-cost

The site already deploys to Cloudflare (`wrangler.toml`, `_headers`). The Workers free tier allows ~100,000
requests/day with no credit card. Our compute is pure arithmetic over small inputs — no database, no external
call, negligible CPU per request. A stateless calculator MCP is close to the ideal free-tier workload. There
is no per-request marginal cost and nothing to scale.

## The design

**Same computes, a second transport.** The Worker exposes the **identical four→seven tools** from
`mcp/tools.js` over **Streamable HTTP** instead of stdio. `dispatch()` and every `lib/*.js` compute are
reused verbatim. No calculator logic is written twice; determinism is inherited.

**The one real engineering task: a build-time registry.** `mcp/catalog.js` builds its registry by
`readFileSync`-ing `app.js` and parsing `UTILITIES` at load time. A Worker has no filesystem. So:

- Add a build step that runs the existing registry assembly **at build time** and emits a static
  `registry.json` (ids, names, groups, specialties, summaries, input schemas, examples, citations,
  interpretation) plus the search corpus and synonyms the ranker needs.
- The Worker imports that generated JSON and the pure `lib/*.js` computes, and serves the same tools. Because
  the JSON is generated from the same source of truth, it cannot drift (and the v625 gate covers it).

This build-time registry is also independently useful — it is the artifact v625's generated ledger and the
site's related-calculator graph can both read.

## Non-negotiable posture (this is where a remote server earns or loses trust)

- **No state, no storage, no logging of inputs.** The Worker is a pure function: request in, computed result
  out. No KV, no D1, no analytics, no request bodies written anywhere. Identical request → byte-identical
  response, exactly like stdio.
- **No egress from the Worker.** It calls nothing outbound. The compute never leaves the isolate.
- **The stdio server stays the default and the documented recommendation** for anyone who wants zero network
  involvement at all. The remote endpoint is a convenience, and the docs must say plainly: *inputs you send
  to the hosted endpoint transit the network; the local stdio server does not.* Users who care choose stdio.
- **Deletable, like the rest of `mcp/`.** Removing the Worker leaves the site and the stdio server untouched.

## Honest limits

- **Free-tier caps are real.** ~100k requests/day is generous for this workload but finite; the endpoint is
  best-effort, not an SLA. Document it as such. If it were ever to exceed the free tier, the answer is to
  point users back at stdio, not to start paying.
- **This adds an attack surface stdio doesn't have.** A public endpoint invites abuse (floods, oversized
  batches). Mitigations that cost nothing: the v623 batch cap, a hard input-size limit, no state to corrupt,
  and Cloudflare's built-in rate limiting on the free tier. No auth is needed because there is nothing to
  protect and nothing to bill.

## Decision this spec asks for

This is the one item in the program that changes the project's egress posture, so it is proposed as
**opt-in**. The recommendation: **build the build-time registry regardless** (v625 and the site both benefit),
and treat the hosted Worker as a follow-on the maintainer switches on deliberately — not as something that
ships silently with the other specs.

## What not to do

- Do **not** add SSE, a REST/OpenAPI surface, or an `api` mode. Streamable HTTP is the one remote transport
  agents need; the rest is surface area with no user.
- Do **not** add auth, accounts, keys, or usage tracking. The moment the endpoint needs those, it is no
  longer the zero-cost, zero-state thing this spec describes.
- Do **not** let the Worker read anything at runtime it wasn't given at build time. Runtime file/network
  access is how determinism and the zero-egress promise die.

## Files (when built)

`scripts/build-mcp-registry.mjs` (new: emit `registry.json` from the load-time assembly),
`mcp/worker.js` (new: Streamable HTTP transport over the shared `dispatch`), `wrangler.toml` (a second,
optional Worker entry), `docs/mcp-coverage.md` (document the remote option + its posture), `test/mcp/*`
(registry-parity: generated JSON equals the load-time registry).

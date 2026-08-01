# spec-v624 — Related calculators, computed deterministically

**Status:** proposal. No code changed. Written 2026-07-31. Part of the v620 program. **Depends on v621.**

## What this does for you

After running one calculator, the useful next question is "what else applies here?" — CHA₂DS₂-VASc pairs with
HAS-BLED; a MELD result invites Child-Pugh; an ABG acid-base read invites the anion gap. Today an agent has
to already know these pairings. This spec computes them: `describe_calculator` gains a `related` list, and an
optional `related_calculators` tool returns the neighborhood for any id — a deterministic "you might also
need" over the whole catalog.

A surveyed competing server builds a tool-relation graph weighted by shared parameters, shared specialty, and
shared clinical context. We can build the same thing from data we already have, plus the concept vocabulary
v621 introduces.

## The design — a deterministic relatedness score

For any two exposed calculators A and B, score the edge from signals we already hold:

| Signal | Source | Why it means "related" |
|---|---|---|
| Shared **specialty** tags | `META.specialties` | Same clinical domain. |
| Shared **input concepts** | v621 `concept` tags on fields | Uses the same patient data — often computable in the same breath. |
| Same **catalog group** | `app.js` UTILITIES `group` | Already curated adjacency. |
| **Curated companion** pair | a small reviewed list | Encodes known clinical pairings a bare overlap misses (risk ↔ bleeding-risk). |

Combine with fixed weights into a score, take the top N per calculator, break ties by id for determinism.
The weights are constants in one file, not tuned parameters — this is a lookup, not a model.

**Curated companions carry the cases overlap can't reach.** CHA₂DS₂-VASc and HAS-BLED share little
parameter-wise but are always used together; a short, reviewed companion list (a few hundred pairs at most)
supplies those edges. Everything else falls out of shared specialty + shared concepts automatically, so the
curated list stays small.

## Surfaces

- **`describe_calculator`** gains `related: [{ id, name, why: ["shared specialty: cardiology", "companion"] }]`.
  The `why` tags make the edge auditable — no opaque scores.
- **`related_calculators({ id, limit })`** returns the same neighborhood standalone, for an agent that wants
  it without the full describe payload.
- **The site** shows the same "related calculators" links on each tool page and route — the identical graph,
  computed the same way. This is a genuine navigation improvement for human users, not just agents.

## Guards

- **Deterministic and precomputable.** The graph is a pure function of the registry; it can be built at load
  time (or at build time for the site) and is stable across runs.
- **Edges only among exposed, clinical calculators.** No edge points at a tile an agent can't then compute.
- **Curated list is gated.** `scripts/check-mcp-catalog.mjs`: every id in the companion list exists in the
  registry and is exposed; the list has no duplicate or self-pairs.
- **Tool count.** Adds at most one tool (`related_calculators`); the `describe_calculator` field is free.
- **Cheap to hold.** If v621 has not landed, the graph still works on specialty + group + companions; the
  concept signal is additive and only sharpens it.

## What not to do

- Do **not** learn or tune the weights from usage — there is no usage data (no telemetry, by design), and a
  tuned weight would make the graph non-deterministic and unauditable.
- Do **not** let `related` imply a clinical workflow ("do B after A"). It means "these are used in the same
  setting," nothing more. Keep the framing to relatedness, per posture (spec-v50 §3).
- Do **not** grow the curated companion list to substitute for the automatic signals — reserve it for
  pairings the overlap genuinely misses.

## Files (when built)

`mcp/related.js` (new: weights, companion list, graph builder), `mcp/tools.js` (`related` in
`describe_calculator`, `related_calculators` tool), `mcp/catalog.js` (expose the graph),
`scripts/check-mcp-catalog.mjs` (companion-list gate), `views/*` or the tool-page generator (site links),
`test/mcp/*` (determinism, edge validity, companion resolution).

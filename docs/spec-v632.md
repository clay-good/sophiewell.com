# spec-v632 — Make full coverage an enforced invariant

**Status:** proposal. No code changed. Written 2026-07-31. Part of the v627 program. **The capstone.**

Specs v628–v631 close today's gaps. This spec makes sure they stay closed: it turns "every deterministic
user-facing tool is exposed, or explicitly waived with a reason" into a rule the build enforces — so the next
person who adds a calculator to the site can't forget the agent.

## Why today's gate can't do this

`scripts/check-mcp-catalog.mjs` is **closed-world**: it iterates the calculators that already have adapters
and checks each one. Add a new computational tile to `app.js` with no adapter and nothing fails — the gate
never looks at tiles it doesn't already know about. That is exactly how the catalog drifted to 63 unexposed
tiles without a red build. A coverage invariant has to look the other way: from the full catalog *toward* the
adapters.

## The design: open-world reconciliation

**1. Mark which tiles are supposed to be reachable.** "Deterministic / computational" is not derivable from a
tile row, so make it explicit: add one authoring-time signal per `UTILITIES` row — an MCP-eligibility marker
(e.g. `mcpEligible: true`, or a small enum `mcpKind: calculator | decision-tool | reference | none`). Set it
when the tile is created. The four workflow timers, being time-dependent, are eligible only under the
explicit-time-input contract (v628); pure content is `none`.

**2. Require every eligible tile to be accounted for exactly once.** For each `mcpEligible` tile, the gate
requires **exactly one** of:
- a live adapter in the registry (it's exposed), **or**
- a matching entry in a new committed **waiver ledger**, `docs/mcp-waivers.md`.

The build **fails** if an eligible tile is in neither (an unexposed tool slipped in) and **fails** if a tile
is in both (a waiver outlived its adapter and should be retired). Keep the existing exact-match check on the
exposed set, and add the symmetric identity: `eligible = exposed ∪ waived`, nothing unaccounted, no overlap.

**3. The waiver ledger.** Each entry records:

| Field | Purpose |
|---|---|
| `id` | the tile id (join key) |
| `reason` | enumerated: `outputs-recommendation`, `time-dependent`, `template-generator`, `wrong-input-modality`, `static-reference`, `sources-disagree` (the spec-v97 skip), `pending-adapter`, `pending-meta` |
| `spec` / owner | the spec or decision that authorized it (accountability) |
| `date` + optional `revisit` | so waivers are auditable and don't rot silently |

**4. Preserve deletability.** The whole check no-ops when `mcp/` is absent (spec-v183 §3), like the rest of
the gate — the waiver ledger and eligibility marker are inert without the subtree.

## The initial ledger (today's accountable exceptions)

Applying the v627 dispositions, the ledger starts as:

| Tiles | reason | disposition |
|---|---|---|
| `appeal-letter`, `hipaa-roa`, `hipaa-auth`, `roi`, `discharge-instr`, `wallet-card`, `sbar-template` | `template-generator` | an LLM writes the boilerplate natively; determinism buys nothing. *Optional:* expose the three CFR completeness lints (`appeal-letter`, `hipaa-roa`, `hipaa-auth`) as check tools — if done, they leave the ledger. |
| `pa-lint` | `wrong-input-modality` | input is uploaded binary documents (PDF/DOCX/images); doesn't fit typed fields. |
| `prep` | `pending-meta` | exposable once it gets a citation + example (v629). |
| `sti-screening`, `co-cn-antidote` | `static-reference` | only if v631 defers them rather than exposing as resources. |

Everything else eligible is exposed by v628–v631. The end state: **zero unaccounted tiles**, and a build that
enforces it forever.

## Coupling to the count surfaces

The MCP coverage count stays a **subset**, deliberately outside the 12 catalog-truth count surfaces
(spec-v46) — it must never be conflated with `UTILITIES.length`. This gate adds a *reconciliation* invariant
(eligible = exposed ∪ waived), not a new hardcoded total. Fold it in alongside the generated coverage ledger
from v625 so there is exactly one place that computes coverage and one place that records exceptions.

## What not to do

- Do **not** make the gate infer eligibility from tile names or renderer shape — too fragile. Eligibility is
  declared and reviewed.
- Do **not** let a waiver be permanent-by-default. `pending-*` reasons must name what unblocks them; the
  optional `revisit` date exists so stale waivers surface.
- Do **not** relax the invariant to "warn" instead of "fail." A warning is how the last drift happened.

## Files (when built)

`app.js` (per-row eligibility marker), `docs/mcp-waivers.md` (new ledger), `scripts/check-mcp-catalog.mjs`
(open-world reconciliation + waiver parse + exactly-once check), `docs/mcp-coverage.md` (note the invariant),
`test/*` (a tile that is eligible-but-unaccounted fails the gate; a both-exposed-and-waived tile fails).

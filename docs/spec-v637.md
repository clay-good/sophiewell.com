# spec-v637 — A reliability contract agents can depend on

**Status:** proposal. No code changed. Written 2026-07-31. Part of the v633 program.

The compute layer is reliable. The **contract around it** is not durable for a machine caller: every failure
is an un-coded English sentence, tile ids are the public API with no alias or deprecation signal reachable
over MCP, and there is no content version an agent can pin or cache against. All three fixes are additive —
the current shapes are unchanged; agents that want reliability get new, structured fields.

## 1. Stable error codes

Fifteen distinct failure situations all surface as `{ valid:false, message:'<English prose>' }` and nothing
else. To branch on "missing input" vs "renamed id" vs "server bug," an agent must regex UX copy that is free
to be reworded. The `id` echo is also inconsistent (present on compute-path errors, absent on `describe`
unknown-id and field errors), and the transport never sets `isError`.

**Add an optional `code` (frozen, append-only enum) and `field` to every `valid:false` return**, keeping
`valid` and `message` exactly as they are:

```js
{ valid: false, code: 'MISSING_INPUT', field: 'age', message: 'Missing required input "age".' }
```

| `code` | Situation |
|---|---|
| `UNKNOWN_TOOL` | unknown tool name |
| `UNKNOWN_ID` | unknown calculator id (also carries alias info — §2) |
| `BAD_ARGS` | empty query / inputs not an object |
| `UNKNOWN_INPUT` | unknown input key (+ `field`, + `didYouMean` from **v621**) |
| `MISSING_INPUT` | required input absent/empty (+ `field`) |
| `INVALID_TYPE` | wrong type / enum value not allowed (+ `field`) |
| `OUT_OF_RANGE` | outside hard bounds — the machine envelope for **v622**'s ranges |
| `INCOMPLETE` | lib returned null/`{valid:false}` (not enough to compute) |
| `COMPUTE_ERROR` | compute threw, or output-safety guard tripped |
| `NO_MATCH` | `find_calculator` zero results (keep `count:0`; add the code for symmetry) |

`validateInputs` already knows the offending field (`mcp/fields.js`), so it just emits the code beside each
message; the compute path stamps its codes in `computeCalculator`. Echo `id` consistently on every
calculator-scoped error. This is a small, self-contained change and it does **not** re-spec v622's ranges or
v621's did-you-mean — it gives them a shared, machine-readable envelope.

## 2. ID stability + machine-readable deprecation

Tile ids **are** the API an agent hardcodes, and nothing protects them. There is no id-alias mechanism
(`data/synonyms.json` is search-only and, if anything, is *forced to follow* a rename rather than surviving
it). The one deprecation policy that exists — `docs/stability.md`'s 90-day notice — is a **browser banner an
agent never sees**. If a shipped id were renamed or removed, `compute_calculator` returns the same
"Unknown calculator id" message as a typo; the agent can't tell the two apart.

**Two additive pieces:**

1. **State the policy** in `docs/stability.md`: a shipped tile id is a stable public identifier and is never
   reused for a different concept; renames ship an alias with a sunset date.
2. **Add `data/id-aliases.json`** — a small map distinct from `synonyms.json`:
   `{ "old-id": { "canonical": "new-id", "since": "…", "sunset": "…" } }`. On a `getCalculator` miss, consult
   it and either resolve (return the result **plus** `{ deprecatedId, canonicalId, sunset }` so the agent
   self-heals and can log the drift) or, if past sunset with no successor, return `UNKNOWN_ID` with
   `{ replacedBy: null, deprecatedSince }` — a real signal, not a typo-shaped message.

This makes the existing 90-day discipline reachable by a non-human caller. It is orthogonal to every other
spec.

## 3. A content version an agent can pin and cache against

The server version is a frozen literal `'1.0.0'` that hasn't moved across ~1,400 catalog additions;
`stability.md` claims git semver tags but there are **zero** tags. Meanwhile a perfect version primitive is
**already built every release and simply not exposed**: `data/search-corpus/manifest.json` carries a
deterministic sha256 `hash` plus tile counts.

**Expose a `catalogVersion` block** — `{ contentHash, tileCount, exposedCount, generatedAt }` sourced from
that manifest — on `list_calculators` and on the `get_catalog_manifest` tool (v635). Fold it into the
generated ledger work of **v625** so there is one place computing coverage/version. Then:

- an agent can cache `compute_calculator` results keyed by `(id, inputs, contentHash)` and know exactly when
  to invalidate;
- clarify the server semver as tracking the **tool-surface contract**, while the **content** version is the
  manifest hash. Document which is which.

## 4. Advertise determinism in a parseable form

The server is deterministic and cacheable by construction, but that promise reaches an agent only as prose in
the README and tool descriptions. **Add `deterministic: true` / `cacheable: true`** to the `catalogVersion`
/ server-info payload (and optionally to each `compute` success). Combined with the `contentHash`, this is a
formal, machine-readable license to cache — the cheapest reliability win here, since the guarantee already
holds.

## Guards

- **Fully backward compatible.** `valid`/`message` unchanged; `code`, `field`, alias info, `catalogVersion`,
  and the determinism flags are all additions.
- **The enum is frozen and append-only.** A gate lists the valid codes; adding one is a deliberate, reviewed
  change (agents branch on these).
- **Deletability preserved.** `id-aliases.json` and the manifest read degrade gracefully when absent; the
  whole thing no-ops without `mcp/`.

## Files (when built)

`mcp/tools.js` + `mcp/fields.js` (codes + `field`, consistent `id` echo, `catalogVersion`, determinism
flags), `data/id-aliases.json` (new), `mcp/catalog.js` (alias resolution on miss; read manifest hash),
`docs/stability.md` (id-stability policy), coordinated with `docs/spec-v625.md`, `test/mcp/*` (code coverage,
alias resolution, version presence).

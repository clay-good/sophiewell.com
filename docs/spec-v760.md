# spec-v760.md — Prefill should not depend on being exposed to agents

> Status: **SHIPPED (2026-08-20).** Browser only. No tile added, no compute changed, no MCP change.
> Catalog stays **1564**.

## Why

`data/fields/<bucket>.json` is built from the MCP adapters ([spec-v753](spec-v753.md)), so a tile
without an adapter has no shard and can never prefill.

24 tiles have no adapter. Every one is a documented waiver in
[mcp-waivers.md](mcp-waivers.md), and every reason is about **agent** exposure:

| Reason | What it says |
|---|---|
| `time-dependent` | the value is a live clock reading, so it is not deterministic for an agent |
| `outputs-recommendation` | the terminal output is a management recommendation, a posture call |
| `template-generator` | the output is boilerplate an LLM writes natively |
| `wrong-input-modality` | the input is an uploaded binary |

None of those is a reason a nurse's typed values should fail to land in a browser form. The
coupling was incidental — the shard is built from adapters because that is where the field
descriptors happened to live.

**18 of the 24 have real typed inputs.** A reader can find `device-day-counter` by name and then
has to retype the values their own question already carried.

## What it does

When routing could not prefill — no shard, or a shard that filled nothing — the tile's own words
are carried through the navigation, and once it has rendered, its fields are read from the DOM.

`lib/dom-fields.js` `readDomFields(root)` returns the **same short-keyed rows** `query-fill.js`
reads, so the extractor and every safety rule in it are shared verbatim between the two paths: the
ambiguity veto, the negation window, the threshold rule, the canonical-unit reset, and the same
`input` + `change` dispatch a reader's typing would produce.

The DOM is the most accurate source there is — it *is* what the reader is looking at, labels and
unit selects and all — it needs no build step, and it covers any tile added later without anyone
remembering to wire it up.

## What it recovers, honestly

| | |
|---|---|
| Tiles that now prefill | **6** — `mppr`, `prior-auth`, `specialty-visit`, `ems-doc`, `unit-converter-v4`, `device-day-counter` |
| Tiles that correctly fill nothing | 12 — free-text template generators |
| Tiles with nothing to fill | 6 — decision trees, static references, `pa-lint`'s file upload |

The twelve are the interesting number, and they are **correct**. `queryFill` has no rule for
`kind: 'string'`, so a HIPAA authorization's patient name, plan, and released-information fields
are never guessed from a sentence. Filling those would be the worst class of wrong value on this
site, and the absence of a rule is the feature.

## Where it lives

- `lib/dom-fields.js` — **new.** `readDomFields()`.
- `app.js` — `pendingQuery`, `fillFromDom()`, and the render-time call.

## Gotchas

- **Reset units to canonical before filling, here too.** The shard path learned this the hard way
  ([spec-v754](spec-v754.md)); a value said in kilograms landing in a field showing `lb` is the
  same bug on either path.
- A `-unit` select is read *through* its field, never filled directly.
- A field with no `id` is skipped: there is no way to address it and no way to put it in the hash.
- This also runs when a shard exists but filled nothing, which makes it a free fallback — a field
  the adapter does not expose but the tile renders is now reachable.

## Proof

- `test/integration/smoke.spec.js` — `spec-v760: a tile with no MCP adapter still prefills from its
  own DOM` (`device day counter for a foley` fills `#dd-dev`, one provenance caption) and
  `spec-v760: the DOM path never guesses a free-text field` (a HIPAA query fills nothing and claims
  no provenance).
- Measured across all 24 waived tiles in the running app.
- lint, 11460 unit, 397 mcp, a11y, 58 e2e: green.

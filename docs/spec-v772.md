# spec-v772 — the two surfaces agree, and a gate says so

## Why

spec-v771 taught `find_calculator` to rank an exact name first. That immediately
created a worse problem: the **website and the MCP server disagreed on the same
words.** `find_calculator` returned `ckd-staging` for "KDIGO CKD Staging (G×A
risk)"; the search bar returned `kdigo-aki`. Deciding the same way is the entire
reason `lib/name-match.js` exists.

## What it does

The rule moved into `lib/name-match.js` as `namesInFull`, and both surfaces import
it. A query that names a calculator in full leads, on both.

**Search bar: 5 → 2 of 1564 not found first by their own name.** The two that
remain are the same two the MCP side reports, for the same reason.

## Distinctive words are not enough

The first version matched only a name's *distinctive* words, and it did not move
the website at all. `"KDIGO CKD Staging (G×A risk)"` and `"KDIGO AKI Staging"`
both reduce to `{kdigo, staging}` — a tie, so list order won, which was the bug.

What separates them is the word the query never said: `aki`. So `namesInFull`
checks **every** token of the name, not just the distinctive ones.

## The gate

`test/integration/every-tool-is-wired.spec.js` walks all 1564 tiles and holds each
to what a reader needs: its name finds it first, opening it renders a body, the
body has something to fill in, and nothing throws. Two documented exception sets:

- `timi-risk-index`, `carpenter-coustan` — names whose distinctive part is a
  single token shared with siblings, so the two-word guard declines to promote
  them on purpose. Both must still appear in the results.
- `co-cn-antidote`, `tetanus`, `rabies-pep`, `bbp-exposure` — reference cards, not
  calculators. All four are documented MCP waivers (`static-reference` /
  `outputs-recommendation`), so "no inputs" is the design on both surfaces.

## The audit that prompted all of this

| | MCP | search bar |
|---|---|---|
| exposed / renders | 1540 + 24 waivers, 0 undocumented | 1564 render a body |
| contract | 1540 schemas, 1540 examples round-trip | 0 page errors |
| findable by own name | 1538 / 1540 | 1562 / 1564 |

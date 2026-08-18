# spec-v747.md — The example row that named half a criterion

> Status: **SHIPPED (2026-08-18).** Copy only. No tile added, no number changed.
> Catalog stays **1564**.

## Why

The left column of a worked example names the field. It was taking that name from the MCP field
label, which is not a name — it is the field's full description, written for an agent reading a
tool schema. So 110 rows across the catalog were a description cut at 80 characters:

> **Tissue type (worst present): 0 closed, 1 epithelial, 2 granulation, 3 slough,…**

Three hundred and fifty-one labels are longer than 80 characters and 211 are longer than 130; one
runs 1,450. Clamping is not optional. But the labels are not shapeless — most are written
`Name: what counts as each level` or `Name - the caveat`, so the cut point is already in the text.

## What changed

`fieldName()` in `scripts/lib/tile-line.mjs` cuts at the separator the label already carries before
falling back to the character clamp. **110 → 60 truncated rows.**

| | |
|---|---|
| Before | `Tissue type (worst present): 0 closed, 1 epithelial, 2 granulation, 3 slough,…` |
| After | `Tissue type (worst present)` |
| Before | `Nuclear pleomorphism: 1 = small/uniform, 2 = moderate variation, 3 = marked…` |
| After | `Nuclear pleomorphism` |

The 60 that still clamp are criteria written as whole clauses with no name in front of them
("At least one glomerulus with segmental or global collapse AND overlying…"). There is nothing
shorter to print, and the tool itself shows the full text.

## Proof

- `test/unit/tile-line.test.js` — the separator cut, a label that is already just a name (left
  untouched), a separator too early in the string to be a name boundary (not a cut point), and a
  no-separator label that must clamp at a word boundary.
- `npm run lint`, `npm run test:unit` (11,401), and `test/integration/static-pages-mobile.spec.js`
  (all 18 cases, including the every-tool-page sweep at 320px) clean.

## The lesson worth keeping

Same root as spec-v744, one column over: the field registry describes the tool to a machine, and
every human-facing surface that renders a registry string straight through inherits a schema
comment where a label belongs.

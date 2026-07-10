# Project — sophiewell.com

A client-side, zero-backend catalog of ~1,137 deterministic healthcare calculators
and reference tiles. Every compute is a pure function; nothing calls the network at
runtime and no AI is in the compute path.

## Conventions

- **Living spec system:** `docs/spec-v*.md` (v1 → v281) is the authoritative, cross-referenced
  spec history. Each spec cites the ones it depends on and states which remain in force.
  OpenSpec change proposals under `openspec/changes/` are the newer, structured format for
  proposing a discrete capability change; a merged change's requirements are folded back into
  the relevant `docs/spec-v*.md` at build time.
- **Propose-first:** larger changes ship as a docs-only proposal first (no catalog-count or
  code change), then a later session builds it. This change follows that pattern.
- **Catalog-truth gate:** the live catalog count comes from `UTILITIES.length`; no doc hardcodes
  it on an exact-count surface.

## Key modules

- `lib/meta.js` — `export const META`: per-tile metadata (`example.fields`, `example.expected`,
  `derivation`, citations).
- `lib/field-units.js` — `unitField()` / `unitNum()`: per-field unit `<select>` with a
  `toCanonical` converter per option. The **first option is the canonical unit** the compute
  expects.
- `lib/unit-convert.js` — pure conversion functions (`lbToKg`, `fToC`, `inchesToCm`, `labConvert`).
- `views/group-*.js` — render the input forms; call `unitField()` (69 call sites).
- `app.js` — `renderToolView`, `applyExample` (fills `example.fields` into the DOM),
  `trackHashState` (serializes every input incl. unit selects into the URL hash).
- `mcp/adapters/*.js` — expose computes over MCP; feed `example.fields` **straight to the
  canonical-unit compute** (the browser unit toggle is bypassed).

## Hard invariants any units change must preserve

1. **Byte-identical reproduction:** every `META.example` and deep-link hash must reproduce the
   same result. `applyExample` fills only ids present in `example.fields`; unit selects are not
   among them, so today they stay at the canonical (index-0) option.
2. **MCP round-trip:** each adapter's `example.fields` must round-trip through `compute` to the
   documented `example.expected` numbers (1,044 entries, 184 adapter files).
3. **No compute-threshold edits:** validated cutoffs (Celsius bands, mg/dL cutoffs) stay in the
   canonical unit; conversion happens only at the input boundary.

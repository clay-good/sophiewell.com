# spec-v294.md — FAST dementia staging tile (fulfills the spec-v173 §2.6 deferral)

> Status: **SHIPPED (2026-07-13).** Builds the `fast-dementia` tile that
> [spec-v173](spec-v173.md) §2.6 proposed and deferred pending verbatim sourcing.
> Catalog **1145 → 1146**. One new tile, group G.

## Why

The [spec-v285](spec-v285.md)–[v293](spec-v293.md) search-quality program repeatedly
surfaced "FAST dementia staging" / "dementia hospice eligibility" as a genuine catalog gap
(no tile existed to route to). spec-v173 had proposed the Functional Assessment Staging Tool
(FAST) but deferred it because the exact stage table was not sourced verbatim in-session. That
sourcing is now resolved.

## What shipped

`fast-dementia` (group G): the clinician selects the highest consecutive FAST stage the patient
has reached (1–5, 6a–6e, 7a–7f); the tile reports the published functional descriptor and, for
stage 7a and beyond, surfaces the Medicare local-coverage dementia hospice-eligibility context.
It reports the guideline's own descriptor and hospice context — never a diagnosis and never an
eligibility determination ([spec-v11](spec-v11.md) §5.3). The id is intentionally distinct from
the live `fast` = FAST / BE-FAST stroke tile.

- `lib/fast-dementia-v294.js` — pure stage→descriptor lookup with the 7a hospice-context flag.
- `views/group-v294.js` (RV294) — a single stage `<select>`, real `<label for>`, no innerHTML.
- `lib/meta.js` — citation + citationUrl + accessed date + interpretation bands (stage groups).
- 6 worked-example unit tests (each stage's descriptor, substage ordering, the 7a threshold,
  case-insensitive codes, the invalid-stage RangeError) + fuzz registration.
- Synonym entry (v14 → v15) + corpus rebuilt to 1146 rows so the tile routes in browser search.

## Sourcing (spec-v97)

Stage table re-fetched and cross-verified at build against two independent reproductions of
Reisberg's ordinal FAST: the CAPC reproduction (capc.org/documents/download/962, full verbatim
text) and a second hospice reproduction (table form). The two agree on every substage
descriptor.

- **Citation:** Reisberg B, Ferris SH, Franssen E. An ordinal functional assessment tool for
  Alzheimer's-type dementia. *Hosp Community Psychiatry.* 1985;36(6):593-595. (FAST; Reisberg B.
  *Psychopharmacol Bull.* 1988;24(4):653-659.) Reisberg is not an ISSUER_PATTERN acronym, so no
  citation-staleness ledger row is required.
- **Stage-order note:** the canonical GDS-aligned FAST places "decreased job functioning" at
  stage 3 and "decreased ability to perform complex tasks" at stage 4 (used here). Some hospice
  reproductions transpose the two integer labels; the descriptors are identical.
- **Hospice context:** FAST stage 7a or beyond, together with a named medical complication in
  the prior 12 months, is a component of the Medicare local-coverage dementia hospice-eligibility
  guideline. The tile surfaces this; it does not assert eligibility.

## Verification

Lint (all catalog-truth surfaces at 1146), 7,601 unit tests, `test:mcp` 171, build (1146 tool
pages) — all green.

## Out of scope

The MCP adapter + golden-probe promotion follow in a separate wave (the golden probe requires
the tile in the MCP-exposed registry, per the [spec-v292](spec-v292.md) precedent). The other
four spec-v173 §2.6 deferrals (GPCOG, Short IQCODE, Reisberg GDS, MDS-CPS) remain deferred
pending their own verbatim sourcing.

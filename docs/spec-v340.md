# spec-v340.md — Clark level (melanoma invasion) tile

> Status: **SHIPPED (2026-07-16).** Builds the `clark-level` tile — the Clark level of a cutaneous
> melanoma (levels I–V). Catalog **1191 → 1192**, group G.

## Why

The catalog carries the AJCC melanoma T category (Breslow thickness in mm) but had no Clark level — the
classic anatomic-compartment microstaging that grades a melanoma by the skin layer it reaches (epidermis →
papillary dermis → reticular dermis → subcutis). The two are the complementary halves of melanoma
microstaging as it is taught and reported. `clark level` / `melanoma invasion level` routed to nothing.
(Companion-gap pattern: the melanoma-microstaging domain has both the thickness scale and the anatomic-level
scale.)

## What it does

The pathologist picks the anatomic level of dermal invasion; the tile reports the level, its description, and
whether it is a deeper (level IV–V) invasion.

- `lib/clark-level-v340.js` — pure level → description. **I:** intraepidermal (in situ). **II:** partial
  papillary-dermis invasion. **III:** fills the papillary dermis to the reticular interface. **IV:**
  reticular dermis — flagged. **V:** subcutaneous fat — flagged. Accepts roman I–V or numeric 1–5,
  case-insensitive.
- `views/group-v340.js` (RV340) — one select (dom `clark-lvl`), real `<label for>`.
- `lib/meta.js` — Clark 1969 citation + accessed date + grouped bands. No citation-staleness row (the Cancer
  Res citation carries no guideline-issuer acronym).
- 5 worked-example unit tests + fuzz registration; synonym entry (v61 → v62); corpus → 1192.

**HIGH-STAKES:** it reports the Clark level the pathologist has determined, never a diagnosis, a staging
decision, or a prognosis ([spec-v11](spec-v11.md) §5.3); modern staging uses AJCC TNM with Breslow
thickness, and the staging / management decisions stay with the clinician and the pathologist (surfaced in
the tile note).

## Sourcing (spec-v97)

- **Citation:** Clark WH Jr, From L, Bernardino EA, Mihm MC. The histogenesis and biologic behavior of
  primary human malignant melanomas of the skin. *Cancer Res.* 1969;29(3):705-727 (the five anatomic
  levels).
- Cross-verified against melanoma-staging references (ScienceDirect / dermatopathology reviews) reproducing
  the same level-I–V anatomic-compartment definitions.

## Verification

Lint (all catalog-truth surfaces at 1192), unit suite (+5 + fuzz), build — all green. Verified in a real
browser: the example (level IV) renders the "reticular dermis / deeper" warn description, level I flips to
the "melanoma in situ" description, and the tile does not scroll horizontally at 320px.

## Out of scope

The tile echoes the level the pathologist selects; it does not read histology, convert to Breslow thickness,
or estimate a numeric prognosis. The MCP adapter + golden-probe promotion follow in a separate wave.

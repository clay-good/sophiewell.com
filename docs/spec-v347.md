# spec-v347.md — Herring lateral pillar classification (Perthes) tile

> Status: **SHIPPED (2026-07-16).** Builds the `herring-pillar` tile — the Herring lateral pillar
> classification of Legg-Calve-Perthes disease (groups A, B, B/C border, C). Catalog **1198 → 1199**,
> group G.

## Why

The catalog shipped the Catterall classification (spec-v346) but had no Herring lateral pillar tile —
the modern prognostic standard for Legg-Calve-Perthes disease, which grades the disease by the height of
the lateral pillar of the capital femoral epiphysis rather than total epiphyseal involvement. The two
are complementary Perthes classifications. `herring classification` / `lateral pillar perthes` routed to
nothing. (Companion-gap pattern: the Perthes-classification domain has both the involvement scale
(Catterall) and the lateral-pillar-height scale (Herring).)

## What it does

The clinician picks the lateral-pillar-height group; the tile reports the group, its description, and
whether it is a poorer-prognosis (B/C or C) group.

- `lib/herring-pillar-v347.js` — pure group → description. **A:** lateral pillar not involved (best
  prognosis). **B:** pillar > 50% of original height. **B/C border:** narrow or poorly ossified at
  about 50% — flagged. **C:** pillar < 50% (poorest prognosis) — flagged. Accepts A / B / BC (or B/C) /
  C, case-insensitive.
- `views/group-v347.js` (RV347) — one select (dom `herring-group`), real `<label for>`.
- `lib/meta.js` — Herring 1992 + Herring 2004 citation + accessed date + grouped bands. No
  citation-staleness row (the JPO / JBJS Am citations carry no guideline-issuer acronym).
- 5 worked-example unit tests + fuzz registration; synonym entry (v68 → v69); corpus → 1199.

**HIGH-STAKES:** it reports the Herring group the clinician has determined, never a diagnosis, a
treatment decision, or a prognosis ([spec-v11](spec-v11.md) §5.3). The prognosis also depends strongly
on the child's age at onset; the group alone is not the outcome, and the management decision stays with
the pediatric orthopedic surgeon (surfaced in the tile note).

## Sourcing (spec-v97)

- **Citation:** Herring JA, Neustadt JB, Williams JJ, Early JS, Browne RH. The lateral pillar
  classification of Legg-Calve-Perthes disease. *J Pediatr Orthop.* 1992;12(2):143-150 (groups A/B/C);
  Herring JA, Kim HT, Browne R. Legg-Calve-Perthes disease. Part I. *J Bone Joint Surg Am.*
  2004;86(10):2103-2120 (adds the B/C border group).
- Cross-verified against pediatric-orthopedic references (Orthobullets / "Classifications in Brief"
  *Clin Orthop Relat Res* 2013) reproducing the same A / B / B-C-border / C lateral-pillar-height
  definitions.

## Verification

Lint (all catalog-truth surfaces at 1199), unit suite (+5 + fuzz), build — all green. Verified in a
real browser: the example (group C) renders the "< 50% / poorest prognosis" warn description, group A
flips to the "not involved, best prognosis" description, and the tile does not scroll horizontally at
320px.

## Out of scope

The tile echoes the group the clinician selects; it does not read imaging, measure the pillar height, or
combine the group with age to predict an individual patient's outcome. The MCP adapter + golden-probe
promotion follow in a separate wave.

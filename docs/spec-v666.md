# spec-v666.md — Ventral Hernia Working Group (VHWG) grade

> Status: **SHIPPED (2026-08-08).** Builds the `vhwg-hernia` tile. Catalog **1496 → 1497**, group G.

## Why

A companion gap in the hernia-classification vein. The catalog had the Nyhus groin-hernia classification
(`nyhus-hernia`), but not the VHWG grade — the standard stratification of surgical-site-occurrence (SSO) risk in
ventral hernia repair, which informs repair technique and mesh choice.

## What it does

A decision-logic classifier: the grade is the **most severe** category whose features are present.

| Grade | Category | Features |
| --- | --- | --- |
| 4 | Infected | infected mesh or septic dehiscence |
| 3 | Potentially contaminated | previous wound infection, a stoma, or violation of the GI tract |
| 2 | Comorbid | smoking, obesity, diabetes, immunosuppression, or COPD |
| 1 | Low risk | none of the above |

A higher grade carries higher SSO risk.

## Scope (spec-v97)

Supports the surgical plan; read with the full clinical picture. The **modified VHWG** (Kanters 2012) is a
3-grade variant that merges the contaminated grades 3 and 4 and sub-stratifies by CDC wound class (and moves
isolated previous wound infection to grade 2); this tile implements the original 4-grade version and notes the
modified one.

## Files

- `lib/vhwg-hernia-v666.js` — `vhwgHernia()`, `VHWG_NOTE`.
- `views/group-v666.js` (RV666) — three feature checkboxes; a11y-checked, no innerHTML, no network.
- `mcp/adapters/vhwg-hernia-v666.js` — exposes the tile (clinical disclaimer).
- `lib/meta.js` — citation, example, interpretation, specialties, related.
- `test/unit/vhwg-hernia.test.js` — 6 tests (each grade, most-severe-wins, example).
- `docs/spec-v666.md` (this file).

## Sourcing (spec-v97)

Ventral Hernia Working Group; Breuing K, Butler CE, Ferzoco S, et al. Incisional ventral hernias: review of the
literature and recommendations regarding the grading and technique of repair. *Surgery.* 2010;148(3):544-558
(PMID 20304452). A source-verification subagent confirmed the four grades and their criteria (stoma is in
grade 3), the most-severe-wins logic, that the original 4-grade version is the commonly cited "VHWG grade," and
corrected the description of the modified Kanters 2012 version (it merges the contaminated grades 3 and 4 —
not grades 1–2 — and moves isolated previous wound infection to grade 2).

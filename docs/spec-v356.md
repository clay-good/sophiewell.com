# spec-v356.md — CEAP classification (chronic venous disease) tile

> Status: **SHIPPED (2026-07-16).** Builds the `ceap-venous` tile — the CEAP clinical classification
> (C-class C0–C6) of chronic venous disease. Catalog **1207 → 1208**, group G.

## Why

The catalog carries the Venous Clinical Severity Score (`vcss`, a severity score) but not the CEAP
clinical class it complements — the internationally accepted standard for describing the clinical signs
of a chronic venous disorder. `ceap classification` / `ceap clinical class` / `chronic venous disease
class` routed to nothing. (Companion-gap: `vcss` is the venous severity score; CEAP is the standard
venous classification.)

## What it does

The clinician picks the clinical class; the tile reports the class, its description, and whether it is an
advanced (C4–C6) class.

- `lib/ceap-venous-v356.js` — pure class → description. **C0:** no signs. **C1:** telangiectasias /
  reticular veins. **C2:** varicose veins. **C3:** edema. **C4a:** pigmentation or eczema — flagged.
  **C4b:** lipodermatosclerosis or atrophie blanche — flagged. **C5:** healed venous ulcer — flagged.
  **C6:** active venous ulcer — flagged. Accepts C0–C6 incl. C4a/C4b, 0–6, or bare `C4` (→ C4a),
  case-insensitive.
- `views/group-v356.js` (RV356) — one select (dom `ceap-class`), real `<label for>`.
- `lib/meta.js` — Eklof 2004 (JVS) citation + 2020 update + accessed date + grouped bands. No
  citation-staleness row (the citation carries no guideline-issuer acronym).
- 5 worked-example unit tests + fuzz registration; synonym entry (v77 → v78); corpus → 1208.

**HIGH-STAKES:** it reports the CEAP clinical class the clinician has determined from the exam, never a
diagnosis, a treatment decision, or a prognosis ([spec-v11](spec-v11.md) §5.3). The management decision
stays with the treating (vascular) clinician (surfaced in the tile note). This tile reports the C
(clinical) axis; the full CEAP also has E/A/P axes (out of scope).

## Sourcing (spec-v97)

- **Citation:** Eklof B, Rutherford RB, Bergan JJ, et al. Revision of the CEAP classification for chronic
  venous disorders: consensus statement. *J Vasc Surg.* 2004;40(6):1248-1252 (C0–C6, C4 split into
  C4a/C4b).
- Cross-verified against Lurie F, et al. The 2020 update of the CEAP classification system. *J Vasc Surg
  Venous Lymphat Disord.* 2020, and StatPearls, reproducing the same clinical classes.

## Verification

Lint (all catalog-truth surfaces at 1208), unit suite (+5 + fuzz), build — all green. Verified in a real
browser: the example (C3) renders the "edema" description, C6 flips to the flagged "active venous ulcer"
description, and the tile does not scroll horizontally at 320px.

## Out of scope

The tile echoes the class the clinician selects; it does not stage the E/A/P axes, image the veins, or
recommend a treatment. The MCP adapter + golden-probe promotion follow in a separate wave.

# spec-v447.md — Anderson-Montesano (occipital condyle fracture) tile

> Status: **SHIPPED (2026-07-19).** Builds the `anderson-montesano` tile — the Anderson-Montesano
> classification of occipital condyle fractures, types I/II/III. Catalog **1298 → 1299**, group G.

## Why

The catalog's craniocervical / spine fracture tiles (Levine-Edwards hangman) had no Anderson-Montesano type —
the standard classification of occipital condyle fractures on CT. `anderson montesano` / `occipital condyle
fracture type` routed to nothing. This fills that neuroradiology / spine gap.

## What it does

The clinician picks the type; the tile reports the type and its morphology description.

- `lib/anderson-montesano-v447.js` — pure type → description, the three Anderson-Montesano types. **I:**
  impacted/comminuted from axial loading (typically stable). **II:** extending from a basioccipital /
  skull-base fracture (usually stable). **III:** alar-ligament avulsion (potentially unstable). Accepts I-III
  and 1-3.
- `views/group-v447.js` (RV447) — one select (dom `am-type`), real `<label for>`.
- `lib/meta.js` — Anderson & Montesano 1988 (Spine) citation + accessed date + grouped bands. No
  citation-staleness row (the citation carries no guideline-issuer acronym).
- 5 worked-example unit tests + fuzz registration; synonym entry (v168 → v169); corpus → 1299.

**HIGH-STAKES:** it reports the imaging type the clinician has determined, never a diagnosis, a stability
determination, a treatment decision, or a prognosis ([spec-v11](spec-v11.md) §5.3); craniocervical stability
is judged with the full clinical and imaging picture, and the management decision stays with the spine /
neurosurgery team.

## Sourcing (spec-v97)

- **Citation:** Anderson PA, Montesano PX. Morphology and treatment of occipital condyle fractures. *Spine
  (Phila Pa 1976).* 1988;13(7):731-736.
- Cross-verified against neuroradiology / spine references reproducing the same impaction (I) /
  basioccipital-extension (II) / alar-ligament-avulsion (III) grouping.

## Verification

Lint (all catalog-truth surfaces at 1299), unit suite (+5 + fuzz), build — all green. Verified in a real
browser: type III renders "avulsion fracture ... at the alar ligament," the other types flip to their
descriptions; the tile does not scroll horizontally at 320px.

## Out of scope

The tile echoes the type the clinician selects; it does not read the CT, determine stability, or recommend
immobilization. The MCP adapter + golden-probe promotion follow in a separate wave.

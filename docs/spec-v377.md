# spec-v377.md — Gartland classification (supracondylar humerus fracture) tile

> Status: **SHIPPED (2026-07-17).** Builds the `gartland-supracondylar` tile — the Gartland classification
> of a pediatric extension-type supracondylar humerus fracture (types I-III + modified IV). Catalog
> **1228 → 1229**, group G.

## Why

The catalog carries many fracture eponyms (Garden, Pauwels, Pipkin, Denis, Salter-Harris, Neer,
Schatzker, Mason, Hawkins, Sanders) but not the Gartland classification — the standard grading of the
**most common pediatric elbow fracture**, by displacement and the integrity of the cortical/periosteal
hinge. `gartland` / `supracondylar humerus fracture classification` routed to nothing.

## What it does

The clinician picks the type; the tile reports the type, its displacement/hinge description, and whether
it is a displaced (type II-IV) fracture.

- `lib/gartland-supracondylar-v377.js` — pure type → description. **I:** nondisplaced; the anterior
  humeral line passes through the capitellum (stable). **II:** displaced with an intact posterior cortical
  hinge (Wilkins IIA rotationally stable / IIB malrotated) — flagged. **III:** completely displaced, no
  cortical contact — flagged. **IV:** (modified, Leitch) multidirectional instability with complete
  periosteal disruption — flagged. Accepts I/II/III/IV or 1-4, IIA/IIB → II, case-insensitive.
- `views/group-v377.js` (RV377) — one select (dom `gartland-type`), real `<label for>`.
- `lib/meta.js` — Gartland 1959 (+ Leitch 2006 type IV) citation + accessed date + grouped bands. No
  citation-staleness row (the citation carries no guideline-issuer acronym).
- 6 worked-example unit tests + fuzz registration; synonym entry (v98 → v99); corpus → 1229.

**HIGH-STAKES:** it reports the Gartland type the clinician has determined from the imaging, never a
diagnosis, a treatment decision, or a prognosis ([spec-v11](spec-v11.md) §5.3). The rising-instability
gradient (I → IV) is the classically taught pattern, not an order; the management decision (nonoperative
vs closed reduction and pinning vs open) stays with the orthopedic / trauma team (surfaced in the tile
note).

## Sourcing (spec-v97)

- **Citation:** Gartland JJ. Management of supracondylar fractures of the humerus in children. *Surg
  Gynecol Obstet.* 1959;109(2):145-154 (the original extension-type I/II/III). Modified type IV: Leitch
  KK, et al. *J Bone Joint Surg Am.* 2006;88(5):980-985.
- Cross-verified against orthopedic references (Wilkins IIA/IIB subdivision; Alton et al. "Classifications
  in Brief," CORR 2015) reproducing the same displacement/hinge grading and the type IV multidirectional
  instability.

## Verification

Lint (all catalog-truth surfaces at 1229), unit suite (+6 + fuzz), build — all green. Verified in a real
browser: type III renders the flagged "completely displaced" description, type I flips to the stable
"nondisplaced / anterior humeral line" description, and the tile does not scroll horizontally at 320px.

## Out of scope

The tile echoes the type the clinician selects; it does not read imaging, cover flexion-type fractures
beyond the type IV note, or recommend fixation. The MCP adapter + golden-probe promotion follow in a
separate wave.

# spec-v395.md — Parks classification (anal fistula) tile

> Status: **SHIPPED (2026-07-17).** Builds the `parks-fistula` tile — the Parks classification of an anal
> fistula (intersphincteric / transsphincteric / suprasphincteric / extrasphincteric). Catalog
> **1246 → 1247**, group G.

## Why

The catalog carries many colorectal / GI tiles but not the Parks classification — the standard anatomic
classification of a fistula-in-ano by its relationship to the anal sphincter complex, which guides
surgical planning and the continence risk. `parks` / `anal fistula classification` routed to nothing.
Found on a fresh colorectal / GI sweep.

## What it does

The clinician picks the type; the tile reports the type, its sphincter-relationship description, and
whether it is a complex (supra- / extrasphincteric) fistula.

- `lib/parks-fistula-v395.js` — pure type → description. **intersphincteric:** through the internal
  sphincter only (most common). **transsphincteric:** through both sphincters into the ischioanal fossa.
  **suprasphincteric:** above the puborectalis — flagged (complex). **extrasphincteric:** outside the
  sphincter complex, through the levator — flagged (complex). Accepts the full names, the
  inter/trans/supra/extra shorthands, and grades I-IV / 1-4.
- `views/group-v395.js` (RV395) — one select (dom `parks-type`), real `<label for>`.
- `lib/meta.js` — Parks 1976 (Br J Surg) citation + accessed date + grouped bands. No citation-staleness
  row (the citation carries no guideline-issuer acronym).
- 6 worked-example unit tests + fuzz registration; synonym entry (v116 → v117); corpus → 1247.

**HIGH-STAKES:** it reports the Parks type the clinician has determined, never a diagnosis, a treatment
decision, or a prognosis ([spec-v11](spec-v11.md) §5.3). The supra- and extrasphincteric types carry a
higher continence risk with surgery, but the management decision stays with the colorectal / surgical
team.

## Sourcing (spec-v97)

- **Citation:** Parks AG, Gordon PH, Hardcastle JD. A classification of fistula-in-ano. *Br J Surg.*
  1976;63(1):1-12 (the four anatomic types, from a series of 400 patients).
- Cross-verified against colorectal / radiology references reproducing the same intersphincteric /
  transsphincteric / suprasphincteric / extrasphincteric grouping by relationship to the sphincter
  complex.

## Verification

Lint (all catalog-truth surfaces at 1247), unit suite (+6 + fuzz), build — all green. Verified in a real
browser: the suprasphincteric type renders the flagged "above the puborectalis / complex" description, the
intersphincteric type flips to "internal sphincter only / most common", and the tile does not scroll
horizontally at 320px.

## Out of scope

The tile echoes the type the clinician selects; it does not read the MRI/exam, apply the St James's
University Hospital MRI grading, or recommend surgery. The MCP adapter + golden-probe promotion follow in
a separate wave.

# spec-v394.md — Borrmann classification (gastric cancer) tile

> Status: **SHIPPED (2026-07-17).** Builds the `borrmann-gastric` tile — the Borrmann classification of
> advanced gastric cancer (types I-IV). Catalog **1245 → 1246**, group G.

## Why

The catalog just gained the Lauren histological typing of gastric carcinoma; its classic morphological
companion is the Borrmann classification — the gross (macroscopic) typing of advanced gastric cancer, the
two often reported together. `borrmann` / `gastric cancer gross morphology` routed to nothing. This is the
Lauren↔Borrmann companion-gap.

## What it does

The clinician picks the type; the tile reports the type and its gross-appearance description.

- `lib/borrmann-gastric-v394.js` — pure type → description. **I:** polypoid (protruding, demarcated, no
  ulcer). **II:** fungating / ulcerated (ulcerated mass, sharply raised margins). **III:** ulcerated and
  infiltrative (ill-defined margins). **IV:** diffusely infiltrative / linitis plastica (no mass or ulcer,
  no clear margins; classically the worst prognosis). Accepts I/II/III/IV or 1-4.
- `views/group-v394.js` (RV394) — one select (dom `borrmann-type`), real `<label for>`.
- `lib/meta.js` — Borrmann 1926 (+ a modern review) citation + accessed date + grouped bands. No
  citation-staleness row (the citation carries no guideline-issuer acronym).
- 6 worked-example unit tests + fuzz registration; synonym entry (v115 → v116); corpus → 1246.

**HIGH-STAKES:** it reports the Borrmann type the endoscopist / pathologist has determined, never a
diagnosis, a treatment decision, or a prognosis ([spec-v11](spec-v11.md) §5.3). The type IV (linitis
plastica) worse-prognosis association is descriptive, not an order; the management decision stays with the
treating oncology team.

## Sourcing (spec-v97)

- **Citation:** Borrmann R. Geschwulste des Magens und Duodenums. In: Henke F, Lubarsch O, eds. *Handbuch
  der speziellen pathologischen Anatomie und Histologie.* Berlin: Springer; 1926 (the original I-IV
  macroscopic typing). Reviewed in Marrelli D, et al. *Cancers (Basel).* 2021;13(12):3081.
- Cross-verified against oncology / pathology references reproducing the same polypoid (I) /
  fungating-ulcerated (II) / ulcerated-infiltrative (III) / diffusely-infiltrative-linitis-plastica (IV)
  grouping.

## Verification

Lint (all catalog-truth surfaces at 1246), unit suite (+6 + fuzz), build — all green. Verified in a real
browser: type IV renders the "diffusely infiltrative / linitis plastica" description, type I flips to
"polypoid", and the tile does not scroll horizontally at 320px.

## Out of scope

The tile echoes the type the clinician selects; it does not read the endoscopy or slide, combine with the
Lauren type automatically, or recommend treatment. The MCP adapter + golden-probe promotion follow in a
separate wave.

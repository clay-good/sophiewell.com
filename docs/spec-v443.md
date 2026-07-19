# spec-v443.md — Kadish staging (esthesioneuroblastoma) tile

> Status: **SHIPPED (2026-07-19).** Builds the `kadish` tile — the Kadish staging of esthesioneuroblastoma,
> stages A/B/C/D. Catalog **1294 → 1295**, group G.

## Why

The catalog had no staging for esthesioneuroblastoma (olfactory neuroblastoma) — the standard Kadish anatomic
staging for this sinonasal tumor. `kadish` / `esthesioneuroblastoma stage` routed to nothing. This fills that
otolaryngology / oncology gap.

## What it does

The clinician picks the stage; the tile reports the stage and its anatomic-extent description.

- `lib/kadish-v443.js` — pure stage → description, the modified Kadish stages. **A:** confined to the nasal
  cavity. **B:** nasal cavity plus paranasal sinuses. **C:** beyond the sinuses (orbit, skull base,
  intracranial). **D:** metastasis to cervical nodes or distant sites (Morita modification). Accepts A-D.
- `views/group-v443.js` (RV443) — one select (dom `kadish-stage`), real `<label for>`.
- `lib/meta.js` — Kadish 1976 (Cancer) citation + accessed date + grouped bands. No citation-staleness row
  (the citation carries no guideline-issuer acronym).
- 6 worked-example unit tests + fuzz registration; synonym entry (v164 → v165); corpus → 1295.

**HIGH-STAKES:** it reports the anatomic stage the clinician has determined, never a diagnosis, a treatment
decision, or a prognosis ([spec-v11](spec-v11.md) §5.3); the management decision stays with the head-and-neck
oncology / skull-base team.

## Sourcing (spec-v97)

- **Citation:** Kadish S, Goodman M, Wang CC. Olfactory neuroblastoma. A clinical analysis of 17 cases.
  *Cancer.* 1976;37(3):1571-1576 (stages A-C), modified by Morita A, et al. *Neurosurgery.* 1993 (adds stage
  D).
- Cross-verified against otolaryngology / oncology references reproducing the same nasal-cavity (A) / sinus
  (B) / beyond-sinuses (C) / metastatic (D) staging.

## Verification

Lint (all catalog-truth surfaces at 1295), unit suite (+6 + fuzz), build — all green. Verified in a real
browser: stage C renders "beyond the nasal cavity and paranasal sinuses," the other stages flip to their
descriptions; the tile does not scroll horizontally at 320px.

## Out of scope

The tile echoes the stage the clinician selects; it does not examine imaging, add TNM staging, or recommend
treatment. The MCP adapter + golden-probe promotion follow in a separate wave.

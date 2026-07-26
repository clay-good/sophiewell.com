# spec-v460.md — Enneking surgical staging (musculoskeletal sarcoma) tile

> Status: **SHIPPED (2026-07-19).** Builds the `enneking` tile — the Enneking (MSTS) surgical staging of
> malignant musculoskeletal tumors, stages IA/IB/IIA/IIB/III. Catalog **1310 → 1311**, group G.

## Why

The catalog carried the Mirels impending-pathologic-fracture score but had no Enneking grade — the standard
surgical staging of bone and soft-tissue sarcoma (the MSTS system), which combines histologic grade,
compartment, and metastasis. `enneking` / `musculoskeletal sarcoma staging` routed to nothing. This fills that
orthopedic-oncology gap.

## What it does

The clinician picks the stage; the tile reports the stage and its grade / compartment / metastasis combination.

- `lib/enneking-v460.js` — pure stage → description, the five Enneking stages by grade (G1 low, G2 high),
  compartment (T1 intracompartmental, T2 extracompartmental), and metastasis (M). **IA:** G1 T1 M0. **IB:** G1
  T2 M0. **IIA:** G2 T1 M0. **IIB:** G2 T2 M0. **III:** any M1. Accepts IA/IB/IIA/IIB/III and 1A/1B/2A/2B/3.
- `views/group-v460.js` (RV460) — one select (dom `enneking-stage`), real `<label for>`.
- `lib/meta.js` — Enneking 1980 (Clin Orthop Relat Res) citation + accessed date + grouped bands. No
  citation-staleness row (the citation carries no guideline-issuer acronym).
- 7 worked-example unit tests + fuzz registration; synonym entry (v180 → v181); corpus → 1311.

**HIGH-STAKES:** it reports the surgical stage the clinician has determined from grade / compartment /
metastasis, never a diagnosis, a treatment decision, or a prognosis ([spec-v11](spec-v11.md) §5.3); the
management decision stays with the orthopedic-oncology team.

## Sourcing (spec-v97)

- **Citation:** Enneking WF, Spanier SS, Goodman MA. A system for the surgical staging of musculoskeletal
  sarcoma. *Clin Orthop Relat Res.* 1980;(153):106-120.
- Cross-verified against orthopedic-oncology references reproducing the same G/T/M combinations. This is the
  surgical staging of *malignant* tumors; the separate benign staging (latent/active/aggressive) is out of
  scope.

## Verification

Lint (all catalog-truth surfaces at 1311), unit suite (+7 + fuzz), build — all green. Verified in a real
browser: stage IIB renders "high-grade (G2), extracompartmental (T2), no metastasis (M0)," the other stages
flip to their combinations; the tile does not scroll horizontally at 320px.

## Out of scope

The tile echoes the stage the clinician selects; it does not grade the tumor, assess the compartment, or
recommend management (margins, adjuvant therapy). The MCP adapter + golden-probe promotion follow in the next
wave (285).

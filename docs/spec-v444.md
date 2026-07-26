# spec-v444.md — McCormick grade (spinal cord function) tile

> Status: **SHIPPED (2026-07-19).** Builds the `mccormick` tile — the McCormick neurological grading scale for
> spinal-cord lesion function, grades I/II/III/IV. Catalog **1295 → 1296**, group G.

## Why

The catalog had no McCormick grade — the standard functional grading of spinal-cord (intramedullary) lesion
severity used in neurosurgery reporting. `mccormick` / `spinal cord function grade` routed to nothing. This
fills that neurosurgery / neurology gap.

## What it does

The clinician picks the grade; the tile reports the grade and its functional description.

- `lib/mccormick-v444.js` — pure grade → description, the four McCormick grades by deficit and ambulation.
  **I:** intact or mild deficit, normal gait. **II:** deficit affecting the involved limb but functions and
  ambulates independently. **III:** needs a cane or brace, or significant bilateral upper-limb impairment.
  **IV:** severe, needs a wheelchair, usually not independent. Accepts I-IV and 1-4.
- `views/group-v444.js` (RV444) — one select (dom `mccormick-grade`), real `<label for>`.
- `lib/meta.js` — McCormick 1990 (J Neurosurg) citation + accessed date + grouped bands. No citation-staleness
  row (the citation carries no guideline-issuer acronym).
- 6 worked-example unit tests + fuzz registration; synonym entry (v165 → v166); corpus → 1296.

**HIGH-STAKES:** it reports the functional grade the clinician has determined, never a diagnosis, a treatment
decision, or a prognosis ([spec-v11](spec-v11.md) §5.3); the management decision stays with the neurosurgery /
neurology team.

## Sourcing (spec-v97)

- **Citation:** McCormick PC, Torres R, Post KD, Stein BM. Intramedullary ependymoma of the spinal cord. *J
  Neurosurg.* 1990;72(4):523-532.
- Cross-verified against neurosurgery references reproducing the same intact/mild (I) / deficit-but-independent
  (II) / needs-aid (III) / severe-dependent (IV) grading.

## Verification

Lint (all catalog-truth surfaces at 1296), unit suite (+6 + fuzz), build — all green. Verified in a real
browser: grade II renders "functions and ambulates independently," the other grades flip to their
descriptions; the tile does not scroll horizontally at 320px.

## Out of scope

The tile echoes the grade the clinician selects; it does not examine the patient, add imaging staging, or
recommend surgery. The MCP adapter + golden-probe promotion follow in a separate wave.

# spec-v557.md — mSWAT tile

> Status: **SHIPPED (2026-07-28).** Builds the `mswat` tile — modified Severity-Weighted Assessment Tool for
> mycosis fungoides and Sézary syndrome. Catalog **1406 → 1407**, group G.

## Why

A **whole-concept gap**: `mswat`, `swat` and `mycosis` were all zero-hit. The catalog had no cutaneous
lymphoma content of any kind.

## What it does

**mSWAT = (%BSA × 1) + (%BSA × 2) + (tumor or ulcer %BSA × 4)**

Area is measured with the **patient's own** palm plus fingers as 1% of body surface area.

## The five rules a plausible implementation breaks

**1. The score runs 0-400, not 0-100.** Every input is a percentage of body surface area, so the output
looks like it should be one too. It is not — a body wholly covered in tumor scores 4 × 100. A score of 180
is ordinary, not impossible, and must never be reported as "180% of body surface area".

**2. The three categories are mutually exclusive per unit of skin.** Each square centimetre is counted
**once**, in one category only, so the three percentages sum to at most 100. They are not three independent
measurements of the same skin — and three fields each accepting 0-100 invite exactly that double-count. The
lib enforces the ceiling.

**3. The tumor weight is 4 in mSWAT and was 3 in the original SWAT.** That is what the "m" modifies. A score
copied from an older record without its version is not comparable, so both weights are exported.

**4. The two forms use different lesion vocabularies for identical arithmetic.** Erythrodermic patients are
scored as patch / plaque / tumor; nonerythrodermic patients as mild infiltration / moderate infiltration /
tumor. Same weights (1, 2, 4). The erythroderma flag is **required** because it selects which question is
being asked, even though it does not change the sum — the view rebuilds the labels from it.

**5. There are no severity bands, and the tile invents none.** mSWAT is a continuous burden measure. Its
published threshold is a **change** from the same patient's baseline — a reduction of ≥50% is a partial skin
response — which belongs to a comparison of two scores, not to one score. Adding a mild/moderate/severe cut
point would be exactly the kind of fabrication a calculator makes easy.

## A deliberate omission

A 12-region %BSA reference table circulates with this instrument. Only **two of its twelve values** could be
independently confirmed, so shipping it would present ten single-sourced numbers with the authority of the
rest of the instrument. The core scoring does not need it — the assessor supplies %BSA directly, which is
what the source asks for (spec-v97).

## Scope (spec-v11 §5.3)

It measures **skin burden only**. It does **not** stage mycosis fungoides or Sézary syndrome, which is a
TNMB classification requiring nodes, viscera and **blood** — and Sézary syndrome is defined by blood
involvement this instrument cannot see, so a patient with limited skin disease and a high blood tumor burden
scores low while having advanced disease. It does not diagnose cutaneous lymphoma, which requires biopsy
with clonality studies, and does not distinguish it from the inflammatory dermatoses it can mimic for years.
It does not detect large-cell transformation, does not select therapy, and is not a response assessment on
its own, because global response combines skin with the other compartments.

## Files

- `lib/mswat-v557.js` — `mswat()`, `MSWAT_CATEGORIES`, `categoryLabel()`, `MSWAT_MAX`,
  `MSWAT_TUMOR_WEIGHT`, `SWAT_ORIGINAL_TUMOR_WEIGHT`.
- `views/group-v557.js` (RV557) — the erythroderma select and three %BSA inputs under **h2** headings.
- `mcp/adapters/mswat-v557.js` — wave 382.
- `test/unit/mswat.test.js` — 16 tests.
- `docs/spec-v557.md` (this file).

## Sourcing (spec-v97)

Three independent reproductions agree on every weight, the palm rule and both formula variants.

- Olsen EA, Whittaker S, Kim YH, et al. Clinical end points and response criteria in mycosis fungoides and
  Sézary syndrome. *J Clin Oncol.* 2011;29(18):2598-2607.

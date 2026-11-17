# spec-v1755 — Ordinal items and counts between their steps

> Status: **SHIPPED (2026-11-16)**: 74 tools. The catalog stays 2,387.

`scripts/probe-fraction-rounded.mjs` (spec-v1722) finds a whole-step field that ROUNDS a fraction. spec-v1754 found
the other half: a field that SCORES a fraction from wherever it falls between cutoffs (a GCS of 12.5). A sweep drove
every field whose label marks it as an ordinal item with a small range ("Mobility (1-4)") or a count ("Number of
lesions") at its worked-example value plus 0.5. With 0-10 scales left out (they are often visual-analogue lines),
286 fields across 74 tools scored the half step.

Examples: Braden and Braden Q subscales, every NIHSS and modified NIHSS item, the 17 modified Rodnan sites, Berg
balance, the MRC sum, MASI, AUDIT, IPSS, IIEF-5, QuickDASH, the neck disability index, CAT, Kupperman and the
Menopause Rating Scale, Villalta, VCSS, Wilkins, SPPB, Aldrete and PADSS, PASS, pediatric GCS, and counts of
lesions, attacks, adenomas, metastases, comorbidities and joints. A leprosy lesion count of 5.5 was floored to 5,
which classed the patient paucibacillary (6 months of treatment) instead of multibacillary (12).

Each library now refuses a fraction with `wholeFault`, or `gradeFault` with the item's own range and the whole
flag. Where a function had no range check, the item's range now refuses an out-of-range whole value too (IPSS,
IIEF-5, OABSS, QuickDASH, RSI, BBPS, Wilson, Ferriman-Gallwey, Thompson, Kupperman, MRS, Wilkins, SPPB, mRSS,
dehydration scale, RDAI/Tal, NDI, Villalta, VCSS), where it used to be clamped, zeroed or asked for again. Where a
function deliberately clamps an out-of-range whole value and tests pin it (Aldrete, PADSS, PASS, pediatric GCS, West
Haven), only the fraction is refused here.

Left fractional on purpose: visual-analogue and 0-10 rating lines (BASDAI, BASFI, the DAPSA and RA globals),
averages and frequencies (attacks per day, headache days per month), durations, a center's own AFC cutoff, and an
iron tablet count (a half tablet is a real ingestion).

Done by four parallel agents split by library file. Tests: one spec-v1755 case in each tool's own unit test file;
two clamp-pinning tests (dehydration scale, RDAI/Tal) now expect the refusal.

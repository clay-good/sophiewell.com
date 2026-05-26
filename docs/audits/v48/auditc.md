# v48 derivation provenance — AUDIT-C (`auditc`)

- Auditor: CG
- Date: 2026-05-26
- Wave: 48-4a
- Citation re-verified against: Bush K, Kivlahan DR, McDonell MB, Fihn SD, Bradley KA. *The AUDIT alcohol consumption questions (AUDIT-C): an effective brief screening test for problem drinking.* Arch Intern Med. 1998;158(16):1789-1795.

## Screener-renderer integration

AUDIT-C uses `lib/screener.js renderScreener` (the wave-48-3d pattern). Component `inputKey`s are the item index as a string (`'0'`-`'2'`). The tile view (`views/group-g.js auditc()`) converts the screener's numeric-indexed `answers` array into a keyed input object for the derivation renderer; the `opts.onUpdate` callback drives live updates of the derivation steps.

## Components — verbatim source mapping

Three items, each scored 0-4.

| Index | Question (Bush 1998) | Source levels |
|---|---|---|
| 0 | Q1: "How often do you have a drink containing alcohol?" | 0 never / 1 monthly or less / 2 2-4× per month / 3 2-3× per week / 4 4 or more times per week |
| 1 | Q2: "How many standard drinks containing alcohol do you have on a typical day?" | 0 (1-2) / 1 (3-4) / 2 (5-6) / 3 (7-9) / 4 (≥10) |
| 2 | Q3: "How often do you have 6 or more drinks on one occasion?" | 0 never / 1 less than monthly / 2 monthly / 3 weekly / 4 daily or almost daily |

## Bands — source mapping

| Range | Source label |
|---|---|
| 0-2 | negative (for women); use cutoff 4 for men |
| 3-7 | positive — risky drinking |
| 8-12 | positive — high risk for alcohol use disorder |

The published cutoff is sex-specific: ≥3 for women, ≥4 for men (Bush 1998). The Sophie band text surfaces both cutoffs because the screener form does not collect sex.

## Population

Bush 1998: validation in 243 Veterans Affairs primary-care patients. Reference standard: structured AUDIT (10-item) interview. AUDIT-C has subsequently been validated in primary-care, ED, and obstetric settings.

## Validity

Adults in primary-care settings. NOT designed for adolescents (use CRAFFT) or for monitoring response to treatment (use AUDIT-10 or biomarkers like CDT). The sex-specific cutoff applies — using the women's cutoff (≥3) on men over-screens; using the men's cutoff (≥4) on women under-screens.

## Source quote

"The AUDIT-C is an effective brief screening test for heavy drinking and/or active alcohol abuse or dependence in primary care." — Bush 1998 §Conclusions.

## Renderer assertions

Verified locally:
- `META.auditc.derivation` has every required field per `lib/derivation.js validate()` and exactly 3 components.
- Components sum equals `scoreScreener()` total at two boundary points (max 12, worked example 4).
- Bands span 0-12 contiguously.

## Defects opened
None.

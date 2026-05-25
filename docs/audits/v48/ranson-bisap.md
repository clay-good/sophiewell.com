# v48 derivation provenance — BISAP half of `ranson-bisap`

- Auditor: CG
- Date: 2026-05-25
- Wave: 48-2b
- Citation re-verified against: Wu BU, Johannes RS, Sun X, Tabak Y, Conwell DL, Banks PA. *The early prediction of mortality in acute pancreatitis: a large population-based study.* Gut. 2008;57(12):1698-1703.

## Scope of the derivation block

The `ranson-bisap` tile renders both Ranson (1974) and BISAP (2008). Wave 48-2b ships BISAP as the primary `derivation` block because:

1. BISAP is the contemporary 24-hour bedside score; Ranson requires 48-hour follow-up labs that are unavailable in the ED triage window the tile is designed for.
2. Ranson sums 11 binary criteria across two time points (5 admission + 6 at 48 hours). Surfacing both as a single additive `components` array would obscure the 48-hour split. A `derivationRanson` sibling block is a candidate for a later wave; for now, the existing per-criterion checkbox UI carries the Ranson math and the bedside output annotation surfaces the result.

## Components — verbatim source mapping

Five binary criteria from Wu 2008 Table 1.

| Letter | Component | Source phrasing | Points |
|---|---|---|---|
| B | BUN > 25 mg/dL | "BUN > 25 mg/dL" | 1 |
| I | Impaired mental status (GCS < 15) | "Impaired mental status (GCS < 15)" | 1 |
| S | SIRS criteria met (≥2 of 4) | "Systemic inflammatory response syndrome (SIRS) — meeting >=2 of: temp <36 or >38°C, HR >90, RR >20 or PaCO2 <32 mmHg, WBC <4 or >12 ×10³/µL or >10% bands" | 1 |
| A | Age > 60 | "Age > 60 years" | 1 |
| P | Pleural effusion present | "Pleural effusion (on imaging)" | 1 |

## Bands — verbatim source mapping

From Wu 2008 Table 3 (in-hospital mortality):

| Score | Source mortality | Sophie band label |
|---|---|---|
| 0 | 0.1% | low risk |
| 1 | 0.4% | low risk |
| 2 | 1.6% | low risk |
| 3 | 3.6% | high risk |
| 4 | 7.4% | high risk |
| 5 | 9.5% | high risk |

Sophie's two-band collapse (0-2 low, ≥3 high) follows Wu 2008's prespecified high-risk cutoff.

## Population

Derivation: 17,992 cases of acute pancreatitis from the National Cancer Data Bank, 2000-2001 (Wu 2008 §Methods). Internal validation: 18,256 cases. Excluded: chronic pancreatitis flares.

## Validity

Adults with acute pancreatitis presenting to the ED. BISAP is a 24-hour bedside severity score; it is not a diagnostic test for pancreatitis (Atlanta criteria apply). Compared to Ranson, BISAP requires fewer inputs and no 48-hour follow-up. NOT validated for chronic pancreatitis flares or for pediatric pancreatitis. The S (SIRS) criterion is itself a composite — the tile checkbox condenses the 4 SIRS sub-criteria into one input; users tracking which SIRS sub-criteria fired should record that separately.

## Source quote

"BISAP is an accurate means for risk stratification in patients with acute pancreatitis. Its components are clinically relevant and easy to obtain at presentation." — Wu 2008 §Conclusion.

## Renderer assertions

Verified locally:
- `META['ranson-bisap'].derivation` has every required field per `lib/derivation.js validate()` and exactly 5 components.
- Components sum equals `bisap().score` at two boundary points (worked example 2, max 5).

## Defects opened
None.

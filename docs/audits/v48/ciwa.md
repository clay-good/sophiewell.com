# v48 derivation provenance — CIWA-Ar (`ciwa`)

- Auditor: CG
- Date: 2026-05-25
- Wave: 48-2a
- Citation re-verified against: Sullivan JT, Sykora K, Schneiderman J, Naranjo CA, Sellers EM. *Assessment of alcohol withdrawal: the revised Clinical Institute Withdrawal Assessment for Alcohol scale (CIWA-Ar).* Br J Addict. 1989;84(11):1353-1357.

## Components — verbatim source mapping

Ten nurse-rated items from Sullivan 1989 Appendix (CIWA-Ar form). Nine items each range 0-7; one item (orientation/clouding of sensorium) ranges 0-4. Maximum aggregate 67.

| Component | Source row (Sullivan 1989 Appendix) | Range |
|---|---|---|
| Nausea/vomiting | "Nausea and vomiting" | 0-7 |
| Tremor | "Tremor" | 0-7 |
| Paroxysmal sweats | "Paroxysmal sweats" | 0-7 |
| Anxiety | "Anxiety" | 0-7 |
| Agitation | "Agitation" | 0-7 |
| Tactile disturbances | "Tactile disturbances" | 0-7 |
| Auditory disturbances | "Auditory disturbances" | 0-7 |
| Visual disturbances | "Visual disturbances" | 0-7 |
| Headache / fullness in head | "Headache, fullness in head" | 0-7 |
| Orientation / clouding of sensorium | "Orientation and clouding of sensorium" | 0-4 |

Each component is implemented with a clamping callback `(v) => Math.max(0, Math.min(N, Number(v) || 0))` where N is 7 or 4 per the item's range.

## Bands — source mapping

Severity bands follow the Mayo-Smith 1997 expert-consensus thresholds (JAMA 1997;278(2):144-151) for symptom-triggered therapy — the Sullivan 1989 original did not specify a treatment cutoff.

| Score | Sophie label |
|---|---|
| 0-7 | mild withdrawal (<8); supportive care typically sufficient |
| 8-15 | moderate withdrawal; symptom-triggered protocol typically initiates treatment |
| 16-20 | severe withdrawal |
| ≥ 21 | very severe; high risk of seizure / DTs |

## Population

Inpatient and outpatient alcohol withdrawal cohorts at the Addiction Research Foundation, Toronto (Sullivan 1989). Subsequent symptom-triggered-therapy validation: Saitz 1994 (JAMA), Mayo-Smith 1997 (expert consensus). The 10-item revised form (CIWA-Ar) shortens the original 15-item CIWA-A by combining redundant items.

## Validity

Adult patients with confirmed or strongly suspected alcohol withdrawal. The scale requires a **verbal patient** who can describe symptoms (tactile/auditory/visual disturbances, headache, anxiety) — its validity drops sharply in intubated, sedated, delirious, or aphasic patients. RASS and CAM-ICU are better-suited in those populations. The 8-point treatment threshold is an institutional convention from Mayo-Smith 1997 (expert consensus), not from the original Sullivan paper; institutional protocols should govern the actual cutoff used.

## Source quote

"The CIWA-Ar is a 10-item, 1-page scale that takes less than 2 minutes to administer. ... The CIWA-Ar is a useful instrument for the assessment of patients undergoing alcohol withdrawal." — Sullivan 1989 §Conclusion.

## Renderer assertions

Verified locally:
- `META.ciwa.derivation` has every required field per `lib/derivation.js validate()`.
- Components sum equals `ciwaAr().score` at three boundary points (worked example 10, max 67, clamped 10→7).

## Defects opened
None.

# v48 derivation provenance — Westley croup score (`westley`)

- Auditor: CG
- Date: 2026-05-26
- Wave: 48-4i
- Citation re-verified against: Westley CR, Cotton EK, Brooks JG. *Nebulized racemic epinephrine by IPPB for the treatment of croup: a double-blind study.* Am J Dis Child. 1978;132(5):484-487.

## Components — verbatim source mapping

Five items with non-uniform per-item maxima; range 0-17.

| # | Item | Allowed values |
|---|---|---|
| 1 | Level of consciousness | 0 (normal) / 5 (disoriented) |
| 2 | Cyanosis | 0 (none) / 4 (with agitation) / 5 (at rest) |
| 3 | Stridor | 0 (none) / 1 (with agitation) / 2 (at rest) |
| 4 | Air entry | 0 (normal) / 1 (decreased) / 2 (markedly decreased) |
| 5 | Retractions | 0 (none) / 1 (mild) / 2 (moderate) / 3 (severe) |

## Bands — source mapping (Westley 1978)

| Range | Severity |
|---|---|
| < 3 | Mild |
| 3-7 | Moderate |
| 8-11 | Severe |
| >= 12 | Impending respiratory failure |

## Population

Westley 1978: derived from a double-blind RCT of nebulized racemic epinephrine versus placebo by IPPB in 20 children with viral croup at the Children's Hospital of Denver. Designed as a quantitative outcome measure for the trial; later established as the standard pediatric croup severity score.

## Validity

Children with viral croup (laryngotracheitis) in the ED or pediatric unit. Guides decisions about racemic epinephrine, dexamethasone, observation, and admission. Not validated for non-croup upper-airway obstruction (epiglottitis, bacterial tracheitis, anaphylaxis, retropharyngeal abscess), spasmodic / recurrent croup, or adolescents.

## Source quote

"A clinical croup score consisting of five components was developed for this study." — Westley 1978 §Methods.

## Renderer assertions

Verified locally:
- `META.westley.derivation` has every required field per `lib/derivation.js validate()` and exactly 5 components.
- Components sum equals `westley().score` at multiple boundary points (none -> 0; max all items -> 17; cyanosis-with-agitation alone -> 4).

## Defects opened
None.

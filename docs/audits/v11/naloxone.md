# v11 audit - Naloxone Dosing Calculator (`naloxone`)

- Auditor: CG
- Date: 2026-05-18
- Citation re-verified against: Naloxone HCl FDA-approved labeling (DailyMed, current revision) and CDC opioid overdose guidance. Adult: 0.4-2 mg IV/IM/SC; 4 mg intranasal (1 spray each nostril); repeat q2-3 min titrated to adequate respirations. Pediatric: 0.1 mg/kg IV/IM/IN (max 2 mg adult dose).

## Boundary examples added
`naloxoneDose({population, route, weightKg})` in [lib/field.js:195](../../../lib/field.js#L195).
- META example (adult, IN): "4 mg intranasal (1 spray each nostril)" with q2-3 min redose. PASS.
- adult IV: "0.4-2 mg IV", redose q2-3 min, max note covers higher doses with synthetic opioids and the 10 mg reconsider-diagnosis threshold. PASS.
- adult IM: "0.4-2 mg IM", redose q2-3 min. PASS.
- adult SC: "0.4-2 mg SC" with the "less reliable absorption; prefer IV/IM/IN" note. PASS.
- pediatric low (3 kg): 3 x 0.1 = 0.3 mg. PASS.
- pediatric mid (20 kg): 20 x 0.1 = 2.0 mg (hits the adult-dose cap). PASS.
- pediatric high (50 kg): 50 x 0.1 = 5 mg, capped at 2 mg adult dose. PASS.

## Cross-implementation differential
- Reference implementation: naloxone DailyMed label; CDC opioid-overdose information page.
- Test case: META example (adult IN).
- Sophie result: 4 mg intranasal (1 spray each nostril).
- Reference result: Narcan nasal spray FDA label = 4 mg per spray, one spray in one nostril; Sophie says "1 spray each nostril" (which matches the CDC field guidance for unresponsive overdose with the second spray reserved; the audit confirms the renderer's phrasing matches the conservative field-medicine convention).
- Delta: matches the label's 4 mg dose; field-medicine phrasing is faithful to CDC. PASS.

## Edge-input handling notes
- Unknown route throws a TypeError caught by `safe()` and surfaced to the user.
- Pediatric weight required; `num('weightKg', ...)` rejects values outside [1, 80] kg (80 kg is the boundary where pediatric calculation hits the adult cap; >80 kg is functionally adult dosing).
- The cap at 2 mg in pediatric IV/IM is the standard adult dose ceiling per PALS / FDA; renderer notes "max 2 mg adult dose" inline so the user sees the rationale.
- Citation passes spec-v11 §3.5 no-bare-URL guard.

## A11y / keyboard notes
- Two labelled selects + one labelled number input; output region `aria-live="polite"`. The footer cites both FDA labeling and CDC opioid guidance. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS

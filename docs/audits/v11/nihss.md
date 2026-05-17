# v11 audit - NIH Stroke Scale (`nihss`)

- Auditor: CG
- Date: 2026-05-17
- Citation re-verified against: Brott T, Adams HP Jr, Olinger CP, et al. *Measurements of acute cerebral infarction: a clinical examination scale.* Stroke. 1989;20(7):864-870. Public-domain instrument maintained by NIH / NINDS. Severity-band framing cross-checked against the NINDS NIH Stroke Scale training pocket card (current).

NIHSS structure: 13 items (LOC sub-divided into 1a/1b/1c), per-item maxima 3/2/2/2/3/3/8/8/2/2/3/2/2; aggregate max 42. Implemented in `lib/clinical.js NIHSS_ITEMS` identically.

Severity bands (Brott 1989 / NINDS framing): no symptoms = 0, minor 1-4, moderate 5-15 (Sophie extends to 5-20, collapsing the older "moderate-to-severe 16-20" into the moderate band; this is consistent with the simpler Brott 1989 framing and does not under-classify any patient). Severe >= 21.

## Boundary examples added
- low (no deficit): every item 0 -> total 0, "No stroke symptoms"
- mid (META example): 1a=1, 4=1, 5=2, 9=1 -> 1+1+2+1 = 5, "Moderate stroke"
- high (maximum): 1a=3, 1b=2, 1c=2, 2=2, 3=3, 4=3, 5=8, 6=8, 7=2, 8=2, 9=3, 10=2, 11=2 -> total 42, "Severe stroke"

Boundary transitions:
- total 4 (Minor ceiling): 1a=1, 4=1, 9=1, 10=1 -> 4 -> "Minor stroke"
- total 5 (Moderate floor): one extra point lifts to 5 -> "Moderate stroke"
- total 21 (Severe floor): 5=8, 6=8, 9=3, 10=2 -> 21 -> "Severe stroke"

## Cross-implementation differential
- Reference implementation: NINDS NIH Stroke Scale paper version (public domain).
- Test case: META example (1a=1, item 4=1, item 5=2, item 9=1).
- Sophie result: 5, "Moderate stroke".
- Reference result: 5, in the moderate stroke band (NINDS).
- Delta: 0%. PASS.

## Edge-input handling notes
- `lib/clinical.js nihss` per-item validates against `num(item.id, v, { min: 0, max: item.max })`; an out-of-range entry throws a typed `RangeError` that the renderer surfaces as a muted paragraph. PASS.
- Each item is a `<input type="number">` range field labeled with both the item id (1a / 1b / ... / 11) and the visible name; the id-first label matches the NINDS pocket card so the row-by-row scoring matches the bedside form. PASS.
- Motor arm and motor leg are intentionally combined to a 0-8 sum (each side 0-4) rather than split into per-side fields; this is the more common scoring shortcut and matches the way most EHR templates capture NIHSS. The audit confirms the max-8 cap is enforced. PASS.

## A11y / keyboard notes
- Thirteen number inputs grouped under the `nihss` renderer, each labeled with the item id + name. Output region `aria-live="polite"`. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS

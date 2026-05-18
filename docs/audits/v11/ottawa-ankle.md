# v11 audit - ottawa-ankle

- Auditor: CG
- Date: 2026-05-18
- Citation re-verified against: Stiell IG, Greenberg GH, McKnight RD, Nair RC, McDowell I, Worthington JR. *A study to develop clinical decision rules for the use of radiography in acute ankle injuries.* Ann Emerg Med. 1992;21(4):384-390. Figure 1 algorithm.

`lib/scoring-v4.js ottawaAnkle()` implements the Stiell 1992 algorithm: ankle x-ray is indicated when there is pain in the malleolar zone AND any of (lateral malleolus tenderness, medial malleolus tenderness, or inability to bear weight); foot x-ray when there is pain in the midfoot zone AND any of (5th metatarsal tenderness, navicular tenderness, or inability to bear weight). Otherwise no imaging is indicated. Pediatric variant (Plint 1999) is documented in the source comments but deferred to a future spec.

## Boundary examples added
- low: no pain in either zone -> no imaging indicated per Stiell 1992. Tile empty-state example.
- mid (ankle): malleolar-zone pain + lateral malleolus tenderness -> ankle x-ray indicated.
- mid (foot): midfoot-zone pain + 5th metatarsal tenderness -> foot x-ray indicated.
- high: both zones with criteria -> ankle AND foot x-ray indicated.

## Cross-implementation differential
- Reference implementation: Stiell IG, et al. Ann Emerg Med. 1992;21(4):384-390 Figure 1 algorithm (hand walk-through).
- Test case: malleolar pain, lateral malleolus tenderness.
- Sophie result: ankleXray = true, footXray = false.
- Reference result: malleolar pain + lateral malleolus tenderness -> ankle x-ray indicated. PASS.

## Edge-input handling notes
- Boolean inputs only.
- The malleolar-zone and midfoot-zone gating checkboxes are required for their respective ankle/foot decisions; tenderness checkboxes alone without the corresponding pain zone do not trigger imaging (matches Stiell 1992 Figure 1).
- Rule applies to patients >= 18 with injury within 10 days per Stiell 1992 §Methods.

## A11y / keyboard notes
- Eight labeled checkboxes grouped under malleolar-zone and midfoot-zone section headers; all Tab-reachable in source order; output region `aria-live="polite"`. `npm run test:a11y` clean after the tile was added.

## Defects opened
- none

## Status
- PASS

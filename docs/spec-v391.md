# spec-v391.md — Hardy classification (pituitary adenoma) tile

> Status: **SHIPPED (2026-07-17).** Builds the `hardy-adenoma` tile — the Hardy (Hardy-Wilson)
> classification of a pituitary adenoma (grade 0-IV × stage 0/A-E). Catalog **1242 → 1243**, group G.

## Why

The catalog just gained the Knosp grade (parasellar / cavernous-sinus axis); its complement is the Hardy
classification — the standard two-axis system for the sellar-floor / sphenoid invasion (grade) and the
suprasellar extension (stage). `hardy` / `hardy wilson pituitary` / `suprasellar extension stage` routed
to nothing. Completes the pituitary-adenoma imaging cluster (Knosp + Hardy).

## What it does

The clinician picks both axes; the tile reports the grade, the stage, and whether it is an invasive
(grade III-IV) sellar-floor grade. A two-select tile (like Fazekas / Tanner).

- `lib/hardy-adenoma-v391.js` — pure grade+stage → description. **Grade (sellar floor):** 0 enclosed / I
  focal <10 mm / II enlarged, floor intact / III localized erosion (invasive) / IV diffuse destruction
  (invasive). **Stage (suprasellar):** 0 none / A cistern / B third-ventricle recess / C third ventricle
  displaced / D intracranial (intradural) / E cavernous sinus. Grades III-IV set the `invasive` flag.
  Accepts 0/I-IV (and 1-4) for the grade and 0/A-E for the stage.
- `views/group-v391.js` (RV391) — two selects (dom `hardy-grade`, `hardy-stage`), each with a real
  `<label for>`.
- `lib/meta.js` — Hardy 1969 (Clin Neurosurg) + Wilson's modification citation + accessed date + grouped
  bands. No citation-staleness row. The example (grade III, stage C) has both fields, so both MCP fields
  are required.
- 6 worked-example unit tests + fuzz registration; synonym entry (v112 → v113); corpus → 1243.

**HIGH-STAKES:** it reports the Hardy grade and stage the clinician has determined, never a diagnosis, a
treatment decision, or a prognosis ([spec-v11](spec-v11.md) §5.3). Grades III-IV are the classically
invasive sellar-floor grades, but the management decision stays with the neurosurgical / endocrine team.

## Sourcing (spec-v97)

- **Citation:** Hardy J. Transsphenoidal microsurgery of the normal and pathological pituitary. *Clin
  Neurosurg.* 1969;16:185-217; suprasellar stages per Wilson's modification.
- Cross-verified against neurosurgery / neuroradiology references reproducing the same sellar-floor grade
  (0 enclosed → IV diffuse destruction) and suprasellar stage (0 none → E cavernous sinus). Sources vary
  slightly on the D/E definitions; the tile uses the commonly-cited Hardy-Wilson wording (D intracranial /
  E cavernous sinus).

## Verification

Lint (all catalog-truth surfaces at 1243), unit suite (+6 + fuzz), build — all green. Verified in a real
browser: grade III + stage C renders the flagged "invasive floor / third ventricle displaced" description,
grade 0 + stage 0 flips to "enclosed / no suprasellar extension", and the tile does not scroll
horizontally at 320px.

## Out of scope

The tile echoes the two axes the clinician selects; it does not read the imaging, resolve source
variations in the D/E stages beyond the copy note, or recommend treatment. The MCP adapter + golden-probe
promotion follow in a separate wave.

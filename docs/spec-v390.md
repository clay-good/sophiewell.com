# spec-v390.md — Knosp grade (pituitary adenoma) tile

> Status: **SHIPPED (2026-07-17).** Builds the `knosp-adenoma` tile — the Knosp grading of cavernous sinus
> invasion by a pituitary adenoma (grades 0-4). Catalog **1241 → 1242**, group G.

## Why

The catalog just gained the Koos vestibular-schwannoma grade; its neurosurgical sibling is the Knosp
grade — the standard MRI classification of cavernous-sinus invasion by a pituitary adenoma, predictive of
surgical remission. `knosp` / `pituitary adenoma cavernous sinus grade` routed to nothing. Found on the
same fresh ENT/neurosurgery sweep as Brodsky and Koos.

## What it does

The clinician picks the grade; the tile reports the grade, its ICA-landmark description, and whether
cavernous-sinus invasion is likely (grade 3-4).

- `lib/knosp-adenoma-v390.js` — pure grade → description, using the internal carotid artery (ICA) as the
  landmark on coronal MRI. **0:** medial to the medial tangent. **1:** to the intercarotid line. **2:** to
  the lateral tangent. **3:** lateral to the lateral tangent (revised 3A superior / 3B inferior) —
  flagged. **4:** total ICA encasement — flagged. Accepts 0-4, and the 3a/3b subgrades → 3.
- `views/group-v390.js` (RV390) — one select (dom `knosp-grade`), real `<label for>`.
- `lib/meta.js` — Knosp 1993 (Neurosurgery) citation + accessed date + grouped bands. No
  citation-staleness row (the citation carries no guideline-issuer acronym).
- 6 worked-example unit tests + fuzz registration; synonym entry (v111 → v112); corpus → 1242.

**HIGH-STAKES:** it reports the Knosp grade the clinician has determined from the MRI, never a diagnosis,
a treatment decision, or a prognosis ([spec-v11](spec-v11.md) §5.3). Grades 3-4 predict true
cavernous-sinus invasion (and lower surgical remission), but the management decision stays with the
neurosurgical / endocrine team.

## Sourcing (spec-v97)

- **Citation:** Knosp E, Steiner E, Kitz K, Matula C. Pituitary adenomas with invasion of the cavernous
  sinus space: a magnetic resonance imaging classification compared with surgical findings. *Neurosurgery.*
  1993;33(4):610-617 (the 0-4 grading by ICA tangent lines).
- Cross-verified against neurosurgery / neuroradiology references reproducing the same medial-tangent /
  intercarotid-line / lateral-tangent / encasement landmarks (revised Knosp adds the 3A/3B subtypes).

## Verification

Lint (all catalog-truth surfaces at 1242), unit suite (+6 + fuzz), build — all green. Verified in a real
browser: grade 4 renders the flagged "total ICA encasement" description, grade 0 flips to "medial to the
medial tangent", and the tile does not scroll horizontally at 320px.

## Out of scope

The tile echoes the grade the clinician selects; it does not read the MRI, resolve the 3A/3B subgrades
beyond mapping them to 3, or recommend treatment. The MCP adapter + golden-probe promotion follow in a
separate wave.

# spec-v389.md — Koos grade (vestibular schwannoma) tile

> Status: **SHIPPED (2026-07-17).** Builds the `koos-schwannoma` tile — the Koos grading of a vestibular
> schwannoma (grades I-IV). Catalog **1240 → 1241**, group G.

## Why

The catalog carries neuro-oncology grading tiles but not the Koos classification — the standard grading
of a vestibular schwannoma (acoustic neuroma) by extrameatal extension and brainstem involvement, used in
radiosurgery-vs-microsurgery planning. `koos` / `vestibular schwannoma grade` routed to nothing. Found on
the same fresh ENT/neurosurgery sweep that surfaced Brodsky.

## What it does

The clinician picks the grade; the tile reports the grade, its extension/brainstem description, and
whether it involves the brainstem (grade III-IV).

- `lib/koos-schwannoma-v389.js` — pure grade → description. **I:** intracanalicular (within the internal
  auditory canal). **II:** extends into the cerebellopontine angle, no brainstem contact. **III:**
  contacts the brainstem, no displacement — flagged. **IV:** compresses the brainstem and displaces the
  fourth ventricle — flagged. Accepts I/II/III/IV or 1-4, and the 2a/2b subgrades → II.
- `views/group-v389.js` (RV389) — one select (dom `koos-grade`), real `<label for>`.
- `lib/meta.js` — Koos 1998 (J Neurosurg) citation + accessed date + grouped bands. No citation-staleness
  row (the citation carries no guideline-issuer acronym).
- 6 worked-example unit tests + fuzz registration; synonym entry (v110 → v111); corpus → 1241.

**HIGH-STAKES:** it reports the Koos grade the clinician has determined from the imaging, never a
diagnosis, a treatment decision, or a prognosis ([spec-v11](spec-v11.md) §5.3). The rising-size /
brainstem-involvement gradient (I → IV) is the classically taught pattern, not an order; the management
decision stays with the neurosurgical / neuro-otology team.

## Sourcing (spec-v97)

- **Citation:** Koos WT, Day JD, Matula C, Levy DI. Neurotopographic considerations in the microsurgical
  treatment of small acoustic neurinomas. *J Neurosurg.* 1998;88(3):506-512 (the I-IV grading).
- Cross-verified against neurosurgery / radiology reliability studies reproducing the same
  intracanalicular (I) / CPA-extension-no-contact (II) / brainstem-contact-no-displacement (III) /
  brainstem-compression (IV) grading.

## Verification

Lint (all catalog-truth surfaces at 1241), unit suite (+6 + fuzz), build — all green. Verified in a real
browser: grade IV renders the flagged "compresses the brainstem" description, grade I flips to
"intracanalicular", and the tile does not scroll horizontally at 320px.

## Out of scope

The tile echoes the grade the clinician selects; it does not measure the tumor, resolve the 2a/2b
subgrades beyond mapping them to II, or recommend treatment. The MCP adapter + golden-probe promotion
follow in a separate wave.

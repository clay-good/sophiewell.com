# spec-v790.md — 2018 Lake Louise Criteria (myocarditis on cardiac MRI)

> Status: **SHIPPED (2026-08-26).** Builds the `lake-louise-cmr` tile. Catalog
> **1581 → 1582**, group G.

## Why

spec-v788 and spec-v789 filled in takotsubo and pericarditis. **Myocarditis was the third
gap** in the same differential, and the one that gets answered by imaging rather than at the
bedside. The Lake Louise Criteria are how a cardiac MRI report becomes a yes or a no.

## What it does

Two prongs. **A positive study needs at least one marker from each — never two from the same
one.**

| T2-based prong (edema) | T1-based prong (injury) |
| --- | --- |
| Increased myocardial T2 relaxation time on mapping | Increased myocardial T1 relaxation time on mapping |
| Visible myocardial edema on T2-weighted images | Increased extracellular volume fraction |
| Increased T2 signal intensity ratio | Late gadolinium enhancement in a non-ischemic pattern |

**That cross-prong requirement is the whole tile.** All three T2 markers together still do not
meet the criteria; neither do all three T1 markers. Both cases are pinned by tests, and the
tile names which prong is missing rather than just saying "not met." A further test walks all
**nine** cross-prong pairings and confirms each one is positive.

**Worked example:** raised T2 relaxation time + non-ischemic late gadolinium enhancement →
**criteria met**.

Reported performance against biopsy: about **88% sensitivity, 96% specificity** — a gain in
sensitivity over the 2009 three-part criteria.

## Posture (spec-v97)

Reads a study a radiologist has **already reported**; it does not interpret images.

**A naming collision worth stating:** the catalog already contains `lake-louise-ams`, the
Lake Louise acute mountain sickness score. These are unrelated instruments that share only
the name of the conference venue. The id, the tile name and the note all say so, so a search
for "Lake Louise" cannot silently return the wrong one.

## Files

- `lib/lake-louise-cmr-v790.js` — `lakeLouiseCmr()`, `LAKE_LOUISE_CMR_NOTE`.
- `views/group-v790.js` (RV790) — six checkboxes under two prong headings that carry the rule; a11y-checked.
- `mcp/adapters/lake-louise-cmr-v790.js` — exposes the tile (clinical disclaimer).
- `lib/meta.js` — citation, example, both prongs, performance, the naming collision, related (acute-pericarditis, intertak, arvc-tfc).
- `test/unit/lake-louise-cmr.test.js` — 5 tests (nothing selected, same-prong stacking in both directions, all nine cross-prong pairings, the worked example, prong membership of every marker).
- `docs/spec-v790.md` (this file).

## Sourcing (spec-v97)

Ferreira VM, Schulz-Menger J, Holmvang G, et al. *J Am Coll Cardiol.* 2018;72(24):3158-3176
(PMID 30545455). The two-pronged rule and both marker lists were confirmed against two
independent sources that agreed on every marker and on the requirement for one from each
prong. The supportive findings some renderings mention — pericardial effusion, wall motion
abnormality — are **deliberately not shipped**: one source declines to designate them as
criteria at all, so under the spec-v97 gate they are left out rather than guessed at.

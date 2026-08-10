# spec-v695.md — Manning Criteria for IBS

> Status: **SHIPPED (2026-08-10).** Builds the `manning-ibs` tile. Catalog **1525 → 1526**, group G.

## Why

The catalog had the Rome IV IBS criteria but not the older, still-cited **Manning criteria** —
a distinct symptom-count rule. Companion gap in the IBS-diagnosis cluster.

## What it does

Count six symptoms, each present/absent (0–6):

- Onset of pain linked to more frequent bowel movements
- Looser stools associated with the onset of pain
- Pain relieved by passage of stool
- Noticeable abdominal bloating
- Sensation of incomplete evacuation > 25% of the time
- Passage of mucus with stool > 25% of the time

**≥ 3 of 6 supports IBS** (roughly 63–90% sensitive / 70–93% specific), provided alarm
features are absent. More symptoms → more likely IBS.

## Posture (spec-v97)

Applies only when alarm/red-flag features are absent (weight loss, bleeding, anemia, onset
after ~50, nocturnal symptoms, family history of colorectal cancer or IBD warrant investigation
first). It supports rather than replaces clinical judgment and does not by itself exclude
organic disease.

## Note on numbering

Authored concurrently with spec-v694 (`cobb-angle`, another session), which claimed v694 first;
this tile was renumbered to v695 during rebase.

## Files

- `lib/manning-ibs-v695.js` — `manningIbs()`, `MANNING_NOTE`.
- `views/group-v695.js` (RV695) — six checkboxes; a11y-checked, no innerHTML.
- `mcp/adapters/manning-ibs-v695.js` — exposes the tile (clinical disclaimer).
- `lib/meta.js` — citation, example, items + cutoff, related (rome-iv-ibs, stool-osmotic-gap).
- `test/unit/manning-ibs.test.js` — 3 tests (baseline 0, all six 6, ≥ 3 cutoff worked example).
- `docs/spec-v695.md` (this file).

## Sourcing (spec-v97)

Manning AP, Thompson WG, Heaton KW, Morris AF. Towards positive diagnosis of the irritable
bowel. *Br Med J.* 1978;2(6138):653-654 (PMID 698649). The six symptoms and the ≥ 3 cut were
confirmed against the original and an independent calculator reproduction.

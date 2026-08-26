# spec-v783.md — POSAS Patient Scale (scar assessment)

> Status: **SHIPPED (2026-08-26).** Builds the `posas-patient-scar` tile. Catalog
> **1574 → 1575**, group G.

## Why

The POSAS is a **two-part** scale, and the catalog had only one part. The
`posas-observer-scar` tile has said so in its own on-screen note since spec-v691: it is
"typically paired with the patient-rated component." That component did not exist.

It is not a cosmetic gap. **Pain and itch appear only on the patient half** — no observer can
rate them, and they are usually what the patient actually cares about.

## What it does

The patient rates six things about their own scar, each **1** (not at all, or like normal
skin) to **10** (very much, or the worst imaginable):

| Item | |
| --- | --- |
| Pain | patient-only |
| Itch | patient-only |
| Color | |
| Pliability (stiffness) | |
| Thickness | |
| Relief (irregularity) | |

**Total = the sum of those six, range 6–60**, higher is worse.

A seventh item — the patient's overall opinion, same 1–10 scale — is recorded but **falls
outside the total**, exactly as on the observer half. A test pins that an overall opinion of
10 leaves the total unchanged.

**Worked example:** pain 2, itch 3, color 5, pliability 4, thickness 4, relief 3, overall 5
→ **21 of 60**.

There are no fixed severity cut-points; the scale describes a scar and tracks change.

## Posture (spec-v97)

What the patient reports. Meant to be reported **alongside** the observer half, not instead
of it. This change also adds the reciprocal `related` link on `posas-observer-scar`, since
the pair is the whole point.

## Files

- `lib/posas-patient-scar-v783.js` — `posasPatientScar()`, `POSAS_PATIENT_NOTE`.
- `views/group-v783.js` (RV783) — six required 1–10 inputs plus an optional overall opinion, matching the observer tile's layout; a11y-checked.
- `mcp/adapters/posas-patient-scar-v783.js` — exposes the tile (clinical disclaimer).
- `lib/meta.js` — citation, example, items, the excluded overall opinion, related; plus the reciprocal link added to `posas-observer-scar`.
- `test/unit/posas-patient-scar.test.js` — 6 tests (floor, ceiling, worked example, overall opinion excluded, pain/itch count normally, required range).
- `docs/spec-v783.md` (this file).

## Sourcing (spec-v97)

Draaijers LJ, Tempelman FR, Botman YA, et al. *Plast Reconstr Surg.* 2004;113(7):1960-1965
(PMID 15253184); version 2.0 van de Kar AL, Corion LU, Smeulders MJ, et al. *Plast Reconstr
Surg.* 2005;116(2):514-522. The six-item composition (pain and itch, plus color, pliability,
thickness and relief), the 1–10 anchors, the summed 6–60 total and the exclusion of the
overall-opinion item were read off the Dutch national measurement-instrument registry entry
for POSAS 2.0 and 3.0, and are structurally identical to the observer half already shipped in
spec-v691, which agrees on the anchors and the excluded overall item.

# spec-v647.md — Schenck classification of knee dislocations

> Status: **SHIPPED (2026-08-03).** Builds the `schenck-knee` tile. Catalog **1477 → 1478**, group G.

## Why

A gap in the multiligament-knee-injury space. The catalog had Schatzker (tibial plateau) and other knee
tools, but not the Schenck anatomic classification — the standard way to describe a knee dislocation by which
ligaments are torn, and the language of the multiligament-knee literature.

## What it does

A **decision-logic classifier**, not a score. It maps the torn structures to a KD grade:

| Grade | Structures |
| --- | --- |
| KD-I | one cruciate torn (variable collateral) |
| KD-II | both cruciates; both collaterals intact |
| KD-III | both cruciates + one collateral — **IIIM** medial / **IIIL** lateral |
| KD-IV | both cruciates + both collaterals |
| KD-V | knee dislocation with a periarticular fracture |

Two letter modifiers append: **C** = arterial (popliteal) injury, **N** = neurologic (often peroneal) injury,
e.g. `KD-IIIL-C-N`. If no cruciate is torn and there is no fracture, the tile reports "not a Schenck KD
pattern" rather than a spurious grade.

## Two nuances handled per spec-v97

1. **KD-V's Stannard subgrade is inconsistently reported.** Some sources carry a `.1`–`.4` ligament subgrade
   on KD-V; most published series omit it. The tile reports the **base KD-V** and names the omission rather
   than inventing a subgrade.
2. **KD-I strictly requires a documented dislocation.** A multicenter series found most "KD-I" labels were
   multiligament injuries without a confirmed dislocation. The note states the grade is **inferred** from the
   entered structures and that true KD-I needs a documented tibiofemoral dislocation.

## Scope (spec-v11 §5.3)

A classification, not a management order. A knee dislocation is a **vascular emergency**; the tile's posture
note is explicit that the grade does not replace pulse checks, ABIs, and urgent surgical assessment.

## Files

- `lib/schenck-v647.js` — `schenckKnee()`, `SCHENCK_NOTE`.
- `views/group-v647.js` (RV647) — checkboxes for the torn structures, fracture, and C/N modifiers;
  a11y-checked, no innerHTML, no network.
- `mcp/adapters/schenck-v647.js` — exposes the tile (clinical disclaimer).
- `lib/meta.js` — citation, example, interpretation, specialties, related.
- `test/unit/schenck.test.js` — 7 tests (each grade, IIIM/IIIL split, KD-V override, C/N modifiers, not-a-KD).
- `docs/spec-v647.md` (this file).

## Sourcing (spec-v97)

Schenck RC Jr. The dislocated knee. *Instr Course Lect.* 1994;43:127-136 (original four-grade anatomic
system); Wascher DC, et al. (1997) added KD-V and the C/N modifiers. The KD-I–KD-V definitions, the IIIM/IIIL
split, and the C/N modifiers were confirmed consistent across Radiopaedia, the multiligament-knee literature,
and a 2024 systematic review; the only documented inconsistencies (KD-V subgrade, KD-I dislocation
requirement) are handled as above rather than guessed.

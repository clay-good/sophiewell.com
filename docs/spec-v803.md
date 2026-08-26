# spec-v803.md — Anaphylaxis diagnostic criteria (2020 WAO)

> Status: **SHIPPED (2026-08-26).** Builds the `anaphylaxis-criteria` tile. Catalog
> **1594 → 1595**, group G.

## Why

The catalog had `anaphylaxis-grade` (Ring & Messmer), which grades how **severe** a reaction
was — and nothing that answers the question that comes first and matters more: **is this
anaphylaxis at all?** That is the same axis gap that produced spec-v777 (delirium risk vs
delirium screens) and spec-v773/774 (carpal tunnel diagnosis vs severity).

## What it does

**Either criterion alone is enough. They are alternatives, not steps.**

**Criterion 1** — acute skin or mucosal involvement **and** at least one of:

- respiratory compromise
- reduced blood pressure, or end-organ dysfunction (collapse, syncope, incontinence)
- severe gastrointestinal symptoms

**Criterion 2** — acute hypotension, bronchospasm **or** laryngeal involvement after exposure
to a known or highly probable allergen — **even with no skin involvement at all.**

That second route is the one worth having a tool for. A reaction with no rash still counts,
and a test asserts each of its three features triggers it while criterion 1 stays unmet.

The 2020 revision cut the older three-criterion set to two and **added severe gastrointestinal
symptoms** as a qualifying system under criterion 1; a test walks all three systems.

**Worked example:** hives with wheeze → **criterion 1 met**, anaphylaxis highly likely.

## Posture (spec-v97)

Anaphylaxis is a **clinical diagnosis** and epinephrine is the first-line treatment. Nothing
here is a reason to delay it, and **not meeting either criterion does not exclude
anaphylaxis** — stated in the result line itself when the criteria are unmet. A test asserts
the met result points toward epinephrine.

## Files

- `lib/anaphylaxis-criteria-v803.js` — `anaphylaxisCriteria()`, `ANAPHYLAXIS_NOTE`.
- `views/group-v803.js` (RV803) — the two criteria under separate headings, so their
  alternative nature is visible; a11y-checked.
- `mcp/adapters/anaphylaxis-criteria-v803.js` — exposes the tile (clinical disclaimer).
- `lib/meta.js` — citation, example, both criteria, the alternatives note, related (anaphylaxis-grade, pen-fast).
- `test/unit/anaphylaxis-criteria.test.js` — 7 tests (nothing selected, criterion 1 needing both halves, all three systems, criterion 2 without skin for each of its features, criterion 2 needing the exposure too, the alternatives behaviour including both holding, the epinephrine direction).
- `docs/spec-v803.md` (this file).

## Sourcing (spec-v97)

Cardona V, Ansotegui IJ, Ebisawa M, et al. *World Allergy Organ J.* 2020;13(10):100472
(PMID 33204386). Both criteria, the three qualifying systems under criterion 1 and the
three features under criterion 2 were confirmed against two independent renderings that
agreed clause for clause, including the explicit "even in the absence of typical skin
involvement" on criterion 2. Blood-pressure thresholds are deliberately **not** shipped as
numbers: the 2020 WAO criteria state reduced blood pressure without giving age-specific
values in the way the older NIAID criteria do, so a number here would be imported from a
different criteria set.

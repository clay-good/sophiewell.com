# spec-v548.md — Patient-prosthesis mismatch (indexed effective orifice area) tile

> Status: **SHIPPED (2026-07-28).** Builds the `ppm-eoai` tile — EOAi with position-specific thresholds.
> Catalog **1397 → 1398**, group G.

## Why

`eoai`, `pibarot`, and `effective orifice` were zero-hit. The `prosthesis` and `mismatch` hits are unrelated
prose (a periprosthetic fracture type, a delirium item, an A-a gradient note).

**A different question from the existing `gorlin` tile**, which estimates the area of a **native** valve from
hemodynamics. This grades a valve already **replaced**, against the size of the person it was put into. A
prosthesis can be functioning exactly as designed and still be too small for the patient — mismatch is **not
prosthesis failure**.

## What it does

**EOAi = EOA ÷ BSA.** The indexing is the step that gets skipped, and it is the entire concept: a valve
adequate in a small person can be severely mismatched in a large one.

| | Not clinically significant | Moderate | Severe |
| --- | --- | --- | --- |
| **Aortic** | >0.85 | 0.65-0.85 | <0.65 |
| **Mitral** | >1.2 | >0.9 to 1.2 | ≤0.9 |

**An EOAi of 1.0 is entirely normal aortic and moderate mismatch mitral.** Applying aortic cut points to a
mitral prosthesis would call that valve normal, so the position is **required and never assumed** — a test
asserts the same value grades differently.

### A citation correction that matters

The paper almost always cited for patient-prosthesis mismatch — **Pibarot and Dumesnil, Heart 2006** —
contains the **aortic** grading and **no mitral moderate/severe grading at all**. It says only that mitral
indexed EOA should ideally not fall below about 1.2-1.3. The three-tier mitral grading used here is
**Magne and colleagues, Circulation 2007**, from the same group. A tile citing Heart 2006 for both would
misattribute the mitral cut points, so **each position carries its own citation** and the result returns it.

**The aortic severe boundary is disclosed rather than silently picked.** Heart 2006 defines severe as
**below** 0.65, so exactly 0.65 is moderate; later guideline-aligned tables define it as **0.65 or below**.
The tile follows its own cited source and says so *at the boundary*, staying quiet elsewhere — a test asserts
both halves of that behavior.

**Obesity-specific aortic thresholds** (proposed for BMI ≥30) are deliberately **not implemented**: they
appear in a single source, and a lower threshold applied on one source's authority would **downgrade real
mismatch** in exactly the patients where indexing is most contested — the wrong direction to be wrong in.

- `lib/ppm-eoai-v548.js` — pure position + EOA + BSA → EOAi, severity, band text, per-position citation.
  Exports `PPM_POSITIONS`.
- `views/group-v548.js` (RV548) — a position select and two number inputs under an **h2** heading.
- `lib/meta.js` — both citations + accessed date + bands, related to `gorlin`. No citation-staleness row
  (named-author articles, no guideline-issuer acronym).
- 11 worked-example unit tests + fuzz registration; synonym entry; corpus → 1398.

**HIGH-STAKES:** this grades a **hemodynamic relationship**, not a clinical outcome. Mismatch is *associated*
with worse outcomes at a population level, and moderate mismatch in particular is common and often well
tolerated — a grade is not a prediction, and severe mismatch is **not by itself an indication for
reoperation**. It does **not diagnose prosthetic dysfunction**: a stenotic, thrombosed, or degenerated valve
is a *different* problem that also produces high gradients, and distinguishing the two is the point of the
measurement rather than something this tile does. The EOA must be the prosthesis's **measured or reference**
effective orifice area, not its **labelled size**, which is a manufacturing dimension that systematically
overstates the opening ([spec-v11](spec-v11.md) §5.3).

## Duplicate check

Per the procedure in [spec-v508](spec-v508.md): the acronym (`eoai`), the first author (`pibarot`), the
concept (`effective orifice`, `prosthesis`, `mismatch`), and the native-valve neighbor (`gorlin`) — each
against **both** `corpus.json` and `app.js` (and `lib/meta.js`), plus a `test/unit/` scan. The non-zero hits
were read in context and are the unrelated prose and the Gorlin tile named above.

## Sourcing (spec-v97)

- **Aortic:** Pibarot P, Dumesnil JG. Prosthesis-patient mismatch: definition, clinical impact, and
  prevention. *Heart.* 2006;92(8):1022-1029.
- **Mitral:** Magne J, Mathieu P, Dumesnil JG, et al. Impact of prosthesis-patient mismatch on survival after
  mitral valve replacement. *Circulation.* 2007;115(11):1417-1425.
- Each position's thresholds were double-confirmed against its **own** source pair. The obesity
  sub-thresholds failed that bar and were omitted rather than shipped on one source.

## Verification

Lint (all catalog-truth surfaces at 1398), unit suite (+11 + fuzz), a11y, build, and the chromium
heading-level check — all green.

## Out of scope

The tile does not compute BSA, look up a prosthesis's reference EOA from its model or labelled size, apply
the single-sourced obesity thresholds, diagnose prosthetic dysfunction, or recommend reoperation. The MCP
adapter + golden-probe promotion ship in the same wave (373).

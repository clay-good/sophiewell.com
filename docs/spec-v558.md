# spec-v558.md — OSDI (Ocular Surface Disease Index) tile

> Status: **SHIPPED (2026-07-28).** Builds the `osdi` tile. Catalog **1407 → 1408**, group G.

## Why

A **whole-concept gap**: `osdi`, `dry-eye`, `surface-disease` and `meibomian` were all zero-hit. The catalog
had no dry-eye content of any kind.

## What it does

12 items in three sections, each answered 0-4 over **the last week**.

**OSDI = (sum of scores) × 25 / (number of questions answered)**, range 0-100, higher is worse.

| Score | Severity |
| --- | --- |
| 0 to under 13 | Normal |
| 13 to under 23 | Mild |
| 23 to under 33 | Moderate |
| 33 or above | Severe |

## The three rules a plausible implementation breaks

**1. The denominator is variable, so the score is generally not an integer.** "Not applicable" answers are
excluded from **both** the numerator and the denominator. Twelve questions answered with a sum of 5 gives
10.4166… — and the instrument's own printed grid shows exactly these fractional values. Dividing by a fixed
12, or rounding to an integer, reports a different number from the instrument for most patients.

**2. Because the score is fractional, the integer band rendering is unusable.** The bands circulate as
half-open intervals *and* as integer ranges (0-12, 13-22, 23-32). Under the integer form a score of **12.5
or 22.7 falls in no band**, and such scores are ordinary here. The two renderings agree wherever both are
defined, so this is **not** a source disagreement to disclose — it is a rendering that simply cannot express
a fractional score. The lib implements the intervals; a test scores exactly 12.5 and asserts it bands.

**3. Only items 6-12 offer "not applicable".** Items 1-5 ask what the patient has *experienced* and are
always answerable; the later sections ask about specific activities and situations that may genuinely not
apply — someone who does not drive cannot answer about driving at night. Requiring items 1-5 also makes
division by zero **structurally impossible**: the denominator never falls below 5.

A patient who marks every optional item "not applicable" is scored on five questions, and a maximum sum of
20 still gives 100 — the scale reaches its ceiling on any number of answered questions, which is the point
of the variable denominator.

## A provenance note

The instrument itself encodes its severity bands **graphically** and prints no numeric cut points. The
numeric bands come from the secondary literature, and the result says so rather than attributing them to the
instrument.

## Scope (spec-v11 §5.3)

A **symptom** questionnaire. It does **not** diagnose dry eye disease, which requires symptoms *together
with* an objective sign — tear break-up time, osmolarity, or ocular surface staining — and symptoms and
signs correlate poorly, so a high OSDI with a normal examination and a low OSDI with marked staining are
both common and both real. Several items ask about **blurred and poor vision**, which are not specific to
the ocular surface and move with refractive error, cataract and retinal disease. It does not identify the
causes of an irritable eye that need different management (blepharitis, allergy, medication toxicity,
contact lens problems), and it does **not** detect the red flags that make an eye urgent — pain with
photophobia, vision loss, or a red eye with discharge all need examination *regardless of the score*. It
does not select treatment.

## Files

- `lib/osdi-v558.js` — `osdi()`, `OSDI_SECTIONS`, `OSDI_ITEMS`, `OSDI_OPTIONS`, `NOT_APPLICABLE`,
  `MIN_DENOMINATOR`.
- `views/group-v558.js` (RV558) — one **h2** per section carrying the instrument's own stem; the N/A option
  appears only on items 6-12.
- `mcp/adapters/osdi-v558.js` — wave 383.
- `test/unit/osdi.test.js` — 16 tests.
- `docs/spec-v558.md` (this file).

## Sourcing (spec-v97)

- Schiffman RM, Christianson MD, Jacobsen G, Hirsch JD, Reis BL. Reliability and validity of the Ocular
  Surface Disease Index. *Arch Ophthalmol.* 2000;118(5):615-621. Instrument © 1995, Allergan.
- An independent common-data-element definition restating the formula and the 0-100 range verbatim.

# spec-v560.md — al Naqeeb aEEG amplitude classification tile

> Status: **SHIPPED (2026-07-28).** Builds the `anaqeeb-aeeg` tile. Catalog **1409 → 1410**, group G.

## Why

`naqeeb` and `aeeg` were both zero-hit; the `eeg` hits are unrelated contexts. The catalog had no
amplitude-integrated EEG content of any kind.

## What it does

A **decision table**, not a score — nothing is summed. Two continuous inputs, three categories.

| Category | Criteria |
| --- | --- |
| Normal amplitude | Upper margin **>10 µV** and lower margin **>5 µV** |
| Moderately abnormal | Upper margin **>10 µV** and lower margin **≤5 µV** |
| Suppressed | Upper margin **<10 µV** and lower margin **<5 µV** |

## The three rules a plausible implementation breaks

**1. The classification is not exhaustive.** Two regions fall in **no** published category:

- an upper margin of **exactly 10 µV** — every category requires strictly above or strictly below 10;
- an upper margin **below 10** with a lower margin **above 5** — no category describes it.

Both are reachable from real measurements. Two thresholds in a three-way classifier look as though they
should partition the plane; they do not. The lib returns `classified: false` with the reason rather than
rounding to the nearest category — the holes sit exactly where a reader most needs to know the instrument is
silent.

**2. Seizure activity is a separate flag, never folded into the amplitude category.** The original scheme
defines seizures *alongside* the classification, not within it. An infant with a **normal** amplitude and
recorded seizures is **not** thereby moderately abnormal. A test asserts the category is unchanged by the
flag in both directions.

**3. Sleep-wake cycling is not assessed here at all.** It belongs to the later pattern-based schemes, so its
absence must not be read as it being normal.

## Boundary convention

The middle band's lower boundary differs by **one glyph** between sources: the original prints "5 µV or
below"; an independent review restates it as "less than 5". The **numbers are identical** — a convention to
choose, not a value disagreement to refuse under spec-v97. The original is followed, and the divergence is
disclosed **only** at a lower margin of exactly 5.

## Scope (spec-v11 §5.3)

The reading is **device- and montage-dependent**: voltage is affected by interelectrode distance, scalp
edema, and extracerebral signals including the ECG, so the same brain produces different margins on
different setups and the numbers are not transferable between them. aEEG is a filtered, compressed,
two-channel summary — **not** a conventional EEG — and it **cannot exclude seizures**, which it is well known
to miss. It does not diagnose hypoxic-ischemic encephalopathy, which is a clinical diagnosis, and it does not
grade it (Sarnat staging is a different instrument on a different axis). **It is not a therapeutic
hypothermia eligibility criterion** — cooling is decided on published clinical and biochemical criteria
within a time window, and this classification neither establishes nor excludes eligibility. That is the
decision it would most damagingly be misused to settle. It does not predict outcome for an individual infant.

## Files

- `lib/anaqeeb-aeeg-v560.js` — `anaqeebAeeg()`, `ANAQEEB_CATEGORIES`, `UPPER_THRESHOLD`, `LOWER_THRESHOLD`,
  `HEALTHY_CONTROL_REFERENCE`.
- `views/group-v560.js` (RV560) — margins and the seizure flag under separate **h2** headings.
- `mcp/adapters/anaqeeb-aeeg-v560.js` — wave 385.
- `test/unit/anaqeeb-aeeg.test.js` — 18 tests, including both unclassifiable regions.
- `docs/spec-v560.md` (this file).

## Sourcing (spec-v97)

The original report and an independent review restating it agree on all three categories and both
thresholds.

- al Naqeeb N, Edwards AD, Cowan FM, Azzopardi D. Assessment of neonatal encephalopathy by
  amplitude-integrated electroencephalography. *Pediatrics.* 1999;103(6 Pt 1):1263-1271.
- Hellström-Westas L, Rosén I, de Vries LS, Greisen G. Amplitude-integrated EEG classification and
  interpretation in preterm and term infants. *NeoReviews.* 2006;7(2):e76-e87.

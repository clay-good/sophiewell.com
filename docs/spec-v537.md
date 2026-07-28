# spec-v537.md — ALSFRS-R (ALS Functional Rating Scale, Revised) tile

> Status: **SHIPPED (2026-07-28).** Builds the `alsfrs-r` tile — the twelve-item ALS function scale, total
> 0-48. Catalog **1386 → 1387**, group G.

## Why

Whole-disease gap: `alsfrs`, `amyotrophic`, and `cedarbaum` were all zero-hit across `corpus.json`,
`app.js`, and `lib/meta.js`. The catalog had **no ALS instrument at all**, and its nearest neuro function
scales measure other diseases entirely — ONLS for neuropathy, EDSS for multiple sclerosis, modified Rankin
for stroke, Schwab and England for Parkinson disease.

## What it does

Twelve items, each **0-4**, total **0-48**. **Higher is better:** 48 is normal function, 0 is complete loss.
That direction is worth stating because most scored instruments in this catalog run the other way, and a
reader who assumes "higher is worse" will read a declining patient as improving.

### What the revision changed, and why it matters for reading older records

The original ALSFRS gave three questions each to upper-limb, lower-limb, and bulbar function but only **one**
to respiration — underweighting the domain that actually determines survival. The revision replaced that
single breathing item with **three** (dyspnea, orthopnea, respiratory insufficiency), taking the scale from
10 items / max 40 to **12 items / max 48**.

So a score of **40** means the *top of the scale* on the original instrument and a *substantial deficit* on
the revised one. A total copied from an older note without its denominator is uninterpretable, and the tile
therefore always reports the total **as a fraction of 48**. A test asserts the warning appears.

### Item 5 is two alternative scales, not two items

Cutting food and handling utensils is scored on one of **two mutually exclusive** versions depending on
whether the patient **has a gastrostomy**: 5a (without one) describes food handling; 5b (with one) describes
manipulating closures and fasteners. Exactly **one** is scored, contributing a single 0-4. Scoring both would
produce a maximum of **52** and silently inflate every gastrostomy patient. The tile asks about the
gastrostomy first, shows only the applicable scale, and reports which it used (`cuttingScale`,
`cuttingItem`). Tests assert both that the ceiling stays 48 either way and that the inapplicable scale is
excluded from the scored set.

The three respiratory items are also returned as a **subscore out of 12**, since they are what the revision
added.

- `lib/alsfrs-r-v537.js` — pure items → total, respiratory subscore, and which cutting scale applied.
  Exports `ALSFRS_ITEMS` (13 defined, 12 ever scored) and `itemsFor(hasGastrostomy)`.
- `views/group-v537.js` (RV537) — a gastrostomy select plus twelve item selects (dom `als-*`) under **h2**
  headings; the inapplicable cutting scale is hidden.
- `lib/meta.js` — Cedarbaum and colleagues 1999 citation + accessed date + bands. No citation-staleness row
  (a named-author article, no guideline-issuer acronym).
- 11 worked-example unit tests + fuzz registration; synonym entry; corpus → 1387.
- Audiences include `patients`: the items are self-reportable and the scale is widely self-administered.

**HIGH-STAKES:** it measures **function** — not disease severity, not prognosis for an individual, not the
diagnosis. It does not diagnose ALS, which rests on clinical and electrophysiologic criteria and on excluding
mimics. It does **not measure respiratory function**: the three respiratory items record what the patient
reports and what support they use, not a vital capacity, so a patient can score full marks with a
significantly reduced FVC — it is not a substitute for respiratory testing or a trigger for ventilation
decisions. It weights nothing for **cognition or behavior**, so frontotemporal involvement is invisible to
it. Trials use the **rate of change**; a single total says little on its own, and this tile scores one time
point and does not compute a slope ([spec-v11](spec-v11.md) §5.3).

## Duplicate check

Per the procedure in [spec-v508](spec-v508.md): the acronym (`alsfrs`), the disease (`amyotrophic`, `als`),
and the first author (`cedarbaum`) — each against **both** `corpus.json` and `app.js` (and `lib/meta.js`),
plus a `test/unit/` scan. The bare `als` hits were read in context and are not an ALS instrument.

## Sourcing (spec-v97)

- **Citation:** Cedarbaum JM, Stambler N, Malta E, et al. The ALSFRS-R: a revised ALS functional rating scale
  that incorporates assessments of respiratory function. BDNF ALS Study Group (Phase III). *J Neurol Sci.*
  1999;169(1-2):13-21.
- All twelve items and **all sixty option wordings** were transcribed from two independent sources agreeing
  on every one, including a reproduction of the full instrument by the scale's own first author. A
  widely circulated abridged derivative ("ALSFRS-R12") diverges materially at several items and was
  explicitly **not** used as a wording source.

## Verification

Lint (all catalog-truth surfaces at 1387), unit suite (+11 + fuzz), a11y, build, and the chromium
heading-level check — all green.

## Out of scope

The tile does not compute a progression rate or slope, apply the original 10-item ALSFRS, score the ALSAQ
quality-of-life instruments, measure respiratory capacity, or assess cognition. The MCP adapter +
golden-probe promotion ship in the same wave (362).

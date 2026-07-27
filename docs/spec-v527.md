# spec-v527.md — Wayne index (clinical diagnosis of thyrotoxicosis) tile

> Status: **SHIPPED (2026-07-27).** Builds the `wayne-index` tile — the eighteen-item signed-weight clinical
> index for thyrotoxicosis. Catalog **1376 → 1377**, group G.

## Why

`wayne`, `crooks`, `thyrotoxicosis`, and `hyperthyroid` were all zero-hit across `corpus.json`, `app.js`, and
`lib/meta.js`.

**A different axis from the existing `burch-wartofsky` tile.** Burch-Wartofsky grades **thyroid storm** — a
life-threatening decompensation in someone *already known* to be thyrotoxic; it answers "how sick is this
patient right now." The Wayne index answers a **diagnostic** question: "does this examination look
thyrotoxic at all." A patient can sit deep in the Wayne toxic range with a Burch-Wartofsky score of nearly
nothing. Neither substitutes for the other, and each tile now names the other.

## What it does

Eight symptoms and ten signs, signed weights, read as **above 19 toxic**, **11-19 equivocal**, **below 11
euthyroid**.

### The weights are signed, and several are negative — this is what implementations get wrong

Preferring heat scores **−5**. An absent palpable thyroid scores **−3**, not 0. Absent hyperkinesis **−2**. A
pulse below 80 **−3**. An implementation that treats every item as "present adds points, absent adds nothing"
converts a euthyroid patient's *protective negative findings* into a neutral zero and pushes the total up —
the direction that manufactures false positives. Every negative weight is carried explicitly and pinned by a
test, and the renderer shows each option's signed value so a reader can sanity-check the total.

A consequence worth stating outright, and pinned by its own test: **an exam with nothing found scores −10,
not 0.** Five sign items contribute negative points when absent, so the instrument has no all-zero state.

### Three items are three-way, not yes/no

Temperature preference (heat −5 / neither 0 / cold +5), appetite (increased +3 / unchanged 0 / decreased −3),
and weight (increased −3 / unchanged 0 / decreased +3) each have opposite-signed alternatives that cannot
both be true. Modeling them as two independent checkboxes would let a caller select both and score an
impossible combination.

**Pulse is one item with three bands**, not two: below 80 → −3, 80-90 → 0, above 90 → +3. The source prints
it as two rows ("only if absent: >80/min, −3" and "only if present: >90/min, +3"), which reads as two items
but is one.

### The range is derived, not asserted

Secondary sources state the range as "+45 to −25"; summing the table as printed floors at **−24**. Rather
than repeat either number on authority, `WAYNE_RANGE` is **computed from the weight table at load time**, so
the range the tile reports is necessarily the range it can produce. A test asserts the derivation by scoring
the all-minimum and all-maximum answer sets.

There is also **no tremor item** — some secondary web sources add one; both full table reproductions refute
it, and a test asserts its absence.

- `lib/wayne-index-v527.js` — pure answers → total, symptom and sign subtotals, reading, and the sum of
  negative contributions. Exports `WAYNE_SYMPTOMS`, `WAYNE_SIGNS`, `WAYNE_ITEMS`, `WAYNE_RANGE`.
- `views/group-v527.js` (RV527) — eighteen selects (dom `wi-*`) under two **h2** headings matching the
  table's own division, each option labeled with its signed points.
- `lib/meta.js` — Crooks, Murray and Wayne 1959 citation + accessed date + bands, related to
  `burch-wartofsky`. No citation-staleness row (a named-author article, no guideline-issuer acronym).
- 12 worked-example unit tests + fuzz registration; synonym entry; corpus → 1377.

**HIGH-STAKES, AND HISTORICALLY SITUATED:** the Wayne index was published in **1959, before sensitive TSH
assays existed**, precisely because clinical diagnosis was unreliable. Thyrotoxicosis today is diagnosed
**biochemically**. This is not a substitute for TSH and free T4; it does **not identify the cause** (Graves
disease, toxic nodular goiter, thyroiditis, exogenous thyroid hormone), which changes management entirely;
and it is not an indication to start an antithyroid drug, a beta blocker, radioiodine, or surgery
([spec-v11](spec-v11.md) §5.3). It performs **worst exactly where it would be most useful** — subclinical and
mild disease, and older patients, whose apathetic presentation lacks the hyperkinesis and sweating the index
rewards. A toxic score does not establish thyrotoxicosis and a euthyroid score does not exclude it.

## Duplicate check

Per the procedure in [spec-v508](spec-v508.md): the eponym (`wayne`), the first author (`crooks`), and the
condition's own name words (`thyrotoxicosis`, `hyperthyroid`) — each against **both** `corpus.json` and
`app.js` (and `lib/meta.js`), plus a `test/unit/` scan (`burch-wartofsky.test.js`, `bethesda-thyroid.test.js`
and `free-thyroxine-index.test.js` exist and answer other questions). All zero.

## Sourcing (spec-v97)

- **Citation:** Crooks J, Murray IPC, Wayne EJ. Statistical methods applied to the clinical diagnosis of
  thyrotoxicosis. *Q J Med.* 1959;28(110):211-234.
- Transcribed from **two independent complete reproductions of the table that agree cell for cell**,
  including every negative weight, the pulse bands, and the absence of a tremor item.
- The band convention shipped (>19 / 11-19 / <11) is what both full tables print. A competing rendering
  (≥20 toxic / 10-19 doubtful / <10 normal) exists and disagrees about a score of exactly 10; the printed
  convention was preferred.

## Verification

Lint (all catalog-truth surfaces at 1377), unit suite (+12 + fuzz), a11y, build, and the chromium
heading-level check — all green.

## Out of scope

The tile does not order or interpret thyroid function tests, identify the cause of thyrotoxicosis, apply the
Newcastle or Crooks index variants, grade thyroid eye disease, or score thyroid storm (that is
`burch-wartofsky`). The MCP adapter + golden-probe promotion follow in the next wave (352).

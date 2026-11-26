# spec-v1794 — An envelope borrowed for its numbers

> Status: **SHIPPED (2026-11-25)**: eighteen fields published a range their library does not enforce; all
> eighteen are fixed, the finder that found them is now a gate, and the one rule two finders use to tell a
> range refusal from any other kind lives in one place with a test. No tool's arithmetic changed; the
> catalog stays 2,390.

`probe-adapter-only-bounds` has asked one question since [spec-v1744](spec-v1744.md): is a range the agent
adapter **declares** one the library actually **enforces**? `mcp/fields.js` refuses a value outside a
declared range before the library runs, and the browser page calls the library directly — so where the two
disagree, **the page answers what the agent is refused**. It had been printing eighteen rows for a while.
They were all real, and sixteen of them are the same mistake.

## A dB threshold bounded like an age

| Field | What it declared | What it is | What the library reads |
|---|---|---|---|
| `pure-tone-average` ×4 thresholds | `bound: 'ageYears'` | dB HL | **-10 to 130** |
| `who-hearing-grade` ×2 ear averages | `bound: 'ageYears'` | dB | **-10 to 130** |
| `meniere-aao-hns` ×4 thresholds | `bound: 'ageYears'` | dB HL | **-20 to 130** |
| `spherical-equivalent` sphere | `bound: 'platelets'` ÷100 | diopters | **-40 to 40** |
| `clia-pt-acceptance` target, response | `bound: 'hcg'` | any analyte, any unit | **-1,000,000 to 10,000,000** |
| `light-criteria` LDH, its upper limit | `bound: 'hcg'` ÷100 | IU/L | **0 to 100,000** |

Each of those names an envelope from `lib/bounds.js` whose **ceiling happened to fit** and whose floor of 0
is simply wrong for the quantity. The consequence is not theoretical:

* A good ear reaches **-10 to -5 dB HL**, which every one of those libraries accepts and no agent could send.
* `spherical-equivalent` published a floor of 0 for a refractive **sphere** — so an agent could not enter
  the commonest refraction there is, a myopic **-1.25 D**, while the page answers it.
* `clia-pt-acceptance` reads from -1,000,000 **on purpose**, because a base excess and an anion gap are
  reported negative.

A borrowed envelope is worse than a literal in a second way. Specs v1762-v1765 widened four envelopes past
values verified in survivors; a field that **rides** on `ageYears` would have moved its dB range with it.
`bound:` exists so a declaration can name an envelope instead of copying it — it is the right mechanism
pointed at the wrong quantity.

[spec-v1793](spec-v1793.md) made this exact mistake while fixing a different one: it mirrored
`light-criteria`'s existing `bound: 'hcg'` onto the serum LDH beside it, for consistency. Consistent and
wrong. Both now state the library's own literal.

## The other four, each its own thing

| Field | Declared | The library reads | Why the declaration was wrong |
|---|---|---|---|
| `auth-runout`, `auth-units-request` interval | `min: 56` | above 0, at most 3,650 | 56 days is the **example drug's** schedule; a monthly biologic is 28 |
| `taper-calendar` interval | 28 to 280 | **1 to 365** | its own refusal names 7 for weekly — the pace the CDC and ASAM ranges are written in |
| `peds-weight-est` years | `min: 1` | 0 to 14 | the library converts a year under 1 to months and applies the APLS infant formula **on purpose** |

The last one had been **judged** in `probe-declared-cap-configs`'s ledger since spec-v1780, as a
reader-facing choice left for the owner: widen the declaration and the label, or refuse a fallback that was
added deliberately. The choice is made — the floor, the field label, the page's note and the library's own
refusal sentence all read **0-14** now — so the row is closed rather than judged, and that ledger is empty.

## One row left, and it is not a defect

`o2-cylinder-duration`'s flow is clamped to 0 when negative, inside the adapter's own compute wrapper. This
was fixed here and the fix **reverted**, because four other finders' ledgers record an **owner decision of
2026-11-17** that the tool keeps reading a negative optional flow as absent ([spec-v1759](spec-v1759.md)).
It is also a path **neither surface reaches**: the field declares a minimum of 0, so `validateInputs`
refuses an agent's negative first, and the page calls the library directly, where `num()` refuses it. This
finder skips the validator on purpose — that is how it models the page — and for this one tool the page does
not go through the wrapper.

So the row is judged, with that reason, and `probe-adapter-only-bounds` is promoted from a hand-run report
to a gate in `test/unit/finder-ledgers.test.js`: **0 findings, 1 judged**. It is the mirror of
`probe-declared-cap-configs` — that one asks whether a declaration holds in every *configuration*, this one
whether the library enforces it at all.

## The vein was not closed; the finder was blind

spec-v1793 reported `probe-undeclared-cap` at zero and called the vein closed. That reading rested on a
regular expression. Two finders each carried their own copy of the list of sentence shapes a library uses to
say *that value is outside the range I accept*, and the copies had drifted:

| Shape | `probe-undeclared-cap` | `probe-envelope-inside` |
|---|---|---|
| `...must be a number.` | since spec-v1785 | **missing** |
| `Enter a ... between 0 and 100` | yes | **missing** |
| `...must be greater than 0 and at most 3650` | **missing** | **missing** |

That third row is `inputFault`'s sentence for an **exclusive floor**, and neither finder could see it. The
list now lives in `scripts/lib/range-sentence.mjs`, one rule in one place — the lesson of
[spec-v1083](spec-v1083.md) applied to a finder instead of a library — and with the hole closed:

| | spec-v1793 | now |
|---|---|---|
| Fields `probe-undeclared-cap` finds a cap on at all | 2,369 | **2,747** |
| DECLARABLE | 0 | **198** |
| `probe-envelope-inside` rows | 22 | **56** |

Those 198 are the next batch, not a regression: they were always there and nothing could see them.

The shared rule carries `test/unit/range-sentence.test.js`, one real sentence per shape, because the list
**is** the finders' reach — a shape it stops matching makes rows vanish from a report with nothing failing.
The test earned its place immediately, failing twice on the first run: the exclusive-floor shape above, and
`prague-barrett`'s *"The maximal extent (M) must be at least as long as the circumferential extent (C)"* —
a sibling comparison that `must be at least` matched as a range. `at least` and `at most` now require a
number after them, and `Enter the days **between** administrations as a whole number` no longer reads as a
cap, which is what had `auth-runout` printing a DISAGREES row against a declaration that was correct.

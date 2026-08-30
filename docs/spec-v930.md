# spec-v930 — An empty string is not a zero

## The finding

`Number('')` is `0`. A tile that reads its inputs with a bare `Number()` therefore treats an
empty form as a form full of zeros, and answers with confidence from nothing.

Measured across all 1685 exposed calculators, comparing "every field set to `''`" against "every
field absent": **36 tiles reached different outcomes**. Two mattered enough to fix on sight.

| Tile | An empty form reported |
| --- | --- |
| `tb-testing` | **"TST: 0 mm vs cutoff 0 mm → POSITIVE"** — a positive tuberculin test, declared from nothing |
| `mods` | **"MODS 12 of 24: ICU mortality ~25%"** |

Confirmed in the browser, not just in the library: every tile opens pre-filled with its worked
example, so a reader meets this by **clearing a field** — which is exactly what someone does
before typing their own numbers. Clearing every number input still produced *"GRACE 59, Low"*,
*"Bishop: 5, Unfavorable"*, *"Oakland 27"*, *"SNAPPE-II 103/162: high illness severity"*. An
agent calling the MCP surface with empty strings meets it immediately.

## What changed

**Fixed (5):** `tb-testing`, and the four tiles from this session's own work that had the same
bug — `vod-sos`, `kings-college-nonapap`, `reference-change-value`, `auto-peep`. Each now treats
a blank, whitespace-only or absent input as missing, and says what it needs instead of answering.

**Gated:** `test/mcp/blank-is-absent.test.js` pins the invariant for every exposed calculator —
computing with every field `''` must reach the same outcome as computing with every field absent.
It says nothing about *which* outcome is right (a checklist may legitimately answer 0 from an
empty form), only that a blank and an absent input cannot mean different things. Negative-tested:
reintroducing the `tb-testing` bug fails it by name.

**Drained (12 more), by guarding four shared readers in `lib/scoring-v4.js`:**
`checkOrdinal`, `checkOrdinalRange` and `checkSigned` now refuse a blank the same way they
refuse an absent value — `Number('')` is 0, which *is* an integer, so an unanswered item scored
as a zero while a missing one threw. That covers the eight paediatric pain and sedation scales
at once. Four more had a refusal path that a blank slipped straight past:

| Tile | A blank form used to report |
| --- | --- |
| `rass` | "RASS 0: in the light-sedation target band" |
| `sas-riker` | "SAS 4: calm and cooperative; goal sedation" — it fell through to a **default** of 4 |
| `cfs` | "CFS 1 (Very fit): not frail" |
| `bps` | "BPS 3 of 12: acceptable pain" — clamped to 1, "relaxed", the exact default its guard existed to prevent |

**Ledger: 31 → 0.** It was drained in the same session and the exemption list is gone; the
invariant now holds for every exposed calculator with no carve-outs.

The last eight fell into three shapes, and the last two are the ones worth remembering:

| Shape | Tiles | The mistake |
| --- | --- | --- |
| A guard that 0 passes | `afi`, `fazekas-wmh` | `Number.isFinite` / integer-in-range, both true of 0 |
| A bare band chain | `bishop` | absent fell to the top band ("Favorable"), blank to the bottom ("Unfavorable") — now refuses, with the renderer taught not to print "Bishop: null" |
| **A blank string is not a chosen option** | `kings-college`, `aom-criteria` | a **default parameter** fires only on `undefined`, and `typeof '' === 'string'` |
| **A blank is not an absent argument** | `ariscat`, `burch-wartofsky`, `nihss`, `norepi-equiv`, `qbl-pph` | `?? 0` and `= 0` defaults both skip `''`, so a picker nobody touched threw while the same picker left off scored 0 |
| A nothing that is not the other nothing | `abx-renal`, `peds-weight-conv` | `!= null` let `''` through, so an empty form returned `{}` where an absent one returned `null` |

Where "nothing entered" genuinely means zero — a points picker, an infusion that is not running,
an unscored NIHSS item — the fix makes a blank read as zero, matching what an absent field
already did. Where it does not — a cervical exam, a discharge decision, a tuberculin test — the
tile refuses and says what it needs.

## The half that only a browser check found

Fixing the libraries fixed the **agent** surface. It did not fix the **reader's**, and the
invariant could not see that, because it calls the library directly.

`views/group-g.js` reads its numeric inputs with

```js
function nv(id) { return Number(document.getElementById(id).value); }
```

so a blank field became `0` **before the library was ever called**. Every guard added above was
downstream of that. Clearing every number input on the live page still produced *"MODS 12 of 24:
ICU mortality ~25%"*, *"GRACE 59, Low"*, *"Oakland 27, not in the safe-discharge band"*,
*"Bishop: 5, Unfavorable"*, *"MUST 2: high malnutrition risk; refer to dietitian"*.

The fix was already in the same file, twelve lines below, written for this exact purpose in
spec-v59:

```js
// A genuinely empty field reads as null (not 0), so a compute function can refuse to score an
// empty instrument instead of substituting a clinically-loaded default.
function nvOrNull(id) { ... }
```

It had simply never been applied to these tiles. `mods`, `grace`, `oakland`, `bishop`,
`must-nutrition` and `smart-cop` now use it; `tb-testing` gained the same reader in
`views/group-j.js`. `views/group-v140.js` already had one (`optNum`) and needed nothing.

Verified in a live browser, clearing every number input:

| Tile | Before | After |
| --- | --- | --- |
| `mods` | MODS 12 of 24: ICU mortality ~25% | MODS 0 of 24: ICU mortality 0% |
| `grace` | GRACE 59, Low | Enter age, heart rate, systolic BP, creatinine and Killip class |
| `oakland` | Oakland 27, not safe for discharge | Enter age, heart rate, systolic BP and hemoglobin |
| `bishop` | Bishop: 5, Unfavorable | Enter cervical dilation, effacement and station |
| `must-nutrition` | MUST 2: high risk; refer to dietitian | MUST 0: low malnutrition risk |
| `tb-testing` | TST: 0 mm vs cutoff 10 mm → Negative | Enter the induration in mm and select a risk category |

**The lesson for the invariant itself:** a test that calls the library proves the library. The
surface a person actually touches has its own input reader, and it can undo every guard beneath
it.

### Two more, found by the same measurement

Repeating the audit against the *renderer* rather than the library — view files that define
`function X(id) { return Number(el.value) }`, renderer blocks that call it, tiles where zero is a
confident answer — turned up **42** candidates. Two were early-warning scores, and they are the
worst of the whole spec:

| Tile | An empty observation set reported |
| --- | --- |
| `news2` | **"High (≥7): continuous monitoring; emergency assessment by critical-care team"** |
| `mews` | **"≥5: increased risk of death, ICU admission, and HDU admission"** |

Both band with unguarded `if/else` chains, so a respiratory rate of 0, a saturation of 0 and a
systolic of 0 each score the worst value. An empty chart is not a deteriorating patient. Both now
refuse and name the observations they need, and their renderers read with `nvOrNull`.

Two traps in that audit are worth recording, because each cost a pass:

- **`num(` is a field builder in the `group-vNNN` view files, not a reader.** Those renderers
  pass the raw string through `val()` and were already safe; matching on the name alone flags
  them all.
- **Probing with a literal `0` is not probing with `''`.** The first tells you whether zero is a
  confident answer, which is the *second* half of the question.

One candidate turned out **not** to be a defect, and the correction is worth keeping. Calling
`pecarnHead({})` directly returns *"High risk … CT recommended"*, because `gcs15` is a
positively-framed flag whose absent state reads as GCS < 15. On the page it never happens: the
renderer **pre-checks** `ph-gcs15` (and `ph-acting`) when it builds the form, and the MCP adapter
marks every field required so dispatch refuses a call that omits it. A bare library call is not a
surface anyone reaches. Recorded because the first pass called it a live bug on the strength of
the library alone — the same mistake in the opposite direction from the one this spec is about.

### The size of what is left, measured

**803** of the 1,685 exposed calculators take at least one numeric field *and* have a library
that refuses an all-null form. Those are exactly the tiles where a renderer reading a blank as
`0` would mask a refusal the library was written to give. Seven of them are fixed here — the ones
whose blank-state answer was alarming — and the rest are unaudited.

A browser-side gate would have to sweep them the way
`test/integration/no-impossible-number.spec.js` sweeps for `NaN`. It is not written here, for a
reason worth recording: **the obvious formulation does not work.** Asserting that a cleared form
must not state a number fails on tiles where an empty checklist legitimately totals 0 (`MODS 0`,
`SMART-COP 0`, an unscored NIHSS). Asserting that a cleared form must match the same form filled
with zeros passes the very bug it is meant to catch — `nv()` *makes* it a zero, so the two agree.
The property that actually broke is semantic: 0 is a legitimate value that happens to be
alarming, and a blank should not mean it. Writing that as a mechanical assertion is the open
problem, and a weak gate here would be worse than none.

## A reversal worth recording

`test/unit/tb-testing.test.js` carried a deliberate test asserting that an empty string reads as
0 mm, "matches the renderer default, not NaN". Avoiding a NaN band was right; reading blank as
zero was not the way to do it, because with the cutoff blank too the tile reported a POSITIVE
result from an empty form. The prompt path already answers the NaN concern. The test now asserts
the opposite and says why, and a second case pins that a **real** zero is still a real answer —
0 mm against a 10 mm cutoff is negative.

## Files

New: `test/mcp/blank-is-absent.test.js`, this file.
Changed: `lib/tb-testing.js`, `lib/vod-sos-v907.js`, `lib/kings-college-nonapap-v910.js`,
`lib/reference-change-value-v920.js`, `lib/auto-peep-v928.js`, `test/unit/tb-testing.test.js`.

No catalog change, no count change.

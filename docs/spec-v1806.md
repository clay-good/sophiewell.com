# spec-v1806 — Entered, and asked for again

> Status: **SHIPPED (2026-11-26)**: 143 fields across 44 libraries stop answering a value the reader
> entered with "Enter it". `probe-entered-asked-for`'s strong category — the refusal that is **word for
> word** what a blank field gets — goes from **225 to 82**. No tool's arithmetic changed; the catalog stays
> 2,390.

[spec-v1723](spec-v1723.md) named the shape: ACR TI-RADS read a 25 cm nodule diameter through
`pos(v, 20)`, which returns `null` above the range — **the same null a blank field gives** — and answered
*"Enter the nodule maximum diameter"*. The reader typed a value and was told to type one, with nothing about
what was wrong with it. spec-v1722 fixed that tool and the HEART pathway; the finder has been printing the
rest ever since.

Of its 345 rows, 225 were the strong form: the refusal for an impossible value is **identical** to the
refusal for an empty box. 143 of those are fixed here.

## One shape, 44 libraries

Every one is a local helper returning the blank-field null:

```js
const pos = (v) => { const n = num(v); return n !== null && n > 0 ? n : null; };
function item010(v) { ... if (!Number.isFinite(n) || n < 0 || n > 10) return null; return n; }
```

…followed by a missing-value branch that cannot tell the two apart:

```js
if (plt === null || ast === null || alt === null || inr === null) return { valid: false, message: INCOMPLETE };
```

The fix is `gradeFault` before it, which is what this catalog already does in the libraries that were
reached in earlier waves. It names the quantity and its edges, so *"Enter all ten 0–10 items — still
needed: item 1"* becomes a sentence about the 999999 that was typed.

`basfi` and `basdai` show why the reader's name matters as much as the range: their ten and six items are
`i1`…`i10` and `q1`…`q6` in the library, and the refusal now reads *"the fatigue item"* and *"item 1"* —
the labels the tool already had for its missing-value message, reused rather than reinvented.

## The gate caught the codemod

37 of the insertions were written by codemod, which placed each `gradeFault` before the first
`=== null` guard in the named function. One landed in the **wrong function**: `gelf-criteria`'s largest
nodal mass, hemoglobin and platelet count went into `cllIpi`, which sits above it in the same file.

`probe-unsupplied-input` — gated at zero by [spec-v1803](spec-v1803.md) the same day — failed immediately:
*"cll-ipi reads maxMassCm, hgb, platelet, which no surface supplies."* A library reading a key nobody can
send is exactly what that finder asks about, and a misplaced guard is one way to create it. A check over
every inserted block confirmed the other 57 reference only args their own tool declares.

That is worth recording as the general case: **a codemod's blast radius is covered by whichever gate owns
the invariant it can break**, and this one broke an invariant that had been gated for an unrelated reason
hours earlier.

Two more shapes the codemod could not take, handled by hand: four libraries have no `./num.js` import at
all, and `hemodynamics-v87.js` destructures its parameter, so there is no `o` for a generated reference to
read.

## What is left

82 rows of the strong form remain, across libraries with one tool each — the long tail of the same shape,
and the next wave. `test/unit/entered-not-asked-for.test.js` holds one case per shape fixed here: the
refusal names the quantity, says the value is out of range rather than asking for one, and is **not** the
sentence a blank field gets, which is the whole defect.

# spec-v1133 — a unit is a default too

[spec-v1132](spec-v1132.md) asked which defaulted parameters reach the answer as
prose. This asks the narrower and sharper version:

> **Which defaults are UNITS?**

A defaulted level costs points. A defaulted unit costs a factor — ten here,
eighty-eight for creatinine — and it applies to a number the caller *did* supply,
which is the part that makes it easy to miss. The whole library has two:

| | Default | Verdict |
| --- | --- | --- |
| `uacr-upcr` | `albuminUnit = 'mg/dL'` | **silent** — fixed here |
| `kings-college` | `creatinineUnit = 'mg/dl'` | already disclosed |

## The same number, two albuminuria stages

```
albumin 300, urine creatinine 100
  no unit  UACR 3000 mg/g (A3); estimated albumin excretion ~3000 mg/day.
  mg/L     UACR  300 mg/g (A2); estimated albumin excretion  ~300 mg/day.
```

A3 is *severely increased albuminuria* and A2 is *moderately increased* — a
KDIGO CKD stage, and the difference between them here is a parameter the reading
never named.

**mg/dL stays the default.** It is the house convention, the page has always
offered the choice as a visible select, and refusing a ratio for want of a unit
would be an over-refusal. What was missing is the disclosure, which is exactly
what rule 21 asks for: *a default is not a defect; a silent default is.* The
answer now reads

> UACR 3000 mg/g (A3) **reading the albumin as mg/dL (no unit given; mg/L would
> be a tenth of this)**; estimated albumin excretion ~3000 mg/day.

and drops the parenthetical when the caller states a unit. The page always sends
one, so the caveat is agent-surface only; the page gains four words naming the
unit it used, which is worth having above a stage.

## Why `kings-college` did not need the same fix

Its limb text carries the threshold with its unit:

> Limb(s) met: the three-part limb (INR > 6.5 + **creatinine > 3.4 mg/dL** +
> grade III/IV encephalopathy).

A reader who entered 300 µmol/L can see, in the sentence that reports the
finding, that it was compared against a mg/dL threshold. **A disclosure does not
have to name the parameter; it has to make the assumption visible where the
verdict is.**

## Echoing the caller's string back at the reader

The first version of this fix printed `albuminUnit` verbatim, and the spec-v53
fuzz harness failed it in the same run:

```
uacrUpcr({albuminUnit:NaN}): returned string <return>.band leaked "NaN":
  "UACR 1000 mg/g (A3) reading the albumin as NaN; ..."
```

**A disclosure is output, and output built from an unvalidated input is a leak.**
Adding a sentence that names a parameter turns that parameter into something the
reader sees, which it was not before — so the whitelist has to arrive in the same
change. Only `mg/dL` and `mg/L` are echoed; anything else is treated exactly as
an absent unit, which is what it is. Normalising for the lookup also means `MG/L`
now reads as mg/L instead of silently falling to mg/dL.

The guard that caught this is a fuzz harness nobody wrote for this tile. It is
the second time in this programme that a disclosure I added was corrected by an
existing gate rather than by me ([spec-v1114](spec-v1114.md) was the first) —
which is the argument for running the whole suite on a one-line prose change.

## The shape, for next time

The three families this run has now drained are all the same sentence with a
different noun:

| Defaulted | Costs | Example |
| --- | --- | --- |
| a **level** | points | `anginaIndex = 0`, `lvl(v, 1, 4)` |
| a **timepoint** | which cutoff applies | `hoursAfterStart = 12` |
| a **unit** | a factor | `albuminUnit = 'mg/dL'` |

In each, the fix is the same test: does the answer name what it assumed?

# spec-v1226 — a refusal with no way out

`scripts/probe-envelope-unbounded.mjs` keeps these rows in a section of their
own, apart from the tiles that answer *from* an impossible value, because it is a
different defect. Not a wrong answer — a loop:

> ePVS, hematocrit **750%** → *"Enter hematocrit (%) and hemoglobin (g/dL), both
> greater than 0."*

The reader typed the hematocrit. They are told to enter it. They retype it and
get the same sentence.

## One line, eighteen files

```js
function pos(v, max) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n <= 0 || n > max) return null;   // three things,
  return n;                                                     // one null
}
```

Blank, non-numeric and out-of-range all return `null`, and every caller reads
`null` as absent. The bound *was* being enforced; only the sentence was wrong.

## The fix

`gradeFault` (lib/num.js, spec-v1209) is the half that tells the two apart. It
**skips a blank**, so each function's own missing-value message still runs and
still names every empty field at once, and it reports only the value that is out
of range — by name, with the range:

> *"Hematocrit in % must be greater than 0 and at most 100. Check the value
> entered."*

**The bounds are the callers' own**, copied from the `pos` / `real` / `inRange`
call that already enforced them silently. No envelope moves and no clinical
number is decided: the same inputs are accepted and rejected as before, and the
rejected ones now say why.

Where a function already builds a `missing` list, the label comes from that list
verbatim, so the two sentences name the same field the same way — *"Enter the
bilirubin (mg/dL)"* and *"Bilirubin (mg/dL) must be greater than 0 and at most
100"*.

## This wave

Three files, sixteen functions, **17 of the probe's 89 rows**:

| file | tiles |
| --- | --- |
| `lib/nephrology-v226.js` | watson-tbw, salazar-corcoran, epvs, furosemide-stress-test, fe-bicarbonate, corrected-potassium-ph |
| `lib/liver-v196.js` | abic-score, globe-score, uk-pbc-risk, page-b, mayo-psc-risk |
| `lib/hemo-v194.js` | papi, transpulmonary-gradient, tei-index, shunt-fraction |

Two functions in each of the first two files were **not** on the probe's list —
`watson-tbw` and `furosemide-stress-test`, `uk-pbc-risk` — and are fixed anyway.
The probe only reaches a field whose quantity `BOUNDS` names, and a weight of
900 kg on the furosemide stress test is the same dead end whether or not the
probe can see it. Leaving them is how a file ends up half-fixed
(spec-v1063/v1064).

## Ledger

`probe-envelope-unbounded`, second section: **89 rows → 72.** The first section —
rows that answer from an impossible value — is unchanged at 94 / 54, and its
reassuring-reading subset has stood at zero since spec-v1211.

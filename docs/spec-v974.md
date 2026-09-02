# spec-v974 — "psi" returned alpha-1 antitrypsin deficiency

## The defect

The hero search scores a tile with a rubric in `lib/prompt.js`. Two of its terms — the exact-phrase
bonus on the name (10 points) and on the description (5) — were **raw substring tests**.

A raw substring fires in the middle of unrelated words. And a buried match collects *both* bonuses,
15 points, while the tile the reader is actually naming scores about 13.9 for carrying the acronym
as a name token. So the accidents won:

| Typed | Matched inside | What came back first | Where the right tile was |
| --- | --- | --- | --- |
| `psi` | alpha-1 antitry**psi**n, preeclam**psi**a, se**psi**s | Alpha-1 Antitrypsin Level and Genotype | rank 16 of 26 |
| `anc` | bal**anc**e, resist**anc**e, adv**anc**ed | ABC Balance Confidence Scale | rank 81 of 256 |
| `abi` | prob**abi**lity, cervical favor**abi**lity | 4PEPS | rank 28 of 115 |
| `vis` | re**vis**ed | ALSFRS-R | rank 26 of 82 |

Across the catalog, **28 acronyms printed in exactly one tile's own name did not reach that tile
in the top five at all**, and 65 more were present but not first. `PSI`, `ANC`, `ABI`, `IGRA`,
`ETT`, `VIS`, `NDI`, `RSI` — the abbreviations a clinician actually types.

## The fix

The exact-phrase bonus is now whole-word containment. Both fields are `normalizePhrase` output —
lowercase words separated by single spaces — so padding each side and testing for the padded phrase
is the whole test:

```js
function phraseInField(field, phrase) {
  if (!field || !phrase) return false;
  return ` ${field} `.includes(` ${phrase} `);
}
```

This is the rule `lib/synonyms.js` already documents and applies — *"the query is contained as a
whole-word substring of a phrase"*. The ranker had simply never adopted it.

**Absent from the top five: 28 → 1.** Not rank 1: 65 → 51. The one remaining absence is `DOSE`
(the DOSE Index for COPD), which is also an ordinary English word every dosing tile uses; it is
allowlisted by name rather than papered over.

Nothing else moved: all 421 MCP golden search probes and all 12,991 existing unit tests pass
unchanged, and `wells pe` still returns Wells Score for PE.

## The gate

`test/unit/acronym-findable.test.js` sweeps the live corpus through the same tile view `app.js`
builds for the hero search. Every acronym printed as a whole token in exactly one tile's name must
reach that tile. Two guards keep it honest rather than merely green:

- **Acronyms two tiles both print are skipped.** The catalog carries IPSS for the prostate and
  IPSS-R for myelodysplasia; no ranking reads the reader's mind.
- **Acronyms are queried as they are written.** Stripping the hyphen out of `ALT-70` invents a
  query nobody types, and an earlier cut of this probe reported 118 failures that were mostly its
  own punctuation.

Reverted against the old substring bonus, the gate fails 6 of its 7 tests.

## Files

Changed: `lib/prompt.js`. New: `test/unit/acronym-findable.test.js`, this file.

## Still open

31 tiles whose **id** is a standard clinical abbreviation that appears nowhere in their name are
still not rank 1 for it — `tsat` (Transferrin Saturation), `bsa` (Body Surface Area), `rcri`,
`gose`, `mrs`, `cfs`. That is a naming and synonym gap rather than a ranking one, and some of them
(`mrs`, `cfs`, `arr`) are genuinely ambiguous. It is a separate change.

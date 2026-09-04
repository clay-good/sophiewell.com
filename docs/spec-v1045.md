# spec-v1045 — The panel that refused what it could answer

## Category 2, found at last

The required-field ledger's second category is *"the declaration is wrong, and the AGENT surface is
refusing input it could answer from"*. It had been a hypothetical since spec-v1037. `corrected-ca-na`
is the first confirmed case, and it turned out to have four siblings.

These five adapters each compute two or more **independent** things from one input set:

| Adapter | Computes | Which needs what |
| --- | --- | --- |
| `corrected-ca-na` | corrected calcium, corrected sodium | calcium+albumin / sodium+glucose |
| `aa-pf-suite` | A-a gradient, P/F ratio, age-expected gradient | +PaCO2 / — / +age |
| `egfr-suite` | CKD-EPI, MDRD, Cockcroft-Gault | — / — / +weight |
| `fena-feurea` | FeNa, FeUrea | +sodium pair / +urea pair |
| `shock-index` | MAP, pulse pressure, shock index, modified SI | +DBP / +DBP / +HR / +both |

Every one was written to return *"whichever of these I can compute"* — the compute functions all end
`return a == null && b == null ? null : {…}`. None of them could:

1. **Every field was declared `required`**, so `validateInputs` refused before compute ran.
2. And the underlying library functions **throw** on a missing argument rather than returning null,
   so the `== null` test never described what actually happened either.

Two mistakes that cancel out into a working-looking adapter, for as long as nothing tries the case
they were written for.

## The fix

The declaration now marks only what **every** output needs — the PaO2 and FiO2 in `aa-pf-suite`, the
two creatinines in `fena-feurea`, the systolic pressure in `shock-index` — and each compute checks
its own arguments before calling. So:

- a sodium and a glucose get a corrected sodium (the calcium half comes back `null`);
- a blood gas with no age still gets a P/F ratio;
- a creatinine, an age and a sex get both eGFRs without a weight;
- the urea fraction alone reaches the patient who has had a diuretic, which is the entire reason
  FeUrea exists.

**Absence is checked, errors are not swallowed.** A PaCO2 of `"banana"` still fails; only a value
that is *not there* is treated as not there. `test/mcp/partial-panel.test.js` pins both directions.

## What this says about the ledger

Writing a reason beside each line (spec-v1043) is what surfaced this. The line read *"probably an
over-strict declaration — read it against the formula"*, and reading it against the formula took ten
minutes and turned up four more. A ledger of bare ids would not have prompted that.

The browser was right the whole time.

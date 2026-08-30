# spec-v910 — King's College criteria: the arm that was missing

## Why

`kings-college` has been in the catalog since spec-v89 — but only the **acetaminophen** arm, as
its own name says. The non-acetaminophen arm is not a variant of it: it is a different set of
variables entirely, and nothing in the catalog held it. Clichy, the European alternative for the
same decision, was already there.

## What it does

Either limb marks a poor prognosis.

| Limb | Criterion |
| --- | --- |
| 1 | INR **> 6.5**, or prothrombin time **> 100 s**, on its own and whatever the grade of encephalopathy |
| 2 | **any three of five**: age **< 10 or > 40**; cause is non-A non-B hepatitis, halothane hepatitis or an idiosyncratic drug reaction; **> 7 days** from jaundice to encephalopathy; INR **> 3.5** (PT > 50 s); bilirubin **> 17.5 mg/dL** (300 micromol/L) |

## The three things it is for

**A negative is not reassurance.** The criteria are specific and they are not sensitive: a large
share of the patients who go on to die never meet them. That line prints on every result, met or
not, because a negative here has never been a reason to stand down.

**Meeting them is a reason to refer, not a decision to transplant** — and referral does not wait
on them. Speaking to a transplant center early is the long-standing advice, and the tile says so
rather than implying the criteria are the trigger.

**This is not the other arm.** The acetaminophen arm turns on arterial pH, creatinine and
encephalopathy grade. Each tile names the other.

A factor with nothing entered comes back as **not entered**, not as absent, and the headline says
how many are unknown — three of the five are optional and a blank should never quietly count as a
"no".

"Non-A non-B hepatitis" is kept as the 1989 wording, with a note that it is what is now called
indeterminate or seronegative hepatitis. Renaming it would change the criterion.

## Files

New: `lib/kings-college-nonapap-v910.js`, `views/group-v910.js`,
`mcp/adapters/kings-college-nonapap-v910.js`, `test/unit/kings-college-nonapap.test.js`, this
file.
Wired: `app.js`, `mcp/catalog.js`, `lib/meta.js`, `test/unit/fuzz-tools.test.js`,
`test/mcp/mcp-search-relevance.test.js`, `docs/mcp-coverage.md`, `data/synonyms.json`, and the
count surfaces.

## Sourcing

O'Grady 1989 (*Gastroenterology*), cross-checked against the AASLD acute liver failure position
paper's tabulation of the same criteria. Neither issuer is in `ISSUER_PATTERN`, so no
`docs/citation-staleness.md` row is owed.

Catalog 1698 → 1699.

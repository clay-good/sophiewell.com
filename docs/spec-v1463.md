# spec-v1463 — FeNO: a blank age group is not the adult one

Found by the same blank-select probe as [spec-v1460](spec-v1460.md).

## What was wrong

The ATS 2011 cutpoints for exhaled nitric oxide depend on age: 25 and 50 ppb at twelve and over,
20 and 35 ppb under twelve. The age group is optional on the agent surface, and a blank one got the
adult cutpoints while the answer said "for this age group". For a child, 40 ppb read
**"intermediate ... interpret cautiously"** instead of **"high ... a response to an inhaled
corticosteroid [is] likely"**. The same happened with any unknown value. (The page was not
affected: its select always holds a visible choice.)

## The fix

With no age group entered, the value is read against both sets of cutpoints.

- If they disagree, the tool asks: "Choose the age group: 40 ppb reads intermediate at twelve and
  over but high under twelve, so the cutpoints decide the reading."
- If they agree (for example 30 ppb, intermediate in both), the answer stands and adds "No age
  group was entered; both age groups read this value the same." The returned `ageGroup` is `null`.

## Tests

`test/unit/feno.test.js`:

- a deciding blank age is asked for;
- an agreeing blank age is disclosed and `ageGroup` is `null`;
- an unknown value is treated as not entered.

Five assertions that called the tool with no age group and expected the adult reading now pass
`ageGroup: 'adult'` explicitly.

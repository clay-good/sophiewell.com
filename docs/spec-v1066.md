# spec-v1066 — not met, or not measured

Fourth wave of the one-blank-field programme ([spec-v1063](spec-v1063.md) →
[spec-v1065](spec-v1065.md)). Two calculators, one distinction.

## The distinction

A criterion list has three states, and these two tiles only had two of them.

| State | What it means | What it may support |
|---|---|---|
| met | the value was measured and crossed its threshold | ruling in |
| **not met** | the value was measured and did not cross | ruling **out** |
| **not measured** | nobody entered it | **neither** |

Collapsing the third into the second is what makes an incomplete assessment
sound like a negative one. `triple-i` had exactly this fixed in spec-v1063 for
its supporting features; these two carry it in their criteria counts.

## `truelove-witts`

Severe acute ulcerative colitis is six or more bloody stools a day **plus at
least one** of four systemic criteria — a temperature above 37.8 °C, a pulse
above 90, a haemoglobin below 10.5, an ESR above 30.

With eight bloody stools entered and all four systemic values blank, it returned:

> Truelove & Witts: **moderate**: intermediate between mild and severe. **No
> systemic toxicity criterion met.**

One of those four is the whole difference between moderate and severe, and
severe acute colitis is an admission and IV-steroid conversation. The sentence
was a rule-out written from four labs nobody had taken.

It now distinguishes the three states: "No systemic value has been entered" when
none were, "No systemic toxicity criterion met **among those entered**" when some
were, and in both partial cases it names what is missing and says the grade
cannot yet rule severe colitis out. Where a criterion *is* met the tile rules in
exactly as before, with no caveat appended — a floor is safe once it has left the
reassuring band.

## `tls-cairo-bishop`

Laboratory tumour lysis syndrome is **two or more** of four metabolic criteria.
This tile explicitly invites partial entry — its own fallback says "enter the
ones available" — so a partial panel is the expected case, not an edge one. But
the negative branch counted over four regardless:

> Criteria for laboratory TLS are not met (**1 of the 4** metabolic criteria
> present; 2 are required).

with three of those four never entered. It now reports the count over what was
*assessed*, names the labs still outstanding, and says plainly that this does not
rule laboratory TLS out. With all four entered and none met, the original
sentence returns unchanged.

## Scope

Both fixes are pinned by named tests that assert all three states, including the
fully-measured case, so a later cleanup cannot quietly re-collapse them.

The finder's remaining hits are dominated by calculators that are already right:
they drop the dependent output line (`anion-gap`, `corrected-ca-na`,
`aa-pf-suite`, `egfr-suite`, `ecmo-titration`), report only assessed systems by
design (`modified-marshall`), or take a genuine zero (`iv-osmolarity`'s
additives, `mtp-tracker`'s units transfused). Those are catalogued in
spec-v1065 and must not be "fixed".

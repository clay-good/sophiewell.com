# spec-v1467 — blanks that decide a verdict only in some contexts

[spec-v1460](spec-v1460.md)'s probe dropped each optional select from the worked example alone. So a
blank that decides the verdict only when other fields change went unseen: Jones was caught only
because the example's wording happened to change. This wave's probe varies the other fields one at
a time and flags a blank whose **verdict** matches exactly one option while the options disagree,
with nothing saying so. It found 93 rows. Most are additive items read as "none" (the house
convention for optional criteria), or a published rule for missing items: the Oswestry and HAQ-DI
average over the sections answered, so a blank matches the mean. Four were defects, and one of them
was a false defect rather than a blank.

| Tool | What was wrong | Now |
|---|---|---|
| NY health care proxy check | A "no" to a witness rule was a defect whatever the setting. A proxy signed at home was flagged "no witness is a qualified psychiatrist", a rule of Public Health Law 2981(2)(b) that binds only an OMH facility that is also a hospital. The questions were already scoped this way; the defects were not. | Each witness defect binds only the setting the statute names, the same scope as the questions. |
| CA NP 103/104 tracker | A blank "active California RN license" or degree was read as yes: the 104 projection read "104 about 2028-07-01" when a "no" makes it not-eligible. The lib tracked these as unconfirmed, but said so only after three years. | The projected date says "This date assumes an active California RN license, which was not entered." |
| ICHD-3 tension-type headache | "No nausea" is itself a criterion, and a blank nausea met it: "criteria met for 2.2 Frequent episodic tension-type headache", while moderate nausea gives no subtype. | The diagnosis stands and says "No nausea severity was entered, so it was counted as none; any nausea rules out the episodic forms and moderate or severe nausea the chronic one." |
| DigiFab dosing | In empiric mode a blank setting gave 10-20 vials, the acute-ingestion dose. Chronic toxicity is 3-6 vials. | A dose is not assumed: "Choose the empiric setting: the dose is 10-20 vials for an acute ingestion and 3-6 vials for chronic toxicity." |

None affected the page, whose selects always hold a visible choice. The NY defect scoping applies
on both surfaces.

## Tests

- `test/unit/who-decides-v1391.test.js`: witness answers outside their setting raise no defect, and
  each still does inside it.
- `test/unit/nurse-training-v1397.test.js`: the projection names one or both unentered requirements,
  names none when both are stated, and a "no" still reads not-eligible.
- `test/unit/tension-headache-ichd3.test.js`: a blank nausea is disclosed, and a stated one is not.
- `test/unit/digifab-dosing.test.js`: a blank or unknown empiric setting is asked for, and level
  mode does not need it.

# spec-v1477 — RIPASA and SSIGN: a blank is not the higher weight or the better survival

Found by re-running spec-v1467's context-varied blank probe after exempting the house conventions
(unit selects, items that read "none", and published missing-item rules). Of 17 residual rows, most
were named in the answer, derived from another field, or disclosed by design. Two were defects.

## RIPASA: blank demographics read as the higher weight

Gender, age band and symptom duration each always add 0.5 or 1 point. A blank one was scored as the
higher weight (male, 40 or under, under 48 hours). That silently added up to 1.5 points, enough to
cross the 7.5 diagnostic cutoff. Five positive findings with no demographics read **"RIPASA 7.5 of 16 —
high probability of appendicitis (>= 7.5 diagnostic cutoff)"**; the same findings in a woman read
"7 — low/moderate". The tool's own worked example and a unit test relied on this.

**Now** each blank demographic makes the score a range:

- If the range crosses a band, the tool asks: "Choose the gender, the age band and the symptom
  duration: without them the score is between 6 and 7.5, which spans low/moderate probability ... and
  high probability of appendicitis."
- If the range stays in one band, it answers with the range and says what was not entered, for
  example "RIPASA 10 to 11.5 of 16 — high probability ... No value was entered for ...".

The worked example now states male, 40 or under, and under 48 hours.

## SSIGN: a high-risk floor quoted the better survival figure

With factors unstaged, SSIGN correctly kept "high risk", the top group, which unstaged factors cannot
lower. But it also printed "~57.7% (score 7-9) 5-year cancer-specific survival", and a score of 10 or
more carries ~18.1%. **Now** the answer reads "SSIGN at least 7 of 17 — high risk, which the unstaged
factors cannot lower ... the survival figure falls further above 9, so none is given until they are
staged." The worked example now stages all six factors.

## Tests

- `test/unit/acute-abdomen-v261.test.js`: a blank range disclosed within one band, and asked for
  across the cutoff. The two tests that relied on the defaults now state the demographics.
- `test/unit/rcc-prognosis-v266.test.js`: a high-risk floor gives no survival figure, and a fully
  staged score still does.

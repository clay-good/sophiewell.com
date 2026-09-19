# spec-v1409 — the cohort a model was derived in

[spec-v1408](spec-v1408.md) enforced the fitted age range for the two engines whose range this repo
already stated (SCORE2 40–69, Framingham 30–74) and left four rows standing because no source here
gave their range. Three of the four now have one, read from the derivation papers and the model's
own calculator:

| tool | range | source |
|---|---|---|
| `mesa-chd` | 45 to 85 | MESA's own risk calculator: *"most appropriate for patients in the 45-85 year age range"* (mesa-nhlbi.org). Its derivation cohort was 45–84 (McClelland RL et al, *J Am Coll Cardiol* 2015;66:1643-53). |
| `score2-op` | 70 and over | Derived in people over 65 and *"intended for use in people aged over 70"* (*Eur Heart J* 2021;42:2455-2467); the 2021 ESC prevention guideline recommends it above 70. No upper bound is stated anywhere, so none is enforced. |
| `reynolds-risk` | women 45 and over; men 50 and over | Two models on two cohorts: the Women's Health Study, *"US women 45 years and older"* (*JAMA* 2007;297:611-619), and Physicians' Health Study II, *"US men 50 years and older"* (*Circulation* 2008;118:2243-2251). |

Each refused silently before: the age was clamped into the fitted range and an answer computed from
it. Reynolds is the sharpest of the three, because its floor is **not shared** — a 47-year-old is
inside the women's cohort and outside the men's, and the tile took 30 for either sex.

Two judgment calls, both recorded rather than papered over:

- **The men's upper bound is not enforced.** One reading of the Physicians' Health Study II paper
  says the men were under 80 at baseline; another gives 50–80. Where two reads disagree, the floor
  both state is enforced and the ceiling is left alone.
- **A field publishes no ceiling nobody wrote down.** Where a model has a sourced floor and no
  sourced ceiling (`score2-op`, `reynolds-risk`), the input's own `min`/`max` are the physiologic
  envelope and the floor lives in the label and in the library's refusal. MESA's range is sourced at
  both ends, so its field keeps it — and reads it from the library's exported constant, so the page
  and the model cannot drift.

`pospom` is the one row left: its field accepts 18 and over, and no source in this repo says the
model was fitted on adults only. It needs its derivation paper (Le Manach Y et al, *Anesthesiology*
2016) read before the library can enforce anything.

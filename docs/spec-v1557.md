# spec-v1557 — Rabies post-exposure prophylaxis by WHO schedule, and tetanus in the WHO series

Program: [scope-field-health.md](scope-field-health.md). Rules: [spec-v1540](spec-v1540.md).
One new tile and two backfills. The catalog's `rabies-pep` and `tetanus` follow CDC/ACIP. Outside the
US, most countries follow WHO, whose rabies schedules and immunoglobulin rules differ.

## Sources (read in full)

| Key | Document | Licence |
|---|---|---|
| RAB18 | WHO. Rabies vaccines: WHO position paper, April 2018. *Wkly Epidemiol Rec* 2018;93(16):201–220 | WHO copyright |
| TET17 | WHO. Tetanus vaccines: WHO position paper, February 2017. *Wkly Epidemiol Rec* 2017;92(6):53–76 | WHO copyright |

---

## 1. `who-rabies-pep` — Rabies Post-Exposure Prophylaxis: WHO Categories and Schedules (2018)

**Question.** For this exposure and prior vaccination, what does WHO recommend: wound washing, which
vaccine schedule, whether immunoglobulin (RIG), and how much?

**Inputs.** Exposure category I / II / III (required; definitions shown on the control); previously
vaccinated with documented pre-exposure prophylaxis or at least 2 PEP doses (yes / no / unknown;
unknown is treated as no, and the answer says so); a complete PEP course less than 3 months ago (yes /
no); immunocompromised (for example HIV not on ART) (yes / no, required); weight (kg, required for
RIG); RIG available: human / equine / monoclonal / none; date of the first vaccine dose (for the RIG
window and schedule dates); the dog, cat or ferret still healthy after 10 days, or the animal tested
negative (yes / no, the stop rule); bat contact.

**Logic (RAB18 pp. 207, 213–215, Table 1).**

- **Categories.** I: touching or feeding an animal, licks on intact skin. II: nibbling of uncovered
  skin, minor scratches or abrasions without bleeding. III: one or more bites or scratches through the
  skin, licks on broken skin or mucosa, **any direct contact with bats**.
- **Not previously vaccinated.** Category I: wash, no PEP. Category II: wash, plus vaccine by one
  of: **1-week, 2-site intradermal** (2 sites on days 0, 3, 7); **4-dose Essen**, 1 site IM on days
  0, 3, 7 and one day from 14 to 28; **Zagreb**, 2 sites IM on day 0, then 1 site on days 7 and 21. No
  RIG. Category III: the same vaccine options **plus RIG**.
- **Previously vaccinated** (category II or III): wash, plus 1-site intradermal on days 0 and 3, or
  4-site intradermal on day 0, or 1-site IM on days 0 and 3; **no RIG**. A complete PEP less than 3
  months ago: wound care only.
- **Immunocompromised, category II or III:** a full course **plus RIG in every case, even if
  previously vaccinated**; 3 visits (days 0, 7, 21–28) or 2 visits (days 0, 7) with antibody testing
  at 2–4 weeks.
- **RIG.** Once, as soon as possible, and **not after day 7** from the first vaccine dose. **Maximum
  20 IU/kg human, 40 IU/kg equine.** Infiltrated into and around the wound; WHO no longer recommends
  injecting the remainder at a distant site. No skin test before equine RIG. Where RIG is scarce, WHO's
  priority order prints: multiple bites, deep wounds, bites to head, neck or hands, severe
  immunodeficiency, a confirmed or probable rabid animal, bats.
- **Stop PEP** if the animal tests negative, or a dog, cat or ferret stays healthy for 10 days from
  the bite.
- **Late presentation:** a category III exposure is vaccinated even months or years later.
- An intradermal dose is 0.1 mL.

**Output.** The category, every allowed schedule with **calendar dates from day 0**, RIG yes or no, the
**maximum RIG in IU** (weight × 20 or × 40, labelled a ceiling, "infiltrate what is anatomically
feasible, not a target volume"), the RIG deadline date, and the stop rule.

**Edges.** RIG on day 7 allowed, day 8 not. Unknown prior vaccination never removes RIG.

**Relation to `rabies-pep`.** That tile is CDC (HRIG plus 4 IM doses on days 0, 3, 7, 14) and stays,
relabelled "(CDC, US)". Each links to the other with one line: *"Most countries outside the US follow
WHO's schedules."*

## 2. Backfill: `tetanus` — a WHO line

TET17 has no wound-by-history table of its own (it defers to a WHO wound guide), so no new tile. Add
one line to `tetanus`: WHO counts **6 doses** (3 primary plus 3 boosters) for lifelong protection, so a
person with 3 childhood doses may not be fully protected by WHO's measure; and TET17 gives tetanus
immunoglobulin for dirty wounds in the incompletely vaccinated.

## 3. Backfill: `measles-case-def` — a link to vitamin A

Add a link to `vitamin-a-dose-child` (spec-v1550), which carries WHO's measles vitamin A dosing.

## Tests

`test/unit/who-rabies.test.js`: each category for naive, vaccinated, and immunocompromised patients;
schedule dates from a fixed day 0; the RIG ceiling at 10 kg (200 IU human, 400 IU equine); day 7 vs 8;
the 3-month rule; unknown prior vaccination; bat contact forces category III.

## Staleness

RAB18 *low*; no newer WHO rabies position paper exists.

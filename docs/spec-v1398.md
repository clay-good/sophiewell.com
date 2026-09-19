# spec-v1398 — heat, smoke, air, and Valley fever

Program: [scope-state-practice.md](scope-state-practice.md). Depends on spec-v1388. Group G.
Specialties: `occupational-health` (added in spec-v1388), `emergency-medicine`,
`infectious-disease`, `pulmonology`. Audiences: clinicians, educators, patients.

Houston, San Antonio, the Inland Empire, and the Central Valley spend summer above 95°F, and
Southern California's fire season now runs most of the year. `heat-index` and
`heatstroke-decision` answer the physiology. Nothing answers the two questions an employee-health
nurse, a farmworker-clinic NP, or a home-health agency is asked: **at what reading does the rule
require something**, and **what does this AQI mean for this patient today**.

## `aqi-pm25` — Air Quality Index From PM2.5 (EPA, 2024 Breakpoints)

Inputs: a 24-hour PM2.5 concentration in µg/m³ **or** an AQI value (it converts either way), plus
whether the patient is in a sensitive group (lung or heart disease, children, older adults,
pregnancy). Output: the AQI, its category, and EPA's health message for the general and sensitive
groups.

The breakpoints are EPA's **as revised in 2024**: Good is **0.0–9.0** µg/m³ (it was 0.0–12.0), and
Moderate is **9.1–35.4**. The 35.4 and 55.4 breakpoints were kept. Source: EPA 2024 PM NAAQS final
rule and AQI fact sheet; *AQI Technical Assistance Document*, AirNow, May 2026. **The trap it
prevents:** any calculator written before May 2024 reports 10 µg/m³ as "Good". Truncation follows
the Technical Assistance Document (PM2.5 to one decimal). This is national, not state law. It
belongs to this program because the Cal/OSHA smoke rule below keys off it.

## `calosha-outdoor-heat` — Cal/OSHA Outdoor Heat Rule Triggers (8 CCR §3395)

Inputs: temperature, industry (the §3395 high-heat industries), days on the job, and the previous
five days' highs. Output: the requirements now in force. Shade is required **above 80°F**.
High-heat procedures apply **at 95°F or above**, with a **10-minute cool-down every 2 hours** in
listed industries. A **heat wave** is at least 80°F **and** at least 10°F above the prior
five-day average high. New workers are observed for **14 days**. Water is **1 quart per worker
per hour**.

## `calosha-indoor-heat` — Cal/OSHA Indoor Heat Rule Triggers (8 CCR §3396)

Inputs: indoor temperature, heat index, restrictive clothing, radiant heat source, minutes of
exposure per hour. Output: whether the rule applies (**82°F** or above; exempt under **15 minutes
in 60** while below 95°F), and whether engineering and administrative **control measures** are
required (temperature or heat index **87°F**, or **82°F** with restrictive clothing or radiant
heat). Hospital laundries, kitchens, and central sterile are the indoor heat workplaces a
hospital's employee-health nurse is responsible for.

## `calosha-wildfire-smoke` — Cal/OSHA Wildfire Smoke Respirator Rule (8 CCR §5141.1)

Inputs: current PM2.5 AQI (or concentration, converted by `aqi-pm25`'s shared function) and hours
exposed per shift. Output: below **151**, no requirement. From **151 to 500**, N95s must be
provided for voluntary use, with no fit test. Above **500**, respirators are **required** under the
full respiratory protection standard. Exposure of **1 hour or less** per shift is exempt. The
home-health nurse driving between patients in the Inland Empire is the intended user.

## `ca-valley-fever-test-prompt` — Valley Fever: When to Test (CDPH)

Inputs: residence in or travel to a highly endemic county, community-acquired pneumonia not
responding to antibiotics, symptoms beyond 1–2 weeks, fatigue, rash (erythema nodosum), and dust or
soil exposure. Output: whether CDPH's advisory supports coccidioidomycosis testing, which tests
to order (EIA with confirmation, immunodiffusion, complement fixation), and the limits: **early
serology can be negative, so repeat in 2–4 weeks**, and send PCR or culture when disease is severe
with negative serology. **Highly endemic** is more than **20 cases per 100,000 per year** (Labor
Code §6709(b)). The tile takes the county as the user's yes/no. **It does not carry a county
list**, because incidence moves year to year. Source: CDPH CAHAN, January 18, 2024. Coccidioidomycosis
is reportable in CA within 7 days (see `reportable-condition-urgency`).

## Acceptance

- `aqi-pm25`: 9.0 → AQI 50 (Good). 9.1 → 51 (Moderate). 35.4 → 100. 35.5 → 101. An AQI →
  concentration → AQI round trip returns the AQI it started from.
- Outdoor heat: a heat-wave test (82°F after five days averaging 70°F) and a non-heat-wave test
  (82°F after five days averaging 78°F).
- Smoke: AQI 150 → no requirement; 151 → voluntary N95; 501 → required. 45 minutes of exposure at
  AQI 300 → exempt.
- All three Cal/OSHA tiles name only California in their titles and do not offer a state picker.

## Built (2026-09-18)

| tile | source read |
|---|---|
| `aqi-pm25` | EPA AQI Technical Assistance Document, May 2026 (Table 6, Equation 1) |
| `calosha-outdoor-heat` | dir.ca.gov, 8 CCR 3395 |
| `calosha-indoor-heat` | dir.ca.gov, 8 CCR 3396 |
| `calosha-wildfire-smoke` | dir.ca.gov, 8 CCR 5141.1 |
| `ca-valley-fever-test-prompt` | CDPH CAHAN, January 18, 2024 |

- **Corrected from the plan:** the 10-minute cool-down every 2 hours (3395(e)(6)) is
  for **agriculture only**. The other four listed industries get the rest of the
  high-heat procedures. A test pins this.
- **Corrected from the plan:** CDPH's advisory says "symptomatic for a week or longer",
  not 1 to 2 weeks. It lists no rash or fatigue prompt, so the tile asks the
  advisory's four prompts only. The Labor Code 6709 "highly endemic" definition was
  not read; the tile uses the advisory's own words, "areas with coccidioidomycosis".
- The AQI round trip holds for every AQI from 0 to 500: AQI to concentration returns
  the lowest one-decimal concentration that reports that AQI.
- The smoke tile reuses the AQI tile's conversion, so a concentration entered there
  gives the same AQI as on the AQI tile.

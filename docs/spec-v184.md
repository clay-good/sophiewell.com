# spec-v184.md — US-defaults & localization audit: locale tag, °F/lb/inch toggles, US date format, and American-English copy

> Status: **SHIPPED (2026-06-29).** Remediation spec — **no tiles added, no
> catalog-count change** (`UTILITIES.length` stays 737). §4.1 locale (`en-US`),
> §4.2 American-English copy (the §4.2 table plus the user-facing British
> spellings the audit's limited Playwright pass missed — Forrest `haemorrhage`
> bands, the Bristol `Diarrhoea` band/`diarrhea` category, PEWS `grey`),
> §4.5 US date display (`usDate`/`usDateLong`), and §5.3 the
> `scripts/check-us-english.mjs` guard + `test/unit/us-english-guard.test.js`
> are **fully implemented**. §4.3 `TEMP_UNITS` and §4.4 `HEIGHT_UNITS` exports
> ship with a blank-safe `unitNumOpt` reader and are applied to the three named
> energy tiles (`mifflin-st-jeor`, `harris-benedict`, `penn-state-ree`: weight
> kg|lb, height cm|in, Tmax °C|°F); the broader §4.3 threshold-label °F
> annotations and the §4.4 sweep across every remaining height/temperature site
> are the spec-sanctioned follow-on wave ("§4.4 … may land in waves"). The
> official-name "(Japanese) Orthopaedic Association" (mJOA) and all
> citation/journal strings are left untouched (§3.7), enforced by the guard's
> allowlist. Authored from a full clinician-perspective QA pass of
> the live site (built `dist/` + the SPA at `index.html`, driven with Playwright
> against `localhost:4173`). The audit role: a **US-based bedside nurse /
> clinician**, checking that the product behaves with **US defaults** end to end
> (units, temperature, dates, spelling, terminology, locale metadata).
>
> Every prior spec (v4 through v183) remains in force. v184 changes **only
> user-facing strings, field affordances, and locale metadata**; it adds no
> runtime network call, no AI, and no new tile. It introduces one new CI guard
> (a grep-check rule, §6) and one new field helper (`TEMP_UNITS`, §5.3). No
> compute function changes its canonical units, so every `META.example` and
> deep-link hash continues to reproduce byte-identically (the §7 hard
> constraint).

## 1. Thesis

The catalog is clinically strong, but it does not consistently present **US
defaults** to a US clinician. Three classes of defect were found and confirmed
in a real browser:

1. **Localization metadata is inconsistent** — the document advertises
   `og:locale = en_US` but declares `<html lang="en">` and JSON-LD
   `inLanguage: ["en"]`.
2. **US-customary units are second-class.** Weight (kg) and height (cm) toggle
   to lb/in on *some* tiles (e.g. `bmi`) but are **metric-only** on many
   clinical tiles (e.g. `mifflin-st-jeor`, `penn-state-ree`), and **temperature
   has no °F affordance anywhere** — there is no `TEMP_UNITS` helper at all, so
   every numeric temperature input is **°C-only**. A US nurse charts Tmax in °F
   and weight in lb.
3. **Copy is not uniformly American English / US clinical idiom** — rendered
   prose and field labels carry British spellings (`oedema`, `haemoglobin`,
   `colour`, `tumour`, `fibre`, `diarrhoea`, `ionised`, `behaviour`, `grey`) and
   at least one non-US drug name (`noradrenaline`). User-facing dates render in
   ISO `YYYY-MM-DD` (e.g. the Naegele estimated due date), not a US format.

The global formatting mandate (American English, US numeric/date/unit
conventions) is the governing requirement; this spec brings the user-facing
surface into compliance **without** disturbing citations, official instrument
names, or canonical compute units.

## 2. What was actually tested (methodology)

- `node scripts/build.mjs` → `dist/` (BUILD_HASH recorded); `node scripts/serve.mjs`
  on `:4173`.
- Playwright (`chromium`, the project's pinned `@playwright/test`) navigated the
  SPA hash routes and read rendered `innerText`/`innerHTML`. Confirmed **live**:
  - `#/` → `document.documentElement.lang === "en"` (not `en-US`).
  - `#due-date` → estimated due date rendered as `2025-10-08` (ISO); LMP input
    labeled `Last menstrual period (YYYY-MM-DD)`.
  - `#bristol-girth` → rendered text contains `fibre` and `Diarrhoea`.
  - `#possum` → rendered text contains `oedema` and `Haemoglobin`.
  - `#penn-state-ree` → numeric `temperature prior 24 h (°C)` input with **no
    °F option** (no unit `<select>`); Weight `(kg)` / Height `(cm)` with no
    toggle.
  - `#mifflin-st-jeor` → Weight `(kg)` / Height `(cm)`, **no** unit `<select>`.
  - `#bmi` → for contrast, Weight offers `kg|lb` and Height offers `cm|in`
    `<option>`s. This asymmetry is the bug: the affordance exists but is not
    applied consistently.
- Static inventory (`lib/`, `views/`, `app.js`, `index.html`) for British
  spellings and non-US drug names, **excluding** JS comments, citation strings,
  journal abbreviations, and official instrument names. Result: **~34
  user-facing occurrences across 16 files** (the §4.2 table).

## 3. Findings

### 3.1 F1 — Locale metadata says two different things (Class: metadata)

`index.html` declares `<html lang="en">` (line 2) and JSON-LD
`"inLanguage": ["en"]` (≈ line 81), while `og:locale` is `en_US` (line 47). The
same `lang="en"` is emitted by the static-page builders
(`scripts/build-tool-pages.mjs`, `build-topic-pages.mjs`, `build-hub-pages.mjs`,
`build-commitments-page.mjs`) and asserted by `scripts/a11y-check.mjs`. A US
product should declare `en-US` consistently.

### 3.2 F2 — Temperature is °C-only; no °F affordance exists (Class: units)

There is **no** `TEMP_UNITS` export in `lib/field-units.js`. Every numeric
temperature input is therefore °C with no toggle. Confirmed sites include
`penn-state-ree` (`views/group-v152.js:142`), and the `Temperature (°C)` numeric
labels at `views/group-g.js:1079/1255/4637`, `views/group-v19.js:131`,
`views/group-v20.js:71`, `views/group-v140.js:118`. Threshold/checkbox criteria
that name a °C cutoff (e.g. SIRS `Temp < 36 or > 38 °C`, qSOFA, EOS) have no °F
equivalent in the label.

### 3.3 F3 — US-customary weight/height toggles are applied inconsistently (Class: units)

`lib/field-units.js` ships `WEIGHT_UNITS` (kg→lb) and the `bmi` tile additionally
offers cm/in, but many clinical tiles take **metric-only** weight/height with no
`<select>` — confirmed on `mifflin-st-jeor` and `penn-state-ree`; the
`Height (cm)` numeric labels at `views/group-v133.js`, `group-v141.js`,
`group-v152.js`, `group-v17.js`, `group-v5.js`, `group-v7.js` are candidates.
Note: there is **no `HEIGHT_UNITS` export** — height/in toggling is bespoke
where it exists.

### 3.4 F4 — User-facing dates render in ISO, not US format (Class: dates)

`lib/clinical.js` `naegele()` returns `dueDate` as `toISOString().slice(0,10)`;
`views/group-e.js` renders `Estimated due date: <ISO>`. The Naegele EDD is a
patient-facing OB date that a US clinician expects as `MM/DD/YYYY` (or
`Mon D, YYYY`). The appeals-letter template (`views/group-c.js:117/172`) also
stamps `Date: <ISO>` in a printed US business letter.

### 3.5 F5 — British spellings in rendered prose/labels (Class: copy)

See §4.2. These are **rendered** strings (interpretation bands, field labels,
result banners, category values), not comments or citations.

### 3.6 F6 — Non-US drug name (Class: terminology)

`views/group-f.js:96` lists a vasopressor preset as `noradrenaline 16 mg / 250
mL`; the same module otherwise uses the US name (`norepinephrine`-equivalent
factors). US default is **norepinephrine**.

### 3.7 Confirmed NON-findings (correct as-is — do not "fix")

- **Lab units already default US-conventional**: glucose/BUN/calcium/albumin/
  magnesium/bilirubin default to `mg/dL` (or `g/dL`) with the SI alternate
  behind the toggle (`lib/field-units.js`). Correct; no change.
- **Canonical compute units stay metric** (kg, cm, °C, mmol/L where applicable).
  Changing the *default* (first) toggle option is **out of scope** — it would
  break every `META.example` and deep-link hash (spec-v61/v62 byte-identical
  rule). The fix is to *offer* the US unit, not to flip the canonical default.
- **Citations, journal abbreviations, and official instrument names keep their
  original spelling** — they are proper nouns. Examples that MUST NOT change:
  `Br J Haematol`, `Paediatr Nurs`, `Paediatr Anaesth`, `Acta Paediatr`,
  `Gut`, the BMJ "paracetamol poisoning" title, **PIM3 = "Paediatric Index of
  Mortality"**, **APLS = "Advanced Paediatric Life Support"**, ELSO **"Adult and
  Paediatric Respiratory Failure Guidelines"**.
- **JS code comments** are left as-is (project convention).

## 4. Fixes

### 4.1 Locale → `en-US`

- `index.html`: `<html lang="en">` → `<html lang="en-US">`; JSON-LD
  `"inLanguage": ["en"]` → `["en-US"]`.
- Static-page builders emit `lang="en-US"`:
  `scripts/build-tool-pages.mjs`, `build-topic-pages.mjs`, `build-hub-pages.mjs`,
  `build-commitments-page.mjs`.
- `scripts/a11y-check.mjs`: assert `lang="en-US"`.
- `og:locale` already `en_US` — unchanged.

### 4.2 American-English / US-terminology copy (rendered strings only)

| File | Line | Before (excerpt) | After |
|---|---|---|---|
| `lib/clinical-v7.js` | 162 | "recheck **ionised** calcium" | ionized |
| `lib/clinical-v7.js` | 163 | "titrate calcium to the **ionised** calcium" | ionized |
| `lib/frailty-v143.js` | 193 | "**haemoglobin** low for sex" | hemoglobin |
| `lib/meta.js` | 580 | "The cell **colour**" | color |
| `lib/meta.js` | 4822 | "a hilar **tumour**" | tumor |
| `lib/meta.js` | 7296 | "**grey** or CR 4 s" (PEWS) | gray |
| `lib/meta.js` | 10598 | "Total/**ionised** Ca >= 2.5" | ionized |
| `lib/meta.js` | 10736 | "Soft (lacking **fibre**)" | fiber |
| `lib/meta.js` | 10737 | "**Diarrhoea**." | Diarrhea |
| `lib/nephro-v92.js` | 112 | "The risk **colour** (green/yellow/…)" | color |
| `lib/scoring-v4.js` | 3939 | "Recheck phos and **ionised** Ca" | ionized |
| `lib/scoring-v4.js` | 3966 | "Systemic **ionised** Ca …" | ionized |
| `lib/scoring-v4.js` | 3970 | "Post-filter **ionised** Ca …" | ionized |
| `lib/scoring-v4.js` | 3976 | "Total/**ionised** Ca ratio …" | ionized |
| `lib/scoring-v4.js` | 4284 | "clear edges (lacking **fibre**)" | fiber |
| `lib/scoring-v4.js` | 4285 | "mushy stool (mild **diarrhoea**)" | diarrhea |
| `lib/scoring-v4.js` | 4286 | "no solid pieces (severe **diarrhoea**)" | diarrhea |
| `lib/scoring-v4.js` | 4298 | `category = '**diarrhoea**'` | 'diarrhea' |
| `lib/uro-v131.js` | 132 | "Radius (**tumour** size)" | tumor |
| `lib/uro-v131.js` | 172 | "… and **tumour** size" | tumor |
| `views/group-f.js` | 96 | "**noradrenaline** 16 mg / 250 mL" | norepinephrine |
| `views/group-f.js` | 714 | "Systemic **ionised** Ca (optional)" | ionized |
| `views/group-f.js` | 715 | "Post-filter **ionised** Ca (optional)" | ionized |
| `views/group-f.js` | 730 | display text "Total/**ionised** Ca ratio:" | ionized |
| `views/group-v131.js` | 80 | "h marks a hilar **tumour**" | tumor |
| `views/group-v131.js` | 86 | "Hilar **tumour**?" | tumor |
| `views/group-v131.js` | 99 | "for a renal **tumour**" | tumor |
| `views/group-v131.js` | 105 | "**Tumour** size" | Tumor |
| `views/group-v132.js` | 130 | "solid-**tumour** outpatients" | solid-tumor |
| `views/group-v142.js` | 59 | "peripheral **oedema**, warfarin" | edema |
| `views/group-v142.js` | 64 | "**Haemoglobin** (g/dL)" | Hemoglobin |
| `views/group-v143.js` | 200 | "**Haemoglobin** < 11 g/dL (male)…" | Hemoglobin |
| `views/group-v22.js` | 86 | "**Behaviour** at interview" | Behavior |
| `views/group-v22.js` | 108 | "self-destructive **behaviour**" | behavior |
| `app.js` + `index.html` | tile name | "PADUA renal-**tumour** complexity score" | renal-tumor |

Notes:
- `group-f.js:730` and `scoring-v4.js:3976` change **display text only**; the
  internal property key `totalIonisedRatio` is NOT renamed (it never reaches the
  user). Same for any `'anemia'`/`'diarrhea'` keys — already US.
- The PADUA tile-name change touches the catalog name in **both** `app.js` and
  the embedded list in `index.html` (and re-derives into `lib/meta.js`/OG cards
  on build); it changes a *name*, not the catalog *count*, so catalog-truth is
  unaffected. Verify the tile still resolves by id (`padua` id is unchanged).

### 4.3 Add a °F affordance for temperature (`TEMP_UNITS`)

- Add to `lib/field-units.js`, mirroring `WEIGHT_UNITS` (canonical first so
  examples/hashes are byte-identical):

  ```js
  // Temperature: canonical °C, with the US-bedside °F alternate.
  export const TEMP_UNITS = [
    { unit: '°C', toCanonical: (v) => v },
    { unit: '°F', toCanonical: (v) => (v - 32) * 5 / 9 },
  ];
  ```
- Convert numeric temperature inputs from a bare `field(...)` to
  `unitField(label, id, TEMP_UNITS)` at the §3.2 sites (start with
  `penn-state-ree`; sweep the rest). `unitNum(id)` returns °C to the compute
  path unchanged.
- For **threshold/checkbox** criteria that only name a °C cutoff (SIRS, qSOFA,
  EOS, etc.), append the °F equivalent in the label text, e.g.
  `Temp < 36 °C (96.8 °F) or > 38 °C (100.4 °F)`. No compute change.

### 4.4 US-customary weight/height toggles everywhere weight/height is entered

- Add a `HEIGHT_UNITS = [{cm}, {in}]` export to `lib/field-units.js` (canonical
  cm first), companion to `WEIGHT_UNITS`.
- Replace metric-only `field('Weight (kg)'…)` / `field('Height (cm)'…)` with the
  `unitField(...)` toggle on clinical tiles that currently lack it
  (`mifflin-st-jeor`, `harris-benedict`, `penn-state-ree`, and the §3.3 height
  sites). Canonical units unchanged → examples/hashes stable.
- This is a **mechanical sweep**; it may land in waves after the higher-priority
  §4.1–§4.3 fixes. Each converted tile must keep its `META.example` passing
  (the example values are in canonical units and remain the default option).

### 4.5 US date format for user-facing dates

- `views/group-e.js` (`due-date`): render the EDD in US format while keeping ISO
  for unambiguity, e.g. `Estimated due date: 10/08/2025 (2025-10-08)`. Implement
  via a small `usDate(iso)` formatter (new, in `lib/num.js` or `lib/dom.js`); do
  **not** change `naegele()`'s ISO return value (compute/contract stable).
- `views/group-c.js:117/172` (appeal-letter template): stamp the letter date as
  `Mon D, YYYY` (US business-letter convention).
- LMP **input** stays ISO-labeled (`YYYY-MM-DD`) — unambiguous and already
  parsed that way; only **output** display is Americanized in this spec.

## 5. New helper & guard surface

- **5.1** New `lib/field-units.js` exports: `TEMP_UNITS` (§4.3), `HEIGHT_UNITS`
  (§4.4).
- **5.2** New `usDate(iso)` formatter (§4.5).
- **5.3** New CI guard `scripts/check-us-english.mjs` (wired into `npm run lint`):
  fails on British spellings and non-US drug names **in user-facing surfaces**
  (rendered strings in `lib/`, `views/`, `app.js`, `index.html`), with an
  explicit **allowlist** that exempts:
  - JS comment lines (`//`, `/* */`);
  - any line matching a citation field (`citation`, `sourceCitation`,
    `citationUrl`) or a journal-abbreviation token (`Br J …`, `Paediatr …`,
    `Acta …`, `Gut`, `BMJ`, `Lancet`, `N Engl`, …);
  - the official instrument/program/guideline names enumerated in §3.7 (PIM3,
    APLS, ELSO title).

  Banned token seed list: `ionised|ionisation|haemoglobin|haematocrit|
  haemorrhage|oedema|colour|behaviour|anaemia|fibre|tumour|diarrhoea|grey|
  paralyse|catheteris|oestrogen|foetal|leucocyte|caesarean|orthopaedic|
  noradrenaline|adrenaline|paracetamol|salbutamol|frusemide`.

## 6. Acceptance criteria

1. **Locale:** `index.html`, all built pages, and the a11y assertion declare
   `lang="en-US"`; JSON-LD `inLanguage: ["en-US"]`. `og:locale` unchanged.
2. **Copy:** the §4.2 table is fully applied; `node scripts/check-us-english.mjs`
   exits 0 with no user-facing British spelling or non-US drug name, and does
   **not** flag any citation/journal/official-name (allowlist verified by a unit
   test that feeds it a known-citation line and asserts a pass).
3. **Temperature:** every numeric temperature input offers a °F option;
   `unitNum` still returns °C; the affected tiles' `META.example` and deep-link
   hashes are byte-identical (existing example-correctness e2e stays green).
4. **Weight/height:** the §4.4 clinical tiles expose kg/lb and cm/in toggles;
   examples unchanged.
5. **Dates:** `due-date` and the appeal-letter template render a US-formatted
   date; `naegele()` return value and the LMP input contract are unchanged.
6. **No regressions:** `npm run lint`, `npm run test` (unit + a11y + grep-check +
   data:verify), and `npm run test:e2e` pass; catalog count and `check-catalog-truth`
   unchanged (this spec adds/removes **zero** tiles).

## 7. Out of scope / explicit non-changes

- **Do not flip canonical default units** (kg→lb, cm→in, °C→°F, mg/dL→…). The
  first toggle option must stay the canonical compute unit so `META.example` and
  every deep-link hash reproduce byte-identically (spec-v61/v62). US units are
  *offered*, not made canonical.
- **Do not alter citations, journal names, article titles, or official
  instrument/program names** (§3.7). The CI guard's allowlist enforces this.
- **Do not edit JS comments** for spelling (project convention).
- **No tile added or removed; no compute formula changed.** This is a
  presentation/localization remediation only.

## 8. Files touched (at implementation)

- `index.html` (lang, inLanguage, PADUA tile name)
- `app.js` (PADUA tile name)
- `lib/field-units.js` (`TEMP_UNITS`, `HEIGHT_UNITS`)
- `lib/clinical-v7.js`, `lib/frailty-v143.js`, `lib/meta.js`, `lib/nephro-v92.js`,
  `lib/scoring-v4.js`, `lib/uro-v131.js` (copy)
- `views/group-f.js`, `group-v131.js`, `group-v132.js`, `group-v142.js`,
  `group-v143.js`, `group-v22.js` (copy + ionized labels)
- `views/group-v152.js` and the other §3.2/§3.3 view modules (`TEMP_UNITS`/
  `HEIGHT_UNITS`/`unitField` conversions)
- `views/group-e.js`, `views/group-c.js` (US date display)
- `lib/num.js` or `lib/dom.js` (`usDate` helper)
- `scripts/build-tool-pages.mjs`, `build-topic-pages.mjs`, `build-hub-pages.mjs`,
  `build-commitments-page.mjs`, `a11y-check.mjs` (lang)
- `scripts/check-us-english.mjs` (new guard), wired into `package.json` `lint`
- `test/unit/us-english-guard.test.js` (new, allowlist coverage)

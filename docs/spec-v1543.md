# spec-v1543 — Languages: the design, and the gate before any ships

Program: [scope-field-health.md](scope-field-health.md). Platform spec. **Design only**: it builds
the machinery once the owner approves the first language, and it ships no translation until the
review process in §4 has run for that language.

## 1. Why this is the biggest reach lever, and the riskiest

Most target users work in French (West and Central Africa), Portuguese (Mozambique, Angola,
Brazil), Spanish (Latin America), Swahili (East Africa), Amharic (Ethiopia), Hausa (northern
Nigeria and Niger), Hindi, Bengali, or Urdu. An English-only tool reaches clinical officers and
district doctors, and far fewer CHWs. But a mistranslated danger sign or unit is a clinical
error, and machine translation of thresholds is not acceptable.

The MSF guidelines app ships English, French, Spanish and Arabic, a useful benchmark for a first
set.

## 2. Order

| Phase | Languages | Why |
|---|---|---|
| 1 | French, Portuguese, Spanish | WHO and PAHO publish IMCI and AIEPI in all three, so the clinical vocabulary already exists and a reviewer can check against it. Latin script, left to right |
| 2 | Swahili, Hindi | The largest CHW workforces not covered by phase 1 (Kenya, Tanzania, Uganda; India's ASHAs) |
| 3 | Amharic, Hausa, Bengali, Urdu, Arabic | Urdu and Arabic are right to left and need the RTL work in §3.4 |

Only the program's `global-health` tiles and the home box are translated at first. The rest of
the catalog stays English, and its search results say so.

## 3. Machinery

### 3.1 Strings leave the code

- Every user-facing string in a translated tile moves into a message file per language,
  `i18n/<lang>/<tile-id>.json`, keyed by stable IDs. English is the source file.
- **Numbers never live inside translatable strings.** Thresholds, doses, and units are
  placeholders filled from the lib: `"{rr} breaths per minute; the cutoff at {band} is {cutoff}"`.
  A translator cannot change a number. A test fails if any message value contains a digit that
  is not a placeholder.
- Drug names, units, and classification labels come from a **frozen glossary per language**,
  reviewed once and reused, so "chest indrawing" has one translation everywhere.

### 3.2 Choosing a language

- The page offers a language select only on translated pages. It reads `navigator.language` for
  the first suggestion and never switches without the user choosing.
- The choice is remembered in a new allowlisted key, `sw-lang`, and carried in the URL fragment.
- `<html lang>` and `dir` are set from the choice. `site.webmanifest` gains `lang` and `id`.

### 3.3 Gates that must change

- `check-us-english` enforces US spelling on user-facing strings. It stays for English, and skips
  `i18n/<lang>/` files for other languages.
- Hard-coded `toLocaleString('en-US')` calls move to `Intl.NumberFormat(pageLang)`. Values copied
  to the clipboard and returned to agents keep a dot decimal (spec-v1542 §3).
- The 320px no-horizontal-scroll sweep runs once per shipped language. French and Portuguese
  labels run about 20% longer than English.

### 3.4 Right to left (phase 3)

`dir="rtl"`, CSS logical properties in place of left and right, and `<bdi>` around every number,
unit, and Latin drug name, so "5 mL" does not render as "mL 5". Urdu's Nastaliq script may fall
back to Naskh on low-end phones; test on a real device before shipping.

## 4. The review gate (per language, before it ships)

Following the WHO instrument-translation process:

1. **Forward translation** of the English message files by a health professional who is a native
   speaker of the target language.
2. **Expert panel** reconciliation against the country's own IMCI, AIEPI or PCIME edition, so
   the words match the chart the user was trained on.
3. **Back-translation** to English by a second translator who has not seen the source, compared
   line by line.
4. **Cognitive testing** with at least five health workers from the target group, reading real
   answers aloud.
5. **Sign-off** recorded in `docs/translations.md`: language, reviewers' roles (not names unless
   they agree), date, and the tile list covered.

Any later change to a translated English string marks that string stale in every language. A
stale string falls back to English, with the page saying the translation is being updated. It
never shows an old translation of a changed threshold.

WHO requires translations of its material to carry its disclaimer. This program translates only
its own MIT text, never WHO's, so the disclaimer is not needed. The reproduction guard from
spec-v1540 §6 runs on every language's files against the WHO editions in that language.

## 5. Open decisions for the owner

- Whether to fund professional translation, or build the machinery and invite ministry or NGO
  partners to supply reviewed translations under MIT.
- Whether phase 1 waits for the offline pack (spec-v1541). The recommendation is yes: a
  translated tool that fails offline fails its audience.

## Acceptance (when built)

The machinery ships with English only and changes nothing visible. The digit-in-message test and
the stale-string fallback are tested with a planted French file. No language ships until its
row in `docs/translations.md` is complete.

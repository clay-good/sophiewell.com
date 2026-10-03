# Translations

**The site ships in English only** (owner's decision, October 3, 2026; [spec-v1564](spec-v1564.md) D6).
Its words go through a language layer (`lib/i18n.js`) so a reviewed translation can be plugged in
later without changing any tool's logic. Nothing on the site changes until a language is added below.

## How a language is added

1. **Messages, not code.** English source messages live in `lib/i18n/en/<namespace>.js`. A translation
   is `lib/i18n/<lang>/<namespace>.js`, calling `addMessages('<lang>', '<namespace>', { key: { text, source } })`.
   `source` is the exact English it was translated from. When the English changes, the translation goes
   stale and the English is shown instead, never an old translation of a changed string.
2. **No numbers in messages.** Thresholds, doses and counts are `{placeholders}` the code fills, so a
   translator cannot change one. `test/unit/i18n.test.js` fails on a digit in any message.
3. **Review before it ships** ([spec-v1543](spec-v1543.md) §4): forward translation by a native-speaking
   health professional; reconciliation against the country's own chart edition; blind back-translation;
   cognitive testing with at least five health workers; sign-off recorded in the table below.
4. **Ship it** by adding the language to `SHIPPED` in `lib/i18n.js`. The test refuses a shipped language
   without a completed row here.

## Languages

| language | code | tiles covered | forward translator (role) | back-translator (role) | cognitive testing | signed off |
|---|---|---|---|---|---|---|
| English (source) | en | all | n/a | n/a | n/a | source |

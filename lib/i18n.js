// spec-v1543 §3 with the owner's decision of 2026-10-03 (spec-v1564 D6): the language layer. The site
// ships English only. A string that goes through this layer can take a reviewed translation later
// without touching the code that uses it.
//
//   t('offline-status', 'saving', { pct: 40 })  ->  'Saving for offline use... 40%.'
//
// - English is the source. Each namespace's English messages are a module in lib/i18n/en/ that
//   registers itself, so they load with the code that uses them.
// - Numbers never live inside a message: a threshold, dose or count is a {placeholder} the code
//   fills, so a translator cannot change one (test/unit/i18n.test.js fails on a digit in any message).
// - A translation entry records the English it was made from: { text, source }. When the English
//   changes, the translation is stale and the English is shown, never an old translation of a
//   changed string.
// - A language is offered only when it is in SHIPPED, and only English is. Adding one means a
//   completed review row in docs/translations.md (spec-v1543 §4), which the test checks.

export const SHIPPED = ['en'];
const SOURCE = 'en';
const catalogs = new Map([[SOURCE, new Map()]]);
let current = SOURCE;

// addMessages(lang, ns, messages): English as { key: 'text' }; any other language as { key: { text, source } }.
export function addMessages(lang, ns, messages) {
  if (!catalogs.has(lang)) catalogs.set(lang, new Map());
  catalogs.get(lang).set(ns, { ...(catalogs.get(lang).get(ns) || {}), ...messages });
}

export function setLanguage(lang) {
  if (!SHIPPED.includes(lang)) return false;
  current = lang;
  return true;
}
export const getLanguage = () => current;

const fill = (text, vars) => String(text).replace(/\{(\w+)\}/g, (m, k) => (vars && vars[k] !== undefined && vars[k] !== null ? String(vars[k]) : m));

// t(ns, key, vars, lang) -> the message in `lang` if it has a current translation, else the English.
export function t(ns, key, vars = {}, lang = current) {
  const en = (catalogs.get(SOURCE).get(ns) || {})[key];
  if (en === undefined) throw new Error(`i18n: no English message ${ns}.${key}`);
  if (lang !== SOURCE) {
    const tr = ((catalogs.get(lang) || new Map()).get(ns) || {})[key];
    if (tr && tr.source === en) return fill(tr.text, vars);
  }
  return fill(en, vars);
}

// The locale tag for number and date formatting in the chosen language.
export const localeTag = (lang = current) => (lang === 'en' ? 'en-US' : lang);

// For the test: every registered catalog, read-only.
export const _catalogs = () => catalogs;

// The browser tab, and the first line of every search result.
//
// Two things belong there: what the tool is, and whose site it is. The title
// used to be built as `<name> - Free, in your browser · Sophie Well` and
// clamped afterwards, so on 1336 of 1564 pages the cut landed inside the
// boilerplate and the tab read "Wells Score for DVT - Free, in your brows…" --
// the pitch half-said, the brand gone. Dropping the boilerplate whole costs
// nothing and keeps both the name and the brand.
//
// Shared by the pre-rendered pages (scripts/build-tool-pages.mjs) and the app
// (app.js), because they are the same tab. They were separate: the builder
// clamped and the app did not, so /tools/thakar-aki/ opened a 65-character tab
// and #thakar-aki opened a 91-character one for the same tool, with a
// different separator between the name and the brand.

import { outsideBrackets } from './brackets.js';

export const TITLE_MAX = 65;
export const BRAND = 'Sophie Well';

export function clampTitle(s, max = TITLE_MAX) {
  if (s.length <= max) return s;
  return `${s.slice(0, outsideBrackets(s, max - 1)).trimEnd().replace(/[,;:([-]+$/, '').trimEnd()}…`;
}

export function pageTitle(name) {
  const withBrand = `${name} · ${BRAND}`;
  if (withBrand.length <= TITLE_MAX) return withBrand;
  // A name long enough to crowd out the brand keeps the tab honest on its own.
  if (name.length <= TITLE_MAX) return name;
  return clampTitle(name);
}

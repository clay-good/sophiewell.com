// scripts/data/discover.mjs -- spec-v1621 §2 and §3.
//
// CMS moves its download links every release, so a builder never hardcodes a
// file URL. It reads the dataset's landing page and picks the newest link
// matching a pattern. A page with no match is a failed fetch, not a guess.

// findLinks(html, pattern, base?) -> [href] in page order, de-duplicated.
// Accepts double- or single-quoted href attributes. With `base`, relative
// links come back absolute.
export function findLinks(html, pattern, base) {
  const out = [];
  const seen = new Set();
  const re = /\bhref\s*=\s*(?:"([^"]*)"|'([^']*)')/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    let href = (m[1] ?? m[2]).replace(/&amp;/g, '&').trim();
    if (!pattern.test(href)) continue;
    if (base) href = new URL(href, base).href;
    if (seen.has(href)) continue;
    seen.add(href);
    out.push(href);
  }
  return out;
}

// newest(links, compare) -> the link that sorts highest. `compare(a, b)` is
// the dataset's own ordering (year, then letter, then correction).
export function newest(links, compare) {
  if (!links.length) return null;
  return [...links].sort(compare).at(-1);
}

// unwrapLicenseLink('/license/ama?file=/files/zip/x.zip') -> '/files/zip/x.zip'.
// Only for sources the maintainer has cleared (spec-v1621 §3.4); every other
// link comes back unchanged.
export function unwrapLicenseLink(href) {
  const m = /\/license\/ama\?(?:[^#]*&)?file=([^&#]+)/.exec(href);
  return m ? decodeURIComponent(m[1]) : href;
}

// isLicenseGated(href) -> true for a link behind the AMA click-through.
export const isLicenseGated = (href) => /\/license\/ama\?/.test(href);

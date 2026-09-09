// spec-v1157: does a tile state its own clinical disclaimer?
//
// The generic notice goes above the inputs on every clinical tile -- "This is a
// math aid for verification. Institutional protocols and clinician judgment
// govern any clinical decision." A third of the views then close with their own,
// longer version of the same sentence, and 1,063 tiles said it twice on one
// screen. app.js drops the generic one when the view states its own.
//
// This rule was written TWICE: once in app.js, which decides whether to drop the
// banner, and once in test/integration/one-disclaimer.spec.js, which checks
// nobody ends up with both. The copies had already drifted -- the test's
// recogniser had neither the `/ ` opening alternative nor the
// standalone-disclaimer branch nor the "who decides" conjunct -- so the gate was
// reading a different rule from the one it exists to police.
//
// One copy, imported by app.js and by the sweep (which loads it into the page the
// same way it loads /lib/meta.js).
//
// "Decision support, not a verdict" is a disclaimer and nothing else, so it
// stands on its own. Any other opening has to also say who the decision belongs
// to, because "decision support" alone appears in prose that is describing the
// tool rather than disclaiming it. Recognised by a closed set of openings rather
// than by keyword, because "the clinician" appears in plenty of prose that is not
// a disclaimer.
export const OWN_NOTICE_DISCLAIMER = /^decision support,? (?:and|but)? ?not an? (?:verdict|order|diagnosis|prescription|treatment|substitute)/i;
export const OWN_NOTICE_OPENING = /^(?:[A-Z][A-Za-z-]* )?(?:\/ )?(?:decision support|screening \/ decision support|estimate \/ decision support)\b[,.]/i;
const NAMES_WHO_DECIDES = /stays? with|clinician|prescriber|protocol|clinical judgment/i;

// Is this one line a tile's own disclaimer? Lines shorter than 40 characters are
// not, and neither is a wrapper that contains other lines -- both are the sweep's
// and app.js's shared reading of the DOM, kept here so they cannot diverge either.
export function isOwnNoticeLine(text) {
  const t = String(text || '').replace(/\s+/g, ' ').trim();
  if (t.length < 40) return false;
  if (OWN_NOTICE_DISCLAIMER.test(t)) return true;
  return OWN_NOTICE_OPENING.test(t) && NAMES_WHO_DECIDES.test(t);
}

// The candidate lines inside a rendered subtree: leaf p / li / summary nodes.
export function noticeLines(root) {
  const out = [];
  for (const n of root.querySelectorAll('p, li, summary')) {
    if (n.querySelector('p, li')) continue;
    out.push((n.textContent || '').replace(/\s+/g, ' ').trim());
  }
  return out;
}

export function tileStatesItsOwnNotice(root) {
  return noticeLines(root).some(isOwnNoticeLine);
}

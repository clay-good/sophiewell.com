// A number the page cannot mean.
//
// `fmt()` in lib/num.js exists so a non-finite result prints as "--" rather
// than as itself, and scripts/check-output-safety.mjs bans the pattern that
// leaks a literal `undefined`. Neither covers a renderer that interpolates a
// raw number: on 81 tiles a large enough input arrives at the page intact, and
// the tile states it with full confidence --
//
//   "Cardiac power output Infinity W: above the 0.6 W cardiogenic-shock
//    threshold (Fincke 2004)."
//   "Duke treadmill score -Infinity: high risk (DTS <= -11), 79% 5-year
//    survival (Mark 1987)."
//
// which is a clinical reading of a number that does not exist. The MCP surface
// already refuses these: computeCalculator's firstNonFinite guard demotes the
// whole result to `{ valid: false }` rather than return one, and
// test/mcp/mcp-fuzz.test.js holds it across the exposed set. The browser had no
// equivalent, so the two customers got different answers to the same input.
//
// This is that guard, one pass over the rendered region rather than 81 view
// edits. The whole answer goes, the way MCP demotes the whole result: a tile
// that has one impossible value among several has not computed the others from
// anything better.
//
// `NaN` and `Infinity` are safe to recognise by name. No tile in the catalog
// prints either word in its own prose -- swept over all 1564 with their
// examples filled -- so a match is always a leak and never a sentence.

const NON_FINITE = /(?:^|[^A-Za-z])(?:NaN|-?Infinity)(?![A-Za-z])/;

export const OUT_OF_RANGE_TEXT =
  'One of these values is too large or too small for this calculation to have '
  + 'an answer. Check the values below.';

let activeGuard = null;

export function guardNonFinite(body, doc = typeof document === 'undefined' ? null : document) {
  if (activeGuard) { activeGuard.disconnect(); activeGuard = null; }
  if (!body || !doc) return null;
  let busy = false;

  const scan = () => {
    // Replacing the region mutates what this observes.
    if (busy) return;
    // spec-v1032: EVERY live region, not the first one.
    //
    // This used to take `body.querySelector('[aria-live]')`, which was the
    // results region on every tile until spec-v1009 added a second one: the
    // out-of-range field warning, inserted ABOVE the results and also polite.
    // From then on the guard scanned the warning, found no Infinity in it --
    // there never is -- and returned, while the answer below it went on saying
    // "Cardiac power output Infinity W: above the 0.6 W cardiogenic-shock
    // threshold". The guard reported clean with the exact defect it exists to
    // catch on screen beneath it.
    const lives = body.querySelectorAll('[aria-live]');
    if (!lives.length) return;
    for (const live of lives) {
      const text = (live.textContent || '').replace(/\s+/g, ' ');
      if (!NON_FINITE.test(text)) continue;
      busy = true;
      try {
        while (live.firstChild) live.removeChild(live.firstChild);
        const p = doc.createElement('p');
        p.className = 'muted';
        p.textContent = OUT_OF_RANGE_TEXT;
        live.appendChild(p);
      } finally {
        busy = false;
      }
    }
  };

  scan();
  if (typeof MutationObserver === 'function') {
    const observer = new MutationObserver(scan);
    observer.observe(body, { childList: true, subtree: true });
    activeGuard = observer;
  }
  // Returned so a test can drive a re-render directly rather than waiting on a
  // real MutationObserver.
  return { recheck: scan };
}

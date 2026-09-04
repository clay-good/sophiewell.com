// spec-v1032: the non-finite guard has to look at every live region.
//
// It scanned `body.querySelector('[aria-live]')` -- the first one -- which was
// the results region until spec-v1009 put a second, politer one above it for
// out-of-range fields. After that the guard read the warning, found no Infinity
// in it (there never is one), and returned, while the answer below went on
// reading "Cardiac power output Infinity W: above the cardiogenic-shock
// threshold". A gate that reports clean with its own defect on screen is worse
// than no gate; see docs/gate-self-review.md.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { guardNonFinite, OUT_OF_RANGE_TEXT } from '../../lib/output-guard.js';

function fakeDom() {
  const make = (tag) => {
    const node = {
      tagName: tag.toUpperCase(),
      className: '',
      textContent: '',
      children: [],
      attrs: {},
      get firstChild() { return this.children[0] || null; },
      appendChild(c) { this.children.push(c); return c; },
      removeChild(c) { this.children.splice(this.children.indexOf(c), 1); return c; },
    };
    return node;
  };
  const doc = { createElement: make };
  const regions = [];
  const body = {
    ...make('div'),
    querySelectorAll: () => regions,
    querySelector: () => regions[0] || null,
  };
  return { doc, body, regions, make };
}

test('a decoy live region above the results does not hide an Infinity below it', () => {
  const { doc, body, regions, make } = fakeDom();
  const warning = make('p');            // the out-of-range warning, spec-v1009
  warning.textContent = 'Check the value entered for weight.';
  const results = make('div');          // #q-results
  results.textContent = 'Cardiac power output Infinity W: above the 0.6 W threshold.';
  results.children.push(make('h2'));
  regions.push(warning, results);

  const guard = guardNonFinite(body, doc);
  guard.recheck();

  assert.equal(results.children.length, 1);
  assert.equal(results.children[0].textContent, OUT_OF_RANGE_TEXT);
  // The warning is untouched -- it never held an impossible number.
  assert.equal(warning.children.length, 0);
});

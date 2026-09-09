// spec-v1179: an option a view module silently ignores.
//
// spec-v1174 declared a platelet ceiling on 18 inputs so the browser would show
// its range warning above the answer. EIGHT OF THE EIGHTEEN RENDERED NOTHING,
// because each view module carries its own copy of `field(label, id, opts)` --
// the house convention -- and they do not agree about which options they honour.
// `views/group-v124.js` read `opts.min` and not `opts.max`, which is the shape
// exactly: support was added for the option someone needed at the time.
//
// Nothing failed. The option was accepted, ignored, and the wave's own write-up
// said the bound was declared -- verified in the library, assumed in the view.
//
// This reads the source, because the thing being asserted is a property of the
// helpers rather than of any one tile: a module whose `field()` takes an options
// object must not drop a bound passed to it.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const VIEWS = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'views');

function fieldHelperBody(src) {
  const i = src.search(/^function field\(label, id, opts = \{\}\) \{/m);
  if (i === -1) return null;
  // The body starts after the PARAMETER LIST. Brace-matching from the first `{`
  // after `function` lands on the default parameter's own `{}` in `opts = {}`,
  // captures the signature alone, and reports every module as an offender --
  // which is what the first version of this test did, on four modules that were
  // correct. `group-v25` sets opts.max on the line after opts.min.
  const open = src.indexOf('{', src.indexOf(')', i));
  let depth = 0;
  for (let j = open; j < src.length; j += 1) {
    if (src[j] === '{') depth += 1;
    else if (src[j] === '}') { depth -= 1; if (depth === 0) return src.slice(open, j + 1); }
  }
  return null;
}

// Both ledgers are DRAINED, and both were drained the same way.
//
// spec-v1182 took `max`: 51 declarations across 18 modules that never reached
// the page. spec-v1183 took `min`, which spec-v1179 had deferred on the
// reasoning that activating a floor is a behaviour change rather than a repair
// -- a value the tile has always accepted can start warning. That was measured
// before it was turned on, on the page as a reader first meets it:
//
//   85 `min:` declarations across the same 18 modules, inert
//   0 tiles warn about their own worked example
//   1,976 -> 2,061 number inputs render a floor
//
// The sets are kept, rather than deleted, because an empty ledger with its size
// asserted below is the record that it was drained -- and because the next
// module to drop a bound should land here rather than pass.
//
// The two bounds are ONE rule, checked in one loop. They were nearly two test
// files, and a second copy of a rule is exactly how these helpers came to
// disagree about which options they honour.
const DROPPED_BEFORE_V1179 = { min: new Set([]), max: new Set([]) };

for (const bound of ['min', 'max']) {
  test(`every view module that is PASSED a ${bound} renders it`, () => {
    const offenders = [];
    let checked = 0;
    for (const file of readdirSync(VIEWS).filter((f) => f.endsWith('.js'))) {
      const src = readFileSync(join(VIEWS, file), 'utf8');
      // A module is a subject when something in it declares a numeric bound. The
      // first version scoped that with `field\([^)]*max:` and was wrong: the call
      // `field('Platelet count (×10⁹/L) - must be > 0', 'sk-plt', { max: 2000 })`
      // has a `)` INSIDE ITS LABEL, so the scan stopped before the option -- and
      // the module it missed was the one whose defect this test was written from.
      // Matching the option itself needs no paren-balancing and cannot be fooled
      // by punctuation in a label.
      if (!new RegExp(`\\b${bound}:\\s*[-0-9]`).test(src)) continue;
      const body = fieldHelperBody(src);
      if (!body) continue; // a shared or differently-shaped helper is not this test's subject
      checked += 1;
      if (!body.includes(`opts.${bound}`) && !DROPPED_BEFORE_V1179[bound].has(file)) offenders.push(file);
    }
    // The reach, asserted: "clean" must not come to mean "looked at nothing".
    assert.ok(checked >= 20, `expected many view modules to declare a ${bound}; saw ${checked}`);
    assert.equal(DROPPED_BEFORE_V1179[bound].size, 0, `the ${bound} ledger was drained`);
    assert.deepEqual(offenders, [],
      `these modules accept a \`${bound}:\` option and never set the attribute, so the `
      + 'range warning above the answer can never fire for those fields');
  });
}

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

// The modules whose `field()` dropped a bound BEFORE spec-v1179, kept so the
// gate holds the line against a new one while these drain. Two were verified on
// the page rather than in the source, because that is the mistake this whole
// wave is about:
//
//   sodium-correction|na       declares { min: 0, max: 200 } -> renders NEITHER
//   apc-payment|apc-disc       declares { min: 0, max: 100 } -> renders NEITHER
//
// They drop `min` as well as `max`. spec-v1179 fixed only `max`, and only in the
// four modules it had itself declared a bound in, because adding `min` support
// makes a below-min value start warning on tiles nobody has looked at -- a
// behaviour change, not a repair.
const DROPPED_BEFORE_V1179 = new Set([
  'group-b.js', 'group-f.js', 'group-i.js', 'group-v10.js', 'group-v11.js',
  'group-v125.js', 'group-v126.js', 'group-v127.js', 'group-v129.js',
  'group-v13.js', 'group-v15.js', 'group-v16.js', 'group-v17.js', 'group-v18.js',
  'group-v5.js', 'group-v7.js', 'group-v8.js', 'group-v9.js',
]);

test('every view module that is PASSED a max renders it', () => {
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
    if (!/\bmax:\s*[-0-9]/.test(src)) continue;
    const body = fieldHelperBody(src);
    if (!body) continue; // a shared or differently-shaped helper is not this test's subject
    checked += 1;
    if (!/opts\.max/.test(body) && !DROPPED_BEFORE_V1179.has(file)) offenders.push(file);
  }
  // The reach, asserted: "clean" must not come to mean "looked at nothing".
  assert.ok(checked >= 20, `expected many view modules to declare a bound; saw ${checked}`);
  // And the ledger must not quietly grow into the whole catalog.
  assert.ok(DROPPED_BEFORE_V1179.size <= 18, 'the ledger is a backlog, not a home');
  assert.deepEqual(offenders, [],
    'these modules accept a `max:` option and never set the attribute, so the '
    + 'range warning above the answer can never fire for those fields');
});

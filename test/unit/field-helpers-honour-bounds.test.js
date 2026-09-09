// spec-v1179: an option a view module silently ignores.
//
// spec-v1174 declared a platelet ceiling on 18 inputs so the browser would show
// its range warning above the answer. EIGHT OF THE EIGHTEEN RENDERED NOTHING,
// because each view module carries its own copy of the input-building helper --
// the house convention -- and they do not agree about which options they honour.
// `views/group-v124.js` read `opts.min` and not `opts.max`, which is the shape
// exactly: support was added for the option someone needed at the time.
//
// Nothing failed. The option was accepted, ignored, and the wave's own write-up
// said the bound was declared -- verified in the library, assumed in the view.
//
// This reads the source, because the thing being asserted is a property of the
// helpers rather than of any one tile: a helper that takes an options object
// must not drop an option passed to it.
//
// THE GATE'S REACH IS THE POINT, and it has been wrong twice.
//
//   spec-v1182 drained `max` across 18 modules; spec-v1183 drained `min` across
//   the same 18. Both ledgers empty, both bounds asserted -- and the gate still
//   matched ONE HELPER BY NAME, `function field(label, id, opts = {})`. A helper
//   called `numField` was not a subject, so `group-v176` and `group-v178` sat
//   clean through three waves while honouring `min` and dropping `max` on an age
//   field bounded at 130. A transposed digit there is spec-v1009's whole reason
//   for existing.
//
// So the subject is now shape, not name: any local function whose last parameter
// is an options object, and any key any call site passes it. Naming the helper
// was how the last hole got in.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const VIEWS = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'views');

// The body starts after the PARAMETER LIST. Brace-matching from the first `{`
// after `function` lands on the default parameter's own `{}` in `opts = {}`,
// captures the signature alone, and reports every module as an offender --
// which is what the first version of this test did, on four modules that were
// correct.
function bodyAfter(src, from) {
  const open = src.indexOf('{', src.indexOf(')', from));
  let depth = 0;
  for (let j = open; j < src.length; j += 1) {
    if (src[j] === '{') depth += 1;
    else if (src[j] === '}') { depth -= 1; if (depth === 0) return src.slice(open, j + 1); }
  }
  return null;
}

// The keys a call site passes, read off the option literal. NOT by paren-
// balancing the call: `field('Platelet count (×10⁹/L) - must be > 0', 'sk-plt',
// { max: 2000 })` has a `)` INSIDE ITS LABEL, so a paren-balanced scan stops
// before the options -- and the module it missed was the one whose defect this
// test was written from.
function keysPassedTo(src, fn) {
  const call = new RegExp(`\\b${fn}\\(`);
  const keys = new Map();
  for (const line of src.split('\n')) {
    if (!call.test(line)) continue;
    const brace = line.indexOf('{', line.indexOf(`${fn}(`));
    if (brace === -1) continue;
    for (const m of line.slice(brace).matchAll(/([A-Za-z_$][\w$]*)\s*:/g)) {
      keys.set(m[1], (keys.get(m[1]) || 0) + 1);
    }
  }
  return keys;
}

test('no view helper accepts an option and drops it', () => {
  const offenders = [];
  let helpers = 0;
  let pairs = 0;
  for (const file of readdirSync(VIEWS).filter((f) => f.endsWith('.js'))) {
    const src = readFileSync(join(VIEWS, file), 'utf8');
    for (const m of src.matchAll(/^function ([A-Za-z_$][\w$]*)\(([^)]*)\) \{/gm)) {
      const [, name, params] = m;
      const opts = params.split(',').pop().trim().match(/^([A-Za-z_$][\w$]*)\s*=\s*\{\}$/)?.[1];
      if (!opts) continue;
      const body = bodyAfter(src, m.index);
      if (!body) continue;
      // Spread or dynamic indexing reads every key; such a helper drops nothing.
      if (new RegExp(`\\.\\.\\.${opts}\\b|\\b${opts}\\[`).test(body)) continue;
      helpers += 1;
      for (const [key, n] of keysPassedTo(src, name)) {
        pairs += 1;
        if (!body.includes(`${opts}.${key}`)) offenders.push(`${file} ${name}() drops ${key} (${n} call sites)`);
      }
    }
  }
  // The reach, asserted twice over: "clean" must not come to mean "looked at
  // nothing", and this gate's blind spot was its reach both times.
  assert.ok(helpers >= 60, `expected many options-taking view helpers; saw ${helpers}`);
  assert.ok(pairs >= 200, `expected many helper/option pairs; saw ${pairs}`);
  assert.deepEqual(offenders, [],
    'these helpers accept an option and never read it, so whatever the call site '
    + 'declared -- a bound, a step, a placeholder -- never reaches the page');
});

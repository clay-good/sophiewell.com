// spec-v53 §4.4.2 / §6: reflection-driven adversarial fuzz of every public
// compute export.
//
// Location / runner note (a deliberate, documented deviation from the spec's
// proposed `test/integration/fuzz-tools.spec.js`): these are pure Node compute
// functions -- no browser is involved -- and the spec requires the harness be
// "wired into `npm run test`". `npm run test` runs `test:unit` (node:test), NOT
// `test:e2e` (Playwright). A Playwright spec under test/integration/ would only
// run in test:e2e, so it would NOT satisfy "wired into npm run test". A node:test
// here is the correct home: faster, no browser, and actually in the `npm run
// test` path. See docs/audits/v11/_hardening-v53.md.
//
// What is asserted, for EVERY exported function across the target modules, for
// each value in the fixed adversarial matrix:
//   (a) THROW-SAFETY (spec-v53 §3.1): if the call throws, the error is a
//       TypeError or RangeError (a declared validation error) -- never a
//       programming error (ReferenceError, a thrown string, etc.).
//   (c) NO STRING LEAK (spec-v53 §3.2): no returned string field embeds the
//       literal token `NaN` / `Infinity` / `undefined` (a string field is
//       rendered verbatim, so a leak there reaches the DOM).
//
// What is NOT asserted, and why (honesty discipline, spec-v53 §7): the matrix
// passes each adversarial value as the SOLE argument. Most compute functions
// take a single OBJECT and destructure it, so a scalar argument yields
// `undefined` fields and a `NaN` numeric return -- but that input is NOT
// reachable through any renderer (a renderer always passes a populated object).
// Asserting "every numeric field is finite" for the scalar matrix would flag
// ~486 such unreachable cases and force a defensive guard onto 245 functions for
// no behavior change -- exactly the non-surgical sweep §7 forbids. The
// finiteness-on-REACHABLE-input half of the invariant is instead enforced where
// it bites: `fmt()` (lib/num.js) at every guarded render site, the
// `check-output-safety` gate (the `?.toFixed(` leak fingerprint), the three
// confirmed Class-A/B fixes (pinned by their own unit tests), and each tile's
// existing valid-input correctness tests.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import * as clinical from '../../lib/clinical.js';
import * as clinicalV4 from '../../lib/clinical-v4.js';
import * as clinicalV5 from '../../lib/clinical-v5.js';
import * as clinicalV6 from '../../lib/clinical-v6.js';
import * as medicationV4 from '../../lib/medication-v4.js';
import * as medicationV5 from '../../lib/medication-v5.js';
import * as scoringV4 from '../../lib/scoring-v4.js';
import * as scoringV5 from '../../lib/scoring-v5.js';
import * as labInterpret from '../../lib/lab-interpret.js';
import * as unitConvert from '../../lib/unit-convert.js';

const MODULES = {
  'clinical.js': clinical,
  'clinical-v4.js': clinicalV4,
  'clinical-v5.js': clinicalV5,
  'clinical-v6.js': clinicalV6,
  'medication-v4.js': medicationV4,
  'medication-v5.js': medicationV5,
  'scoring-v4.js': scoringV4,
  'scoring-v5.js': scoringV5,
  'lab-interpret.js': labInterpret,
  'unit-convert.js': unitConvert,
};

const MATRIX = [0, -1, 1e9, NaN, Infinity, -Infinity, '', undefined, null];
const BANNED = ['NaN', 'Infinity', 'undefined'];

// Recursively assert no STRING field of `v` embeds a banned token.
function assertNoStringLeak(v, path, label) {
  if (typeof v === 'string') {
    for (const t of BANNED) {
      assert.ok(!v.includes(t), `${label}: returned string ${path} leaked "${t}": ${JSON.stringify(v)}`);
    }
    return;
  }
  if (v && typeof v === 'object') {
    for (const k of Object.keys(v)) assertNoStringLeak(v[k], `${path}.${k}`, label);
  }
}

let fnCount = 0;
for (const [modName, mod] of Object.entries(MODULES)) {
  for (const [name, fn] of Object.entries(mod)) {
    if (typeof fn !== 'function') continue;
    fnCount += 1;
    test(`fuzz: ${modName} ${name}() is throw-safe and string-leak-free across the adversarial matrix`, () => {
      for (const input of MATRIX) {
        let result;
        try {
          result = fn(input);
        } catch (err) {
          assert.ok(
            err instanceof TypeError || err instanceof RangeError,
            `${name}(${String(input)}) threw ${err && err.constructor && err.constructor.name}: ${err && err.message} -- only TypeError/RangeError are allowed (spec-v53 §3.1)`,
          );
          continue;
        }
        assertNoStringLeak(result, '<return>', `${name}(${String(input)})`);
      }
    });
  }
}

test('the fuzz harness actually enumerated the public compute surface', () => {
  // Guard against the harness silently covering nothing (e.g. an import that
  // resolved to an empty namespace). scoring-v4 alone exports 150+ functions.
  assert.ok(fnCount > 200, `expected 200+ fuzzed exports, got ${fnCount}`);
});

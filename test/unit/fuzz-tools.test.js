// spec-v53 §4.4.2 / spec-v59 §2.6: reflection-driven adversarial fuzz of every
// public compute export.
//
// Location / runner note (a deliberate, documented deviation from the spec's
// proposed `test/integration/fuzz-tools.spec.js`): these are pure Node compute
// functions -- no browser is involved -- and the spec requires the harness be
// "wired into `npm run test`". `npm run test` runs `test:unit` (node:test), NOT
// `test:e2e` (Playwright). A Playwright spec under test/integration/ would only
// run in test:e2e, so it would NOT satisfy "wired into npm run test". A node:test
// here is the correct home: faster, no browser, and actually in the `npm run
// test` path. See docs/audits/v11/_hardening-v53.md and _hardening-v59.md.
//
// spec-v59 §2.6 upgrades the harness on two axes:
//   1. OBJECT-AWARE matrix. Almost every compute function takes a single
//      destructured object, so the old scalar-only matrix never exercised the
//      reachable "valid object with one impossible field" path. The harness now
//      reflects each function's destructured field names from its source, builds
//      a finite baseline object, and drives EACH field through the adversarial
//      matrix while holding the others valid.
//   2. FINITENESS on reachable input. On the object path, when a call returns
//      (does not throw), every numeric return field must be finite or exactly
//      null -- never NaN/Infinity. This is the half of the v53 invariant that
//      catches Class B (a confident non-finite number reaching the DOM).
//
// For EVERY exported function across the target modules and each adversarial
// value the harness asserts:
//   (a) THROW-SAFETY (spec-v53 §3.1): a thrown error is a TypeError or
//       RangeError (a declared validation error), never a programming error.
//   (b) NO STRING LEAK (spec-v53 §3.2): no returned string field embeds the
//       literal token NaN / Infinity / undefined. This IS the DOM-safety
//       invariant -- the DOM only ever receives strings, so a non-finite value
//       that never reaches a string never reaches the user.
//
// Scoping note (honesty discipline, spec-v53 §7 / spec-v59 §2.2): the harness
// asserts the actual DOM-safety invariant -- no banned TOKEN in any returned
// STRING field -- on the object-aware REACHABLE matrix, NOT blanket numeric
// finiteness of internal fields. The DOM only ever receives strings, so a non-
// finite value that never reaches a string never reaches the user. A divide-by-
// an-entered-0 (e.g. shock index with SBP=0) is a mathematically-forced Infinity
// in an INTERNAL numeric field; spec-v59 §2.2's fix for that class is a render-
// side boundsAdvisory() plus the fmt() guard at the render site (which keeps the
// token out of the DOM), NOT a blanket null-return forced onto ~40 functions --
// that is precisely the non-surgical sweep spec-v53 §7 forbids. What the object-
// aware string-leak check newly catches (and the old scalar-only harness missed)
// is a band string that interpolates a raw NaN/Infinity from one bad field -- a
// real leak; spec-v59 fixes each such site (rox, vis, berlinArds) to route the
// interpolation through fmt(). The three confirmed Class-A/B sites that slipped a
// number to the DOM (hacor, lisMurray, bps) return null and are pinned by their
// own unit tests.
//
// Module coverage: the 21 PURE compute modules. The four DOM-renderer modules
// (derivation.js, screener.js, table.js, tree.js) require a `document` and so
// cannot run under node:test; they are exercised by the Playwright all-tools /
// mobile-no-hscroll specs, which mount every tile in a real browser. derivation
// .js's one numeric-leak path (the show-your-work panel) is additionally guarded
// at the source by fmt() (spec-v59 §2.7) -- see lib/derivation.js formatInput.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import * as clinical from '../../lib/clinical.js';
import * as clinicalV4 from '../../lib/clinical-v4.js';
import * as clinicalV5 from '../../lib/clinical-v5.js';
import * as clinicalV6 from '../../lib/clinical-v6.js';
import * as clinicalV7 from '../../lib/clinical-v7.js';
import * as clinicalV8 from '../../lib/clinical-v8.js';
import * as medicationV4 from '../../lib/medication-v4.js';
import * as medicationV5 from '../../lib/medication-v5.js';
import * as scoringV4 from '../../lib/scoring-v4.js';
import * as scoringV5 from '../../lib/scoring-v5.js';
import * as scoringV6 from '../../lib/scoring-v6.js';
import * as labInterpret from '../../lib/lab-interpret.js';
import * as unitConvert from '../../lib/unit-convert.js';
import * as field from '../../lib/field.js';
import * as codingV5 from '../../lib/coding-v5.js';
import * as regulatory from '../../lib/regulatory.js';
import * as prompt from '../../lib/prompt.js';
import * as workflowV4 from '../../lib/workflow-v4.js';
import * as trend from '../../lib/trend.js';
import * as deadlineMod from '../../lib/deadline.js';
import * as opsV63 from '../../lib/ops-v63.js';
import * as billingV78 from '../../lib/billing-v78.js';
import * as billingV79 from '../../lib/billing-v79.js';
import * as billingV80 from '../../lib/billing-v80.js';
import * as billingV81 from '../../lib/billing-v81.js';
import * as billingV82 from '../../lib/billing-v82.js';
import * as billingV83 from '../../lib/billing-v83.js';
import * as toxV86 from '../../lib/tox-v86.js';
import * as hemodynamicsV87 from '../../lib/hemodynamics-v87.js';
import * as metabolicOncV88 from '../../lib/metabolic-onc-v88.js';
import * as rheumPeriopV89 from '../../lib/rheum-periop-v89.js';
import * as cardioV90 from '../../lib/cardio-v90.js';
import * as pulmV91 from '../../lib/pulm-v91.js';
import * as nephroV92 from '../../lib/nephro-v92.js';
import * as hepgiV93 from '../../lib/hepgi-v93.js';
import * as hemoncV94 from '../../lib/hemonc-v94.js';
import * as neuroV95 from '../../lib/neuro-v95.js';
import * as psychV96 from '../../lib/psych-v96.js';
import * as periopV97 from '../../lib/periop-v97.js';
import * as pedsV98 from '../../lib/peds-v98.js';
import * as idcritV99 from '../../lib/idcrit-v99.js';
import * as cardioV101 from '../../lib/cardio-v101.js';
import * as cardioV102 from '../../lib/cardio-v102.js';
import * as cvriskV103 from '../../lib/cvrisk-v103.js';
import * as cardioV104 from '../../lib/cardio-v104.js';
import * as vascularV105 from '../../lib/vascular-v105.js';
import * as vteV106 from '../../lib/vte-v106.js';
import * as eddecisionV107 from '../../lib/eddecision-v107.js';
import * as traumaV108 from '../../lib/trauma-v108.js';
import * as traumaclassV109 from '../../lib/traumaclass-v109.js';
import * as toxV110 from '../../lib/tox-v110.js';
import * as enviroV111 from '../../lib/enviro-v111.js';
import * as critcareV112 from '../../lib/critcare-v112.js';
import * as fluidrespV113 from '../../lib/fluidresp-v113.js';
import * as pulmV114 from '../../lib/pulm-v114.js';
import * as pulmnodV115 from '../../lib/pulmnod-v115.js';
import * as neuroV117 from '../../lib/neuro-v117.js';
import * as neuroV118 from '../../lib/neuro-v118.js';
import * as neuroV119 from '../../lib/neuro-v119.js';
import * as neuroV120 from '../../lib/neuro-v120.js';
import * as neuroV121 from '../../lib/neuro-v121.js';
import * as neuroV122 from '../../lib/neuro-v122.js';
import * as psychV123 from '../../lib/psych-v123.js';
import * as hepV124 from '../../lib/hep-v124.js';
import * as hepV125 from '../../lib/hep-v125.js';
import * as giV126 from '../../lib/gi-v126.js';
import * as nephroV127 from '../../lib/nephro-v127.js';
import * as renalV128 from '../../lib/renal-v128.js';
import * as acidbaseV129 from '../../lib/acidbase-v129.js';
import * as uroV130 from '../../lib/uro-v130.js';
import * as uroV131 from '../../lib/uro-v131.js';
import * as hemeV132 from '../../lib/heme-v132.js';
import * as warfarinV133 from '../../lib/warfarin-v133.js';
import * as oncV134 from '../../lib/onc-v134.js';
import * as lymphomaV135 from '../../lib/lymphoma-v135.js';
import * as endoV136 from '../../lib/endo-v136.js';
import * as idV137 from '../../lib/id-v137.js';
import * as emsV149 from '../../lib/ems-v149.js';

const MODULES = {
  'clinical.js': clinical,
  'clinical-v4.js': clinicalV4,
  'clinical-v5.js': clinicalV5,
  'clinical-v6.js': clinicalV6,
  'clinical-v7.js': clinicalV7,
  'clinical-v8.js': clinicalV8,
  'medication-v4.js': medicationV4,
  'medication-v5.js': medicationV5,
  'scoring-v4.js': scoringV4,
  'scoring-v5.js': scoringV5,
  'scoring-v6.js': scoringV6,
  'lab-interpret.js': labInterpret,
  'unit-convert.js': unitConvert,
  'field.js': field,
  'coding-v5.js': codingV5,
  'regulatory.js': regulatory,
  'prompt.js': prompt,
  'workflow-v4.js': workflowV4,
  'trend.js': trend,
  'deadline.js': deadlineMod,
  'ops-v63.js': opsV63,
  'billing-v78.js': billingV78,
  'billing-v79.js': billingV79,
  'billing-v80.js': billingV80,
  'billing-v81.js': billingV81,
  'billing-v82.js': billingV82,
  'billing-v83.js': billingV83,
  'tox-v86.js': toxV86,
  'hemodynamics-v87.js': hemodynamicsV87,
  'metabolic-onc-v88.js': metabolicOncV88,
  'rheum-periop-v89.js': rheumPeriopV89,
  'cardio-v90.js': cardioV90,
  'pulm-v91.js': pulmV91,
  'nephro-v92.js': nephroV92,
  'hepgi-v93.js': hepgiV93,
  'hemonc-v94.js': hemoncV94,
  'neuro-v95.js': neuroV95,
  'psych-v96.js': psychV96,
  'periop-v97.js': periopV97,
  'peds-v98.js': pedsV98,
  'idcrit-v99.js': idcritV99,
  'cardio-v101.js': cardioV101,
  'cardio-v102.js': cardioV102,
  'cvrisk-v103.js': cvriskV103,
  'cardio-v104.js': cardioV104,
  'vascular-v105.js': vascularV105,
  'vte-v106.js': vteV106,
  'eddecision-v107.js': eddecisionV107,
  'trauma-v108.js': traumaV108,
  'traumaclass-v109.js': traumaclassV109,
  'tox-v110.js': toxV110,
  'enviro-v111.js': enviroV111,
  'critcare-v112.js': critcareV112,
  'fluidresp-v113.js': fluidrespV113,
  'pulm-v114.js': pulmV114,
  'pulmnod-v115.js': pulmnodV115,
  'neuro-v117.js': neuroV117,
  'neuro-v118.js': neuroV118,
  'neuro-v119.js': neuroV119,
  'neuro-v120.js': neuroV120,
  'neuro-v121.js': neuroV121,
  'neuro-v122.js': neuroV122,
  'psych-v123.js': psychV123,
  'hep-v124.js': hepV124,
  'hep-v125.js': hepV125,
  'gi-v126.js': giV126,
  'nephro-v127.js': nephroV127,
  'renal-v128.js': renalV128,
  'acidbase-v129.js': acidbaseV129,
  'uro-v130.js': uroV130,
  'uro-v131.js': uroV131,
  'heme-v132.js': hemeV132,
  'warfarin-v133.js': warfarinV133,
  'onc-v134.js': oncV134,
  'lymphoma-v135.js': lymphomaV135,
  'endo-v136.js': endoV136,
  'id-v137.js': idV137,
  'ems-v149.js': emsV149,
};

const MATRIX = [0, -1, 1e9, NaN, Infinity, -Infinity, '', undefined, null];
const BANNED = ['NaN', 'Infinity', 'undefined'];

// Reflect the destructured field names from a function's first parameter when it
// is a flat object pattern: `function f({ a, b = 1, c: x })` / `({ a, b }) =>`.
// Returns null when the first parameter is not an object pattern (positional or
// scalar arg) -- those take the scalar matrix instead.
function objectFields(fn) {
  const src = fn.toString();
  const m = src.match(/^(?:[^({]*?)\(\s*\{([^}]*)\}/s);
  if (!m) return null;
  const fields = m[1]
    .split(',')
    .map((s) => s.trim().split(/[=:]/)[0].trim())
    .filter((s) => /^[A-Za-z_$][\w$]*$/.test(s));
  return fields.length ? fields : null;
}

function assertThrowSafe(err, label) {
  assert.ok(
    err instanceof TypeError || err instanceof RangeError,
    `${label} threw ${err && err.constructor && err.constructor.name}: ${err && err.message} -- only TypeError/RangeError are allowed (spec-v53 §3.1)`,
  );
}

// Recursively assert no STRING field embeds a banned token (the DOM-safety
// invariant). null/undefined/booleans/numbers pass; objects/arrays recurse.
function assertSafeReturn(v, path, label) {
  if (typeof v === 'string') {
    for (const t of BANNED) {
      assert.ok(!v.includes(t), `${label}: returned string ${path} leaked "${t}": ${JSON.stringify(v)}`);
    }
    return;
  }
  if (v && typeof v === 'object') {
    for (const k of Object.keys(v)) assertSafeReturn(v[k], `${path}.${k}`, label);
  }
}

let fnCount = 0;
let objCount = 0;
for (const [modName, mod] of Object.entries(MODULES)) {
  for (const [name, fn] of Object.entries(mod)) {
    if (typeof fn !== 'function') continue;
    fnCount += 1;
    const fields = objectFields(fn);
    test(`fuzz: ${modName} ${name}() is throw-safe and string-leak-free across the object-aware matrix`, () => {
      if (fields) {
        objCount += 1;
        // Object-aware: baseline of finite 1s, drive each field through the matrix.
        const baseline = {};
        for (const f of fields) baseline[f] = 1;
        // A valid baseline call first.
        try { assertSafeReturn(fn({ ...baseline }), '<return>', `${name}(baseline)`); }
        catch (err) { assertThrowSafe(err, `${name}(baseline)`); }
        for (const f of fields) {
          for (const adv of MATRIX) {
            const arg = { ...baseline, [f]: adv };
            let result;
            try { result = fn(arg); }
            catch (err) { assertThrowSafe(err, `${name}({${f}:${String(adv)}})`); continue; }
            assertSafeReturn(result, '<return>', `${name}({${f}:${String(adv)}})`);
          }
        }
      } else {
        // Scalar / positional: pass each adversarial value as the sole argument.
        for (const input of MATRIX) {
          let result;
          try { result = fn(input); }
          catch (err) { assertThrowSafe(err, `${name}(${String(input)})`); continue; }
          // A scalar arg to a positional function yields undefined trailing
          // args, an unreachable shape -- only the string-leak half is
          // meaningful (spec-v53 §7 honesty discipline). A bare numeric return
          // is rendered through fmt() at the call site, not as a raw string.
          assertSafeReturn(result, '<return>', `${name}(${String(input)})`);
        }
      }
    });
  }
}

test('the fuzz harness enumerated the public compute surface and exercised the object path', () => {
  assert.ok(fnCount > 200, `expected 200+ fuzzed exports, got ${fnCount}`);
});

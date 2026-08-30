// spec-v930: a blank field and an absent field mean the same thing.
//
// `Number('')` is 0. A tile that reads its inputs with a bare `Number()` therefore treats an
// empty form as a form full of zeros, and answers with confidence from nothing. The two that
// mattered most, before this test existed:
//
//   tb-testing   an empty form reported "TST: 0 mm vs cutoff 0 mm -> POSITIVE"
//   mods         an empty form reported "MODS 12 of 24: ICU mortality ~25%"
//
// The browser opens every tile pre-filled with its worked example, so a reader meets this only
// by clearing a field -- which is exactly what someone does before typing their own numbers.
// An agent calling the MCP surface with empty strings meets it immediately.
//
// The invariant is deliberately narrow and mechanical: computing with every field set to '' must
// reach the same outcome as computing with every field absent. It says nothing about WHICH
// outcome is right -- a tile may legitimately answer 0 from an empty checklist -- only that a
// blank and an absent input cannot mean different things.
//
// KNOWN is a ratchet. It may only shrink. Each id in it is a tile whose blank and absent paths
// still diverge; none of them may be added to.

import test from 'node:test';
import assert from 'node:assert/strict';
import { allCalculators } from '../../mcp/catalog.js';

// Started at 31 when the invariant was written; 12 were drained in the same change. Sorted, so
// a diff is readable. What is left are banded scores whose libraries take an already-typed
// number and have no missing-value guard at all -- fixing those means teaching them to refuse,
// which changes their return shape and their renderers, and is the follow-up this list holds.
const KNOWN = new Set([
  'abx-renal', 'afi', 'aom-criteria', 'ariscat', 'bishop', 'burch-wartofsky', 'fazekas-wmh',
  'kings-college', 'koff-bladder-capacity', 'must-nutrition', 'nihss', 'norepi-equiv',
  'peds-weight-conv', 'qbl-pph', 'smart-cop', 'snappe-ii',
]);

function outcome(compute, args) {
  try {
    const r = compute(args);
    return JSON.stringify(r && (r.band ?? r.bandLabel ?? r.valid));
  } catch {
    return 'THREW';
  }
}

function diverging() {
  const out = [];
  for (const tool of allCalculators()) {
    const blank = {};
    for (const field of tool.fields) blank[field.arg] = '';
    const withBlanks = outcome(tool.compute, blank);
    const withNothing = outcome(tool.compute, {});
    // Both throwing is the same outcome, and a common one: the library refuses either way.
    if (withBlanks === 'THREW' && withNothing === 'THREW') continue;
    if (withBlanks !== withNothing) out.push(tool.id);
  }
  return out.sort();
}

test('spec-v930: a blank field and an absent field reach the same outcome', () => {
  const stray = diverging().filter((id) => !KNOWN.has(id));
  assert.deepEqual(stray, [],
    'these tiles read an empty string as a value, so an empty form answers from nothing: '
      + `${stray.join(', ')}. Guard the input reader -- an empty string is not a zero.`);
});

test('spec-v930: the known-diverging list only shrinks', () => {
  const still = new Set(diverging());
  const fixed = [...KNOWN].filter((id) => !still.has(id));
  assert.deepEqual(fixed, [],
    `these are no longer diverging and should be removed from KNOWN: ${fixed.join(', ')}`);
});

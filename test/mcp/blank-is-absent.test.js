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
// It held for every exposed calculator from spec-v930 onward. The ledger it shipped with -- 31
// tiles that were already diverging -- was drained to zero in the same session, so there is no
// exemption list and no id may be added to one.

import test from 'node:test';
import assert from 'node:assert/strict';
import { allCalculators } from '../../mcp/catalog.js';

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

test('spec-v930: a blank field and an absent field reach the same outcome, on every tile', () => {
  const stray = diverging();
  assert.deepEqual(stray, [],
    'these tiles read an empty string as a value, so an empty form answers from nothing: '
      + `${stray.join(', ')}. Guard the input reader -- an empty string is not a zero, it is not `
      + 'a chosen option, and it does not trigger a default parameter.');
});

// spec-v931: a dose is a mass and a bag concentration is a mass per volume. Neither is
// negative. Three tiles echoed one back and converted it cleanly -- "-100 mg hydrocortisone"
// became "-25 mg prednisone", which is arithmetically consistent and clinically meaningless.
//
// Kept alongside the blank invariant because it is the same idea: a value the arithmetic
// accepts is not the same as a value the quantity admits.
test('spec-v931: no tile returns a negative dose, volume, rate or concentration', () => {
  const QUANTITY = /(dose|volume|rate|perhour|perday|infusion|drip|mg$|ml$|units?$|kcal|grams?$|vials?)/i;
  const offenders = [];
  for (const tool of allCalculators()) {
    const numeric = tool.fields.filter((f) => f.kind === 'number');
    if (!numeric.length) continue;
    for (const probe of [-1, -100]) {
      const args = {};
      for (const field of tool.fields) {
        if (field.kind === 'number') args[field.arg] = probe;
        else if (Array.isArray(field.values) && field.values.length) args[field.arg] = field.values[0];
        else if (field.kind === 'boolean' || field.kind === 'bool') args[field.arg] = true;
      }
      let result;
      try { result = tool.compute(args); } catch { continue; }
      if (!result || typeof result !== 'object' || result.valid === false) continue;
      for (const [key, value] of Object.entries(result)) {
        if (typeof value === 'number' && value < 0 && QUANTITY.test(key)) {
          offenders.push(`${tool.id}.${key} = ${value}`);
        }
      }
    }
  }
  assert.deepEqual([...new Set(offenders)], [],
    'a negative mass, volume or rate is not a quantity: ' + offenders.join(', '));
});

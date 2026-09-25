// spec-v1458: no reading prints "null", "undefined", "NaN" or "[object Object]".
//
// spec-v1457 found lvh-criteria's note printing "Cornell voltage > null mm (men)" when the sex was
// blank, and a sweep of every worked example -- plus the example with each field dropped in turn --
// found nichd-fhr labelling an uncategorized tracing "Category null". Both were template strings
// interpolating a value that is null exactly when an input is missing. This gate runs that sweep:
// ~8,400 library calls across the catalog.
//
// Two tools use the words in their ordinary sense and are allowed by the exact phrase, not by id.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { allCalculators } from '../../mcp/catalog.js';
import { META } from '../../lib/meta.js';

const BAD = /\b(null|undefined|NaN)\b|\[object Object\]/;
const PROSE = [/NNT undefined/, /deliberately left undefined/];

function texts(v, out = []) {
  if (typeof v === 'string') out.push(v);
  else if (Array.isArray(v)) v.forEach((x) => texts(x, out));
  else if (v && typeof v === 'object') Object.values(v).forEach((x) => texts(x, out));
  return out;
}

test('no worked example, or example with one field dropped, prints null/undefined/NaN', () => {
  const offenders = [];
  let runs = 0;
  for (const tool of allCalculators()) {
    const ex = META[tool.id]?.example?.fields;
    if (!ex) continue;
    const args = {};
    for (const f of tool.fields || []) if (ex[f.dom] !== undefined) args[f.arg] = ex[f.dom];
    const variants = [['example', args]];
    for (const f of tool.fields || []) {
      if (args[f.arg] === undefined) continue;
      const a = { ...args };
      delete a[f.arg];
      variants.push([`drop ${f.arg}`, a]);
    }
    for (const [name, a] of variants) {
      let r;
      try { r = tool.compute(a); } catch { continue; }
      runs += 1;
      for (const t of texts(r)) {
        if (BAD.test(t) && !PROSE.some((p) => p.test(t))) {
          offenders.push(`${tool.id} (${name}): ${t.slice(0, 120)}`);
          break;
        }
      }
    }
  }
  assert.ok(runs > 5000, `the sweep reached only ${runs} runs`);
  assert.deepEqual(offenders, []);
});

// spec-v1726: a fraction of a billed unit, minute or administration is refused by
// name, not rounded (owner decision 2026-11-15). scripts/probe-fraction-rounded.mjs
// listed these after spec-v1722; the views also rounded before calling the library.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { META } from '../../lib/meta.js';
import { REGISTRY } from '../../mcp/catalog.js';

const ROWS = [
  ['mue-check', 'mue-units'], ['mue-check', 'mue-value'],
  ['rvu-payment', 'rvu-units'],
  ['site-of-care-compare', 'soc-n'],
  ['bi-summary', 'bi-n'],
  ['dose-calendar', 'dc-count'],
  ['therapy-units', 'tu-total'],
  ['critical-care-time', 'cc-total'], ['critical-care-time', 'cc-proc'],
  ['prolonged-services', 'ps-min'],
];

const said = (e, inputs) => {
  try {
    const r = e.compute(e.toArgs(inputs));
    return r && r.valid === false ? { refused: r.message } : { ok: r };
  } catch (err) { return { refused: err.message }; }
};

for (const [id, dom] of ROWS) {
  test(`${id} ${dom}: a fraction is refused, the whole number still answers`, () => {
    const e = REGISTRY.get(id);
    const ex = META[id].example.fields;
    const x = Number(ex[dom]);
    assert.ok(Number.isInteger(x), `${id} ${dom} example is whole`);
    assert.ok(said(e, ex).ok, `${id} example still answers`);
    const r = said(e, { ...ex, [dom]: String(x + 0.5) });
    assert.match(r.refused || '', /must be a whole number\. Check the value entered\.$/, `${id} ${dom} = ${x + 0.5}`);
  });
}

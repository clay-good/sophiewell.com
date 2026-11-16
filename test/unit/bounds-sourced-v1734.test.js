// spec-v1734: sourced envelopes for triglycerides, ALT and AST (lib/bounds.js),
// applied to the spec-v1731 rows that were waiting for them.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BOUNDS, boundsAdvisory } from '../../lib/bounds.js';
import { META } from '../../lib/meta.js';
import { REGISTRY } from '../../mcp/catalog.js';

test('the new envelopes sit above the highest values reported', () => {
  assert.ok(BOUNDS.triglycerides.max > 22228, 'highest reported triglyceride, 22,228 mg/dL');
  assert.ok(BOUNDS.ast.max > 15500 && BOUNDS.alt.max > 11600, 'reported AST 15,500 / ALT 11,600 U/L');
  assert.equal(boundsAdvisory('triglycerides', 22228), null);
  assert.equal(boundsAdvisory('ast', 15500), null);
  assert.match(boundsAdvisory('alt', 999999), /ALT/);
});

const said = (id, over) => {
  const e = REGISTRY.get(id);
  const r = e.compute(e.toArgs({ ...META[id].example.fields, ...over }));
  return r && r.valid === false ? { refused: String(r.message || r.band) } : { ok: r };
};

for (const [id, dom, real] of [['tyg-index', 'tyg-tg', '22000'], ['metabolic-syndrome', 'ms-tg', '22000'], ['hepatic-steatosis-index', 'hs-alt', '15000'], ['hepatic-steatosis-index', 'hs-ast', '15000']]) {
  test(`${id} ${dom}: an impossible value is refused, a reported extreme is not`, () => {
    assert.ok(said(id, {}).ok, 'example answers');
    assert.match(said(id, { [dom]: '999999' }).refused || '', /plausible range/);
    assert.ok(said(id, { [dom]: real }).ok, `${real} still answers`);
  });
}

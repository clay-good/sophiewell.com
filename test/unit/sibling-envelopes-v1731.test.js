// spec-v1731: probe-unguarded-sibling's 45 functions, driven with an impossible
// value. Where lib/bounds.js already declares an envelope for the quantity (or a
// bound follows by definition), the tile now refuses instead of answering.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { META } from '../../lib/meta.js';
import { REGISTRY } from '../../mcp/catalog.js';

const said = (id, over) => {
  const e = REGISTRY.get(id);
  try {
    const r = e.compute(e.toArgs({ ...META[id].example.fields, ...over }));
    return r && r.valid === false ? { refused: String(r.message || r.band) } : { ok: r };
  } catch (err) { return { refused: err.message }; }
};

const ROWS = [
  // existing envelopes
  ['bode-index', 'bo-bmi', /body mass index/],
  ['homa-ir', 'hir-glucose', /serum glucose/],
  ['hepatic-steatosis-index', 'hs-bmi', /body mass index/],
  ['clif-c-aclf', 'cl-age', /age/],
  ['clif-c-aclf', 'cl-wbc', /white blood cell count/],
  ['surgical-apgar', 'sa-hr', /heart rate/],
  ['hemodynamic-suite', 'hs-hr', /heart rate/],
  ['mechanical-power', 'mp-rr', /respiratory rate/],
  ['iom-gwg', 'ig-wt', /pre-pregnancy weight must be between 0\.44 and 1,102 lb/], // spec-v1762: floor 0.2 kg
  ['iom-gwg', 'ig-ht', /height must be between 17\.7 and 98\.4 inches/],
  // bounds that follow by definition
  ['cardiac-power-output', 'cp-map', /mean arterial pressure in mmHg must be between 5 and 300/],
  ['hemodynamic-suite', 'hs-map', /mean arterial pressure in mmHg must be between 5 and 300/],
  ['surgical-apgar', 'sa-map', /lowest mean arterial pressure in mmHg must be between 5 and 300/],
  ['das28', 'da-tjc', /tender joint count must be between 0 and 28/],
  ['das28', 'da-sjc', /swollen joint count must be between 0 and 28/],
  ['das28', 'da-gh', /patient global assessment must be between 0 and 100/],
];

for (const [id, dom, said_] of ROWS) {
  test(`${id} ${dom}: an impossible value is refused`, () => {
    assert.ok(said(id, {}).ok, `${id} example still answers`);
    const r = said(id, { [dom]: '999999' });
    assert.ok(r.refused, `${id} ${dom} refused`);
    assert.match(r.refused, said_);
  });
}

test('homa-ir checks glucose in mmol/L against the mg/dL envelope after converting', () => {
  // 30 mmol/L is 540 mg/dL: inside the envelope, so it must still answer.
  assert.ok(said('homa-ir', { 'hir-glucose': '30', 'hir-unit': 'mmol' }).ok);
});

test('das28 refuses a fractional joint count (it used to clamp 999999 to 28)', () => {
  assert.match(said('das28', { 'da-tjc': '4.5' }).refused || '', /whole number/);
});

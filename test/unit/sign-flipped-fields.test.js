// spec-v1728: an optional value entered with an impossible sign is refused by
// name, not dropped as "not entered". Found by scripts/probe-sign-flipped.mjs;
// the page rows were confirmed by test/integration/entered-asked-for-probe.spec.js.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { META } from '../../lib/meta.js';
import { REGISTRY } from '../../mcp/catalog.js';
import { validateInputs } from '../../mcp/fields.js';

const said = (e, inputs) => {
  try {
    const r = e.compute(e.toArgs(inputs));
    if (r == null) return { blank: true };
    return r.valid === false ? { refused: String(r.message || r.band || '') } : { ok: r };
  } catch (err) { return { refused: err.message }; }
};

// The library refuses these itself, on the page's path.
const LIBRARY = [
  ['ckd-epi-cystatin', 'cc-cr'],
  ['ecmo-titration', 'ec-pco'], ['ecmo-titration', 'ec-tgt'], ['ecmo-titration', 'ec-hb'], ['ecmo-titration', 'ec-sat'],
  ['ktv-urr', 'kt-uf'], ['ktv-urr', 'kt-time'], ['ktv-urr', 'kt-wt'],
  ['midas', 'mi-freq'],
  ['preg-dating', 'pd-crl'],
  ['vasopressor', 'vp-dose'], ['vasopressor', 'vp-rate'],
];

for (const [id, dom] of LIBRARY) {
  test(`${id} ${dom}: a negative entry is refused, not read as blank`, () => {
    const e = REGISTRY.get(id);
    const ex = META[id].example.fields;
    const x = Number(ex[dom]);
    assert.ok(x > 0, `${id} ${dom} example is positive`);
    assert.ok(said(e, ex).ok, `${id} example still answers`);
    const r = said(e, { ...ex, [dom]: String(-x) });
    assert.ok(r.refused, `${id} ${dom} = ${-x} refused`);
    assert.match(r.refused, /Check the value entered\.$/);
  });
}

test('midas refuses a day count above the three months it asks about, instead of clamping to 92', () => {
  const e = REGISTRY.get('midas');
  const r = said(e, { ...META.midas.example.fields, 'mi-q1': '120' });
  assert.match(r.refused || '', /Q1\) must be between 0 and 92\. Check the value entered\.$/);
});

test('preg-dating refuses a CRL outside the dating range, and a blank CRL is still optional', () => {
  const e = REGISTRY.get('preg-dating');
  const ex = META['preg-dating'].example.fields;
  assert.match(said(e, { ...ex, 'pd-crl': '150' }).refused || '', /between 1 and 120 mm/);
  assert.ok(said(e, { ...ex, 'pd-crl': '' }).ok);
});

// The agent layer fences these with the field's declared min (the page's own
// range warning already covered them).
const ADAPTER = [
  ['abi', 'abi-ra'], ['abi', 'abi-la'], ['abi', 'abi-rb'], ['abi', 'abi-lb'],
  ['diagnostic-2x2', 'dx-prev'], ['kings-college', 'kc-inr'], ['kings-college', 'kc-cr'],
  ['modified-marshall', 'mm-fio2'], ['modified-marshall', 'mm-creat'], ['o2-cylinder-duration', 'o2-flow'],
  ['phoenix-sepsis', 'phx-ratio'], ['phoenix-sepsis', 'phx-vaso'], ['phoenix-sepsis', 'phx-map'],
  ['pk-suite', 'pk-vd'], ['pk-suite', 'pk-cl'], ['pk-suite', 'pk-cp'], ['pk-suite', 'pk-tau'],
  ['udca-response', 'ur-baselinealp'],
];

for (const [id, dom] of ADAPTER) {
  test(`${id} ${dom}: agents are refused a negative value`, () => {
    const e = REGISTRY.get(id);
    const ex = META[id].example.fields;
    assert.equal(validateInputs(ex, e.fields).valid, true, `${id} example validates`);
    const v = validateInputs({ ...ex, [dom]: String(-Number(ex[dom])) }, e.fields);
    assert.equal(v.valid, false);
    assert.equal(v.code, 'OUT_OF_RANGE');
    // spec-v1729: ABI's pressures take the page's own floor of 20 mmHg (lib/bounds.js).
    assert.match(v.message, new RegExp(`must be at least ${id === 'abi' ? 20 : 0}; got -`));
  });
}

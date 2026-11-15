// spec-v1722: a fraction typed into an item or count field is refused by name,
// not rounded to a neighbor. The house number input is step="any", so the page
// passes 1.49 to the library; `Math.round` used to score it as 1 without a word.
// Found by scripts/probe-fraction-rounded.mjs, confirmed on the page by
// test/integration/fraction-rounded-probe.spec.js.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { wholeFault, gradeFault } from '../../lib/num.js';
import { META } from '../../lib/meta.js';
import { REGISTRY } from '../../mcp/catalog.js';

test('wholeFault: refuses a fraction, skips blanks, booleans, and whole numbers', () => {
  assert.equal(wholeFault([['the count', 2]]), null);
  assert.equal(wholeFault([['the count', '3']]), null);
  assert.equal(wholeFault([['the count', '']]), null);
  assert.equal(wholeFault([['the count', null]]), null);
  assert.equal(wholeFault([['the count', true]]), null);
  assert.equal(wholeFault([['the count', 'abc']]), null);
  assert.equal(wholeFault([['the count', '2.5']]), 'The count must be a whole number. Check the value entered.');
});

test('gradeFault: the fifth element adds the whole-number rule after the range', () => {
  assert.equal(gradeFault([['the item', 1.5, 0, 2]]), null);
  assert.match(gradeFault([['the item', 1.5, 0, 2, true]]), /whole number/);
  assert.match(gradeFault([['the item', 9.5, 0, 2, true]]), /between 0 and 2/);
});

// Every row the probe confirmed on the page, through the page's own path
// (compute(toArgs(example with the field set to x + 0.49))).
const ROWS = {
  epworth: ['ep-read'],
  'white-song': ['ws-loc'],
  'esas-symptom-assessment': ['esas-pain', 'esas-wellbeing'],
  'isth-bat': ['isth-epistaxis'],
  'mmt8-myositis': ['mm-neck'],
  niss: ['ni-a1', 'ni-a3'],
  ihs4: ['ihs4-nod'],
  'cdai-crohns': ['cd-stools', 'cd-comp'],
  'harvey-bradshaw': ['hb-stools', 'hb-cx'],
  'harris-hip-score': ['hh-pain', 'hh-rom'],
  'intubation-difficulty-scale': ['ids-attempts'],
  'lis-murray': ['lm-quad'],
  'mb-later-score': ['mbl-type'],
  'durie-salmon': ['ds-lesions'],
  'groningen-frailty-indicator': ['gfi-count'],
  'gcs-pupils': ['gp-gcs'],
  'heart-pathway': ['hp-heart'],
  'roland-morris-disability': ['rmdq-count'],
  'tinetti-poma': ['poma-balance', 'poma-gait'],
  uas7: ['uas-wheal'],
  'pbac-hmb': ['pb-lp'],
  'sits-sich': ['sits-nihss'],
  'astral-score': ['ast-nihss'],
};

for (const [id, doms] of Object.entries(ROWS)) {
  test(`${id}: a fraction is refused, the whole number still scores`, () => {
    const e = REGISTRY.get(id);
    const ex = META[id].example.fields;
    for (const dom of doms) {
      const f = e.fields.find((g) => g.dom === dom);
      let x = Number(ex[dom]);
      assert.ok(Number.isInteger(x), `${id} ${dom} example is whole`);
      if (Number.isFinite(f.max) && x + 1 > f.max) x -= 1;   // top of the scale: ask one step down
      const whole = e.compute(e.toArgs({ ...ex, [dom]: String(x) }));
      assert.notEqual(whole.valid, false, `${id} ${dom} = ${x} still scores`);
      const frac = e.compute(e.toArgs({ ...ex, [dom]: String(x + 0.49) }));
      assert.equal(frac.valid, false, `${id} ${dom} = ${x + 0.49} is refused`);
      const said = frac.message || frac.band || frac.text;
      assert.match(said, /must be a whole number\. Check the value entered\.$/, `${id} ${dom} says why`);
    }
  });
}

// The out-of-range companions fixed alongside: each used to read an impossible
// value as 0 (or as "not entered"), and now refuses it by name.
test('out-of-range values these helpers used to swallow are refused', () => {
  const cases = [
    ['groningen-frailty-indicator', 'gfi-count', '16'],
    ['roland-morris-disability', 'rmdq-count', '25'],
    ['esas-symptom-assessment', 'esas-pain', '11'],
    ['harris-hip-score', 'hh-pain', '45'],
    ['heart-pathway', 'hp-heart', '11'],
    ['uas7', 'uas-wheal', '22'],
    ['tinetti-poma', 'poma-balance', '99'],
  ];
  for (const [id, dom, v] of cases) {
    const e = REGISTRY.get(id);
    const r = e.compute(e.toArgs({ ...META[id].example.fields, [dom]: v }));
    assert.equal(r.valid, false, `${id} ${dom} = ${v}`);
    assert.match(r.message || r.band, /must be between .* Check the value entered\.$/, `${id} ${dom}`);
  }
});

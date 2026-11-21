// spec-v1766: a value INSIDE a lib/bounds.js envelope that a tool still refused with a narrower
// cap of its own (scripts/probe-envelope-inside.mjs). The caps below were plain copies of older
// limits and now read the envelope. Each row drives a value between the old cap and the envelope
// and checks the tool answers; the next test checks the envelope still refuses just past it.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { computeCalculator } from '../../mcp/tools.js';
import { META } from '../../lib/meta.js';

const run = (id, over) => computeCalculator({ id, inputs: { ...META[id].example.fields, ...over } });

// [tool id, the field driven, a value past the old cap, old cap, other fields the case needs]
const ROWS = [
  ['sodium-correction', 'na', '205', 200],
  ['sodium-correction', 'na', '88', 90],
  ['free-water-deficit', 'na', '205', 200],
  ['corrected-anion-gap', 'na', '205', 200],
  ['corrected-anion-gap', 'na', '88', 100, { cl: '60', hco3: '20' }],
  ['corrected-anion-gap', 'hco3', '70', 60, { na: '205', cl: '100' }],
  ['kdigo-aki', 'base', '25', 20, { cur: '70' }],
  ['kdigo-aki', 'cur', '70', 30],
  ['abcd2', 'sbp', '450', 300],
  ['abcd2', 'sbp', '25', 30, { dbp: '15' }],
  ['abcd2', 'dbp', '350', 200, { sbp: '450' }],
  ['abcd2', 'dbp', '7', 10, { sbp: '25' }],
  ['ldl-calc', 'ldl-tg', '5', 10],
  ['ttkg', 'ttkg-pk', '12', 10],
  ['acid-base-deficit', 'abd-mhco3', '60', 50],
  ['acid-base-deficit', 'abd-mna', '205', 200],
  ['acid-base-deficit', 'abd-mna', '88', 90],
  ['oasis', 'oasis-temp', '46.5', 45],
  ['oasis', 'oasis-temp', '14', 20],
  ['delta-gap', 'dg-hco3', '70', 60, { 'dg-na': '200', 'dg-cl': '100' }],
  ['rems', 'rems-hr', '400', 350],
  ['cart-score', 'cart-hr', '400', 350],
  ['cart-score', 'cart-dbp', '300', 200],
  ['rate-pressure-product', 'rpp-hr', '580', 350, { 'rpp-sbp': '480' }],
  ['rate-pressure-product', 'rpp-sbp', '480', 320],
  ['rate-pressure-product', 'rpp-sbp', '25', 30],
  ['crop-index', 'crop-pao2', '15', 20],
  ['crop-index', 'crop-paco2', '200', 150, { 'crop-fio2': '1' }],
  ['crop-index', 'crop-paco2', '7', 10],
  ['iss-rts', 'ir-sbp', '450', 300],
  ['dka-resolution', 'dr-glucosemgdl', '2500', 2000],
  ['dka-resolution', 'dr-bicarbonate', '70', 60],
  ['dka-resolution', 'dr-venousph', '6.4', 6.5],
  ['action-icu-score', 'aic-hr', '450', 400],
  ['action-icu-score', 'aic-sbp', '450', 400],
  ['batt', 'batt-sbp', '450', 400],
  ['ets', 'ets-sbp', '450', 400],
  ['renal-failure-index', 'rfi-pcr', '50', 30],
  ['feua', 'feua-scr', '40', 30, { 'feua-ucr': '500' }],
  ['tyg-bmi', 'tygbmi-tg', '3', 5],
  ['tyg-bmi', 'tygbmi-glucose', '2500', 2000],
  ['mitral-stenosis-stage', 'mvs-hr', '300', 250],
  ['mitral-stenosis-stage', 'mvs-hr', '15', 20],
  ['compartment-delta-pressure', 'comp-dia', '300', 250],
  ['scai-shock', 'scai-lactate', '45', 40],
  ['spise', 'spise-tg', '5', 10],
  ['rpr', 'rpr-plt', '3000', 2000],
  ['erez-dic', 'erez-platelets', '3000', 2000],
  ['furst-ratio', 'furst-sna', '205', 200],
  ['gastric-emptying-scintigraphy', 'ges-glu', '2500', 1500],
  ['mra-potassium-dose-check', 'mra-k', '12', 10],
  ['iv-phosphate-order-check', 'ip-k', '13', 12],
];

for (const [id, field, value, oldCap, extra = {}] of ROWS) {
  test(`spec-v1766 ${id}: ${field} ${value} (past the old cap of ${oldCap}) now answers`, () => {
    const r = run(id, { ...extra, [field]: value });
    assert.equal(r.valid, true, `${id} ${field}=${value}: ${r.message}`);
  });
}

// [tool id, the field, a value just past the envelope, other fields]
const PAST = [
  ['sodium-correction', 'na', '211'],
  ['kdigo-aki', 'cur', '76'],
  ['abcd2', 'sbp', '501'],
  ['ttkg', 'ttkg-pk', '16'],
  ['oasis', 'oasis-temp', '48'],
  ['rems', 'rems-hr', '601'],
  ['rate-pressure-product', 'rpp-sbp', '501'],
  ['crop-index', 'crop-paco2', '251'],
  ['iss-rts', 'ir-sbp', '501'],
  ['dka-resolution', 'dr-venousph', '6.2'],
  ['action-icu-score', 'aic-hr', '601'],
  ['renal-failure-index', 'rfi-pcr', '76'],
  ['tyg-bmi', 'tygbmi-glucose', '3001'],
  ['mitral-stenosis-stage', 'mvs-hr', '601'],
  ['compartment-delta-pressure', 'comp-dia', '401'],
  ['scai-shock', 'scai-lactate', '51'],
  ['rpr', 'rpr-plt', '4001'],
  ['erez-dic', 'erez-platelets', '4001'],
  ['furst-ratio', 'furst-sna', '211'],
  ['gastric-emptying-scintigraphy', 'ges-glu', '3001'],
  ['mra-potassium-dose-check', 'mra-k', '16'],
  ['iv-phosphate-order-check', 'ip-k', '16'],
];

for (const [id, field, value, extra = {}] of PAST) {
  test(`spec-v1766 ${id}: ${field} ${value} (past the envelope) is still refused`, () => {
    const r = run(id, { ...extra, [field]: value });
    assert.equal(r.valid, false, `${id} ${field}=${value} answered`);
  });
}

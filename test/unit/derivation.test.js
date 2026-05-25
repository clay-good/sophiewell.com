// spec-v48: derivation renderer + per-tile derivation schema tests.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { META } from '../../lib/meta.js';
import { wellsPe, gcs, wellsDvt, chadsVasc, hasBled } from '../../lib/clinical.js';
import { qsofa, timi, heart, perc } from '../../lib/scoring-v4.js';

// --- 1. Schema completeness ---------------------------------------------

const REQUIRED_FIELDS = ['formula', 'population', 'units', 'validity', 'source'];
const WAVE_48_1A_TILES = ['wells-pe', 'gcs', 'qsofa-sofa'];
const WAVE_48_1B_TILES = ['wells-dvt', 'chads', 'hasbled', 'perc', 'timi', 'heart'];
const ALL_DERIVATION_TILES = [...WAVE_48_1A_TILES, ...WAVE_48_1B_TILES];

for (const id of ALL_DERIVATION_TILES) {
  test(`derivation schema: ${id} has all required fields`, () => {
    const d = META[id].derivation;
    assert.ok(d, `${id} must have derivation`);
    for (const k of REQUIRED_FIELDS) {
      assert.ok(d[k] !== undefined && d[k] !== null, `${id}.derivation.${k} present`);
    }
    assert.equal(typeof d.formula, 'string');
    assert.equal(typeof d.population, 'string');
    assert.equal(typeof d.validity, 'string');
    assert.equal(typeof d.source, 'string');
    assert.equal(typeof d.units, 'object');
  });
}

for (const id of ALL_DERIVATION_TILES) {
  test(`derivation schema: ${id} units key set covers every component input`, () => {
    const d = META[id].derivation;
    if (!Array.isArray(d.components)) return;
    for (const c of d.components) {
      assert.ok(d.units[c.inputKey], `${id}.derivation.units missing key ${c.inputKey}`);
    }
  });
}

// --- 2. Components sum -- additive scoring must reproduce the score -----

test('wells-pe components sum equals wellsPe() computed total (zero case)', () => {
  const inputs = {
    clinicalDvtSigns: false, peLikely: false, hrOver100: false,
    immobilizationOrSurgery: false, priorPeOrDvt: false,
    hemoptysis: false, malignancy: false,
  };
  const r = wellsPe(inputs);
  const sum = META['wells-pe'].derivation.components.reduce((acc, c) => {
    return acc + (inputs[c.inputKey] ? c.points : 0);
  }, 0);
  assert.equal(sum, r.total);
  assert.equal(sum, 0);
});

test('wells-pe components sum equals wellsPe() computed total (mid case 4.5)', () => {
  const inputs = {
    clinicalDvtSigns: false, peLikely: true, hrOver100: true,
    immobilizationOrSurgery: false, priorPeOrDvt: false,
    hemoptysis: false, malignancy: false,
  };
  const r = wellsPe(inputs);
  const sum = META['wells-pe'].derivation.components.reduce((acc, c) => {
    return acc + (inputs[c.inputKey] ? c.points : 0);
  }, 0);
  assert.equal(sum, r.total);
  assert.equal(sum, 4.5);
});

test('wells-pe components sum equals wellsPe() computed total (all true, 12.5)', () => {
  const inputs = {
    clinicalDvtSigns: true, peLikely: true, hrOver100: true,
    immobilizationOrSurgery: true, priorPeOrDvt: true,
    hemoptysis: true, malignancy: true,
  };
  const r = wellsPe(inputs);
  const sum = META['wells-pe'].derivation.components.reduce((acc, c) => {
    return acc + (inputs[c.inputKey] ? c.points : 0);
  }, 0);
  assert.equal(sum, r.total);
  assert.equal(sum, 12.5);
});

test('gcs components sum equals gcs() computed total (worked example 3+4+5=12)', () => {
  const inputs = { eye: 3, verbal: 4, motor: 5 };
  const r = gcs(inputs);
  const sum = META.gcs.derivation.components.reduce((acc, c) => acc + c.points(inputs[c.inputKey]), 0);
  assert.equal(sum, r.total);
  assert.equal(sum, 12);
});

test('gcs components sum equals gcs() computed total (best, 4+5+6=15)', () => {
  const inputs = { eye: 4, verbal: 5, motor: 6 };
  const r = gcs(inputs);
  const sum = META.gcs.derivation.components.reduce((acc, c) => acc + c.points(inputs[c.inputKey]), 0);
  assert.equal(sum, r.total);
  assert.equal(sum, 15);
});

test('gcs components sum equals gcs() computed total (worst, 1+1+1=3)', () => {
  const inputs = { eye: 1, verbal: 1, motor: 1 };
  const r = gcs(inputs);
  const sum = META.gcs.derivation.components.reduce((acc, c) => acc + c.points(inputs[c.inputKey]), 0);
  assert.equal(sum, r.total);
  assert.equal(sum, 3);
});

test('qsofa components sum equals qsofa() computed score (positive screen 2/3)', () => {
  const inputs = { rr22: true, alteredMental: true, sbp100: false };
  const r = qsofa(inputs);
  const sum = META['qsofa-sofa'].derivation.components.reduce((acc, c) => {
    return acc + (inputs[c.inputKey] ? c.points : 0);
  }, 0);
  assert.equal(sum, r.score);
  assert.equal(sum, 2);
});

test('qsofa components sum equals qsofa() computed score (negative 0/3)', () => {
  const inputs = { rr22: false, alteredMental: false, sbp100: false };
  const r = qsofa(inputs);
  const sum = META['qsofa-sofa'].derivation.components.reduce((acc, c) => {
    return acc + (inputs[c.inputKey] ? c.points : 0);
  }, 0);
  assert.equal(sum, r.score);
  assert.equal(sum, 0);
});

// --- 3. Bands cover the achievable range --------------------------------

test('wells-pe bands cover the two-tier dichotomy (>4 vs <=4)', () => {
  const bands = META['wells-pe'].derivation.bands;
  assert.equal(bands.length, 2);
  const labels = bands.map((b) => b.label).join('|');
  assert.match(labels, /unlikely/);
  assert.match(labels, /likely/);
});

test('gcs bands cover 3-15 contiguously', () => {
  const bands = META.gcs.derivation.bands;
  const ranges = bands.map((b) => b.range).sort((a, b) => a[0] - b[0]);
  assert.equal(ranges[0][0], 3);
  assert.equal(ranges[ranges.length - 1][1], 15);
});

test('qsofa-sofa bands cover the 0-1 vs 2-3 split', () => {
  const bands = META['qsofa-sofa'].derivation.bands;
  assert.equal(bands.length, 2);
  assert.deepEqual(bands[0].range, [0, 1]);
  assert.deepEqual(bands[1].range, [2, 3]);
});

// --- Wave 48-1b: components-sum-equals-score for the 6 additive tiles ---

function sumComponents(meta, inputs) {
  return meta.derivation.components.reduce((acc, c) => {
    const v = inputs[c.inputKey];
    if (typeof c.points === 'function') return acc + (Number(c.points(v)) || 0);
    if (v) return acc + c.points;
    return acc;
  }, 0);
}

test('wells-dvt components sum equals wellsDvt() (zero case)', () => {
  const inputs = {
    activeCancer: false, paralysis: false, recentBedrest: false,
    tendernessAlongVeins: false, entireLegSwollen: false,
    calfSwellingGt3cm: false, pittingEdema: false,
    collateralVeins: false, priorDvt: false, alternativeDxAsLikely: false,
  };
  assert.equal(sumComponents(META['wells-dvt'], inputs), wellsDvt(inputs).total);
});

test('wells-dvt components sum equals wellsDvt() (high case, 3 positive)', () => {
  const inputs = {
    activeCancer: false, paralysis: false, recentBedrest: false,
    tendernessAlongVeins: true, entireLegSwollen: true,
    calfSwellingGt3cm: true, pittingEdema: false,
    collateralVeins: false, priorDvt: false, alternativeDxAsLikely: false,
  };
  const r = wellsDvt(inputs);
  assert.equal(sumComponents(META['wells-dvt'], inputs), r.total);
  assert.equal(r.total, 3);
});

test('wells-dvt components sum honors the -2 subtractive criterion', () => {
  const inputs = {
    activeCancer: true, paralysis: true, recentBedrest: false,
    tendernessAlongVeins: false, entireLegSwollen: false,
    calfSwellingGt3cm: false, pittingEdema: false,
    collateralVeins: false, priorDvt: false, alternativeDxAsLikely: true,
  };
  // 1 + 1 + (-2) = 0
  assert.equal(sumComponents(META['wells-dvt'], inputs), wellsDvt(inputs).total);
  assert.equal(wellsDvt(inputs).total, 0);
});

test('chads (CHA2DS2-VASc) components sum equals chadsVasc() (zero)', () => {
  const inputs = {
    chf: false, hypertension: false, ageGte75: false, diabetes: false,
    strokeOrTia: false, vascularDisease: false, ageGte65: false, female: false,
  };
  assert.equal(sumComponents(META.chads, inputs), chadsVasc(inputs).total);
});

test('chads components sum equals chadsVasc() (worked example 3)', () => {
  const inputs = {
    chf: false, hypertension: true, ageGte75: false, diabetes: true,
    strokeOrTia: false, vascularDisease: false, ageGte65: true, female: false,
  };
  // 1 + 1 + 1 = 3
  assert.equal(sumComponents(META.chads, inputs), chadsVasc(inputs).total);
  assert.equal(chadsVasc(inputs).total, 3);
});

test('chads components sum equals chadsVasc() (max with both 2-point items)', () => {
  const inputs = {
    chf: true, hypertension: true, ageGte75: true, diabetes: true,
    strokeOrTia: true, vascularDisease: true, ageGte65: true, female: true,
  };
  // 1 + 1 + 2 + 1 + 2 + 1 + 1 + 1 = 10
  assert.equal(sumComponents(META.chads, inputs), chadsVasc(inputs).total);
  assert.equal(chadsVasc(inputs).total, 10);
});

test('hasbled components sum equals hasBled() (worked example 2)', () => {
  const inputs = {
    hypertension: true, abnormalRenal: false, abnormalLiver: false,
    stroke: false, bleedingHistory: false, labileInr: false,
    ageGt65: true, drugs: false, alcohol: false,
  };
  const r = hasBled(inputs);
  assert.equal(sumComponents(META.hasbled, inputs), r.total);
  assert.equal(r.total, 2);
});

test('hasbled components sum equals hasBled() (high, 4)', () => {
  const inputs = {
    hypertension: true, abnormalRenal: false, abnormalLiver: false,
    stroke: true, bleedingHistory: true, labileInr: false,
    ageGt65: true, drugs: false, alcohol: false,
  };
  const r = hasBled(inputs);
  assert.equal(sumComponents(META.hasbled, inputs), r.total);
  assert.equal(r.total, 4);
});

test('perc components sum equals perc().score (negative 0)', () => {
  const inputs = {
    age50: false, hr100: false, sao2lt95: false, hemoptysis: false,
    estrogen: false, priorVte: false, recentSurgery: false, unilateralLegSwelling: false,
  };
  assert.equal(sumComponents(META.perc, inputs), perc(inputs).score);
});

test('perc components sum equals perc().score (1 positive feature)', () => {
  const inputs = {
    age50: true, hr100: false, sao2lt95: false, hemoptysis: false,
    estrogen: false, priorVte: false, recentSurgery: false, unilateralLegSwelling: false,
  };
  const r = perc(inputs);
  assert.equal(sumComponents(META.perc, inputs), r.score);
  assert.equal(r.score, 1);
});

test('timi components sum equals timi().score (3, intermediate)', () => {
  const inputs = {
    age65: true, threeRiskFactors: true, knownCad50pct: false, asaPast7Days: true,
    severeAngina: false, stDeviation: false, elevatedMarkers: false,
  };
  const r = timi(inputs);
  assert.equal(sumComponents(META.timi, inputs), r.score);
  assert.equal(r.score, 3);
});

test('timi components sum equals timi().score (max 7)', () => {
  const inputs = {
    age65: true, threeRiskFactors: true, knownCad50pct: true, asaPast7Days: true,
    severeAngina: true, stDeviation: true, elevatedMarkers: true,
  };
  const r = timi(inputs);
  assert.equal(sumComponents(META.timi, inputs), r.score);
  assert.equal(r.score, 7);
});

test('heart components sum equals heart().score (worked 0+1+0+1+0=2... wait, low 3)', () => {
  // Recreate the META example: h-hist=1, h-ekg=0, h-age=1, h-rf=1, h-trop=0 -> 3 (low)
  const inputs = { history: 1, ekg: 0, age: 1, riskFactors: 1, troponin: 0 };
  const r = heart(inputs);
  assert.equal(sumComponents(META.heart, inputs), r.score);
  assert.equal(r.score, 3);
});

test('heart components sum equals heart().score (high 10)', () => {
  const inputs = { history: 2, ekg: 2, age: 2, riskFactors: 2, troponin: 2 };
  const r = heart(inputs);
  assert.equal(sumComponents(META.heart, inputs), r.score);
  assert.equal(r.score, 10);
});

test('heart components clamp out-of-range values to 0-2', () => {
  const inputs = { history: 5, ekg: -1, age: 1, riskFactors: 99, troponin: 2 };
  // clamps: 2 + 0 + 1 + 2 + 2 = 7
  const r = heart(inputs);
  assert.equal(sumComponents(META.heart, inputs), r.score);
  assert.equal(r.score, 7);
});

// --- 4. Renderer behavior (jsdom-free smoke via stub) -------------------
// renderDerivation/updateDerivationSteps need a DOM. The full UI assertion
// happens in the Playwright e2e suite. Here we just assert the validation
// path: omitting a required field throws.

test('renderDerivation throws on a malformed derivation block', async () => {
  // Provide a minimal stub document since lib/dom.js calls document.createElement.
  const originalDocument = globalThis.document;
  const elements = [];
  globalThis.document = {
    createElement(tag) {
      const node = {
        tag, children: [], attrs: {},
        appendChild(c) { this.children.push(c); return c; },
        setAttribute(k, v) { this.attrs[k] = v; },
        get textContent() { return this._text || ''; },
        set textContent(v) { this._text = v; },
        querySelector() { return null; },
      };
      elements.push(node);
      return node;
    },
    createTextNode(s) { return { text: String(s) }; },
  };
  try {
    const { renderDerivation } = await import('../../lib/derivation.js');
    assert.throws(() => renderDerivation({ derivation: { formula: 'x' } }),
      /missing required field/);
    assert.equal(renderDerivation(null), null);
    assert.equal(renderDerivation({}), null);
  } finally {
    if (originalDocument) globalThis.document = originalDocument;
    else delete globalThis.document;
  }
});

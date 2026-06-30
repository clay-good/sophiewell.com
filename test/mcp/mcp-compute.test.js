// spec-v183 §4: worked compute calls (>=3 per first-wave module) plus the
// full-set example round-trip. The round-trip mirrors the e2e
// example-correctness numeric contract on the JSON tool surface.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { META } from '../../lib/meta.js';
import { computeCalculator, listCalculators } from '../../mcp/tools.js';

function ok(id, inputs) {
  const r = computeCalculator({ id, inputs });
  assert.equal(r.valid, true, `${id} should compute: ${r.message || ''}`);
  return r.result;
}

test('lib/tox-v86.js worked calls', () => {
  assert.equal(ok('serotonin-toxicity', { 'st-agent': '1', 'st-spont-clonus': '1' }).meets, true);
  assert.equal(ok('salicylate-toxicity', { 'sal-level': '110', 'sal-unit': 'mgdl', 'sal-type': 'acute' }).levelMgDl, 110);
  const ta = ok('toxic-alcohol', { 'ta-osm': '305', 'ta-na': '140', 'ta-glu': '90', 'ta-bun': '14', 'ta-recent': '1' });
  assert.equal(ta.calcOsm, 290);
  assert.equal(ta.osmolarGap, 15);
});

test('lib/hep-v124.js worked calls', () => {
  assert.equal(ok('albi-grade', { 'al-alb': '3.5', 'al-bili': '1.0' }).grade, 2);
  assert.equal(ok('meld-xi', { 'mx-bili': '2.0', 'mx-creat': '1.5' }).score, 18);
  assert.equal(ok('bard-score', { 'bd-bmi': '30', 'bd-ast': '45', 'bd-alt': '40', 'bd-dm': true }).total, 4);
});

test('lib/acidbase-v129.js worked calls', () => {
  assert.equal(ok('base-excess', { 'be-ph': '7.2', 'be-hco3': '15', 'be-hb': '15' }).be, -13);
  assert.equal(ok('stewart-sid-sig', { 'ss-na': '140', 'ss-k': '4', 'ss-ca': '2.4', 'ss-mg': '1.0', 'ss-cl': '100', 'ss-lac': '2', 'ss-hco3': '14', 'ss-alb': '4.0', 'ss-phos': '4' }).sig, 17.8);
  assert.equal(ok('resp-acidosis-compensation', { 'ra-paco2': '60', 'ra-hco3': '26', 'ra-ch': 'acute' }).expected, 26);
});

test('lib/cardio-v90.js worked calls', () => {
  assert.equal(ok('cardiac-power-output', { 'cp-map': '80', 'cp-co': '5' }).cpo, 0.89);
  assert.equal(ok('ecg-axis', { 'ea-i': '8', 'ea-avf': '6' }).axis, 36.9);
  const ava = ok('aortic-valve-area', { 'av-d': '2.0', 'av-lvti': '20', 'av-avti': '100' });
  assert.equal(ava.ava, 0.63);
  assert.equal(ava.severity, 'severe');
});

test('lib/pulm-v91.js worked calls (wave 2)', () => {
  assert.equal(ok('gold-spirometry', { 'gs-pct': '45', 'gs-ratio': '0.6' }).grade, 3);
  assert.equal(ok('bode-index', { 'bo-bmi': '24', 'bo-pct': '45', 'bo-mmrc': '2', 'bo-6mwd': '300' }).total, 4);
  assert.equal(ok('gap-ipf', { 'gp-sex': 'male', 'gp-age': '68', 'gp-fvc': '60', 'gp-dlco': '40' }).stage, 'II');
  assert.equal(ok('mmrc-dyspnea', { 'md-grade': '2' }).grade, 2);
});

test('lib/neuro-v118.js worked calls (wave 2)', () => {
  assert.equal(ok('modified-fisher', { 'mf-sah': 'thick', 'mf-ivh': true }).grade, 4);
  assert.equal(ok('bat-score', { 'bt-blend': true, 'bt-hypo': true, 'bt-timing': true }).total, 5);
  const graeb = ok('graeb-ivh', {
    'gr-rl': '4', 'gr-rl-exp': true, 'gr-ll': '4', 'gr-ll-exp': true, 'gr-3': '4', 'gr-3-exp': true,
    'gr-4': '4', 'gr-4-exp': true, 'gr-ro': '2', 'gr-ro-exp': true, 'gr-lo': '2', 'gr-lo-exp': true,
    'gr-rt': '2', 'gr-rt-exp': true, 'gr-lt': '2', 'gr-lt-exp': true,
  });
  assert.equal(graeb.total, 32);
});

test('lib/endo-v136.js worked calls (wave 2)', () => {
  assert.equal(ok('homa-ir', { 'hir-insulin': '12', 'hir-glucose': '100', 'hir-unit': 'mgdl' }).value, 2.96);
  assert.equal(ok('quicki', { 'qui-insulin': '12', 'qui-glucose': '100' }).value, 0.3248);
  assert.equal(ok('osteoporosis-prescreen', { 'ost-age': '60', 'ost-weight': '72', 'ost-estrogen': 'no' }).ost, 2);
});

test('lib/periop-v97.js worked calls (wave 2)', () => {
  assert.equal(ok('gupta-mica', { 'mica-age': '65', 'mica-asa': '3', 'mica-func': 'partial', 'mica-creat': 'normal', 'mica-surg': 'intestinal' }).risk, 1.66);
  assert.equal(ok('arozullah-pneumonia', { 'aroz-surg': 'thoracic', 'aroz-age': '60-69', 'aroz-func': 'independent', 'aroz-bun': '8-21', 'aroz-copd': true }).total, 28);
  assert.equal(ok('el-ganzouri', { 'eg-mouth': 'lt-4', 'eg-thyro': '6-6.5', 'eg-mall': '3', 'eg-neck': '80-90', 'eg-prog': 'yes', 'eg-weight': 'under-90', 'eg-history': 'none' }).total, 4);
});

// The enum->boolean adapter transform reaches the lib: el-ganzouri prognath and
// elapss earlierSah both map a yes/no select onto a lib boolean.
test('enum->boolean adapter transform reaches the lib (elapss earlierSah)', () => {
  // Use a low, non-saturating profile so the +1 from earlierSah='no' is visible
  // (the documented example saturates the score at the 40-point ceiling).
  const base = { 'el-loc': 'icaAcaAcom', 'el-age': '40', 'el-pop': 'na', 'el-size': '4', 'el-irregular': false };
  const no = ok('elapss', { ...base, 'el-sah': 'no' }).total;
  const yes = ok('elapss', { ...base, 'el-sah': 'yes' }).total;
  assert.notEqual(no, yes);
});

// The acute/chronic select maps to the lib boolean `chronic` arg via the
// adapter `to` transform; confirm both branches differ.
test('enum->boolean adapter transform (acute vs chronic) reaches the lib', () => {
  const acute = ok('resp-acidosis-compensation', { 'ra-paco2': '80', 'ra-hco3': '30', 'ra-ch': 'acute' }).expected;
  const chronic = ok('resp-acidosis-compensation', { 'ra-paco2': '80', 'ra-hco3': '30', 'ra-ch': 'chronic' }).expected;
  assert.notEqual(acute, chronic);
});

test('every exposed example round-trips to its META.example.expected numbers', () => {
  function numericFacts(s) {
    const facts = [];
    const re = /(~)?(\d+(?:\.\d+)?)(?:\s*-\s*(\d+(?:\.\d+)?))?(\s*%)?/g;
    let m;
    while ((m = re.exec(s)) !== null) {
      const value = Number(m[2]);
      if (Number.isInteger(value) && value >= 1900 && value <= 2100 && /^\d{4}$/.test(m[2])) continue;
      facts.push({ value, raw: m[0], isApprox: !!m[1], rangeEnd: m[3] ? Number(m[3]) : null });
    }
    return facts;
  }
  function near(haystack, f) {
    const tol = f.isApprox ? Math.max(Math.abs(f.value) * 0.15, 1) : Math.max(Math.abs(f.value) * 0.02, 0.05);
    const lo = (f.rangeEnd != null ? Math.min(f.value, f.rangeEnd) : f.value) - tol;
    const hi = (f.rangeEnd != null ? Math.max(f.value, f.rangeEnd) : f.value) + tol;
    return [...haystack.matchAll(/\d+(?:\.\d+)?/g)].map((x) => Number(x[0])).some((n) => n >= lo && n <= hi);
  }
  for (const row of listCalculators().calculators) {
    const ex = META[row.id].example;
    const r = computeCalculator({ id: row.id, inputs: ex.fields });
    assert.equal(r.valid, true, `${row.id} example must compute`);
    const ser = JSON.stringify(r.result);
    for (const f of numericFacts(ex.expected)) {
      assert.ok(near(ser, f), `${row.id}: expected number ${f.raw} missing from result`);
    }
  }
});

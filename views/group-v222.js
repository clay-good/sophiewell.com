// spec-v222 §2: renderers for the rheumatology classification & activity
// instruments — 2017 EULAR/ACR myositis, 2012 PMR, Bohan & Peter, 2013 systemic
// sclerosis, modified Rodnan skin score, 2016 Sjogren, and ESSPRI. Group G.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per the
// spec-v50 §3 posture note each tile defers the diagnostic / treatment decision to
// the clinician and the patient (spec-v11 §5.3).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/rheum-classification-v222.js';
import { resultRow } from '../lib/result-copy.js';

function num(label, id, attrs = {}) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'number', step: 'any', inputmode: 'decimal', ...attrs }));
  return wrap;
}
function check(label, id) {
  const wrap = el('p');
  wrap.appendChild(el('input', { id, type: 'checkbox' }));
  wrap.appendChild(el('label', { for: id, text: ' ' + label }));
  return wrap;
}
function select(label, id, options) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const s = el('select', { id });
  for (const [value, text] of options) s.appendChild(el('option', { value, text }));
  wrap.appendChild(s);
  return wrap;
}
function grade04(label, id) { return select(label, id, [['0', '0'], ['1', '1'], ['2', '2'], ['3', '3']]); }
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function chk(id) { const n = document.getElementById(id); return n ? n.checked : false; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The diagnostic and treatment decisions stay with the clinician and the patient.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}
function render(o, r, valueLabel, value) {
  if (!r.valid) { note(o, r.message || 'Complete the fields.'); return; }
  resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: valueLabel, value }]);
  note(o, r.detail); note(o, r.note);
}

export const renderers = {
  'iim-eular-acr-2017'(root) {
    note(root, '2017 EULAR/ACR myositis criteria (Lundberg 2017), without-biopsy weights. Definite >= 7.5, probable >= 5.5, possible >= 5.3. Near-neighbors: bohan-peter, mrss-modified-rodnan-skin-score.');
    root.appendChild(select('Age of onset', 'iim-age', [['0', '< 18 years (0)'], ['1.3', '18 to < 40 years (1.3)'], ['2.1', '>= 40 years (2.1)']]));
    const items = [['iim-pu', 'proximalUpper', 'Proximal upper-extremity weakness (0.7)'], ['iim-pl', 'proximalLower', 'Proximal lower-extremity weakness (0.8)'], ['iim-neck', 'neckFlexors', 'Neck flexors weaker than extensors (1.9)'], ['iim-leg', 'legProximal', 'Leg proximal weaker than distal (0.9)'], ['iim-helio', 'heliotrope', 'Heliotrope rash (3.1)'], ['iim-gp', 'gottronPapules', "Gottron's papules (2.1)"], ['iim-gs', 'gottronSign', "Gottron's sign (3.3)"], ['iim-dys', 'dysphagia', 'Dysphagia / esophageal dysmotility (0.7)'], ['iim-jo1', 'antiJo1', 'Anti-Jo-1 antibody (3.9)'], ['iim-enz', 'elevatedEnzymes', 'Elevated CK / LDH / AST / ALT (1.3)']];
    for (const [id, , label] of items) root.appendChild(check(label, id));
    const o = out(); root.appendChild(o);
    wire(['iim-age', ...items.map((i) => i[0])], () => safe(o, () => {
      const inp = { ageBand: val('iim-age') }; for (const [id, key] of items) inp[key] = chk(id);
      render(o, M.iimEularAcr(inp), 'IIM', `${M.iimEularAcr(inp).score}`);
    }));
    postureNote(root);
  },
  'pmr-eular-acr-2012'(root) {
    note(root, '2012 EULAR/ACR PMR criteria (Dasgupta 2012), after entry criteria (age >= 50, bilateral shoulder aching, abnormal CRP/ESR). >= 4 = PMR. Near-neighbors: gca-acr-eular-2022, esr.');
    const items = [['pmr-stiff', 'stiffness', 'Morning stiffness > 45 minutes (+2)'], ['pmr-hip', 'hip', 'Hip pain or limited range of motion (+1)'], ['pmr-rf', 'absentRfAcpa', 'Absence of RF and/or ACPA (+2)'], ['pmr-joint', 'absentOtherJoints', 'Absence of other joint involvement (+1)']];
    for (const [id, , label] of items) root.appendChild(check(label, id));
    const o = out(); root.appendChild(o);
    wire(items.map((i) => i[0]), () => safe(o, () => {
      const inp = {}; for (const [id, key] of items) inp[key] = chk(id);
      render(o, M.pmrEularAcr(inp), 'PMR', `${M.pmrEularAcr(inp).score}`);
    }));
    postureNote(root);
  },
  'bohan-peter'(root) {
    note(root, 'Bohan & Peter criteria (1975): weakness, enzymes, EMG, biopsy, DM rash. Polymyositis (no rash) or dermatomyositis (rash) classified by count. Near-neighbors: iim-eular-acr-2017, mrss-modified-rodnan-skin-score.');
    const items = [['bp-weak', 'weakness', 'Symmetric proximal muscle weakness'], ['bp-enz', 'enzymes', 'Elevated serum muscle enzymes'], ['bp-emg', 'emg', 'Myopathic EMG changes'], ['bp-biopsy', 'biopsy', 'Abnormal muscle biopsy'], ['bp-rash', 'rash', 'Dermatomyositis rash (heliotrope / Gottron)']];
    for (const [id, , label] of items) root.appendChild(check(label, id));
    const o = out(); root.appendChild(o);
    wire(items.map((i) => i[0]), () => safe(o, () => {
      const inp = {}; for (const [id, key] of items) inp[key] = chk(id);
      const r = M.bohanPeter(inp);
      render(o, r, 'Verdict', r.bandLabel);
    }));
    postureNote(root);
  },
  'acr-eular-2013-systemic-sclerosis'(root) {
    note(root, '2013 ACR/EULAR systemic sclerosis criteria (van den Hoogen 2013): skin proximal to MCP is sufficient (9); else weighted sum. >= 9 = SSc. Near-neighbors: mrss-modified-rodnan-skin-score, esspri.');
    root.appendChild(check('Skin thickening of the fingers extending proximal to the MCP joints (sufficient, 9)', 'ssc-mcp'));
    root.appendChild(select('Skin thickening of the fingers (if not proximal to MCP)', 'ssc-skin', [['0', 'None (0)'], ['2', 'Puffy fingers (2)'], ['4', 'Sclerodactyly / distal to MCP (4)']]));
    root.appendChild(select('Fingertip lesions', 'ssc-tip', [['0', 'None (0)'], ['2', 'Digital tip ulcers (2)'], ['3', 'Fingertip pitting scars (3)']]));
    root.appendChild(check('Telangiectasia (2)', 'ssc-tel'));
    root.appendChild(check('Abnormal nailfold capillaries (2)', 'ssc-nail'));
    root.appendChild(check('Pulmonary arterial hypertension and/or ILD (2)', 'ssc-pah'));
    root.appendChild(check('Raynaud phenomenon (3)', 'ssc-ray'));
    root.appendChild(check('SSc-related autoantibodies: anticentromere / anti-Scl-70 / anti-RNA-pol-III (3)', 'ssc-ab'));
    const o = out(); root.appendChild(o);
    wire(['ssc-mcp', 'ssc-skin', 'ssc-tip', 'ssc-tel', 'ssc-nail', 'ssc-pah', 'ssc-ray', 'ssc-ab'], () => safe(o, () => {
      const r = M.ssc2013({ proximalMcp: chk('ssc-mcp'), skinFingers: val('ssc-skin'), fingertip: val('ssc-tip'), telangiectasia: chk('ssc-tel'), nailfold: chk('ssc-nail'), pahIld: chk('ssc-pah'), raynaud: chk('ssc-ray'), autoantibodies: chk('ssc-ab') });
      render(o, r, 'SSc', `${r.score}`);
    }));
    postureNote(root);
  },
  'mrss-modified-rodnan-skin-score'(root) {
    note(root, 'Modified Rodnan skin score (Clements 1995): skin thickness 0-3 at 17 sites; total 0-51. Higher = more extensive skin involvement in systemic sclerosis. Near-neighbors: acr-eular-2013-systemic-sclerosis, esspri.');
    const sites = [['fingersR', 'Fingers (right)'], ['fingersL', 'Fingers (left)'], ['handsR', 'Hand (right)'], ['handsL', 'Hand (left)'], ['forearmsR', 'Forearm (right)'], ['forearmsL', 'Forearm (left)'], ['upperArmsR', 'Upper arm (right)'], ['upperArmsL', 'Upper arm (left)'], ['face', 'Face'], ['chest', 'Anterior chest'], ['abdomen', 'Abdomen'], ['thighsR', 'Thigh (right)'], ['thighsL', 'Thigh (left)'], ['legsR', 'Lower leg (right)'], ['legsL', 'Lower leg (left)'], ['feetR', 'Foot (right)'], ['feetL', 'Foot (left)']];
    for (const [key, label] of sites) root.appendChild(grade04(label + ' (0-3)', 'mrss-' + key));
    const o = out(); root.appendChild(o);
    wire(sites.map((s) => 'mrss-' + s[0]), () => safe(o, () => {
      const inp = {}; for (const [key] of sites) inp[key] = val('mrss-' + key);
      render(o, M.mrss(inp), 'mRSS', `${M.mrss(inp).score}`);
    }));
    postureNote(root);
  },
  'acr-eular-2016-sjogren'(root) {
    note(root, "2016 ACR/EULAR Sjogren criteria (Shiboski 2017): focus score >= 1 (3), anti-SSA/Ro (3), ocular staining >= 5 (1), Schirmer <= 5 (1), saliva flow <= 0.1 (1). >= 4 = Sjogren. Near-neighbors: esspri, essdai.");
    const items = [['sj-focus', 'focusScore', 'Labial gland focus score >= 1 (+3)'], ['sj-ssa', 'antiSsa', 'Anti-SSA/Ro positivity (+3)'], ['sj-ocular', 'ocularStaining', 'Ocular staining score >= 5 (+1)'], ['sj-schirmer', 'schirmer', 'Schirmer test <= 5 mm/5 min (+1)'], ['sj-saliva', 'salivaFlow', 'Unstimulated saliva flow <= 0.1 mL/min (+1)']];
    for (const [id, , label] of items) root.appendChild(check(label, id));
    const o = out(); root.appendChild(o);
    wire(items.map((i) => i[0]), () => safe(o, () => {
      const inp = {}; for (const [id, key] of items) inp[key] = chk(id);
      render(o, M.sjogren2016(inp), 'Sjogren', `${M.sjogren2016(inp).score}`);
    }));
    postureNote(root);
  },
  'esspri'(root) {
    note(root, 'ESSPRI (Seror 2011): mean of three 0-10 patient-reported scales — dryness, fatigue, pain. Near-neighbors: acr-eular-2016-sjogren, essdai.');
    root.appendChild(num('Dryness (0-10)', 'esp-dry', { min: '0', max: '10' }));
    root.appendChild(num('Fatigue (0-10)', 'esp-fat', { min: '0', max: '10' }));
    root.appendChild(num('Pain (limb / articular / muscular) (0-10)', 'esp-pain', { min: '0', max: '10' }));
    const o = out(); root.appendChild(o);
    wire(['esp-dry', 'esp-fat', 'esp-pain'], () => safe(o, () => {
      const r = M.esspri({ dryness: val('esp-dry'), fatigue: val('esp-fat'), pain: val('esp-pain') });
      render(o, r, 'ESSPRI', r.score !== undefined ? `${r.score}` : '');
    }));
    postureNote(root);
  },
};

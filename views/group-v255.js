// spec-v255 §2: renderers for the risk & severity scores — the Venous Clinical
// Severity Score, the PEN-FAST rule, the Harris Hip Score, and the Koivuranta PONV
// score. Group G.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per the
// spec-v50 §3 posture note each tile defers the diagnosis and treatment to the
// clinician and the patient (spec-v11 §5.3).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/riskscores-v255.js';
import { resultRow } from '../lib/result-copy.js';

function check(label, id) {
  const wrap = el('p');
  wrap.appendChild(el('input', { id, type: 'checkbox' }));
  wrap.appendChild(el('label', { for: id, text: ' ' + label }));
  return wrap;
}
function numInput(label, id, attrs = {}) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'number', step: '1', inputmode: 'numeric', ...attrs }));
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
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function chk(id) { const n = document.getElementById(id); return n ? n.checked : false; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The diagnosis and treatment stay with the clinician and the patient.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}
function render(o, r, valueLabel) {
  if (!r.valid) { note(o, r.message || 'Complete the fields.'); return; }
  resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: valueLabel, value: `${r.score}` }]);
  note(o, r.detail); note(o, r.note);
}
const S03 = [['0', '0 (none)'], ['1', '1 (mild)'], ['2', '2 (moderate)'], ['3', '3 (severe)']];

export const renderers = {
  'vcss'(root) {
    note(root, 'Venous Clinical Severity Score (Vasquez 2010): 10 attributes each 0-3, 0-30. Complements CEAP. Near-neighbors: wells-dvt-caprini.');
    const items = [['vc-pain', 'pain', 'Pain'], ['vc-var', 'varicose', 'Varicose veins'], ['vc-edema', 'edema', 'Venous edema'], ['vc-pig', 'pigmentation', 'Skin pigmentation'], ['vc-inf', 'inflammation', 'Inflammation'], ['vc-ind', 'induration', 'Induration'], ['vc-uln', 'ulcerNumber', 'Number of active ulcers'], ['vc-uld', 'ulcerDuration', 'Active ulcer duration'], ['vc-uls', 'ulcerSize', 'Active ulcer size'], ['vc-comp', 'compression', 'Use of compression therapy']];
    for (const [id, , label] of items) root.appendChild(select(`${label} (0-3)`, id, S03));
    const o = out(); root.appendChild(o);
    wire(items.map((i) => i[0]), () => safe(o, () => {
      const inp = {}; for (const [id, key] of items) inp[key] = val(id);
      render(o, M.vcss(inp), 'VCSS');
    }));
    postureNote(root);
  },
  'pen-fast'(root) {
    note(root, 'PEN-FAST (Trubiano 2020): Five years, Anaphylaxis/SCAR, Treatment required, 0-5. < 3 low risk -> direct challenge. Near-neighbors: auditc.');
    root.appendChild(check('Reaction within the last Five years (2)', 'pf-recent'));
    root.appendChild(check('Anaphylaxis/angioedema OR severe cutaneous reaction (2)', 'pf-anaph'));
    root.appendChild(check('Treatment required for the reaction (1)', 'pf-treat'));
    const o = out(); root.appendChild(o);
    wire(['pf-recent', 'pf-anaph', 'pf-treat'], () => safe(o, () => {
      render(o, M.penFast({ recent: chk('pf-recent'), anaphylaxis: chk('pf-anaph'), treatment: chk('pf-treat') }), 'PEN-FAST');
    }));
    postureNote(root);
  },
  'harris-hip-score'(root) {
    note(root, 'Harris Hip Score (Harris 1969): pain (0-44) + function (0-47) + deformity (0/4) + ROM (0-5) = 0-100. Near-neighbors: quickdash.');
    root.appendChild(numInput('Pain (0-44)', 'hh-pain', { min: '0', max: '44' }));
    root.appendChild(numInput('Function / gait + activities (0-47)', 'hh-func', { min: '0', max: '47' }));
    root.appendChild(numInput('Absence of deformity (0 or 4)', 'hh-def', { min: '0', max: '4' }));
    root.appendChild(numInput('Range of motion (0-5)', 'hh-rom', { min: '0', max: '5' }));
    const o = out(); root.appendChild(o);
    wire(['hh-pain', 'hh-func', 'hh-def', 'hh-rom'], () => safe(o, () => {
      render(o, M.harrisHipScore({ pain: val('hh-pain'), function: val('hh-func'), deformity: val('hh-def'), rom: val('hh-rom') }), 'HHS');
    }));
    postureNote(root);
  },
  'koivuranta-ponv'(root) {
    note(root, 'Koivuranta PONV (1997): female, prior PONV, motion sickness, non-smoker, surgery > 60 min, each 1 point. Near-neighbors: apfel.');
    root.appendChild(check('Female sex', 'kv-female'));
    root.appendChild(check('Previous PONV', 'kv-prior'));
    root.appendChild(check('History of motion sickness', 'kv-motion'));
    root.appendChild(check('Non-smoker', 'kv-smoke'));
    root.appendChild(check('Surgery > 60 minutes', 'kv-long'));
    const o = out(); root.appendChild(o);
    wire(['kv-female', 'kv-prior', 'kv-motion', 'kv-smoke', 'kv-long'], () => safe(o, () => {
      render(o, M.koivurantaPonv({ female: chk('kv-female'), priorPonv: chk('kv-prior'), motionSickness: chk('kv-motion'), nonSmoker: chk('kv-smoke'), longSurgery: chk('kv-long') }), 'Koivuranta');
    }));
    postureNote(root);
  },
};

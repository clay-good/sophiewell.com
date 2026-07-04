// spec-v247 §2: renderers for the pediatric acute-care + toxicology tools — the
// Pediatric Trauma Score, the BIND score, the Widmark BAC estimate, and the POVOC
// score. Group G.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per the
// spec-v50 §3 posture note each tile defers the diagnosis and treatment to the
// clinician and the patient (spec-v11 §5.3).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/pedstox-v247.js';
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
  wrap.appendChild(el('input', { id, type: 'number', step: 'any', inputmode: 'decimal', ...attrs }));
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
const TRI = [['2', '+2'], ['1', '+1'], ['-1', '-1']];
const S03 = [['0', '0 (normal)'], ['1', '1 (mild)'], ['2', '2 (moderate)'], ['3', '3 (severe)']];

export const renderers = {
  'pediatric-trauma-score'(root) {
    note(root, 'Pediatric Trauma Score (Tepas 1987): 6 components each -1/+1/+2, -6..+12. <= 8 transfer to a pediatric trauma center. Near-neighbors: big.');
    root.appendChild(select('Weight (> 20 kg / 10-20 kg / < 10 kg)', 'pts-wt', TRI));
    root.appendChild(select('Airway (normal / maintainable / unmaintainable)', 'pts-air', TRI));
    root.appendChild(select('Systolic BP (> 90 / 50-90 / < 50)', 'pts-sbp', TRI));
    root.appendChild(select('CNS (awake / obtunded / comatose)', 'pts-cns', TRI));
    root.appendChild(select('Open wound (none / minor / major)', 'pts-wound', TRI));
    root.appendChild(select('Skeletal (none / closed / open-multiple)', 'pts-skel', TRI));
    const o = out(); root.appendChild(o);
    wire(['pts-wt', 'pts-air', 'pts-sbp', 'pts-cns', 'pts-wound', 'pts-skel'], () => safe(o, () => {
      render(o, M.pediatricTraumaScore({ weight: val('pts-wt'), airway: val('pts-air'), sbp: val('pts-sbp'), cns: val('pts-cns'), wound: val('pts-wound'), skeletal: val('pts-skel') }), 'PTS');
    }));
    postureNote(root);
  },
  'bind-score'(root) {
    note(root, 'BIND score (Johnson & Bhutani 1999): mental status, muscle tone, cry, each 0-3 (0-9). Higher = worse acute bilirubin encephalopathy. Near-neighbors: bhutani-bilirubin.');
    root.appendChild(select('Mental status', 'bind-ms', S03));
    root.appendChild(select('Muscle tone', 'bind-mt', S03));
    root.appendChild(select('Cry pattern', 'bind-cry', S03));
    const o = out(); root.appendChild(o);
    wire(['bind-ms', 'bind-mt', 'bind-cry'], () => safe(o, () => {
      render(o, M.bindScore({ mentalStatus: val('bind-ms'), muscleTone: val('bind-mt'), cry: val('bind-cry') }), 'BIND');
    }));
    postureNote(root);
  },
  'widmark-bac'(root) {
    note(root, 'Widmark BAC estimate: BAC = A / (r x weight x 10) - 0.015 x hours (r = 0.68 male / 0.55 female). A population estimate, not a legal measurement. Near-neighbors: osmolal-gap.');
    root.appendChild(numInput('Pure alcohol consumed (grams)', 'wid-grams', { min: '0' }));
    root.appendChild(numInput('Body weight (kg)', 'wid-weight', { min: '0' }));
    root.appendChild(numInput('Hours since drinking', 'wid-hours', { min: '0' }));
    root.appendChild(select('Sex', 'wid-sex', [['male', 'Male'], ['female', 'Female']]));
    const o = out(); root.appendChild(o);
    wire(['wid-grams', 'wid-weight', 'wid-hours', 'wid-sex'], () => safe(o, () => {
      render(o, M.widmarkBac({ grams: val('wid-grams'), weight: val('wid-weight'), hours: val('wid-hours'), sex: val('wid-sex') }), 'BAC');
    }));
    postureNote(root);
  },
  'povoc-ponv'(root) {
    note(root, 'POVOC pediatric POV score (Eberhart 2004): surgery >= 30 min, age >= 3 y, POV/PONV history, strabismus surgery, each 1 point (0-4). Near-neighbors: apfel.');
    root.appendChild(check('Surgery >= 30 minutes', 'pov-dur'));
    root.appendChild(check('Age >= 3 years', 'pov-age'));
    root.appendChild(check('History of POV/PONV (self or relative)', 'pov-hist'));
    root.appendChild(check('Strabismus surgery', 'pov-strab'));
    const o = out(); root.appendChild(o);
    wire(['pov-dur', 'pov-age', 'pov-hist', 'pov-strab'], () => safe(o, () => {
      render(o, M.povocPonv({ duration: chk('pov-dur'), age: chk('pov-age'), history: chk('pov-hist'), strabismus: chk('pov-strab') }), 'POVOC');
    }));
    postureNote(root);
  },
};

// spec-v235 §2: renderers for the pain / disability screening instruments — DN4,
// LANSS, the Roland-Morris Disability Questionnaire, and the Neck Disability Index.
// Group G.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per the
// spec-v50 §3 posture note each tile defers the diagnosis and treatment to the
// clinician and the patient (spec-v11 §5.3).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/painscore-v235.js';
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
const S05 = [['0', '0'], ['1', '1'], ['2', '2'], ['3', '3'], ['4', '4'], ['5', '5']];

export const renderers = {
  'dn4-neuropathic-pain'(root) {
    note(root, 'DN4 (Bouhassira 2005): 7 interview + 3 exam items each 1 point. >= 4 suggests neuropathic pain. Near-neighbors: lanss-pain-scale.');
    const items = [['dn4-burn', 'burning', 'Burning'], ['dn4-cold', 'cold', 'Painful cold'], ['dn4-shock', 'shocks', 'Electric shocks'], ['dn4-tingle', 'tingling', 'Tingling'], ['dn4-pins', 'pins', 'Pins and needles'], ['dn4-numb', 'numbness', 'Numbness'], ['dn4-itch', 'itching', 'Itching'], ['dn4-htouch', 'hypoTouch', 'Exam: hypoesthesia to touch'], ['dn4-hpin', 'hypoPinprick', 'Exam: hypoesthesia to pinprick'], ['dn4-brush', 'brushAllodynia', 'Exam: brush allodynia']];
    for (const [id, , label] of items) root.appendChild(check(label, id));
    const o = out(); root.appendChild(o);
    wire(items.map((i) => i[0]), () => safe(o, () => {
      const inp = {}; for (const [id, key] of items) inp[key] = chk(id);
      render(o, M.dn4(inp), 'DN4');
    }));
    postureNote(root);
  },
  'lanss-pain-scale'(root) {
    note(root, 'LANSS (Bennett 2001): weighted symptom + exam items, total 0-24. >= 12 suggests neuropathic origin. Near-neighbors: dn4-neuropathic-pain.');
    const items = [['lanss-dys', 'dysesthesia', 'Dysesthesia — pricking/tingling/pins-and-needles (5)'], ['lanss-auto', 'autonomic', 'Skin looks different — mottled/red (5)'], ['lanss-allo', 'allodyniaReport', 'Abnormally sensitive to touch (3)'], ['lanss-par', 'paroxysmal', 'Sudden electric-shock bursts (2)'], ['lanss-therm', 'thermal', 'Feels hot/burning (1)'], ['lanss-brush', 'brushAllodynia', 'Exam: brush allodynia (5)'], ['lanss-pin', 'pinprick', 'Exam: altered pin-prick threshold (3)']];
    for (const [id, , label] of items) root.appendChild(check(label, id));
    const o = out(); root.appendChild(o);
    wire(items.map((i) => i[0]), () => safe(o, () => {
      const inp = {}; for (const [id, key] of items) inp[key] = chk(id);
      render(o, M.lanss(inp), 'LANSS');
    }));
    postureNote(root);
  },
  'roland-morris-disability'(root) {
    note(root, 'Roland-Morris (Roland & Morris 1983): 24 low-back disability statements, each applicable one scores 1. Total 0-24; MDC ~5. Near-neighbors: neck-disability-index.');
    root.appendChild(numInput('Number of applicable statements (0-24)', 'rmdq-count', { min: '0', max: '24' }));
    const o = out(); root.appendChild(o);
    wire(['rmdq-count'], () => safe(o, () => {
      render(o, M.rolandMorris({ count: val('rmdq-count') }), 'RMDQ');
    }));
    postureNote(root);
  },
  'neck-disability-index'(root) {
    note(root, 'Neck Disability Index (Vernon & Mior 1991): 10 sections each 0-5, raw 0-50, percentage = raw x 2. Near-neighbors: roland-morris-disability.');
    const secs = [['ndi-pain', 'pain', 'Pain intensity'], ['ndi-care', 'care', 'Personal care'], ['ndi-lift', 'lifting', 'Lifting'], ['ndi-read', 'reading', 'Reading'], ['ndi-head', 'headaches', 'Headaches'], ['ndi-conc', 'concentration', 'Concentration'], ['ndi-work', 'work', 'Work'], ['ndi-drive', 'driving', 'Driving'], ['ndi-sleep', 'sleeping', 'Sleeping'], ['ndi-rec', 'recreation', 'Recreation']];
    for (const [id, , label] of secs) root.appendChild(select(`${label} (0-5)`, id, S05));
    const o = out(); root.appendChild(o);
    wire(secs.map((s) => s[0]), () => safe(o, () => {
      const inp = {}; for (const [id, key] of secs) inp[key] = val(id);
      render(o, M.neckDisabilityIndex(inp), 'NDI %');
    }));
    postureNote(root);
  },
};

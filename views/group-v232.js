// spec-v232 §2: renderers for the thrombosis/coagulation bedside scores — the
// Villalta post-thrombotic-syndrome scale and the ISTH sepsis-induced coagulopathy
// (SIC) score. Group G.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per the
// spec-v50 §3 posture note each tile defers the diagnosis and treatment to the
// clinician and the patient (spec-v11 §5.3).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/coagscore-v232.js';
import { resultRow } from '../lib/result-copy.js';

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

const GRADE = [['0', 'None (0)'], ['1', 'Mild (1)'], ['2', 'Moderate (2)'], ['3', 'Severe (3)']];

export const renderers = {
  'villalta'(root) {
    note(root, 'Villalta scale (Kahn 2009): 5 symptoms + 6 signs each 0-3 (max 33), plus venous ulcer. 0-4 none, 5-9 mild, 10-14 moderate, >= 15 or ulcer severe. Near-neighbors: wells-dvt-caprini, hit-4ts.');
    const items = [['vil-pain', 'pain', 'Pain'], ['vil-cramps', 'cramps', 'Cramps'], ['vil-heavy', 'heaviness', 'Heaviness'], ['vil-par', 'paresthesia', 'Paresthesia'], ['vil-pru', 'pruritus', 'Pruritus'], ['vil-edema', 'edema', 'Pretibial edema'], ['vil-ind', 'induration', 'Skin induration'], ['vil-hyp', 'hyperpigmentation', 'Hyperpigmentation'], ['vil-red', 'redness', 'Redness'], ['vil-ect', 'ectasia', 'Venous ectasia'], ['vil-comp', 'compressionPain', 'Pain on calf compression']];
    for (const [id, , label] of items) root.appendChild(select(label, id, GRADE));
    root.appendChild(check('Venous ulcer (open or healed) — severe regardless of score', 'vil-ulcer'));
    const o = out(); root.appendChild(o);
    wire([...items.map((i) => i[0]), 'vil-ulcer'], () => safe(o, () => {
      const inp = { ulcer: chk('vil-ulcer') }; for (const [id, key] of items) inp[key] = val(id);
      render(o, M.villalta(inp), 'Villalta');
    }));
    postureNote(root);
  },
  'sic'(root) {
    note(root, 'ISTH sepsis-induced coagulopathy (Iba 2019): platelet, PT-INR, and total SOFA each 0-2. >= 4 diagnoses SIC. Near-neighbors: isth-dic, sirs.');
    root.appendChild(select('Platelet count (10³/µL)', 'sic-plt', [['0', '>= 150 (0)'], ['1', '100-150 (1)'], ['2', '< 100 (2)']]));
    root.appendChild(select('PT-INR', 'sic-inr', [['0', '<= 1.2 (0)'], ['1', '1.2-1.4 (1)'], ['2', '> 1.4 (2)']]));
    root.appendChild(select('Total SOFA score', 'sic-sofa', [['0', '0 (0)'], ['1', '1 (1)'], ['2', '>= 2 (2)']]));
    const o = out(); root.appendChild(o);
    wire(['sic-plt', 'sic-inr', 'sic-sofa'], () => safe(o, () => {
      render(o, M.sic({ platelet: val('sic-plt'), inr: val('sic-inr'), sofa: val('sic-sofa') }), 'SIC');
    }));
    postureNote(root);
  },
};

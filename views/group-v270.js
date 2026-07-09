// spec-v270 §2: renderer for the Cardiometabolic Index (CMI) — a lipid ×
// central-adiposity composite. Group G. It joins the visceral-adiposity-index /
// lipid-accumulation-product family.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per the
// spec-v50 §3 posture note the tile defers the diagnosis and treatment to the
// clinician and the patient (spec-v11 §5.3).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/adiposity-v270.js';
import { resultRow } from '../lib/result-copy.js';

function num(label, id, attrs = {}) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'number', step: 'any', inputmode: 'decimal', ...attrs }));
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
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

export const renderers = {
  'cmi'(root) {
    note(root, 'Cardiometabolic Index = (TG / HDL) x (waist / height) (Wakabayashi 2015). Higher marks a worse cardiometabolic profile. Enter TG and HDL in the same units, waist and height in the same units. Near-neighbors: visceral-adiposity-index, lipid-accumulation-product, tyg-index.');
    root.appendChild(num('Triglycerides (mg/dL)', 'cmi-tg', { min: '0' }));
    root.appendChild(num('HDL cholesterol (mg/dL)', 'cmi-hdl', { min: '0' }));
    root.appendChild(num('Waist circumference (cm)', 'cmi-waist', { min: '0' }));
    root.appendChild(num('Height (cm)', 'cmi-height', { min: '0' }));
    const o = out(); root.appendChild(o);
    wire(['cmi-tg', 'cmi-hdl', 'cmi-waist', 'cmi-height'], () => safe(o, () => {
      render(o, M.cmi({ tg: val('cmi-tg'), hdl: val('cmi-hdl'), waist: val('cmi-waist'), height: val('cmi-height') }), 'CMI');
    }));
    postureNote(root);
  },
};

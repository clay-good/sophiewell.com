// spec-v643 §2: renderer for oswestry-odi — the Oswestry Disability Index (ODI)
// for low-back-pain disability (Clinical Scoring & Risk, Group G). The low-back
// companion to roland-morris-disability and neck-disability-index.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Ten
// sections, each a generic 0-5 rating (the copyright-bearing 6-statement wording is
// NOT reproduced). A section left at "not answered" is excluded from the variable
// denominator. A blank form reports the complete-the-fields message.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/oswestry-v643.js';
import { resultRow } from '../lib/result-copy.js';

function selectField(label, id, options) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const sel = el('select', { id });
  for (const o of options) sel.appendChild(el('option', { value: o.value, text: o.text }));
  wrap.appendChild(sel);
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function selVal(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The Oswestry Disability Index is a patient-reported measure computed from the ratings you entered — it frames a disability percentage, not a diagnosis or a treatment order. The clinical decision stays with the clinician and the patient.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

const RATING_OPTS = [
  { value: '', text: '— not answered —' },
  { value: '0', text: '0 — no disability' },
  { value: '1', text: '1 — mild' },
  { value: '2', text: '2 — moderate' },
  { value: '3', text: '3 — fairly severe' },
  { value: '4', text: '4 — very severe' },
  { value: '5', text: '5 — maximum disability' },
];

const SECTIONS = [
  { key: 'pain', dom: 'odi-pain', label: 'Pain intensity' },
  { key: 'personalCare', dom: 'odi-care', label: 'Personal care (washing, dressing)' },
  { key: 'lifting', dom: 'odi-lift', label: 'Lifting' },
  { key: 'walking', dom: 'odi-walk', label: 'Walking' },
  { key: 'sitting', dom: 'odi-sit', label: 'Sitting' },
  { key: 'standing', dom: 'odi-stand', label: 'Standing' },
  { key: 'sleeping', dom: 'odi-sleep', label: 'Sleeping' },
  { key: 'sexLife', dom: 'odi-sex', label: 'Sex life (if applicable)' },
  { key: 'socialLife', dom: 'odi-social', label: 'Social life' },
  { key: 'travelling', dom: 'odi-travel', label: 'Travelling' },
];

export const renderers = {
  'oswestry-odi'(root) {
    note(root, 'Oswestry Disability Index (Fairbank 2000): rate each of ten sections 0 (no disability) to 5 (maximum). ODI% = round(sum / (5 × sections answered) × 100), so a section left unanswered drops the denominator by 5. Grades: 0-20% minimal, 21-40% moderate, 41-60% severe, 61-80% crippled, 81-100% bed-bound. Companion tiles: roland-morris-disability, neck-disability-index.');
    for (const s of SECTIONS) root.appendChild(selectField(s.label, s.dom, RATING_OPTS));
    const ids = SECTIONS.map((s) => s.dom);
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const input = {};
      for (const s of SECTIONS) input[s.key] = selVal(s.dom);
      const r = M.oswestryDisabilityIndex(input);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.bandLabel, cls: r.total > 40 ? 'warn' : null },
        { label: 'ODI', value: `${r.total}%` },
        { label: 'Grade', value: r.band },
      ]);
      note(o, r.detail);
      note(o, r.note);
    }));
    postureNote(root);
  },
};

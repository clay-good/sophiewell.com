// spec-v713 §2: renderer for eoss — the Edmonton Obesity Staging System (Clinical Scoring &
// Risk, Group G).
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Three domain
// selects (each 0-4); the overall stage is the most severe domain.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/eoss-v713.js';
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
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. EOSS stages obesity by its health impact, not BMI, and guides management intensity; it is not a substitute for the full clinical assessment. It supports rather than replaces clinical judgment.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

const CHOICE = (pairs) => [{ value: '', text: '— choose —' }, ...pairs.map(([value, text]) => ({ value, text }))];
const MEDICAL = [['0', 'No risk factors'], ['1', 'Subclinical risk factors (e.g. borderline BP, IFG)'], ['2', 'Established comorbidity (e.g. hypertension, type 2 diabetes)'], ['3', 'End-organ damage (e.g. MI, heart failure, complications)'], ['4', 'Severe / end-stage chronic disease']];
const FUNCTIONAL = [['0', 'No physical symptoms or limitations'], ['1', 'Mild symptoms (occasional aches, dyspnea on exertion)'], ['2', 'Moderate functional limitation'], ['3', 'Significant functional limitation'], ['4', 'Severe disability']];
const MENTAL = [['0', 'No psychological symptoms'], ['1', 'Mild psychological symptoms'], ['2', 'Moderate psychological symptoms'], ['3', 'Significant psychopathology'], ['4', 'Severe psychopathology']];

export const renderers = {
  'eoss'(root) {
    note(root, 'Edmonton Obesity Staging System (Sharma & Kushner 2009): stages obesity 0–4 by health impact, not BMI. Rate three domains; the overall stage is the most severe. Higher = greater mortality risk and stronger treatment indication.');
    root.appendChild(selectField('Medical domain (obesity-related comorbidity)', 'eoss-medical', CHOICE(MEDICAL)));
    root.appendChild(selectField('Functional domain (physical symptoms / limitation)', 'eoss-functional', CHOICE(FUNCTIONAL)));
    root.appendChild(selectField('Mental domain (psychological symptoms)', 'eoss-mental', CHOICE(MENTAL)));
    const ids = ['eoss-medical', 'eoss-functional', 'eoss-mental'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.eoss({ medical: val('eoss-medical'), functional: val('eoss-functional'), mental: val('eoss-mental') });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Stage', value: `${r.stage} of 4` },
      ]);
      note(o, r.detail);
      note(o, r.note);
    }));
    postureNote(root);
  },
};

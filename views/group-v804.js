// spec-v804 §2: renderer for rome-ecopd — the Rome proposal severity classification for
// COPD exacerbations (Clinical Scoring & Risk, Group G).
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. The five counted
// variables sit under one heading and the arterial blood gas under another, because the gas
// is a separate gate rather than a sixth thing to count.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/rome-ecopd-v804.js';
import { resultRow } from '../lib/result-copy.js';

function numberField(label, id, opts) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const inp = el('input', { id, type: 'number', autocomplete: 'off' });
  inp.setAttribute('min', String(opts.min));
  inp.setAttribute('max', String(opts.max));
  inp.setAttribute('step', opts.step);
  inp.setAttribute('inputmode', opts.step === '1' ? 'numeric' : 'decimal');
  inp.setAttribute('placeholder', opts.placeholder);
  wrap.appendChild(inp);
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. This grades an episode from measurements already taken. It does not decide about steroids, antibiotics, ventilation or admission.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'rome-ecopd'(root) {
    note(root, 'Five variables each have a cutoff, and at least THREE must be above it for a moderate exacerbation; fewer is mild. A single alarming number does not make an exacerbation moderate. Severe is decided separately on the blood gas and needs BOTH hypercapnia and acidosis.');
    root.appendChild(el('h2', { text: 'The five counted variables (three above cutoff means moderate)' }));
    root.appendChild(numberField('Dyspnea on a 0 to 10 visual analog scale (cutoff 5)', 'rome-vas', { min: 0, max: 10, step: '1', placeholder: 'e.g. 6' }));
    root.appendChild(numberField('Respiratory rate per minute (cutoff 24)', 'rome-rr', { min: 0, max: 80, step: '1', placeholder: 'e.g. 26' }));
    root.appendChild(numberField('Heart rate per minute (cutoff 95)', 'rome-hr', { min: 0, max: 250, step: '1', placeholder: 'e.g. 100' }));
    root.appendChild(numberField('Oxygen saturation (%) (cutoff under 92)', 'rome-spo2', { min: 50, max: 100, step: '1', placeholder: 'e.g. 88' }));
    root.appendChild(numberField('Fall in oxygen saturation from the usual value (percentage points, cutoff over 3)', 'rome-drop', { min: 0, max: 50, step: '1', placeholder: 'e.g. 4' }));
    root.appendChild(numberField('C-reactive protein (mg/L) (cutoff 10)', 'rome-crp', { min: 0, max: 500, step: '1', placeholder: 'e.g. 20' }));
    root.appendChild(el('h2', { text: 'Arterial blood gas (a separate gate for severe)' }));
    root.appendChild(numberField('PaCO2 (mmHg)', 'rome-paco2', { min: 10, max: 150, step: '1', placeholder: 'e.g. 55' }));
    root.appendChild(numberField('pH', 'rome-ph', { min: 6.5, max: 8, step: '0.01', placeholder: 'e.g. 7.30' }));
    const ids = ['rome-vas', 'rome-rr', 'rome-hr', 'rome-spo2', 'rome-drop', 'rome-crp', 'rome-paco2', 'rome-ph'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.romeEcopd({
        dyspneaVas: val('rome-vas'),
        respiratoryRate: val('rome-rr'),
        heartRate: val('rome-hr'),
        spo2: val('rome-spo2'),
        spo2DropFromBaseline: val('rome-drop'),
        crp: val('rome-crp'),
        paco2: val('rome-paco2'),
        ph: val('rome-ph'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Above cutoff', value: `${r.aboveCount}/5` },
        { label: 'Blood gas', value: `${r.hypercapnia ? 'hypercapnia' : 'no hypercapnia'}, ${r.acidosis ? 'acidosis' : 'no acidosis'}` },
      ]);
      note(o, r.aboveCutoff.length ? `Above cutoff: ${r.aboveCutoff.join(', ')}.` : 'No variable above its cutoff.');
      note(o, r.detail);
      note(o, r.note);
    }));
    postureNote(root);
  },
};

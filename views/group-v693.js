// spec-v693 §2: renderer for interchest — the INTERCHEST chest-pain CAD rule (Clinical
// Scoring & Risk, Group G).
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Age number + sex
// select + five checkboxes (one worth -1); the sum -1 to +5 maps to a CAD-probability band.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/interchest-v693.js';
import { resultRow } from '../lib/result-copy.js';

function numberField(label, id, step) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'number', min: '0', step: step || '1', inputmode: 'numeric' }));
  return wrap;
}
function selectField(label, id, options) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const sel = el('select', { id });
  for (const o of options) sel.appendChild(el('option', { value: o.value, text: o.text }));
  wrap.appendChild(sel);
  return wrap;
}
function checkField(label, id) {
  const wrap = el('p');
  const cb = el('input', { id, type: 'checkbox' });
  wrap.appendChild(cb);
  wrap.appendChild(el('label', { for: id, text: ' ' + label }));
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function checked(id) { const n = document.getElementById(id); return !!(n && n.checked); }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. INTERCHEST was derived in primary care and is not for acute coronary syndrome triage in the emergency department; it supports rather than replaces clinical judgment.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

const CHOICE = (pairs) => [{ value: '', text: '— choose —' }, ...pairs.map(([value, text]) => ({ value, text }))];
const SEX = [['female', 'Female'], ['male', 'Male']];

export const renderers = {
  'interchest'(root) {
    note(root, 'INTERCHEST (Aerts 2017): estimates the chance chest pain is coronary in primary care. Age/sex (female ≥ 65 or male ≥ 55) +1, history of CAD +1, pain on exertion +1, pressure-like pain +1, physician suspected cardiac +1, reproducible by palpation −1. Score < 2 CAD unlikely (~2%); ≥ 2 (~43%) expedite testing.');
    root.appendChild(numberField('Age (years)', 'ic-age', '1'));
    root.appendChild(selectField('Sex', 'ic-sex', CHOICE(SEX)));
    root.appendChild(checkField('History of coronary artery disease', 'ic-cad'));
    root.appendChild(checkField('Pain brought on by exertion', 'ic-exertion'));
    root.appendChild(checkField('Pain feels like pressure', 'ic-pressure'));
    root.appendChild(checkField('Physician initially suspected a serious / cardiac cause', 'ic-suspect'));
    root.appendChild(checkField('Pain reproducible by palpation (subtracts 1)', 'ic-palpation'));
    const ids = ['ic-age', 'ic-sex', 'ic-cad', 'ic-exertion', 'ic-pressure', 'ic-suspect', 'ic-palpation'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.interchest({
        age: val('ic-age'), sex: val('ic-sex'), historyCad: checked('ic-cad'), exertion: checked('ic-exertion'),
        pressure: checked('ic-pressure'), physicianSuspicion: checked('ic-suspect'), reproduciblePalpation: checked('ic-palpation'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Score', value: `${r.score}` },
        { label: 'CAD prob.', value: r.probability },
      ]);
      note(o, r.factors.length ? `Points: ${r.factors.join(', ')}.` : 'No points (score 0).');
      note(o, r.detail);
      note(o, r.note);
    }));
    postureNote(root);
  },
};

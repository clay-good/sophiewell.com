// spec-v784 §2: renderer for griffith-vt — the Griffith algorithm for wide-complex
// tachycardia (Clinical Scoring & Risk, Group G). Completes the VT-vs-SVT family beside
// brugada-vt and vereckei-avr.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. One pattern
// select plus the morphology checkboxes for both branches; only the chosen branch counts.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/griffith-vt-v784.js';
import { resultRow } from '../lib/result-copy.js';

function checkField(label, id) {
  const wrap = el('p');
  const cb = el('input', { id, type: 'checkbox' });
  wrap.appendChild(cb);
  wrap.appendChild(el('label', { for: id, text: ' ' + label }));
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
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function checked(id) { const n = document.getElementById(id); return !!(n && n.checked); }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. A wide-complex tachycardia in an unstable patient is treated as ventricular tachycardia and cardioverted regardless of what any algorithm says. This classifies a tracing and orders nothing.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

const PATTERN = [
  { value: 'rbbb', text: 'Right bundle pattern (V1 mainly positive)' },
  { value: 'lbbb', text: 'Left bundle pattern (V1 mainly negative)' },
];

export const renderers = {
  'griffith-vt'(root) {
    note(root, 'Griffith (1994) runs backwards from the other algorithms: it assumes ventricular tachycardia and only calls supraventricular tachycardia with aberrancy when the QRS is a textbook bundle branch block. Pick the pattern, then tick every feature that is present. Anything short of all of them is called ventricular tachycardia by default.');
    root.appendChild(selectField('Which bundle branch pattern does the QRS resemble', 'grif-pattern', PATTERN));
    root.appendChild(el('h2', { text: 'Right bundle pattern criteria (both required)' }));
    root.appendChild(checkField('rSR prime in V1', 'grif-rsr'));
    root.appendChild(checkField('RS in V6 with the R taller than the S', 'grif-v6rs'));
    root.appendChild(el('h2', { text: 'Left bundle pattern criteria (all three required)' }));
    root.appendChild(checkField('rS or QS in V1 and V2', 'grif-rsqs'));
    root.appendChild(checkField('Delay to the S nadir under 70 ms', 'grif-nadir'));
    root.appendChild(checkField('R wave in V6 with no Q wave', 'grif-v6r'));
    const ids = ['grif-pattern', 'grif-rsr', 'grif-v6rs', 'grif-rsqs', 'grif-nadir', 'grif-v6r'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.griffithVt({
        pattern: val('grif-pattern'),
        rsrV1: checked('grif-rsr'),
        rsV6RTaller: checked('grif-v6rs'),
        rsOrQsV1V2: checked('grif-rsqs'),
        nadirUnder70: checked('grif-nadir'),
        rNoQV6: checked('grif-v6r'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Reads as', value: r.diagnosis },
      ]);
      note(o, r.missingCriteria.length ? `Missing for a textbook block: ${r.missingCriteria.join(', ')}.` : 'All criteria for the chosen pattern are present.');
      note(o, r.detail);
      note(o, r.note);
    }));
    postureNote(root);
  },
};

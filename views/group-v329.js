// spec-v329: renderer for the Paris endoscopic classification of superficial neoplastic
// lesions. Group G. The endoscopist picks the morphologic type; the tile reports the type,
// its description, and whether it is a higher-risk (depressed/excavated) morphology.
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the morphologic type; it never asserts a diagnosis or a
// treatment decision (lib/paris-classification-v329.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/paris-classification-v329.js';
import { resultRow } from '../lib/result-copy.js';

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
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The diagnosis and the resection approach stay with the endoscopist and the patient.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'paris-classification'(root) {
    note(root, 'Paris endoscopic classification of superficial neoplastic lesions (esophagus, stomach, colon; 2002/2005). Pick the morphologic type. 0-I are protruded; 0-II non-protruding; 0-III excavated. Depressed (0-IIc) and excavated (0-III) types carry a higher risk of submucosal invasion. Near-neighbors: forrest.');
    root.appendChild(select('Paris morphologic type', 'paris-type', [
      ['0-Ip', '0-Ip — protruded, pedunculated'],
      ['0-Is', '0-Is — protruded, sessile'],
      ['0-IIa', '0-IIa — slightly elevated'],
      ['0-IIb', '0-IIb — completely flat'],
      ['0-IIc', '0-IIc — slightly depressed'],
      ['0-III', '0-III — excavated (ulcerated)'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['paris-type'], () => safe(o, () => {
      const r = M.parisClassification({ type: val('paris-type') });
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Type', value: r.type },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};

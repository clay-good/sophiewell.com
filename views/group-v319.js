// spec-v319: renderer for the Canadian Cardiovascular Society (CCS) angina grade.
// Group G. The clinician picks the class (I-IV); the tile reports the class and its
// standard definition.
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the functional class; it never asserts a diagnosis
// or a treatment decision (lib/ccs-angina-v319.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/ccs-angina-v319.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The diagnosis and treatment stay with the clinician and the patient.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'ccs-angina'(root) {
    note(root, 'Canadian Cardiovascular Society (CCS) angina grade (Campeau 1976): the angina analog of the NYHA functional class. Pick the class from the activity that provokes angina. Classes III–IV (angina on mild exertion or at rest) mark severe limitation. Near-neighbors: euroscore2.');
    root.appendChild(select('CCS angina class (activity that provokes angina)', 'ccs-grade', [
      ['1', 'I — only strenuous/rapid/prolonged exertion; ordinary activity does not'],
      ['2', 'II — slight limitation; hurrying, uphill, after meals, cold, > 2 blocks'],
      ['3', 'III — marked limitation; walking 1–2 blocks or 1 flight at normal pace'],
      ['4', 'IV — angina at rest or with any physical activity'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['ccs-grade'], () => safe(o, () => {
      const r = M.ccsAngina({ grade: val('ccs-grade') });
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Class', value: r.class },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};

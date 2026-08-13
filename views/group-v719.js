// spec-v719 §2: renderer for kennedy-edentulous — the Kennedy classification of the
// partially edentulous arch (Clinical Scoring & Risk, Group G). Dentistry vein.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. A class select and a
// modification-count select; decision logic returns the Kennedy class and modification number.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/kennedy-edentulous-v719.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The Kennedy class describes the arch to guide denture design; it does not prescribe the appliance. It supports rather than replaces the prosthodontic assessment and clinical judgment.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

const CHOICE = (pairs) => [{ value: '', text: '— choose —' }, ...pairs.map(([value, text]) => ({ value, text }))];
const CLASS = [
  ['I', 'Bilateral gaps, both behind all remaining teeth'],
  ['II', 'One-sided gap, behind the remaining teeth on that side'],
  ['III', 'One-sided gap with natural teeth in front of and behind it'],
  ['IV', 'Single gap crossing the midline, in front of the remaining teeth'],
];
const MODS = [['0', '0 (none)'], ['1', '1'], ['2', '2'], ['3', '3'], ['4', '4']];

export const renderers = {
  'kennedy-edentulous'(root) {
    note(root, 'Kennedy classification (with Applegate rules): the class is set by the most-posterior edentulous area; extra edentulous areas are modification spaces numbered by count. Class IV admits no modifications.');
    root.appendChild(selectField('Class-determining (most-posterior) edentulous area', 'ken-class', CHOICE(CLASS)));
    root.appendChild(selectField('Number of additional edentulous areas (modifications)', 'ken-mods', CHOICE(MODS)));
    const ids = ['ken-class', 'ken-mods'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.kennedyEdentulous({ primaryClass: val('ken-class'), modifications: val('ken-mods') });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Class', value: r.kennedyClass },
        { label: 'Mods', value: `${r.modifications}` },
      ]);
      note(o, r.detail);
      note(o, r.note);
    }));
    postureNote(root);
  },
};

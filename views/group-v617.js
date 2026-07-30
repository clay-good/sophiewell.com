// spec-v617: renderer for the WHO oral mucositis scale. Group G. Sections are h2 (an h3 under the page h1 is
// a heading-level skip). Appearance and oral intake are asked as two SEPARATE questions, because the scale
// silently switches from one axis to the other at grade 2 (lib/who-mucositis-v617.js).
//
// Per spec-v11 section 5.3 this grades a toxicity for reporting; it never diagnoses, never measures pain, and
// never decides feeding, analgesia or cancer-treatment changes.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/who-mucositis-v617.js';
import { resultRow } from '../lib/result-copy.js';

function select(label, id, options) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const s = el('select', { id });
  s.appendChild(el('option', { value: '', text: '--' }));
  for (const o of options) s.appendChild(el('option', { value: o.value, text: o.text }));
  wrap.appendChild(s);
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function heading(root, text) { root.appendChild(el('h2', { text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The management decision stays with the clinician.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'who-mucositis'(root) {
    note(root, M.TWO_AXIS_NOTE);

    heading(root, 'Mucosal appearance — this decides grades 0 to 2 only');
    root.appendChild(select('Appearance', 'whom-appearance', M.APPEARANCE));
    note(root, M.EXTENT_NOTE);

    heading(root, 'Oral intake — this decides grades 3 and 4 on its own');
    root.appendChild(select('What the patient can tolerate', 'whom-intake', M.INTAKE));
    note(root, M.APPEARANCE_IGNORED_NOTE);

    const o = out(); root.appendChild(o);
    wire(['whom-appearance', 'whom-intake'], () => safe(o, () => {
      const r = M.whoMucositis({ appearance: val('whom-appearance'), intake: val('whom-intake') });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.bandLabel },
        { label: 'Grade', value: `${r.grade}` },
        { label: 'Set by', value: r.appearanceIgnored ? 'Oral intake alone' : 'Mucosal appearance' },
      ]);
      note(o, r.bandText);
      note(o, r.note);
    }));

    heading(root, 'What the grade does not tell you');
    note(root, M.ATTRIBUTION_NOTE);
    note(root, M.PURPOSE_NOTE);
    postureNote(root);
  },
};

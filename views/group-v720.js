// spec-v720 §2: renderer for angle-malocclusion — the Angle classification of malocclusion
// (Clinical Scoring & Risk, Group G). Dentistry / orthodontics vein.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. A molar-relationship
// select and (for Class II) an incisor-pattern select; decision logic returns the Angle class.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/angle-malocclusion-v720.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The Angle class describes the occlusal relationship to guide orthodontic assessment; it does not prescribe treatment. It supports rather than replaces the orthodontic evaluation and clinical judgment.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

const CHOICE = (pairs) => [{ value: '', text: '— choose —' }, ...pairs.map(([value, text]) => ({ value, text }))];
const REL = [
  ['neutroclusion', 'MB cusp in the buccal groove (neutroclusion)'],
  ['distoclusion', 'MB cusp mesial to / in front of the groove (distoclusion)'],
  ['mesioclusion', 'MB cusp distal to / behind the groove (mesioclusion)'],
];
const INCISORS = [
  ['proclined', 'Proclined / protruded upper incisors (Division 1)'],
  ['retroclined', 'Retroclined / palatal upper central incisors (Division 2)'],
];

export const renderers = {
  'angle-malocclusion'(root) {
    note(root, 'Angle classification (Angle 1899): by the mesiobuccal (MB) cusp of the upper first molar vs the buccal groove of the lower first molar. Class I in the groove; Class II mesial to it (Div 1 proclined / Div 2 retroclined incisors); Class III distal to it.');
    root.appendChild(selectField('Molar relationship (upper MB cusp vs lower buccal groove)', 'angle-rel', CHOICE(REL)));
    root.appendChild(selectField('Maxillary incisor pattern (Class II only)', 'angle-incisors', CHOICE(INCISORS)));
    const ids = ['angle-rel', 'angle-incisors'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.angleMalocclusion({ molarRelationship: val('angle-rel'), incisors: val('angle-incisors') });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Class', value: r.angleClass },
        { label: 'Division', value: r.division ? `${r.division}` : '—' },
      ]);
      note(o, r.detail);
      note(o, r.note);
    }));
    postureNote(root);
  },
};

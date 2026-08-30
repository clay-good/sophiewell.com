// spec-v902 §2: renderer for marsi — medical adhesive-related skin injury (Clinical Scoring &
// Risk, Group G).
//
// The thirty-minute rule prints on every result, because transient erythema under a dressing is
// what most often gets written up as an injury.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/marsi-v902.js';
import { resultRow } from '../lib/result-copy.js';

function selectField(root, label, id, options) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  const sel = el('select', { id });
  for (const o of options) sel.appendChild(el('option', { value: o.value, text: o.text }));
  wrap.appendChild(sel);
  root.appendChild(wrap);
}
function checkField(root, label, id) {
  const wrap = el('p');
  wrap.appendChild(el('input', { id, type: 'checkbox' }));
  wrap.appendChild(el('label', { for: id, text: ' ' + label }));
  root.appendChild(wrap);
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function checked(id) { const n = document.getElementById(id); return Boolean(n && n.checked); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  marsi(root) {
    note(root, 'Erythema that fades within half an hour of removing the adhesive is not an injury. Persistence is the criterion.');

    root.appendChild(el('h2', { text: 'The criterion' }));
    checkField(root, 'The skin change persists 30 minutes or more after the adhesive was removed', 'ma-persiststhirtyminutes');

    root.appendChild(el('h2', { text: 'Which injury' }));
    // Written out rather than mapped from M.INJURIES: scripts/lib/option-labels.mjs reads option
    // text out of this file statically, and a mapped list is not readable.
    selectField(root, 'What was seen', 'ma-injury', [
      { value: '', text: 'Not yet categorized' },
      { value: 'skin-stripping', text: 'Mechanical: skin stripping, epidermis removed with the adhesive' },
      { value: 'tension-injury', text: 'Mechanical: tension injury or blister' },
      { value: 'skin-tear', text: 'Mechanical: skin tear caused by the adhesive or its removal' },
      { value: 'irritant-dermatitis', text: 'Dermatitis: irritant, confined to the adhesive footprint' },
      { value: 'allergic-dermatitis', text: 'Dermatitis: allergic, extending beyond the footprint' },
      { value: 'maceration', text: 'Other: maceration' },
      { value: 'folliculitis', text: 'Other: folliculitis' },
    ]);

    const o = out(); root.appendChild(o);
    wire(['ma-persiststhirtyminutes', 'ma-injury'], () => safe(o, () => {
      const r = M.marsi({
        persistsThirtyMinutes: checked('ma-persiststhirtyminutes'),
        injury: val('ma-injury'),
      });
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }]);
      if (r.skinTearNote) note(o, r.skinTearNote);
      if (r.dermatitisNote) note(o, r.dermatitisNote);
      note(o, r.persistenceNote);
      note(o, r.techniqueNote);
      note(o, r.scopeNote);
      note(o, r.detail);
      note(o, r.note);
    }));

    root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. This records a finding against a published consensus. It does not diagnose an allergy, and it does not choose an adhesive.' }));
  },
};

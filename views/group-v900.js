// spec-v900 §2: renderer for skin-tear — the ISTAP classification of a skin tear (Clinical
// Scoring & Risk, Group G).
//
// The not-a-pressure-injury sentence prints on every result, because "stage 2" is the wrong
// vocabulary a skin tear most often gets written up in.

import { el, clear } from '../lib/dom.js';
import * as S from '../lib/skin-tear-v900.js';
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
  'skin-tear'(root) {
    note(root, 'A skin tear is an acute traumatic wound. It is not staged like a pressure injury, and the two systems are not interchangeable.');

    root.appendChild(el('h2', { text: 'The flap' }));
    checkField(root, 'A flap is present', 'st-flappresent');
    checkField(root, 'The flap can be repositioned to cover the whole wound bed', 'st-flapcoverswholebed');

    root.appendChild(el('h2', { text: 'Or record the type directly' }));
    // Written out rather than mapped from S.TYPES: scripts/lib/option-labels.mjs reads option
    // text out of this file statically, and a mapped list is not readable.
    selectField(root, 'Type, if it is already assigned', 'st-type', [
      { value: '', text: 'Derive it from the flap above' },
      { value: 'type-1', text: 'Type 1: no skin loss, the flap covers the wound bed' },
      { value: 'type-2', text: 'Type 2: partial flap loss' },
      { value: 'type-3', text: 'Type 3: total flap loss' },
    ]);

    const o = out(); root.appendChild(o);
    wire(['st-flappresent', 'st-flapcoverswholebed', 'st-type'], () => safe(o, () => {
      const r = S.skinTear({
        flapPresent: checked('st-flappresent'),
        flapCoversWholeBed: checked('st-flapcoverswholebed'),
        type: val('st-type'),
      });
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }]);
      note(o, r.derivationNote);
      if (r.disagreementNote) note(o, r.disagreementNote);
      note(o, r.flapNote);
      note(o, r.notPressureNote);
      note(o, r.dressingNote);
      note(o, r.preventionNote);
      note(o, r.scopeNote);
      note(o, r.detail);
      note(o, r.note);
    }));

    root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. This records a finding against a published classification. It does not choose a dressing, and it does not stage a pressure injury.' }));
  },
};

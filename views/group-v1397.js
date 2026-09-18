// spec-v1397: renderers for licensure and practice authority (State & Coverage Reference, Group M):
// nurse-license-training-requirements (New York first).
//
// Each select is written as `'dom-id', CONST` so scripts/lib/option-labels.mjs, which reads views
// statically, resolves the option text for the tool page.

import { el, clear } from '../lib/dom.js';
import * as NLT from '../lib/nurse-license-training-requirements-v1397.js';
import { resultRow } from '../lib/result-copy.js';

function selectField(root, label, id, options, blankText) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const sel = el('select', { id });
  sel.appendChild(el('option', { value: '', text: blankText }));
  for (const o of options) sel.appendChild(el('option', { value: o.value, text: o.text }));
  wrap.appendChild(sel);
  root.appendChild(wrap);
}
function dateField(root, label, id, hint) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'date' }));
  if (hint) wrap.appendChild(el('span', { class: 'muted', text: ' ' + hint }));
  root.appendChild(wrap);
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'nurse-license-training-requirements'(root) {
    note(root, 'New York for now. Enter the dates you completed each course; leave one blank if you have not taken it.');
    selectField(root, 'State', 'nlt-state', NLT.NLT_STATES, '-- choose --');
    selectField(root, 'License', 'nlt-license', NLT.LICENSES, '-- choose --');
    selectField(root, 'Practicing in New York', 'nlt-practicing', NLT.YES_NO, '-- choose --');
    dateField(root, 'Child abuse identification course completed', 'nlt-abuse', 'blank if never');
    selectField(root, 'Child abuse training exemption claimed (no contact with minors)', 'nlt-exempt', NLT.YES_NO, '-- not entered --');
    dateField(root, 'Infection control course completed', 'nlt-infection', 'most recent');

    const ids = ['nlt-state', 'nlt-license', 'nlt-practicing', 'nlt-abuse', 'nlt-exempt', 'nlt-infection'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = NLT.nurseLicenseTrainingRequirements({
        state: val('nlt-state'), license: val('nlt-license'), practicingNY: val('nlt-practicing'),
        abuseDate: val('nlt-abuse'), abuseExempt: val('nlt-exempt'), infectionDate: val('nlt-infection'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.items[0].text, cls: r.items[0].status === 'due' ? 'warn' : null },
        { label: 'Child abuse update', value: r.bandLabel },
      ]);
      note(o, r.items[1].text);
      note(o, r.note);
      note(o, r.postureNote);
    }));
  },
};

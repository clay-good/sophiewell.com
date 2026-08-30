// spec-v898 §2: renderer for pci-surgery-timing — elective surgery timing after coronary
// stenting (Clinical Scoring & Risk, Group G).
//
// The stent-type sentence prints on every result, because the two intervals differ by a factor
// of twelve and the type is not always in the note that mentions the stent.

import { el, clear } from '../lib/dom.js';
import * as P from '../lib/pci-surgery-timing-v898.js';
import { resultRow } from '../lib/result-copy.js';

function selectField(root, label, id, options) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  const sel = el('select', { id });
  for (const o of options) sel.appendChild(el('option', { value: o.value, text: o.text }));
  wrap.appendChild(sel);
  root.appendChild(wrap);
}
function numField(root, label, id, attrs) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('input', Object.assign({ id, type: 'number' }, attrs || {})));
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
  'pci-surgery-timing'(root) {
    note(root, 'For elective noncardiac surgery. Which stent was placed changes the interval by a factor of twelve.');

    root.appendChild(el('h2', { text: 'The coronary intervention' }));
    // Written out rather than mapped from P.PROCEDURES: scripts/lib/option-labels.mjs reads
    // option text out of this file statically, and a mapped list is not readable.
    selectField(root, 'What was done', 'pci-procedure', [
      { value: 'des', text: 'Drug-eluting stent' },
      { value: 'bms', text: 'Bare-metal stent' },
      { value: 'balloon', text: 'Balloon angioplasty, no stent' },
    ]);
    numField(root, 'Days since the intervention', 'pci-dayssince', { min: '0', max: '3650', step: '1' });

    root.appendChild(el('h2', { text: 'The operation' }));
    checkField(root, 'The surgery is urgent or an emergency', 'pci-urgentoremergency');

    const o = out(); root.appendChild(o);
    wire(['pci-procedure', 'pci-dayssince', 'pci-urgentoremergency'], () => safe(o, () => {
      const r = P.pciSurgeryTiming({
        procedure: val('pci-procedure'),
        daysSince: val('pci-dayssince'),
        urgentOrEmergency: checked('pci-urgentoremergency'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }]);
      if (r.judgmentNote) note(o, r.judgmentNote);
      note(o, r.typeMattersNote);
      note(o, r.antiplateletNote);
      if (r.urgencyNote) note(o, r.urgencyNote);
      note(o, r.scopeNote);
      note(o, r.detail);
      note(o, r.note);
    }));

    root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. This compares an elapsed interval against published minimums. It does not schedule an operation, and it does not decide antiplatelet therapy.' }));
  },
};

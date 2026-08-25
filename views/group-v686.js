// spec-v686 §2: renderer for ucsf-hcc — the UCSF criteria for HCC liver-transplant
// eligibility (Clinical Scoring & Risk, Group G). The expanded companion to the built
// Milan criteria and Up-to-Seven.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Three number
// inputs (nodules, largest, total) plus two exclusion checkboxes (vascular invasion,
// extrahepatic spread); decision logic classifies within/outside UCSF.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/ucsf-hcc-v686.js';
import { resultRow } from '../lib/result-copy.js';

function numberField(label, id, step) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'number', min: '0', step: step || '0.1', inputmode: 'decimal' }));
  return wrap;
}
function checkField(label, id) {
  const wrap = el('p');
  const cb = el('input', { id, type: 'checkbox' });
  wrap.appendChild(cb);
  wrap.appendChild(el('label', { for: id, text: ` ${label}` }));
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function checked(id) { const n = document.getElementById(id); return !!(n && n.checked); }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. UCSF classifies radiologic tumor burden for HCC transplant candidacy; gross vascular invasion or extrahepatic spread makes a patient ineligible regardless of size. Final listing decisions rest with the transplant team and its regional policy.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'ucsf-hcc'(root) {
    note(root, 'UCSF criteria (Yao 2001) for HCC liver-transplant eligibility: within if a single tumor ≤ 6.5 cm, or ≤ 3 nodules with the largest ≤ 4.5 cm and total ≤ 8 cm — and no macrovascular invasion or extrahepatic spread. The expanded version of Milan.');
    root.appendChild(numberField('Number of tumor nodules', 'ucsf-nodules', '1'));
    root.appendChild(numberField('Largest tumor diameter (cm)', 'ucsf-largest', '0.1'));
    root.appendChild(numberField('Total (summed) tumor diameter (cm)', 'ucsf-total', '0.1'));
    root.appendChild(checkField('Gross (macro)vascular invasion', 'ucsf-vascular'));
    root.appendChild(checkField('Extrahepatic spread', 'ucsf-extrahepatic'));
    const ids = ['ucsf-nodules', 'ucsf-largest', 'ucsf-total', 'ucsf-vascular', 'ucsf-extrahepatic'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.ucsfHcc({
        nodules: val('ucsf-nodules'), largest: val('ucsf-largest'), total: val('ucsf-total'),
        vascular: checked('ucsf-vascular'), extrahepatic: checked('ucsf-extrahepatic'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Status', value: r.within ? 'within UCSF' : 'outside UCSF' },
      ]);
      note(o, r.detail);
      note(o, r.note);
    }));
    postureNote(root);
  },
};

// spec-v683 §2: renderer for effective-osmolality — effective serum osmolality / tonicity
// (Clinical Scoring & Risk, Group G). Distinct from the osmolal-gap tile (total osmolality).
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Two number
// inputs (sodium, glucose); a formula returns tonicity in mOsm/kg.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/effective-osmolality-v683.js';
import { resultRow } from '../lib/result-copy.js';

function numberField(label, id, step) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'number', min: '0', step: step || '1', inputmode: 'decimal' }));
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. Effective osmolality (tonicity) excludes urea and is used in the diagnostic criteria for the hyperosmolar hyperglycemic state; it supports rather than replaces clinical assessment.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'effective-osmolality'(root) {
    note(root, 'Effective serum osmolality (tonicity) = 2 × sodium + glucose/18. It excludes urea, unlike total calculated osmolality (the Osmolal Gap tool). Reference range ~275–295 mOsm/kg; above 320 is a diagnostic criterion for the hyperosmolar hyperglycemic state (HHS).');
    root.appendChild(numberField('Serum sodium (mEq/L)', 'eosm-na', '1'));
    root.appendChild(numberField('Serum glucose (mg/dL)', 'eosm-glu', '1'));
    const ids = ['eosm-na', 'eosm-glu'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.effectiveOsmolality({ sodium: val('eosm-na'), glucose: val('eosm-glu') });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Effective osm', value: `${r.osmolality} mOsm/kg` },
      ]);
      note(o, r.detail);
      note(o, r.note);
    }));
    postureNote(root);
  },
};

// spec-v703 §2: renderer for reimers-migration-percentage — the Reimers migration
// percentage / hip migration index (Clinical Scoring & Risk, Group G).
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Two number inputs
// (lateral and total femoral-head width); a ratio returns the migration percentage.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/reimers-migration-percentage-v703.js';
import { resultRow } from '../lib/result-copy.js';

function numberField(label, id, step) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'number', min: '0', step: step || '0.1', inputmode: 'decimal' }));
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The migration percentage measures hip displacement on a single film; it does not by itself dictate surgery. It supports rather than replaces the hip-surveillance program and clinical judgment.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'reimers-migration-percentage'(root) {
    note(root, "Reimers migration percentage (hip migration index): MP = (a / b) × 100, where a is the femoral-head width lateral to Perkin's line and b is the total femoral-head width (mm). ≤ 33% normal, > 33% subluxated (surveillance referral), ~90–100% dislocated.");
    root.appendChild(numberField("Femoral-head width lateral to Perkin's line, a (mm)", 'reimers-a', '0.1'));
    root.appendChild(numberField('Total femoral-head width, b (mm)', 'reimers-b', '0.1'));
    const ids = ['reimers-a', 'reimers-b'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.reimersMigrationPercentage({ lateralWidth: val('reimers-a'), totalWidth: val('reimers-b') });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Migration', value: `${r.migrationPercentage}%` },
      ]);
      note(o, r.detail);
      note(o, r.note);
    }));
    postureNote(root);
  },
};

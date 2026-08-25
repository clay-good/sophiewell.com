// spec-v655 §2: renderer for completeness-cytoreduction — the Sugarbaker CC score
// (Clinical Scoring & Risk, Group G). Companion to peritoneal-cancer-index.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. One residual-
// nodule-size number input plus a confluence checkbox that forces CC-3.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/completeness-cytoreduction-v655.js';
import { resultRow } from '../lib/result-copy.js';

function numberField(label, id) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'number', min: '0', step: 'any', inputmode: 'decimal' }));
  return wrap;
}
function checkField(label, id) {
  const wrap = el('p');
  const inp = el('input', { id, type: 'checkbox' });
  wrap.appendChild(inp);
  wrap.appendChild(el('label', { for: id, text: ' ' + label }));
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function chk(id) { const n = document.getElementById(id); return n ? n.checked : false; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The CC score grades the largest residual tumor nodule after cytoreductive surgery; it is read alongside the Peritoneal Cancer Index and the operative findings, and the decision stays with the surgical team.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'completeness-cytoreduction'(root) {
    note(root, 'Completeness of Cytoreduction (CC) score (Jacquet-Sugarbaker 1996): the largest residual tumor nodule after cytoreductive surgery. CC-0 none, CC-1 under 2.5 mm, CC-2 2.5 mm to 2.5 cm, CC-3 over 2.5 cm or confluence. CC-0 and CC-1 are a complete cytoreduction.');
    root.appendChild(numberField('Largest residual tumor nodule (mm)', 'cc-residual'));
    root.appendChild(checkField('Confluence of unresectable disease (forces CC-3)', 'cc-confluence'));
    const ids = ['cc-residual', 'cc-confluence'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.completenessCytoreduction({ residualMm: val('cc-residual'), confluence: chk('cc-confluence') });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.bandLabel, cls: r.abnormal ? 'warn' : null },
        { label: 'Grade', value: r.code },
        { label: 'Cytoreduction', value: r.complete ? 'complete' : 'incomplete' },
      ]);
      note(o, r.detail);
      note(o, r.note);
    }));
    postureNote(root);
  },
};

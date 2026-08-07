// spec-v654 §2: renderer for peritoneal-cancer-index — the Jacquet-Sugarbaker
// Peritoneal Cancer Index (Clinical Scoring & Risk, Group G). Companion to the built
// oncologic staging tiles.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Thirteen
// region selects, each a 0-3 lesion-size score defaulting to 0 (no tumor); the sum is
// 0-39.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/peritoneal-cancer-index-v654.js';
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
function selVal(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The PCI is the sum of the lesion-size scores you entered across the 13 regions; selection thresholds for cytoreductive surgery and HIPEC are tumor-type specific and center-dependent, and candidacy also depends on the completeness-of-cytoreduction score and tumor biology. The decision stays with the surgical team.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

const LS_OPTS = [
  { value: '0', text: '0 — no tumor' },
  { value: '1', text: '1 — up to 0.5 cm' },
  { value: '2', text: '2 — up to 5.0 cm' },
  { value: '3', text: '3 — > 5.0 cm or confluence' },
];
const DOM = (key) => `pci-${key}`;

export const renderers = {
  'peritoneal-cancer-index'(root) {
    note(root, 'Peritoneal Cancer Index (Jacquet-Sugarbaker 1996): score each of the 13 abdominopelvic regions 0-3 by lesion size (0 none, 1 up to 0.5 cm, 2 up to 5.0 cm, 3 over 5 cm or confluence). Sum 0-39; higher = greater peritoneal tumor burden. Each region defaults to 0 (no tumor).');
    for (const r of M.PCI_REGIONS) root.appendChild(selectField(`${r.label} region`, DOM(r.key), LS_OPTS));
    const ids = M.PCI_REGIONS.map((r) => DOM(r.key));
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const input = {};
      for (const r of M.PCI_REGIONS) input[r.key] = selVal(DOM(r.key));
      const res = M.peritonealCancerIndex(input);
      if (!res.valid) { note(o, res.message); return; }
      resultRow(o, [
        { text: res.bandLabel, cls: res.abnormal ? 'warn' : null },
        { label: 'Total', value: `${res.total}/39` },
        { label: 'Regions involved', value: `${res.regionsInvolved}/13` },
      ]);
      note(o, res.detail);
      note(o, res.note);
    }));
    postureNote(root);
  },
};

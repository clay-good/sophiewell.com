// spec-v731 §2: renderer for ibfat — the Infant Breastfeeding Assessment Tool (Clinical
// Scoring & Risk, Group G).
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Four 0-3 selects;
// the sum 0-12 maps to a feeding-effectiveness band. Neutral item-topic labels (anchor
// wording is copyrighted).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/ibfat-v731.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The IBFAT describes a single observed feed to support breastfeeding assessment; it is not a diagnosis. It supports rather than replaces the clinical and lactation evaluation.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

const SCORE = [{ value: '', text: '— 0-3 —' }, { value: '0', text: '0 (poorest)' }, { value: '1', text: '1' }, { value: '2', text: '2' }, { value: '3', text: '3 (best)' }];

export const renderers = {
  'ibfat'(root) {
    note(root, 'Infant Breastfeeding Assessment Tool (Matthews 1988): score four feeding behaviors 0–3 (best = 3), summed to 0–12. A total of 10–12 indicates effective feeding.');
    root.appendChild(selectField('Readiness to feed (behavioral state)', 'ibfat-ready', SCORE));
    root.appendChild(selectField('Rooting', 'ibfat-root', SCORE));
    root.appendChild(selectField('Fixing (latching on)', 'ibfat-fix', SCORE));
    root.appendChild(selectField('Sucking pattern', 'ibfat-suck', SCORE));
    const ids = ['ibfat-ready', 'ibfat-root', 'ibfat-fix', 'ibfat-suck'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.ibfat({ readiness: val('ibfat-ready'), rooting: val('ibfat-root'), fixing: val('ibfat-fix'), sucking: val('ibfat-suck') });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Score', value: `${r.score}/12` },
        { label: 'Feeding', value: r.tier.replace('-', ' ') },
      ]);
      note(o, r.detail);
      note(o, r.note);
    }));
    postureNote(root);
  },
};

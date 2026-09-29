// spec-v1601: renderers for preventive-cost-share-check.

import { el, clear } from '../lib/dom.js';
import * as PC from '../lib/preventive-cost-share-check.js';
import { resultRow } from '../lib/result-copy.js';

const NA = { value: '', text: '— choose —' };
function selectField(root, label, id, options) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const s = el('select', { id });
  for (const opt of [NA, ...options]) s.appendChild(el('option', { value: opt.value, text: opt.text }));
  wrap.appendChild(s);
  root.appendChild(wrap);
}
function numField(root, label, id, placeholder, max, step) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'number', min: '0', max, step, inputmode: 'decimal', placeholder }));
  root.appendChild(wrap);
}
function list(root, items) {
  if (!items || !items.length) return;
  const ul = el('ul');
  for (const t of items) ul.appendChild(el('li', { text: t }));
  root.appendChild(ul);
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
  'preventive-cost-share-check'(root) {
    const pairs = [['pcs-plan', 'plan'], ['pcs-service', 'service'], ['pcs-network', 'network'], ['pcs-visit', 'visitSeparate'], ['pcs-purpose', 'primaryPurpose'], ['pcs-charged', 'charged']];
    selectField(root, 'Kind of plan', 'pcs-plan', PC.PLANS);
    selectField(root, 'What you were charged for', 'pcs-service', PC.SERVICES);
    selectField(root, 'Was the provider in network?', 'pcs-network', PC.NETWORK);
    selectField(root, 'Was an office visit billed separately? (optional)', 'pcs-visit', PC.YES_NO);
    selectField(root, 'Was the visit mainly for the preventive service? (optional)', 'pcs-purpose', PC.YES_NO);
    numField(root, 'Amount charged, dollars (optional)', 'pcs-charged', 'e.g. 350', '10000000', '0.01');
    const ids = pairs.map(([d]) => d);
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = PC.preventiveCostShareCheck(args);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'Cost sharing', value: r.bandLabel }]);
      list(o, r.notes);
      note(o, r.note);
    }));
  },
};

// spec-v685 §2: renderer for free-androgen-index — the Free Androgen Index (Clinical
// Scoring & Risk, Group G).
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. A sex select and
// two number inputs (total testosterone, SHBG, both nmol/L); a ratio returns the FAI.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/free-androgen-index-v685.js';
import { resultRow } from '../lib/result-copy.js';

function numberField(label, id, step) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'number', min: '0', step: step || '0.1', inputmode: 'decimal' }));
  return wrap;
}
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. FAI is unreliable at SHBG extremes and is not a stand-alone measure of free testosterone in men; reference ranges are assay- and lab-dependent. It supports rather than replaces clinical judgment.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

const CHOICE = (pairs) => [{ value: '', text: '— choose —' }, ...pairs.map(([value, text]) => ({ value, text }))];
const SEX = [['female', 'Female'], ['male', 'Male']];

export const renderers = {
  'free-androgen-index'(root) {
    note(root, 'Free Androgen Index (FAI) = 100 × total testosterone / SHBG, both in nmol/L (US total testosterone in ng/dL ÷ 28.84 = nmol/L). Used mainly to work up androgen excess in women: an FAI above ~5 supports androgen excess (e.g. PCOS).');
    root.appendChild(selectField('Sex', 'fai-sex', CHOICE(SEX)));
    root.appendChild(numberField('Total testosterone (nmol/L)', 'fai-t', '0.1'));
    root.appendChild(numberField('SHBG (nmol/L)', 'fai-shbg', '1'));
    const ids = ['fai-sex', 'fai-t', 'fai-shbg'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.freeAndrogenIndex({ sex: val('fai-sex'), testosterone: val('fai-t'), shbg: val('fai-shbg') });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'FAI', value: `${r.fai}` },
      ]);
      note(o, r.detail);
      note(o, r.note);
    }));
    postureNote(root);
  },
};

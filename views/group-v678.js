// spec-v678 §2: renderer for meld3 — MELD 3.0, the current OPTN liver-allocation
// score (Clinical Scoring & Risk, Group G). Successor to the meld-na tile.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Five lab
// number inputs, a sex select, and a dialysis checkbox; a fitted formula returns a
// 6-40 score.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/meld3-v678.js';
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
function checkField(label, id) {
  const wrap = el('p');
  const cb = el('input', { id, type: 'checkbox' });
  wrap.appendChild(cb);
  wrap.appendChild(el('label', { for: id, text: ' ' + label }));
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function checked(id) { const n = document.getElementById(id); return !!(n && n.checked); }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. MELD 3.0 estimates 90-day waitlist mortality for the transplant team; listing and organ allocation stay with the transplant center. Not for children under 12.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

const CHOICE = (pairs) => [{ value: '', text: '— choose —' }, ...pairs.map(([value, text]) => ({ value, text }))];
const SEX = [['female', 'Female'], ['male', 'Male']];

export const renderers = {
  'meld3'(root) {
    note(root, 'MELD 3.0 (Kim 2021): the current OPTN liver-allocation score, successor to MELD-Na. It adds female sex and albumin and refits every coefficient. Bilirubin, INR, creatinine floored at 1.0; creatinine capped at 3.0 (dialysis sets it to 3.0); sodium 125–137; albumin 1.5–3.5. Score 6–40.');
    root.appendChild(selectField('Sex', 'm3-sex', CHOICE(SEX)));
    root.appendChild(numberField('Serum bilirubin (mg/dL)', 'm3-bili', '0.1'));
    root.appendChild(numberField('INR', 'm3-inr', '0.1'));
    root.appendChild(numberField('Serum creatinine (mg/dL)', 'm3-creat', '0.1'));
    root.appendChild(numberField('Serum sodium (mEq/L)', 'm3-na', '1'));
    root.appendChild(numberField('Serum albumin (g/dL)', 'm3-alb', '0.1'));
    root.appendChild(checkField('≥ 2 dialysis sessions in the prior week (or 24h CVVHD) — sets creatinine to 3.0', 'm3-dial'));
    const ids = ['m3-sex', 'm3-bili', 'm3-inr', 'm3-creat', 'm3-na', 'm3-alb', 'm3-dial'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.meld3({
        sex: val('m3-sex'), bilirubin: val('m3-bili'), inr: val('m3-inr'), creatinine: val('m3-creat'),
        sodium: val('m3-na'), albumin: val('m3-alb'), dialysis: checked('m3-dial'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Score', value: `${r.score}/40` },
        { label: 'Priority', value: r.tier === 'lower' ? 'lower' : (r.tier === 'high' ? 'higher' : 'very high') },
      ]);
      note(o, r.detail);
      note(o, r.note);
    }));
    postureNote(root);
  },
};

// spec-v667 §2: renderer for fgsi — the Fournier's Gangrene Severity Index (Clinical
// Scoring & Risk, Group G). Companion to the built critical-care severity scores
// (apache2, saps-ii).
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Nine numeric
// physiologic inputs plus an acute-renal-failure checkbox; each parameter scores 0-4 by
// APACHE-II deviation, summed to 0-36 (up to 40 with the creatinine doubling).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/fgsi-v667.js';
import { resultRow } from '../lib/result-copy.js';

function numberField(label, id) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'number', step: 'any', inputmode: 'decimal' }));
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The FGSI estimates severity in Fournier gangrene from the physiologic values entered (the APACHE-II acute-physiology score over nine parameters); it is a cohort mortality estimate, not an individual prognosis, and is read with the full clinical picture.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

const DOM = { temp: 'fgsi-temp', hr: 'fgsi-hr', rr: 'fgsi-rr', na: 'fgsi-na', k: 'fgsi-k', creatinine: 'fgsi-creat', hct: 'fgsi-hct', wbc: 'fgsi-wbc', bicarbonate: 'fgsi-bicarb' };

export const renderers = {
  'fgsi'(root) {
    note(root, 'FGSI (Fournier’s Gangrene Severity Index, Laor 1995): the APACHE-II acute-physiology score over nine parameters, each scored 0-4 by deviation from normal, summed to 0-36. A total greater than 9 predicts high mortality. Creatinine points double in acute renal failure.');
    for (const p of M.FGSI_PARAMS) root.appendChild(numberField(p.label, DOM[p.key]));
    root.appendChild(checkField('Acute renal failure (doubles the creatinine points)', 'fgsi-arf'));
    const ids = M.FGSI_PARAMS.map((p) => DOM[p.key]).concat('fgsi-arf');
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const input = { acuteRenalFailure: chk('fgsi-arf') };
      for (const p of M.FGSI_PARAMS) input[p.key] = val(DOM[p.key]);
      const r = M.fgsi(input);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.bandLabel, cls: r.abnormal ? 'warn' : null },
        { label: 'Total', value: `${r.total}/${r.max}` },
      ]);
      note(o, r.detail);
      note(o, r.note);
    }));
    postureNote(root);
  },
};

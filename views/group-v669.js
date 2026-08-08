// spec-v669 §2: renderer for walter-index — the Walter Index for 1-year mortality
// after hospitalization in older adults (Clinical Scoring & Risk, Group G). Companion
// to the built Lee 4-Year Mortality Index (lee-mortality-index).
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Three
// categorical selects (sex, ADL dependence, cancer), one CHF flag, and two raw lab
// number inputs (creatinine, albumin); the total 0-20 maps to a 1-year mortality band.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/walter-index-v669.js';
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
function numberField(label, id) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'number', min: '0', step: '0.1', inputmode: 'decimal' }));
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The Walter index is a population-level estimate of 1-year mortality applied at hospital discharge in adults 70 or older on general medical services; it is not validated for surgical or ICU-only patients and never predicts an individual patient’s death. Care planning stays with the clinician, patient, and family.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

const CHOICE = (pairs) => [{ value: '', text: '— choose —' }, ...pairs.map(([value, text]) => ({ value, text }))];

const SEX_OPTS = [['female', 'Female'], ['male', 'Male']];
const ADL_OPTS = [['none', 'Independent in all 5 ADLs'], ['some', 'Dependent in 1–4 of 5 ADLs'], ['all', 'Dependent in all 5 ADLs']];
const CANCER_OPTS = [['none', 'No cancer'], ['solitary', 'Solitary (non-metastatic) cancer'], ['metastatic', 'Metastatic cancer']];

export const renderers = {
  'walter-index'(root) {
    note(root, 'Walter Index (Walter 2001): estimates 1-year mortality at hospital discharge in adults 70 or older. Male sex (1) + ADL dependence (1–4 = 2, all 5 = 5) + heart failure (2) + cancer (solitary 3, metastatic 8) + creatinine > 3.0 mg/dL (2) + albumin (3.0–3.4 = 1, < 3.0 = 2), total 0–20. The 5 ADLs are bathing, dressing, transferring, toileting, eating. Companion tile: lee-mortality-index.');
    root.appendChild(selectField('Sex', 'walter-sex', CHOICE(SEX_OPTS)));
    root.appendChild(selectField('ADL dependence at discharge (bathing, dressing, transferring, toileting, eating)', 'walter-adl', CHOICE(ADL_OPTS)));
    root.appendChild(checkField('Congestive heart failure', 'walter-chf'));
    root.appendChild(selectField('Cancer', 'walter-cancer', CHOICE(CANCER_OPTS)));
    root.appendChild(numberField('Serum creatinine (mg/dL)', 'walter-creat'));
    root.appendChild(numberField('Serum albumin (g/dL)', 'walter-alb'));
    const ids = ['walter-sex', 'walter-adl', 'walter-chf', 'walter-cancer', 'walter-creat', 'walter-alb'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.walterIndex({
        sex: val('walter-sex'),
        adl: val('walter-adl'),
        chf: checked('walter-chf'),
        cancer: val('walter-cancer'),
        creatinine: val('walter-creat'),
        albumin: val('walter-alb'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Score', value: `${r.score}/20` },
        { label: '1-year mortality', value: r.mortality },
      ]);
      note(o, r.factors.length ? `Points: ${r.factors.join(', ')}.` : 'No risk factors present (0 points).');
      note(o, r.note);
    }));
    postureNote(root);
  },
};

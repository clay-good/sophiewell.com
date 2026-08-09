// spec-v677 §2: renderer for mcmahon-rhabdo — the McMahon Score for rhabdomyolysis
// (Clinical Scoring & Risk, Group G). The first rhabdomyolysis tile in the catalog.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Six lab/age
// number inputs plus two selects (sex, cause); a weighted sum 0-19 maps to a
// low/high/very-high risk band for death or renal replacement.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/mcmahon-rhabdo-v677.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The McMahon score estimates the risk of death or renal replacement from admission values in adults with rhabdomyolysis; a score of 6 or more flags high risk and prompts considering renal-protective therapy. It is not for pre-existing end-stage renal disease or CK from myocardial infarction, and it supports rather than replaces clinical judgment.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

const CHOICE = (pairs) => [{ value: '', text: '— choose —' }, ...pairs.map(([value, text]) => ({ value, text }))];
const SEX = [['female', 'Female'], ['male', 'Male']];
const CAUSE = [['benign', 'Seizures, syncope, exercise, statins, or myositis'], ['other', 'Other cause']];

export const renderers = {
  'mcmahon-rhabdo'(root) {
    note(root, 'McMahon Score for rhabdomyolysis (McMahon 2013): predicts death or renal replacement from admission values. Age + female sex + creatinine + calcium < 7.5 + CPK > 40,000 + non-benign cause + phosphate + bicarbonate < 19 → 0–19. A score ≥ 6 is high risk.');
    root.appendChild(numberField('Age (years)', 'mcm-age', '1'));
    root.appendChild(selectField('Sex', 'mcm-sex', CHOICE(SEX)));
    root.appendChild(numberField('Initial creatinine (mg/dL)', 'mcm-creat', '0.1'));
    root.appendChild(numberField('Initial calcium (mg/dL)', 'mcm-ca', '0.1'));
    root.appendChild(numberField('Initial CPK / creatine kinase (U/L)', 'mcm-cpk', '1'));
    root.appendChild(selectField('Cause of rhabdomyolysis', 'mcm-cause', CHOICE(CAUSE)));
    root.appendChild(numberField('Initial phosphate (mg/dL)', 'mcm-phos', '0.1'));
    root.appendChild(numberField('Initial bicarbonate (mEq/L)', 'mcm-bicarb', '0.1'));
    const ids = ['mcm-age', 'mcm-sex', 'mcm-creat', 'mcm-ca', 'mcm-cpk', 'mcm-cause', 'mcm-phos', 'mcm-bicarb'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.mcmahonRhabdo({
        age: val('mcm-age'), sex: val('mcm-sex'), creatinine: val('mcm-creat'), calcium: val('mcm-ca'),
        cpk: val('mcm-cpk'), cause: val('mcm-cause'), phosphate: val('mcm-phos'), bicarbonate: val('mcm-bicarb'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Score', value: `${r.score}/19` },
        { label: 'Risk', value: r.tier === 'low' ? 'low' : (r.tier === 'high' ? 'high' : 'very high') },
      ]);
      note(o, r.factors.length ? `Points: ${r.factors.join(', ')}.` : 'No risk points (score 0).');
      note(o, r.detail);
      note(o, r.note);
    }));
    postureNote(root);
  },
};

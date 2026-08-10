// spec-v682 §2: renderer for wang-bronchiolitis — the Wang Bronchiolitis Respiratory
// Score (Clinical Scoring & Risk, Group G).
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. One respiratory-
// rate number input plus three clinical selects (wheezing, retraction, general condition);
// the sum 0-12 is reported with an advisory-only severity band.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/wang-bronchiolitis-v682.js';
import { resultRow } from '../lib/result-copy.js';

function numberField(label, id, step) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'number', min: '0', step: step || '1', inputmode: 'numeric' }));
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The Wang score grades infant bronchiolitis severity from 0 to 12; published severity cut-points disagree, so the band is advisory only. It is not a criterion for admission or discharge, and it supports rather than replaces clinical judgment.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

const CHOICE = (pairs) => [{ value: '', text: '— choose —' }, ...pairs.map(([value, text]) => ({ value, text }))];
const WHEEZE = [['0', 'None'], ['1', 'Terminal expiratory or only with a stethoscope'], ['2', 'Entire expiration or audible without a stethoscope'], ['3', 'Inspiration and expiration without a stethoscope']];
const RETRACT = [['0', 'None'], ['1', 'Intercostal only'], ['2', 'Tracheosternal'], ['3', 'Severe with nasal flaring']];
const CONDITION = [['0', 'Normal'], ['3', 'Irritable, lethargic, or poor feeding']];

export const renderers = {
  'wang-bronchiolitis'(root) {
    note(root, 'Wang Bronchiolitis Respiratory Score (Wang 1992): infant bronchiolitis severity. Respiratory rate (banded), wheezing, retraction, and general condition each score 0–3 (general condition is only 0 or 3), summing to 0–12. Higher is more severe; published cut-points disagree, so bands are advisory.');
    root.appendChild(numberField('Respiratory rate (breaths/min)', 'wang-rr', '1'));
    root.appendChild(selectField('Wheezing', 'wang-wheeze', CHOICE(WHEEZE)));
    root.appendChild(selectField('Retraction', 'wang-retract', CHOICE(RETRACT)));
    root.appendChild(selectField('General condition', 'wang-cond', CHOICE(CONDITION)));
    const ids = ['wang-rr', 'wang-wheeze', 'wang-retract', 'wang-cond'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.wangBronchiolitis({
        respiratoryRate: val('wang-rr'), wheezing: val('wang-wheeze'), retraction: val('wang-retract'), generalCondition: val('wang-cond'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Score', value: `${r.score}/12` },
        { label: 'Advisory', value: r.advisoryBand },
      ]);
      note(o, r.detail);
      note(o, r.note);
    }));
    postureNote(root);
  },
};

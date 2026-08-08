// spec-v664 §2: renderer for diastolic-function-ase — the ASE/EACVI 2016 LV diastolic
// function screen for normal EF (Clinical Scoring & Risk, Group G). Companion to the
// built HFpEF-probability scores (h2fpef, hfa-peff) on a different axis.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Five optional
// numeric echo values feed four criteria; the fraction of measured criteria abnormal
// classifies normal / indeterminate / diastolic dysfunction.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/diastolic-function-ase-v664.js';
import { resultRow } from '../lib/result-copy.js';

function numberField(label, id) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'number', min: '0', step: 'any', inputmode: 'decimal' }));
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a diagnosis. This is the ASE 2016 four-variable screen for normal-EF diastolic function; it does not compute the grade (I-III), which needs mitral E/A and peak E. It takes the measured echo values and supports the reading by the cardiologist / sonographer.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'diastolic-function-ase'(root) {
    note(root, 'ASE/EACVI 2016 LV diastolic function screen (normal EF): average E/e′ > 14, annular e′ (septal < 7 or lateral < 10 cm/s), TR velocity > 2.8 m/s, LA volume index > 34 mL/m2. Of the criteria measured, fewer than half abnormal = normal, more than half = diastolic dysfunction, exactly half = indeterminate. Enter the values you have (at least three ideally). Grade I-III is not computed here. Companion tiles: h2fpef, hfa-peff.');
    root.appendChild(numberField('Average E/e′', 'dias-ee'));
    root.appendChild(numberField('Septal e′ velocity (cm/s)', 'dias-septal'));
    root.appendChild(numberField('Lateral e′ velocity (cm/s)', 'dias-lateral'));
    root.appendChild(numberField('Peak TR velocity (m/s)', 'dias-tr'));
    root.appendChild(numberField('LA volume index (mL/m2)', 'dias-lavi'));
    const ids = ['dias-ee', 'dias-septal', 'dias-lateral', 'dias-tr', 'dias-lavi'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.diastolicFunctionAse({ avgEe: val('dias-ee'), septalE: val('dias-septal'), lateralE: val('dias-lateral'), trVelocity: val('dias-tr'), lavi: val('dias-lavi') });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.bandLabel, cls: r.abnormal ? 'warn' : null },
        { label: 'Abnormal', value: `${r.positive}/${r.available}` },
      ]);
      if (r.fewCriteria) note(o, 'Fewer than three criteria were measured — interpret with caution; the algorithm is designed for at least three of the four.');
      note(o, r.detail);
      note(o, r.note);
    }));
    postureNote(root);
  },
};

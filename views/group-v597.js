// spec-v597: renderer for the PANC 3 score. Group G. Sections are h2 (an h3 under the page h1 is a
// heading-level skip). Each input carries its correct unit inline, because two of the three are printed
// wrongly in circulating reproductions (lib/panc3-v597.js).
//
// There is deliberately no amylase or lipase input. Per spec-v11 section 5.3 this predicts severity in an
// established diagnosis; it never diagnoses, never identifies a cause, and a negative result is never
// presented as a reason to stand down monitoring.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/panc3-v597.js';
import { resultRow } from '../lib/result-copy.js';

function number(label, id) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'number', min: '0', step: 'any' }));
  return wrap;
}
function select(label, id) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const s = el('select', { id });
  for (const [value, text] of [['', '--'], ['no', 'No'], ['yes', 'Yes']]) s.appendChild(el('option', { value, text }));
  wrap.appendChild(s);
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function heading(root, text) { root.appendChild(el('h2', { text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The management decision stays with the clinician.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  panc3(root) {
    note(root, `All three criteria must be present — two of three is NOT a positive result. Every item is available at admission, unlike the 48-hour scores in this catalog.`);

    heading(root, 'The three admission criteria');
    root.appendChild(number(`Hematocrit (%) — positive above ${M.HEMATOCRIT_THRESHOLD}`, 'panc3-hct'));
    root.appendChild(number(`Body mass index (kg/m^2) — positive above ${M.BMI_THRESHOLD}`, 'panc3-bmi'));
    root.appendChild(select('Pleural effusion on the chest radiograph', 'panc3-effusion'));
    note(root, M.UNIT_NOTE);

    const o = out(); root.appendChild(o);
    wire(['panc3-hct', 'panc3-bmi', 'panc3-effusion'], () => safe(o, () => {
      const r = M.panc3({
        hematocrit: val('panc3-hct'), bmi: val('panc3-bmi'),
        pleuralEffusion: val('panc3-effusion'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band },
        { label: 'Score', value: `${r.total} of ${r.max}` },
        { label: 'Positive at', value: `${r.required} of ${r.max}` },
        { label: 'Criteria met', value: r.metCriteria.length ? r.metCriteria.join(', ') : 'none' },
      ]);
      note(o, r.bandText);
      note(o, r.note);
    }));

    heading(root, 'What a negative result is worth');
    note(root, M.RULE_IN_NOTE);
    note(root, M.TIMING_NOTE);
    note(root, M.ENZYME_NOTE);
    postureNote(root);
  },
};

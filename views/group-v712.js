// spec-v712 §2: renderer for mna-sf — the Mini Nutritional Assessment Short Form (Clinical
// Scoring & Risk, Group G).
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Six per-item
// selects; the sum 0-14 maps to a nutritional-status band. Neutral labels only (the MNA is a
// trademark and its item wording is copyrighted).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/mna-sf-v712.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The MNA-SF flags nutritional risk and prompts fuller assessment; it is not a diagnosis. It supports rather than replaces clinical and dietetic judgment.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

const CHOICE = (pairs) => [{ value: '', text: '— choose —' }, ...pairs.map(([value, text]) => ({ value, text }))];
const FOOD = [['2', 'No decline'], ['1', 'Moderate decline'], ['0', 'Severe decline']];
const WEIGHT = [['3', 'No weight loss'], ['2', 'Loss of 1 to 3 kg'], ['1', 'Does not know'], ['0', 'Loss over 3 kg']];
const MOBILITY = [['2', 'Goes out'], ['1', 'Out of bed but does not go out'], ['0', 'Bed or chair bound']];
const STRESS = [['2', 'No'], ['0', 'Yes']];
const NEURO = [['2', 'No problems'], ['1', 'Mild dementia or depression'], ['0', 'Severe dementia or depression']];
const BMI = [['3', 'BMI 23 or more (or calf 31 cm or more)'], ['2', 'BMI 21 to under 23'], ['1', 'BMI 19 to under 21'], ['0', 'BMI under 19 (or calf under 31 cm)']];

export const renderers = {
  'mna-sf'(root) {
    note(root, 'Mini Nutritional Assessment Short Form (Kaiser 2009): six items summed to 0–14. Bands: 12–14 normal, 8–11 at risk of malnutrition, 0–7 malnourished.');
    root.appendChild(selectField('Decline in food intake (past 3 months)', 'mna-food', CHOICE(FOOD)));
    root.appendChild(selectField('Weight loss (past 3 months)', 'mna-weight', CHOICE(WEIGHT)));
    root.appendChild(selectField('Mobility', 'mna-mobility', CHOICE(MOBILITY)));
    root.appendChild(selectField('Psychological stress or acute disease (past 3 months)', 'mna-stress', CHOICE(STRESS)));
    root.appendChild(selectField('Neuropsychological problems', 'mna-neuro', CHOICE(NEURO)));
    root.appendChild(selectField('Body mass index (or calf circumference if BMI unavailable)', 'mna-bmi', CHOICE(BMI)));
    const ids = ['mna-food', 'mna-weight', 'mna-mobility', 'mna-stress', 'mna-neuro', 'mna-bmi'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.mnaSf({
        foodIntake: val('mna-food'), weightLoss: val('mna-weight'), mobility: val('mna-mobility'),
        acuteStress: val('mna-stress'), neuropsych: val('mna-neuro'), bmiOrCalf: val('mna-bmi'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Score', value: `${r.score}/14` },
        { label: 'Status', value: r.tier.replace('-', ' ') },
      ]);
      note(o, r.detail);
      note(o, r.note);
    }));
    postureNote(root);
  },
};

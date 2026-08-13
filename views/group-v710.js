// spec-v710 §2: renderer for g8-geriatric — the G8 (Geriatric 8) screening tool (Clinical
// Scoring & Risk, Group G).
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Eight per-item
// selects; the sum 0-17 (<= 14 positive) decides referral for a comprehensive geriatric
// assessment. Neutral labels only (several items derive from the copyrighted MNA).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/g8-geriatric-v710.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The G8 decides who needs a deeper comprehensive geriatric assessment; it is not a diagnosis. It supports rather than replaces clinical judgment.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

const CHOICE = (pairs) => [{ value: '', text: '— choose —' }, ...pairs.map(([value, text]) => ({ value, text }))];
const FOOD = [['2', 'No decline'], ['1', 'Moderate decline'], ['0', 'Severe decline']];
const WEIGHT = [['3', 'No weight loss'], ['2', 'Loss of 1 to 3 kg'], ['1', 'Does not know'], ['0', 'Loss over 3 kg']];
const MOBILITY = [['2', 'Goes out'], ['1', 'Out of bed but does not go out'], ['0', 'Bed or chair bound']];
const NEURO = [['2', 'No problems'], ['1', 'Mild dementia or depression'], ['0', 'Severe dementia or depression']];
const BMI = [['3', 'BMI 23 or more'], ['2', 'BMI 21 to under 23'], ['1', 'BMI 19 to under 21'], ['0', 'BMI under 19']];
const MEDS = [['1', 'No'], ['0', 'Yes, more than 3 per day']];
const HEALTH = [['2', 'Better'], ['1', 'As good'], ['0.5', 'Does not know'], ['0', 'Not as good']];
const AGE = [['2', 'Under 80'], ['1', '80 to 85'], ['0', 'Over 85']];

export const renderers = {
  'g8-geriatric'(root) {
    note(root, 'G8 (Geriatric 8) screening (Bellera 2012): eight items summed to 0–17 (higher is better). A total of 14 or less is a positive screen and warrants a full comprehensive geriatric assessment.');
    root.appendChild(selectField('Decline in food intake (past 3 months)', 'g8-food', CHOICE(FOOD)));
    root.appendChild(selectField('Weight loss (past 3 months)', 'g8-weight', CHOICE(WEIGHT)));
    root.appendChild(selectField('Mobility', 'g8-mobility', CHOICE(MOBILITY)));
    root.appendChild(selectField('Neuropsychological problems', 'g8-neuro', CHOICE(NEURO)));
    root.appendChild(selectField('Body mass index', 'g8-bmi', CHOICE(BMI)));
    root.appendChild(selectField('Takes more than 3 medications per day', 'g8-meds', CHOICE(MEDS)));
    root.appendChild(selectField('Self-rated health vs peers', 'g8-health', CHOICE(HEALTH)));
    root.appendChild(selectField('Age', 'g8-age', CHOICE(AGE)));
    const ids = ['g8-food', 'g8-weight', 'g8-mobility', 'g8-neuro', 'g8-bmi', 'g8-meds', 'g8-health', 'g8-age'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.g8Geriatric({
        foodIntake: val('g8-food'), weightLoss: val('g8-weight'), mobility: val('g8-mobility'), neuropsych: val('g8-neuro'),
        bmi: val('g8-bmi'), medications: val('g8-meds'), selfHealth: val('g8-health'), age: val('g8-age'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Score', value: `${r.score}/17` },
      ]);
      note(o, r.detail);
      note(o, r.note);
    }));
    postureNote(root);
  },
};

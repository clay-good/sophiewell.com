// spec-v711 §2: renderer for ausdrisk — the AUSDRISK type-2 diabetes risk tool (Clinical
// Scoring & Risk, Group G).
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. An age-band select,
// a sex select, a waist number, a waist-band-set checkbox, and seven risk checkboxes; the
// weighted sum 0-35 maps to a three-tier risk band.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/ausdrisk-v711.js';
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
  wrap.appendChild(el('input', { id, type: 'number', min: '0', step: '1', inputmode: 'numeric' }));
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. AUSDRISK estimates future risk; it is not a diagnosis of diabetes. A high result warrants a fasting blood glucose test. It supports rather than replaces clinical judgment and confirmatory testing.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

const CHOICE = (pairs) => [{ value: '', text: '— choose —' }, ...pairs.map(([value, text]) => ({ value, text }))];
const AGE = [['0', 'Under 35'], ['2', '35 to 44'], ['4', '45 to 54'], ['6', '55 to 64'], ['8', '65 or older']];
const SEX = [['female', 'Female'], ['male', 'Male']];

export const renderers = {
  'ausdrisk'(root) {
    note(root, 'AUSDRISK (Chen 2010): 5-year type-2 diabetes risk, total 0–35. Tiers: ≤ 5 low, 6–14 intermediate, ≥ 15 high (a fasting blood glucose test is advised).');
    root.appendChild(selectField('Age band', 'aus-age', CHOICE(AGE)));
    root.appendChild(selectField('Sex', 'aus-sex', CHOICE(SEX)));
    root.appendChild(checkField('Aboriginal, Torres Strait Islander, Pacific Islander, or Maori descent', 'aus-indigenous'));
    root.appendChild(checkField('Born in Asia, the Middle East, North Africa, or Southern Europe', 'aus-birth'));
    root.appendChild(checkField('Family history of diabetes (parent or sibling)', 'aus-family'));
    root.appendChild(checkField('Ever found to have high blood glucose', 'aus-glucose'));
    root.appendChild(checkField('On blood-pressure medication', 'aus-bp'));
    root.appendChild(checkField('Current daily smoker', 'aus-smoke'));
    root.appendChild(checkField('Does not eat vegetables and fruit every day', 'aus-veg'));
    root.appendChild(checkField('Less than 2.5 hours of physical activity per week', 'aus-activity'));
    root.appendChild(checkField('Use the lower waist thresholds (Asian or Aboriginal / TSI descent)', 'aus-waistset'));
    root.appendChild(numberField('Waist circumference (cm)', 'aus-waist'));
    const ids = ['aus-age', 'aus-sex', 'aus-indigenous', 'aus-birth', 'aus-family', 'aus-glucose', 'aus-bp', 'aus-smoke', 'aus-veg', 'aus-activity', 'aus-waistset', 'aus-waist'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.ausdrisk({
        agePoints: val('aus-age'), sex: val('aus-sex'), indigenousOrPacific: checked('aus-indigenous'), highRiskBirthplace: checked('aus-birth'),
        familyHistory: checked('aus-family'), everHighGlucose: checked('aus-glucose'), antihypertensive: checked('aus-bp'), smoker: checked('aus-smoke'),
        lowVegFruit: checked('aus-veg'), lowActivity: checked('aus-activity'), asianOrIndigenousWaist: checked('aus-waistset'), waist: val('aus-waist'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Score', value: `${r.score}/35` },
        { label: 'Risk', value: r.tier },
      ]);
      note(o, r.detail);
      note(o, r.note);
    }));
    postureNote(root);
  },
};

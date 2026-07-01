// spec-v180 §2: renderer for the older-adult mortality & LTC-prognosis cluster
// of the spec-v172 Long-Term Care & Geriatric Assessment program. v180 ships
// 2 of its 7 proposed tiles — lee-mortality-index and chess-scale, both
// Clinical Scoring & Risk (Group G). The other five (schonberg-index,
// walter-index, suemoto-index, mitchell-mri, adept) are deferred on the
// spec-v97 >= 2-source bar (see lib/ltcga-v180.js).
//
// Same input/render contract as the rest of the codebase: every input has a
// real <label for> (a11y-check passes), no innerHTML, no network, no storage.
// The tile is a bounded point-table lookup, so a blank field simply scores zero
// for that factor; the age band is required and surfaces a complete-the-fields
// fallback until chosen. Per the spec-v50 §3 posture note it frames a prognostic
// estimate as decision support for care planning, never an end-of-life or
// goals-of-care order in Sophie's voice (spec-v11 §5.3).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/ltcga-v180.js';
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
function checkField(label, id) {
  const wrap = el('p');
  const inp = el('input', { id, type: 'checkbox' });
  wrap.appendChild(inp);
  wrap.appendChild(el('label', { for: id, text: ' ' + label }));
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function selVal(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function chk(id) { const n = document.getElementById(id); return n ? n.checked : false; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The mortality estimate is the cited index’s, computed from the factors you entered; it is a life-expectancy estimate for the population, not a prediction of this individual’s death. The care decision — whether to screen, refer, or revisit the goals of care — stays with the clinician, the patient and family, and local protocol.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}
function checkList(root, items) {
  for (const [id, label] of items) root.appendChild(checkField(label, id));
  return items.map((i) => i[0]);
}

export const renderers = {
  // ----- 2.1 lee-mortality-index ----------------------------------------
  'lee-mortality-index'(root) {
    note(root, 'Lee 4-Year Mortality Index (Lee 2006): a weighted point sum for community-dwelling older adults, total 0–26. Validation-cohort 4-year mortality bands: 0–5 ≈ 4%, 6–9 ≈ 15%, 10–13 ≈ 42%, ≥ 14 ≈ 64%.');
    root.appendChild(selectField('Age band', 'lee-age', [
      { value: '', text: 'Select age band…' },
      { value: '60to64', text: '60–64 years (1 point)' },
      { value: '65to69', text: '65–69 years (2 points)' },
      { value: '70to74', text: '70–74 years (3 points)' },
      { value: '75to79', text: '75–79 years (4 points)' },
      { value: '80to84', text: '80–84 years (5 points)' },
      { value: '85plus', text: '85 years or older (7 points)' },
    ]));
    note(root, 'Demographics & comorbidities — check each that applies:');
    const comorbid = checkList(root, [
      ['lee-male', 'Male sex (2)'],
      ['lee-dm', 'Diabetes (1)'],
      ['lee-cancer', 'Cancer (2)'],
      ['lee-lung', 'Chronic lung disease (2)'],
      ['lee-chf', 'Heart failure (2)'],
      ['lee-smoke', 'Current smoker (2)'],
      ['lee-bmi', 'BMI under 25 (1)'],
    ]);
    note(root, 'Functional difficulty — because of health, difficulty with any of these:');
    const func = checkList(root, [
      ['lee-bath', 'Bathing (2)'],
      ['lee-walk', 'Walking several blocks (2)'],
      ['lee-money', 'Managing money (2)'],
      ['lee-push', 'Pushing or pulling large/heavy objects (1)'],
    ]);
    const ids = ['lee-age', ...comorbid, ...func];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.leeMortalityIndex({
        age: selVal('lee-age'),
        male: chk('lee-male'), diabetes: chk('lee-dm'), cancer: chk('lee-cancer'),
        lung: chk('lee-lung'), heartFailure: chk('lee-chf'), smoker: chk('lee-smoke'),
        bmiUnder25: chk('lee-bmi'),
        bathing: chk('lee-bath'), walking: chk('lee-walk'), money: chk('lee-money'), pushing: chk('lee-push'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Lee index', value: `${r.score}/26` },
        { label: '4-year mortality', value: `≈ ${r.mortality}` },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.7 chess-scale ------------------------------------------------
  'chess-scale'(root) {
    note(root, 'interRAI CHESS scale (Hirdes 2003, interRAI/CIHI operationalization): signs and symptoms are counted and capped at 2, then a point each is added for decline in decision-making, decline in ADL status, and an end-stage (≤ 6-month) prognosis — total 0–5. Higher = greater health instability.');
    note(root, 'Signs and symptoms — check each present (the count is capped at 2):');
    const symptoms = checkList(root, [
      ['chess-vomit', 'Vomiting'],
      ['chess-edema', 'Peripheral edema'],
      ['chess-dyspnea', 'Dyspnea (shortness of breath)'],
      ['chess-wtloss', 'Weight loss (≥ 5% in 30 days or ≥ 10% in 180 days)'],
      ['chess-dehydr', 'Dehydration — clinically dehydrated, BUN:creatinine > 20, fluid intake < 1,000 mL/day, or output exceeds input'],
      ['chess-intake', 'Reduced intake — decrease in usual food/fluid, or ate ≤ 1 meal on ≥ 2 of the last 3 days'],
    ]);
    note(root, 'Other variables — one point each:');
    const other = checkList(root, [
      ['chess-cog', 'Decline in decision-making vs 90 days ago'],
      ['chess-adl', 'Decline in ADL status vs 90 days ago'],
      ['chess-eol', 'End-stage disease (≤ 6 months to live)'],
    ]);
    const ids = [...symptoms, ...other];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.chessScale({
        vomiting: chk('chess-vomit'), edema: chk('chess-edema'), dyspnea: chk('chess-dyspnea'),
        weightLoss: chk('chess-wtloss'), dehydration: chk('chess-dehydr'), reducedIntake: chk('chess-intake'),
        declineCognition: chk('chess-cog'), declineAdl: chk('chess-adl'), endStage: chk('chess-eol'),
      });
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'CHESS', value: `${r.score}/5` },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};

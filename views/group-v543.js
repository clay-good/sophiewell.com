// spec-v543: renderer for the SAVE score. Group G. Bands and yes/no flags under four h2 section headings
// (never h3 - an h3 under the page h1 is a heading-level skip).
//
// The diagnosis groups and the acute organ failures are each rendered as INDEPENDENT yes/no selects rather
// than as one-of lists, because the source says to select one or more of each and they are additive. The
// result shows the component subtotal and the -6 constant separately, so the arithmetic that decides the
// risk class is visible rather than buried (lib/save-score-v543.js).
//
// Same input/render contract as the rest of the codebase: every control has a real <label for> (a11y-check
// passes), no innerHTML, no network, no storage. Per spec-v11 section 5.3 the tile reports cohort survival;
// it never predicts an individual outcome and never bears on whether to offer or withdraw ECMO.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/save-score-v543.js';
import { resultRow } from '../lib/result-copy.js';

const YES_NO = [['no', 'No'], ['yes', 'Yes']];
const signed = (n) => (n > 0 ? `+${n}` : String(n));

function select(label, id, options) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const s = el('select', { id });
  for (const [value, text] of options) s.appendChild(el('option', { value, text }));
  wrap.appendChild(s);
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function heading(root, text) { root.appendChild(el('h2', { text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The decision stays with the ECMO team.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'save-score'(root) {
    note(root, `The SAVE score estimates hospital survival after veno-arterial ECMO for refractory cardiogenic shock. A constant of ${M.SAVE_CONSTANT} is added to every calculation, so a patient whose components sum to zero scores ${M.SAVE_CONSTANT} — and because the class boundaries sit at 5, 0, −5 and −10, forgetting it shifts most patients a full class. The diagnosis groups and the acute organ failures are additive, not one-of. The survival figures describe cohorts, not individuals, and the score is not a tool for deciding whether to offer ECMO or to withdraw it.`);

    const ids = [];
    const addFlag = (f) => {
      const id = `save-${f.key}`;
      ids.push(id);
      root.appendChild(select(`${f.text} (${signed(f.points)})`, id, YES_NO));
    };
    const addBand = (label, key, bands) => {
      const id = `save-${key}`;
      ids.push(id);
      root.appendChild(select(label, id, bands.map((b) => [b.value, `${b.text} (${signed(b.points)})`])));
    };

    heading(root, 'Acute cardiogenic shock diagnosis group (select all that apply)');
    for (const d of M.SAVE_DIAGNOSES) addFlag(d);

    heading(root, 'Age, weight, and intubation before ECMO');
    addBand('Age', 'ageBand', M.SAVE_AGE_BANDS);
    addBand('Weight', 'weightBand', M.SAVE_WEIGHT_BANDS);
    addBand('Duration of intubation prior to ECMO', 'intubationBand', M.SAVE_INTUBATION_BANDS);

    heading(root, 'Acute pre-ECMO organ failures (select all that apply)');
    for (const f of M.SAVE_ORGAN_FAILURES) addFlag(f);

    heading(root, 'Other pre-ECMO findings');
    for (const f of M.SAVE_BINARY) addFlag(f);

    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const args = { ageBand: val('save-ageBand'), weightBand: val('save-weightBand'), intubationBand: val('save-intubationBand') };
      for (const f of [...M.SAVE_DIAGNOSES, ...M.SAVE_ORGAN_FAILURES, ...M.SAVE_BINARY]) args[f.key] = val(`save-${f.key}`);
      const r = M.saveScore(args);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band },
        { label: 'Components', value: signed(r.componentTotal) },
        { label: 'Published constant', value: signed(r.constant) },
        { label: 'SAVE score', value: signed(r.total) },
        { label: 'Risk class', value: `${r.riskClass} — reported hospital survival ${r.survival}` },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};

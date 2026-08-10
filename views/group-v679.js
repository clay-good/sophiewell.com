// spec-v679 §2: renderer for gerdq — the GerdQ reflux questionnaire (Clinical Scoring
// & Risk, Group G).
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Six frequency
// selects (each 0 / 1 / 2-3 / 4-7 days); a weighted sum 0-18 screens for GERD. Neutral
// field labels — the copyrighted questionnaire wording is not reproduced.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/gerdq-v679.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. GerdQ is a primary-care screen for typical reflux symptoms over the past week, not a substitute for endoscopy or pH testing; alarm features still warrant investigation, and it supports rather than replaces clinical judgment.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

// Days-in-the-past-week frequency bands (band index 0-3). Same options for every item;
// the lib applies the positive/negative polarity.
const DAYS = [{ value: '', text: '— choose —' }, { value: '0', text: '0 days' }, { value: '1', text: '1 day' }, { value: '2', text: '2–3 days' }, { value: '3', text: '4–7 days' }];

export const renderers = {
  'gerdq'(root) {
    note(root, 'GerdQ (Jones 2009): a six-item screen for gastroesophageal reflux disease over the past week. Heartburn, regurgitation, sleep disturbance, and extra over-the-counter reflux medication score 0–3 with frequency; epigastric pain and nausea are reverse-scored 3–0. Total 0–18; a score ≥ 8 marks a high likelihood of GERD.');
    root.appendChild(selectField('Heartburn (burning behind the breastbone) — days in the past week', 'gq-heartburn', DAYS));
    root.appendChild(selectField('Regurgitation (stomach contents into the throat/mouth) — days', 'gq-regurgitation', DAYS));
    root.appendChild(selectField('Pain in the center of the upper stomach — days', 'gq-epigastric', DAYS));
    root.appendChild(selectField('Nausea — days', 'gq-nausea', DAYS));
    root.appendChild(selectField('Sleep disturbed by reflux symptoms — days', 'gq-sleep', DAYS));
    root.appendChild(selectField('Extra over-the-counter medicine for reflux (beyond prescribed) — days', 'gq-medication', DAYS));
    const ids = ['gq-heartburn', 'gq-regurgitation', 'gq-epigastric', 'gq-nausea', 'gq-sleep', 'gq-medication'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.gerdq({
        heartburn: val('gq-heartburn'), regurgitation: val('gq-regurgitation'), epigastric: val('gq-epigastric'),
        nausea: val('gq-nausea'), sleep: val('gq-sleep'), medication: val('gq-medication'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Score', value: `${r.score}/18` },
        { label: 'Impact', value: `${r.impact}/6` },
      ]);
      note(o, r.detail);
      note(o, r.note);
    }));
    postureNote(root);
  },
};

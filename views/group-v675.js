// spec-v675 §2: renderer for asrm-mania — the Altman Self-Rating Mania Scale
// (Clinical Scoring & Risk, Group G). Patient self-report companion to the built
// clinician-rated Young Mania Rating Scale (ymrs).
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Five 0-4
// item selects; the sum 0-20 screens positive at >= 6. Generic domain labels only
// (no copyrighted item statement text).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/asrm-mania-v675.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The ASRM is a patient self-report screen for manic or hypomanic symptoms over the past week; a score of 6 or more warrants clinical evaluation but is not a diagnosis of bipolar disorder or mania. Diagnosis and treatment stay with the clinician.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

const CHOICE = (pairs) => [{ value: '', text: '— choose —' }, ...pairs.map(([value, text]) => ({ value, text }))];
const RATE = [['0', '0 — unchanged from usual self'], ['1', '1 — slightly / occasionally'], ['2', '2 — moderately / often'], ['3', '3 — much / frequently'], ['4', '4 — most severe / almost constantly']];

const ITEMS = [
  ['asrm-mood', 'Elevated / positive mood'],
  ['asrm-confidence', 'Increased self-confidence'],
  ['asrm-sleep', 'Decreased need for sleep'],
  ['asrm-speech', 'Increased speech / talkativeness'],
  ['asrm-activity', 'Increased activity level'],
];

export const renderers = {
  'asrm-mania'(root) {
    note(root, 'Altman Self-Rating Mania Scale (Altman 1997): rate each of 5 domains 0–4 for the past week. Total 0–20; a score of 6 or more screens positive for a manic/hypomanic condition. A self-report screen, not a diagnosis. Companion tile: ymrs (clinician-rated).');
    root.appendChild(selectField('Elevated / positive mood', 'asrm-mood', CHOICE(RATE)));
    root.appendChild(selectField('Increased self-confidence', 'asrm-confidence', CHOICE(RATE)));
    root.appendChild(selectField('Decreased need for sleep', 'asrm-sleep', CHOICE(RATE)));
    root.appendChild(selectField('Increased speech / talkativeness', 'asrm-speech', CHOICE(RATE)));
    root.appendChild(selectField('Increased activity level', 'asrm-activity', CHOICE(RATE)));
    const ids = ITEMS.map(([id]) => id);
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.asrmMania({
        mood: val('asrm-mood'), confidence: val('asrm-confidence'), sleep: val('asrm-sleep'),
        speech: val('asrm-speech'), activity: val('asrm-activity'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Total', value: `${r.total}/20` },
        { label: 'Screen', value: r.positive ? 'positive' : 'negative' },
      ]);
      note(o, r.detail);
      note(o, r.note);
    }));
    postureNote(root);
  },
};

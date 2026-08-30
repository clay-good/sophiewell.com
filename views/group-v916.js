// spec-v916 §2: renderer for ipass-handoff — the I-PASS handoff structure (Communication &
// Handoff, Group H), beside the SBAR template.
//
// The receiver's summary is reported on its own line, not counted as one blank among five,
// because it is the step the evidence rests on and the one most often skipped.
//
// The severity select is written as `'ip-severity', I.ILLNESS_SEVERITY_OPTIONS` so that
// scripts/lib/option-labels.mjs, which reads views statically, resolves the option text from the
// exported list rather than printing the raw values.

import { el, clear } from '../lib/dom.js';
import * as I from '../lib/ipass-handoff-v916.js';
import { resultRow } from '../lib/result-copy.js';

function selectField(root, label, id, options) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  const sel = el('select', { id });
  for (const o of options) sel.appendChild(el('option', { value: o.value, text: o.text }));
  wrap.appendChild(sel);
  root.appendChild(wrap);
}
function areaField(root, label, id, placeholder) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('textarea', { id, rows: '3', placeholder }));
  root.appendChild(wrap);
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'ipass-handoff'(root) {
    selectField(root, 'I - Illness severity', 'ip-severity', I.ILLNESS_SEVERITY_OPTIONS);
    areaField(root, 'P - Patient summary', 'ip-summary',
      'Summary statement, events leading to admission, hospital course, ongoing assessment, plan.');
    areaField(root, 'A - Action list', 'ip-actions',
      'What is to be done, by when, and by whom.');
    areaField(root, 'S - Situation awareness and contingency planning', 'ip-awareness',
      'What to watch for, and what to do if it happens.');
    areaField(root, 'S - Synthesis by the receiver', 'ip-synthesis',
      'What the receiver said back: the summary, the questions, the key actions restated.');

    const ids = ['ip-severity', 'ip-summary', 'ip-actions', 'ip-awareness', 'ip-synthesis'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = I.ipassHandoff({
        illnessSeverity: val('ip-severity'),
        patientSummary: val('ip-summary'),
        actionList: val('ip-actions'),
        situationAwareness: val('ip-awareness'),
        synthesisByReceiver: val('ip-synthesis'),
      });
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }]);
      note(o, r.synthesisNote);
      const pre = el('pre', { class: 'sbar-output' });
      pre.textContent = r.handoff;
      o.appendChild(pre);
      const copy = el('button', { type: 'button', class: 'copy-btn', text: 'Copy handoff to clipboard' });
      copy.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(r.handoff);
          copy.textContent = 'Copied';
          setTimeout(() => { copy.textContent = 'Copy handoff to clipboard'; }, 1500);
        } catch (_e) { copy.textContent = 'Copy failed'; }
      });
      o.appendChild(copy);
      note(o, r.watcherNote);
      note(o, r.structureNote);
      note(o, r.privacyNote);
      note(o, r.scopeNote);
      note(o, r.detail);
      note(o, r.note);
    }));

    root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. This lays out a handoff in a published structure and says which parts are blank. It does not judge whether what was written is right.' }));
  },
};

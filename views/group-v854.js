// spec-v854 §2: renderer for gastric-emptying-scintigraphy — reading a standardized 4-hour
// gastric emptying study (Clinical Scoring & Risk, Group G).
//
// The 4-hour field carries its role in its own label, because a reader who fills only the
// 2-hour field will otherwise take the answer this tile gives back as the study's verdict.

import { el, clear } from '../lib/dom.js';
import * as G from '../lib/gastric-emptying-scintigraphy-v854.js';
import { resultRow } from '../lib/result-copy.js';

function checkField(label, id) {
  const wrap = el('p');
  wrap.appendChild(el('input', { id, type: 'checkbox' }));
  wrap.appendChild(el('label', { for: id, text: ' ' + label }));
  return wrap;
}
function numField(root, label, id, attrs) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', Object.assign({ id, type: 'number', inputmode: 'decimal' }, attrs || {})));
  root.appendChild(wrap);
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function checked(id) { const n = document.getElementById(id); return !!(n && n.checked); }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'gastric-emptying-scintigraphy'(root) {
    note(root, 'The grade comes from the 4-hour value and from nothing else. A normal 2-hour value does not rule delayed emptying out, and a study stopped at 2 hours cannot be graded.');

    root.appendChild(el('h2', { text: 'How much of the meal is still there' }));
    numField(root, 'At 1 hour (percent; normal 30 to 90, below 30 is rapid)', 'ges-h1', { min: '0', max: '100', step: '1' });
    numField(root, 'At 2 hours (percent; delayed above 60)', 'ges-h2', { min: '0', max: '100', step: '1' });
    numField(root, 'At 4 hours (percent; this is the value that grades the study, delayed above 10)', 'ges-h4', { min: '0', max: '100', step: '1' });

    root.appendChild(el('h2', { text: 'Conditions the study was run under' }));
    numField(root, 'Blood glucose at the time of the study (mg/dL)', 'ges-glu', { min: '20', max: '1500', step: '1' });
    root.appendChild(checkField('Drugs that speed emptying up or slow it down were stopped two days beforehand', 'ges-drugs'));

    const ids = ['ges-h1', 'ges-h2', 'ges-h4', 'ges-glu', 'ges-drugs'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = G.gastricEmptyingScintigraphy({
        retention1h: val('ges-h1'),
        retention2h: val('ges-h2'),
        retention4h: val('ges-h4'),
        glucose: val('ges-glu'),
        drugsHeld: checked('ges-drugs'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }]);
      if (r.incompleteNote) note(o, r.incompleteNote);
      if (r.fourHourNote) note(o, r.fourHourNote);
      if (r.disagreeNote) note(o, r.disagreeNote);
      if (r.rapidNote) note(o, r.rapidNote);
      if (r.glucoseNote) note(o, r.glucoseNote);
      if (r.drugNote) note(o, r.drugNote);
      note(o, r.scopeNote);
      note(o, r.detail);
      note(o, r.note);
    }));

    root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. This reads a published protocol against values already measured. It does not by itself diagnose the condition, which needs symptoms as well, and it does not select treatment.' }));
  },
};

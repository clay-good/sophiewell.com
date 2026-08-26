// spec-v789 §2: renderer for acute-pericarditis — the diagnostic criteria and temporal
// classification (Clinical Scoring & Risk, Group G).
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Four criteria
// checkboxes, two supporting-finding checkboxes kept deliberately separate so they cannot
// be mistaken for criteria, and one course select.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/pericarditis-v789.js';
import { resultRow } from '../lib/result-copy.js';

function checkField(label, id) {
  const wrap = el('p');
  const cb = el('input', { id, type: 'checkbox' });
  wrap.appendChild(cb);
  wrap.appendChild(el('label', { for: id, text: ' ' + label }));
  return wrap;
}
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
function checked(id) { const n = document.getElementById(id); return !!(n && n.checked); }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. Chest pain that could be pericarditis could also be a coronary syndrome, an aortic dissection or a pulmonary embolism, and meeting these criteria does not exclude any of them.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

const COURSE = [
  { value: 'acute', text: 'Acute (new onset)' },
  { value: 'incessant', text: 'Incessant (past 4 to 6 weeks, under 3 months, no clear remission)' },
  { value: 'recurrent', text: 'Recurrent (after a symptom-free interval of 4 to 6 weeks or more)' },
  { value: 'chronic', text: 'Chronic (more than 3 months)' },
];

export const renderers = {
  'acute-pericarditis'(root) {
    note(root, 'Acute pericarditis is diagnosed on at least two of four findings. Raised inflammatory markers and inflammation on CT or cardiac MRI support the diagnosis but do not count toward the two. The course is classified separately and does not change the count.');
    root.appendChild(el('h2', { text: 'Diagnostic criteria (two or more required)' }));
    root.appendChild(checkField('Sharp pleuritic chest pain, better sitting up and leaning forward', 'per-pain'));
    root.appendChild(checkField('Pericardial friction rub', 'per-rub'));
    root.appendChild(checkField('New widespread ST elevation or PR depression on the ECG', 'per-ecg'));
    root.appendChild(checkField('New or worsening pericardial effusion', 'per-effusion'));
    root.appendChild(el('h2', { text: 'Supporting findings (not counted toward the two)' }));
    root.appendChild(checkField('Raised inflammatory markers (CRP, ESR, white cell count)', 'per-markers'));
    root.appendChild(checkField('Pericardial inflammation on CT or cardiac MRI', 'per-imaging'));
    root.appendChild(el('h2', { text: 'Course' }));
    root.appendChild(selectField('How this episode is classified in time', 'per-course', COURSE));
    const ids = ['per-pain', 'per-rub', 'per-ecg', 'per-effusion', 'per-markers', 'per-imaging', 'per-course'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.pericarditis({
        chestPain: checked('per-pain'),
        frictionRub: checked('per-rub'),
        ecgChanges: checked('per-ecg'),
        effusion: checked('per-effusion'),
        inflammatoryMarkers: checked('per-markers'),
        imagingInflammation: checked('per-imaging'),
        course: val('per-course'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Criteria met', value: `${r.criteriaMet}/4` },
        { label: 'Course', value: r.courseLabel },
      ]);
      note(o, r.criteria.length ? `Criteria met: ${r.criteria.join(', ')}.` : 'No criteria selected.');
      note(o, r.supporting.length ? `Supporting, not counted: ${r.supporting.join(', ')}.` : 'No supporting findings selected.');
      note(o, r.detail);
      note(o, r.note);
    }));
    postureNote(root);
  },
};

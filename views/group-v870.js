// spec-v870 §2: renderer for nms-criteria — the international consensus diagnostic criteria for
// neuroleptic malignant syndrome (Clinical Scoring & Risk, Group G).
//
// The not-a-severity-scale sentence prints on every result, and the fever-and-rigidity sentence
// prints whenever either is absent, because a total assembled without them is the one most
// likely to be dismissed.

import { el, clear } from '../lib/dom.js';
import * as N from '../lib/nms-criteria-v870.js';
import { resultRow } from '../lib/result-copy.js';

function checkField(root, label, id, detail) {
  const wrap = el('p');
  wrap.appendChild(el('input', { id, type: 'checkbox' }));
  wrap.appendChild(el('label', { for: id, text: ' ' + label }));
  if (detail) wrap.appendChild(el('span', { class: 'muted', text: ' ' + detail }));
  root.appendChild(wrap);
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function checked(id) { const n = document.getElementById(id); return Boolean(n && n.checked); }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

const domId = (key) => `nms-${key.toLowerCase()}`;

export const renderers = {
  'nms-criteria'(root) {
    note(root, 'Priority points, weighing how much each finding argues for the diagnosis. They do not grade how ill the patient is.');

    root.appendChild(el('h2', { text: 'Findings present' }));
    for (const i of N.NMS_ITEMS) checkField(root, i.text, domId(i.key), `${i.points} points.`);

    const ids = N.NMS_ITEMS.map((i) => domId(i.key));
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const args = {};
      for (const i of N.NMS_ITEMS) args[i.key] = checked(domId(i.key));
      const r = N.nmsCriteria(args);
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }]);
      note(o, r.presentNote);
      if (r.gapNote) note(o, r.gapNote);
      if (r.featureNote) note(o, r.featureNote);
      if (r.exposureNote) note(o, r.exposureNote);
      if (r.ckNote) note(o, r.ckNote);
      note(o, r.workupNote);
      note(o, r.notSeverityNote);
      note(o, r.scopeNote);
      note(o, r.detail);
      note(o, r.note);
    }));

    root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. This applies published criteria to findings already recorded. It does not diagnose the syndrome, and it does not decide whether to stop a drug or start treatment.' }));
  },
};

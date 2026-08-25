// spec-v666 §2: renderer for vhwg-hernia — the Ventral Hernia Working Group grade
// (Clinical Scoring & Risk, Group G). Companion to the built hernia classifications.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Three feature
// checkboxes; the most severe present sets the grade (1-4).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/vhwg-hernia-v666.js';
import { resultRow } from '../lib/result-copy.js';

function checkField(label, id) {
  const wrap = el('p');
  const inp = el('input', { id, type: 'checkbox' });
  wrap.appendChild(inp);
  wrap.appendChild(el('label', { for: id, text: ' ' + label }));
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function chk(id) { const n = document.getElementById(id); return n ? n.checked : false; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The VHWG grade is the most severe feature group present; it estimates the risk of surgical site occurrence and informs the repair technique and mesh choice, read with the full clinical picture by the surgical team.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'vhwg-hernia'(root) {
    note(root, 'Ventral Hernia Working Group (VHWG) grade (Breuing 2010): the most severe feature present sets the grade. Grade 4 infected (infected mesh / septic dehiscence); grade 3 potentially contaminated (prior wound infection, stoma, GI-tract violation); grade 2 comorbid (smoking, obesity, diabetes, immunosuppression, COPD); grade 1 low risk. Higher grade = higher surgical-site-occurrence risk.');
    root.appendChild(checkField('Infected mesh or septic dehiscence (Grade 4)', 'vhwg-infected'));
    root.appendChild(checkField('Previous wound infection, a stoma, or GI-tract violation (Grade 3)', 'vhwg-contaminated'));
    root.appendChild(checkField('Smoking, obesity, diabetes, immunosuppression, or COPD (Grade 2)', 'vhwg-comorbid'));
    const ids = ['vhwg-infected', 'vhwg-contaminated', 'vhwg-comorbid'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.vhwgHernia({ infected: chk('vhwg-infected'), contaminated: chk('vhwg-contaminated'), comorbid: chk('vhwg-comorbid') });
      resultRow(o, [
        { text: r.bandLabel, cls: r.abnormal ? 'warn' : null },
        { label: 'Grade', value: r.code },
      ]);
      note(o, r.detail);
      note(o, r.note);
    }));
    postureNote(root);
  },
};

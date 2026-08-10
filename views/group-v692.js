// spec-v692 §2: renderer for conley-fall-risk — the Conley Fall Risk Scale (Clinical
// Scoring & Risk, Group G). Companion to morse-falls / stratify / hendrich-ii / downton.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Six checkboxes;
// a weighted count 0-10 maps to a fall-risk band.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/conley-fall-risk-v692.js';
import { resultRow } from '../lib/result-copy.js';

function checkField(label, id) {
  const wrap = el('p');
  const cb = el('input', { id, type: 'checkbox' });
  wrap.appendChild(cb);
  wrap.appendChild(el('label', { for: id, text: ' ' + label }));
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function checked(id) { const n = document.getElementById(id); return !!(n && n.checked); }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The Conley scale is a fall-risk screen that should prompt fall-prevention strategies, not a prediction of any individual fall. It supports rather than replaces clinical judgment.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'conley-fall-risk'(root) {
    note(root, 'Conley Fall Risk Scale: interview (fell in last 3 months 2, dizziness/vertigo 1, urgency to bathroom 1) plus nurse observation (impaired judgment 3, agitation 2, impaired gait 1). Total 0–10; a score ≥ 2 (or any fall during the stay) triggers fall-prevention.');
    root.appendChild(checkField('Fallen in the last 3 months', 'conley-falls'));
    root.appendChild(checkField('Dizziness or vertigo', 'conley-dizzy'));
    root.appendChild(checkField('Urgency / loss of urine or stool on the way to the bathroom', 'conley-incont'));
    root.appendChild(checkField('Impaired judgment / lack of safety awareness', 'conley-judgment'));
    root.appendChild(checkField('Agitation', 'conley-agit'));
    root.appendChild(checkField('Impaired gait (shuffling, wide base, or unsteady)', 'conley-gait'));
    const ids = ['conley-falls', 'conley-dizzy', 'conley-incont', 'conley-judgment', 'conley-agit', 'conley-gait'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.conleyFallRisk({
        previousFalls: checked('conley-falls'), dizziness: checked('conley-dizzy'), incontinence: checked('conley-incont'),
        impairedJudgment: checked('conley-judgment'), agitation: checked('conley-agit'), impairedGait: checked('conley-gait'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Score', value: `${r.score}/10` },
        { label: 'Risk', value: r.tier === 'at-risk' ? 'at risk' : 'low' },
      ]);
      note(o, r.factors.length ? `Points: ${r.factors.join(', ')}.` : 'No risk points (score 0).');
      note(o, r.detail);
      note(o, r.note);
    }));
    postureNote(root);
  },
};

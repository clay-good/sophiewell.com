// spec-v701 §2: renderer for sad-persons — the SAD PERSONS suicide-risk screen (Clinical
// Scoring & Risk, Group G). Companion to the C-SSRS screener.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Ten checkboxes;
// a count 0-10 maps to a numeric risk band with a strong screen-not-rule-out posture.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/sad-persons-v701.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. SAD PERSONS has low sensitivity and is a screen to prompt a full suicide-risk assessment — never a way to rule out risk or justify discharge. Any acute concern warrants urgent psychiatric evaluation regardless of the score. It supports rather than replaces clinical judgment.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'sad-persons'(root) {
    note(root, 'SAD PERSONS scale (Patterson 1983): a mnemonic 10-item suicide-risk screen, one point each. Bands: 0–4 lower, 5–6 moderate, 7–10 high. It is a screen to prompt assessment, not a rule-out.');
    root.appendChild(checkField('Male sex', 'sad-sex'));
    root.appendChild(checkField('Age under 19 or over 45 years', 'sad-age'));
    root.appendChild(checkField('Depression', 'sad-depression'));
    root.appendChild(checkField('Previous suicide attempt', 'sad-prev'));
    root.appendChild(checkField('Excess alcohol or substance use', 'sad-etoh'));
    root.appendChild(checkField('Rational thinking loss (psychosis or organic illness)', 'sad-rational'));
    root.appendChild(checkField('Social supports lacking', 'sad-supports'));
    root.appendChild(checkField('Organized plan', 'sad-plan'));
    root.appendChild(checkField('No spouse or partner (single, widowed, divorced)', 'sad-spouse'));
    root.appendChild(checkField('Sickness (chronic or serious illness)', 'sad-sickness'));
    const ids = ['sad-sex', 'sad-age', 'sad-depression', 'sad-prev', 'sad-etoh', 'sad-rational', 'sad-supports', 'sad-plan', 'sad-spouse', 'sad-sickness'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.sadPersons({
        maleSex: checked('sad-sex'), ageRisk: checked('sad-age'), depression: checked('sad-depression'),
        previousAttempt: checked('sad-prev'), substanceUse: checked('sad-etoh'), rationalThinkingLoss: checked('sad-rational'),
        lackingSupports: checked('sad-supports'), organizedPlan: checked('sad-plan'), noSpouse: checked('sad-spouse'), sickness: checked('sad-sickness'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Score', value: `${r.score}/10` },
        { label: 'Risk', value: r.tier },
      ]);
      note(o, r.factors.length ? `Factors: ${r.factors.join(', ')}.` : 'No factors (score 0).');
      note(o, r.detail);
      note(o, r.note);
    }));
    postureNote(root);
  },
};

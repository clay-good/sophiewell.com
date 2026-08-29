// spec-v877 §2: renderer for ishoo-angioedema — the Ishoo staging of angioedema by site
// (Clinical Scoring & Risk, Group G).
//
// The not-a-severity-score sentence and the disposition sentence print on every result, because
// the number reads like a severity grade and is not one.

import { el, clear } from '../lib/dom.js';
import * as I from '../lib/ishoo-angioedema-v877.js';
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

const domId = (key) => `ish-${key.toLowerCase()}`;

export const renderers = {
  'ishoo-angioedema'(root) {
    note(root, 'The stage is the most distal site swollen. It is not a severity score, and it does not describe the airway right now.');

    root.appendChild(el('h2', { text: 'Sites of swelling' }));
    for (const s of I.SITES) checkField(root, s.text, domId(s.key), `Stage ${['', 'I', 'II', 'III', 'IV'][s.stage]}.`);

    root.appendChild(el('h2', { text: 'Right now' }));
    checkField(root, 'The airway is threatened', 'ish-airwaythreatened');

    const ids = I.SITES.map((s) => domId(s.key)).concat(['ish-airwaythreatened']);
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const args = { airwayThreatened: checked('ish-airwaythreatened') };
      for (const s of I.SITES) args[s.key] = checked(domId(s.key));
      const r = I.ishooAngioedema(args);
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }]);
      note(o, r.involvedNote);
      if (r.multipleSitesNote) note(o, r.multipleSitesNote);
      if (r.lateSignsNote) note(o, r.lateSignsNote);
      note(o, r.notASeverityScoreNote);
      note(o, r.dispositionNote);
      note(o, r.mechanismNote);
      note(o, r.scopeNote);
      note(o, r.detail);
      note(o, r.note);
    }));

    root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. This stages a finding already examined. It does not decide the airway, and it does not choose a drug.' }));
  },
};

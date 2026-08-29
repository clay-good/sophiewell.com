// spec-v879 §2: renderer for cancer-cachexia — the international consensus definition and stages
// of cancer cachexia (Clinical Scoring & Risk, Group G).
//
// The body-mass-index sentence prints on every result, because the number a reader arrives with
// is the percentage lost and the percentage on its own does not answer the question.

import { el, clear } from '../lib/dom.js';
import * as C from '../lib/cancer-cachexia-v879.js';
import { resultRow } from '../lib/result-copy.js';

function numField(root, label, id, attrs) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('input', Object.assign({ id, type: 'number' }, attrs || {})));
  root.appendChild(wrap);
}
function checkField(root, label, id) {
  const wrap = el('p');
  wrap.appendChild(el('input', { id, type: 'checkbox' }));
  wrap.appendChild(el('label', { for: id, text: ' ' + label }));
  root.appendChild(wrap);
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function checked(id) { const n = document.getElementById(id); return Boolean(n && n.checked); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'cancer-cachexia'(root) {
    note(root, 'The percentage of weight lost does not answer this on its own. The body mass index moves the threshold.');

    root.appendChild(el('h2', { text: 'Weight and muscle' }));
    numField(root, 'Weight loss over the past six months, percent of body weight', 'cx-weightlosspercent', { min: '0', max: '100', step: '0.1' });
    numField(root, 'Body mass index', 'cx-bmi', { min: '5', max: '100', step: '0.1' });
    checkField(root, 'Sarcopenia is present', 'cx-sarcopenia');
    checkField(root, 'Anorexia or metabolic change is present', 'cx-anorexiaormetabolicchange');

    root.appendChild(el('h2', { text: 'Refractory stage' }));
    checkField(root, 'The cancer is not responsive to treatment, with active catabolism', 'cx-cancernotresponsive');
    checkField(root, 'WHO performance status 3 or 4', 'cx-performancestatusthreeorfour');
    checkField(root, 'Expected survival under three months', 'cx-survivalunderthreemonths');

    const ids = ['cx-weightlosspercent', 'cx-bmi', 'cx-sarcopenia', 'cx-anorexiaormetabolicchange',
      'cx-cancernotresponsive', 'cx-performancestatusthreeorfour', 'cx-survivalunderthreemonths'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = C.cancerCachexia({
        weightLossPercent: val('cx-weightlosspercent'),
        bmi: val('cx-bmi'),
        sarcopenia: checked('cx-sarcopenia'),
        anorexiaOrMetabolicChange: checked('cx-anorexiaormetabolicchange'),
        cancerNotResponsive: checked('cx-cancernotresponsive'),
        performanceStatusThreeOrFour: checked('cx-performancestatusthreeorfour'),
        survivalUnderThreeMonths: checked('cx-survivalunderthreemonths'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }]);
      note(o, r.recordedNote);
      if (r.bmiMissingNote) note(o, r.bmiMissingNote);
      if (r.refractoryNote) note(o, r.refractoryNote);
      note(o, r.bmiNote);
      note(o, r.irreversibilityNote);
      note(o, r.refractoryMeaningNote);
      note(o, r.scopeNote);
      note(o, r.detail);
      note(o, r.note);
    }));

    root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. This applies a published consensus definition to values already recorded. It does not decide nutritional or oncologic treatment.' }));
  },
};

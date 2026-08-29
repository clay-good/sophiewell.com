// spec-v878 §2: renderer for membranous-risk — the KDIGO 2021 risk categories for membranous
// nephropathy (Clinical Scoring & Risk, Group G).
//
// The category-drives-the-decision sentence prints on every result, because the number a reader
// arrives with is the proteinuria and the guideline does not act on it alone.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/membranous-risk-v878.js';
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
  'membranous-risk'(root) {
    note(root, 'The category is what the guideline uses to decide whether immunosuppression is considered. The proteinuria alone is not.');

    root.appendChild(el('h2', { text: 'Laboratory values' }));
    numField(root, 'eGFR, mL/min per 1.73 square meters', 'mn-egfr', { min: '0', max: '200', step: '1' });
    numField(root, 'Proteinuria, grams per day', 'mn-proteinuria', { min: '0', max: '50', step: '0.1' });
    numField(root, 'Serum albumin, g/dL', 'mn-albumin', { min: '0', max: '8', step: '0.1' });
    numField(root, 'Anti-PLA2R antibody, RU/mL', 'mn-pla2r', { min: '0', max: '5000', step: '1' });
    checkField(root, 'Urinary alpha-1 microglobulin or IgG excretion is raised', 'mn-urinarymarkersraised');

    root.appendChild(el('h2', { text: 'Course' }));
    checkField(root, 'Six months of supportive therapy have been given', 'mn-sixmonthssupportive');
    checkField(root, 'Proteinuria has fallen by more than half over that period', 'mn-proteinuriahalved');
    checkField(root, 'Proteinuria above 8 g per day persisting beyond six months', 'mn-proteinuriaovereightsixmonths');

    root.appendChild(el('h2', { text: 'Clinical picture' }));
    checkField(root, 'Life-threatening nephrotic syndrome', 'mn-lifethreateningnephrotic');
    checkField(root, 'Rapid unexplained fall in kidney function', 'mn-rapidunexplaineddecline');

    const ids = ['mn-egfr', 'mn-proteinuria', 'mn-albumin', 'mn-pla2r', 'mn-urinarymarkersraised',
      'mn-sixmonthssupportive', 'mn-proteinuriahalved', 'mn-proteinuriaovereightsixmonths',
      'mn-lifethreateningnephrotic', 'mn-rapidunexplaineddecline'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.membranousRisk({
        egfr: val('mn-egfr'),
        proteinuria: val('mn-proteinuria'),
        albumin: val('mn-albumin'),
        pla2r: val('mn-pla2r'),
        urinaryMarkersRaised: checked('mn-urinarymarkersraised'),
        sixMonthsSupportive: checked('mn-sixmonthssupportive'),
        proteinuriaHalved: checked('mn-proteinuriahalved'),
        proteinuriaOverEightSixMonths: checked('mn-proteinuriaovereightsixmonths'),
        lifeThreateningNephrotic: checked('mn-lifethreateningnephrotic'),
        rapidUnexplainedDecline: checked('mn-rapidunexplaineddecline'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }]);
      note(o, r.recordedNote);
      if (r.supportiveNote) note(o, r.supportiveNote);
      if (r.pla2rNote) note(o, r.pla2rNote);
      note(o, r.categoryDrivesNote);
      note(o, r.veryHighNote);
      note(o, r.scopeNote);
      note(o, r.detail);
      note(o, r.note);
    }));

    root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. This applies published risk categories to values already recorded. It does not decide whether to start immunosuppression.' }));
  },
};

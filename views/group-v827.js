// spec-v827 §2: renderer for ntm-pulmonary — the ATS/ERS/ESCMID/IDSA criteria for
// nontuberculous mycobacterial pulmonary disease (Clinical Scoring & Risk, Group G).
//
// Sputum is a COUNT, not a "positive: yes/no", because the criterion turns on how many
// separate samples grew - one is the commonest wrong answer and a boolean cannot see the
// difference. The same-species question sits next to it, since two positives of different
// species do not satisfy the criterion either.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/ntm-pulmonary-v827.js';
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
  wrap.appendChild(el('input', Object.assign({ id, type: 'number', inputmode: 'numeric' }, attrs || {})));
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
  'ntm-pulmonary'(root) {
    note(root, 'One positive sputum is not enough: two separate samples growing the same species are needed. One bronchial wash, on the other hand, is enough on its own.');

    root.appendChild(el('h2', { text: 'Clinical and radiologic, both required' }));
    root.appendChild(checkField('Pulmonary or systemic symptoms', 'ntm-symptoms'));
    root.appendChild(checkField('Nodular or cavitary opacities on chest radiograph', 'ntm-cxr'));
    root.appendChild(checkField('High-resolution CT showing bronchiectasis with multiple small nodules', 'ntm-hrct'));

    root.appendChild(el('h2', { text: 'Exclusion' }));
    root.appendChild(checkField('Appropriate exclusion of other diagnoses', 'ntm-excluded'));

    root.appendChild(el('h2', { text: 'Microbiologic: any one of the three routes' }));
    numField(root, 'Number of separate expectorated sputum samples with a positive culture', 'ntm-sputum', { min: '0', max: '100', step: '1' });
    root.appendChild(checkField('Those sputum samples grew the same species, or subspecies for M. abscessus', 'ntm-species'));
    root.appendChild(checkField('A bronchial wash or lavage culture is positive', 'ntm-wash'));
    root.appendChild(checkField('Lung biopsy shows mycobacterial histologic features, granulomatous inflammation or acid-fast bacilli', 'ntm-biopsy'));
    root.appendChild(checkField('That biopsy is culture positive for NTM', 'ntm-biopsyculture'));
    root.appendChild(checkField('One or more sputum or bronchial washings are culture positive, alongside the biopsy', 'ntm-anyculture'));

    const ids = ['ntm-symptoms', 'ntm-cxr', 'ntm-hrct', 'ntm-excluded', 'ntm-sputum',
      'ntm-species', 'ntm-wash', 'ntm-biopsy', 'ntm-biopsyculture', 'ntm-anyculture'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.ntmPulmonary({
        pulmonarySymptoms: checked('ntm-symptoms'),
        nodularOrCavitary: checked('ntm-cxr'),
        hrctBronchiectasis: checked('ntm-hrct'),
        alternativesExcluded: checked('ntm-excluded'),
        positiveSputumCultures: val('ntm-sputum'),
        sameSpecies: checked('ntm-species'),
        bronchialWashPositive: checked('ntm-wash'),
        biopsyHistology: checked('ntm-biopsy'),
        biopsyCulturePositive: checked('ntm-biopsyculture'),
        anyCulturePositive: checked('ntm-anyculture'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Microbiologic routes met', value: `${r.microbiologicRoutes.length}/3` },
      ]);
      if (r.singleSputumNote) note(o, r.singleSputumNote);
      if (r.speciesNote) note(o, r.speciesNote);
      if (r.washNote) note(o, r.washNote);
      if (r.treatmentNote) note(o, r.treatmentNote);
      note(o, r.detail);
      note(o, r.note);
    }));

    root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. This applies published criteria to results already obtained. It does not choose or start an antimycobacterial regimen.' }));
  },
};

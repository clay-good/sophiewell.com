// spec-v824 §2: renderer for autoimmune-encephalitis — the Graus 2016 criteria for possible
// autoimmune encephalitis and definite autoimmune limbic encephalitis (Clinical Scoring &
// Risk, Group G).
//
// THERE IS DELIBERATELY NO ANTIBODY FIELD. Neither criteria set includes one, because
// serology takes weeks and antibody-negative disease is real. Offering the input would
// invite the reader to wait for a result the criteria do not want them to wait for.
//
// The CSF white cell count is a number, not a "pleocytosis: yes/no" checkbox, because the
// threshold is strictly MORE than five and exactly five is a common near-miss.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/autoimmune-encephalitis-v824.js';
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
  'autoimmune-encephalitis'(root) {
    note(root, 'Neither criteria set asks for an antibody result. That is by design: serology takes weeks, antibody-negative disease is real, and waiting delays treatment.');

    root.appendChild(el('h2', { text: 'Presentation' }));
    root.appendChild(checkField('Subacute onset, progressing over less than 3 months, of working memory deficits, altered mental status or psychiatric symptoms', 'ae-subacute'));
    root.appendChild(checkField('The presentation suggests involvement of the limbic system specifically', 'ae-limbic'));

    root.appendChild(el('h2', { text: 'Supporting features: at least one is needed' }));
    root.appendChild(checkField('New focal central nervous system findings', 'ae-focal'));
    root.appendChild(checkField('Seizures not explained by a previously known seizure disorder', 'ae-seizures'));
    numField(root, 'CSF white cell count per cubic mm (pleocytosis is more than 5)', 'ae-csf', { min: '0', step: '1' });
    root.appendChild(checkField('MRI features suggestive of encephalitis', 'ae-mri'));

    root.appendChild(el('h2', { text: 'For the definite limbic form' }));
    root.appendChild(checkField('Bilateral T2-FLAIR abnormalities highly restricted to the medial temporal lobes', 'ae-mtl'));
    root.appendChild(checkField('EEG with epileptic or slow-wave activity involving the temporal lobes', 'ae-eeg'));

    root.appendChild(el('h2', { text: 'Exclusion' }));
    root.appendChild(checkField('Reasonable exclusion of alternative causes, herpes simplex encephalitis among them', 'ae-excluded'));

    const ids = ['ae-subacute', 'ae-limbic', 'ae-focal', 'ae-seizures', 'ae-csf', 'ae-mri',
      'ae-mtl', 'ae-eeg', 'ae-excluded'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.autoimmuneEncephalitis({
        subacuteOnset: checked('ae-subacute'),
        limbicPresentation: checked('ae-limbic'),
        focalCnsFindings: checked('ae-focal'),
        newSeizures: checked('ae-seizures'),
        csfWhiteCells: val('ae-csf'),
        mriSuggestive: checked('ae-mri'),
        bilateralMedialTemporal: checked('ae-mtl'),
        temporalEeg: checked('ae-eeg'),
        alternativesExcluded: checked('ae-excluded'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Supporting features', value: `${r.supportingFeatures.length}/4` },
      ]);
      if (r.mriNote) note(o, r.mriNote);
      if (r.antibodyNote) note(o, r.antibodyNote);
      note(o, r.detail);
      note(o, r.note);
    }));

    root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. This applies published criteria to findings already gathered. It does not start immunotherapy or aciclovir.' }));
  },
};

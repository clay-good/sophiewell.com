// spec-v823 §2: renderer for nmosd-2015 — the 2015 international consensus criteria for
// neuromyelitis optica spectrum disorder (Clinical Scoring & Risk, Group G).
//
// AQP4-IgG is a three-way select and sits first, because it chooses WHICH RULE applies, not
// merely whether one item is ticked. "Unknown" follows the seronegative rule, which is what
// the criteria say and is easy to get wrong when the antibody has simply not come back yet.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/nmosd-2015-v823.js';
import { resultRow } from '../lib/result-copy.js';

function checkField(label, id) {
  const wrap = el('p');
  wrap.appendChild(el('input', { id, type: 'checkbox' }));
  wrap.appendChild(el('label', { for: id, text: ' ' + label }));
  return wrap;
}
function selField(root, label, id, options) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const s = el('select', { id });
  for (const [value, text] of options) s.appendChild(el('option', { value, text }));
  wrap.appendChild(s);
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
  'nmosd-2015'(root) {
    note(root, 'The antibody chooses the rule, not just a checkbox. One core characteristic is enough when AQP4-IgG is positive; without it, or while the result is unknown, two different ones are required.');

    root.appendChild(el('h2', { text: 'Antibody status' }));
    selField(root, 'AQP4-IgG by the best available detection method', 'nmo-aqp4', [
      ['unknown', 'Not tested, or result not available'],
      ['positive', 'Positive'],
      ['negative', 'Negative'],
    ]);

    root.appendChild(el('h2', { text: 'Core clinical characteristics' }));
    root.appendChild(checkField('Optic neuritis', 'nmo-on'));
    root.appendChild(checkField('Acute myelitis', 'nmo-myelitis'));
    root.appendChild(checkField('Area postrema syndrome: unexplained hiccups, or nausea and vomiting', 'nmo-areapostrema'));
    root.appendChild(checkField('Acute brainstem syndrome', 'nmo-brainstem'));
    root.appendChild(checkField('Symptomatic narcolepsy or acute diencephalic syndrome with NMOSD-typical MRI lesions', 'nmo-diencephalic'));
    root.appendChild(checkField('Symptomatic cerebral syndrome with NMOSD-typical brain lesions', 'nmo-cerebral'));

    root.appendChild(el('h2', { text: 'MRI requirements, needed only without a positive antibody' }));
    root.appendChild(checkField('Optic neuritis: brain MRI normal or nonspecific, OR an optic nerve lesion over half the nerve or involving the chiasm', 'nmo-mri-on'));
    root.appendChild(checkField('Myelitis: an intramedullary lesion over 3 or more contiguous segments, or 3 or more segments of focal cord atrophy', 'nmo-mri-letm'));
    root.appendChild(checkField('Area postrema syndrome: an associated dorsal medulla or area postrema lesion', 'nmo-mri-ap'));
    root.appendChild(checkField('Brainstem syndrome: associated periependymal brainstem lesions', 'nmo-mri-brainstem'));

    root.appendChild(el('h2', { text: 'Exclusion' }));
    root.appendChild(checkField('Alternative diagnoses have been excluded', 'nmo-excluded'));

    const ids = ['nmo-aqp4', 'nmo-on', 'nmo-myelitis', 'nmo-areapostrema', 'nmo-brainstem',
      'nmo-diencephalic', 'nmo-cerebral', 'nmo-mri-on', 'nmo-mri-letm', 'nmo-mri-ap',
      'nmo-mri-brainstem', 'nmo-excluded'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.nmosd2015({
        aqp4: val('nmo-aqp4'),
        opticNeuritis: checked('nmo-on'),
        acuteMyelitis: checked('nmo-myelitis'),
        areaPostrema: checked('nmo-areapostrema'),
        brainstemSyndrome: checked('nmo-brainstem'),
        diencephalicSyndrome: checked('nmo-diencephalic'),
        cerebralSyndrome: checked('nmo-cerebral'),
        mriOpticNerve: checked('nmo-mri-on'),
        mriLetm: checked('nmo-mri-letm'),
        mriAreaPostrema: checked('nmo-mri-ap'),
        mriBrainstem: checked('nmo-mri-brainstem'),
        alternativesExcluded: checked('nmo-excluded'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Core characteristics', value: `${r.coreCount}/6` },
      ]);
      if (r.armNote) note(o, r.armNote);
      if (r.qualifyingNote) note(o, r.qualifyingNote);
      if (r.mriNote) note(o, r.mriNote);
      note(o, r.detail);
      note(o, r.note);
    }));

    root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. This applies published criteria to findings already gathered. It does not start or stop immunotherapy.' }));
  },
};

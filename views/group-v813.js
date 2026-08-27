// spec-v813 §2: renderer for systemic-mastocytosis — the WHO diagnostic criteria
// (Clinical Scoring & Risk, Group G).
//
// The tryptase minor criterion is the only computed one: the entered value is divided by
// (1 + extra alpha-tryptase gene copies) before it is compared with the threshold, so the
// number field and the copy-count field sit together under the same heading.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/systemic-mastocytosis-v813.js';
import { resultRow } from '../lib/result-copy.js';

function checkField(label, id) {
  const wrap = el('p');
  wrap.appendChild(el('input', { id, type: 'checkbox' }));
  wrap.appendChild(el('label', { for: id, text: ' ' + label }));
  return wrap;
}
function numField(label, id, attrs) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', Object.assign({ id, type: 'number', inputmode: 'decimal' }, attrs || {})));
  return wrap;
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
  'systemic-mastocytosis'(root) {
    note(root, 'One major plus one minor criterion, or three minor criteria. Enter the measured tryptase; the hereditary alpha-tryptasemia correction is applied here rather than beforehand.');

    root.appendChild(el('h2', { text: 'Major criterion' }));
    root.appendChild(checkField('Multifocal dense mast cell infiltrates, 15 or more in aggregates, in marrow or another extracutaneous organ', 'sm-major'));

    root.appendChild(el('h2', { text: 'Minor criteria' }));
    root.appendChild(checkField('More than 25 percent of mast cells atypical or spindle-shaped', 'sm-morphology'));
    root.appendChild(checkField('Activating KIT mutation at codon 816 or another critical region', 'sm-kit'));
    root.appendChild(checkField('Mast cells aberrantly express CD2, CD25 or CD30', 'sm-markers'));

    root.appendChild(el('h2', { text: 'Baseline serum tryptase' }));
    root.appendChild(numField('Measured baseline serum tryptase, ng per mL', 'sm-tryptase', { min: '0', step: '0.1' }));
    root.appendChild(numField('Extra alpha-tryptase gene copies (0 if no hereditary alpha-tryptasemia)', 'sm-copies', { min: '0', step: '1' }));
    root.appendChild(checkField('An associated myeloid neoplasm is present', 'sm-ahn'));

    const ids = ['sm-major', 'sm-morphology', 'sm-kit', 'sm-markers', 'sm-tryptase', 'sm-copies', 'sm-ahn'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.systemicMastocytosis({
        multifocalInfiltrates: checked('sm-major'),
        atypicalMorphology: checked('sm-morphology'),
        kitMutation: checked('sm-kit'),
        aberrantMarkers: checked('sm-markers'),
        tryptase: val('sm-tryptase'),
        extraAlphaCopies: val('sm-copies'),
        associatedMyeloidNeoplasm: checked('sm-ahn'),
      });
      if (!r.valid) { note(o, r.message); return; }
      const rows = [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Minor criteria met', value: `${r.minorCount}/4` },
      ];
      if (r.correctedTryptase !== null) rows.push({ label: 'Corrected tryptase', value: `${r.correctedTryptase} ng/mL` });
      resultRow(o, rows);
      if (r.tryptaseNote) note(o, r.tryptaseNote);
      note(o, r.detail);
      note(o, r.note);
    }));

    root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. This applies criteria to results already obtained. It does not order the marrow biopsy or the tryptase genotyping most of them depend on.' }));
  },
};

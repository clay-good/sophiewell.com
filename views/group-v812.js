// spec-v812 §2: renderer for leipzig-wilson — the Leipzig (Ferenci) score for diagnosing
// Wilson disease (Clinical Scoring & Risk, Group G).
//
// Options are written out literally rather than looped so the pre-rendered tool pages can
// resolve their TEXT. Values are numeric codes rather than the point values, because two
// urinary-copper options are both worth 2 points and a value cannot be the score.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/leipzig-wilson-v812.js';
import { resultRow } from '../lib/result-copy.js';

function sel(root, label, id, options) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const s = el('select', { id });
  for (const [value, text] of options) s.appendChild(el('option', { value, text }));
  wrap.appendChild(s);
  root.appendChild(wrap);
}
function checkField(label, id) {
  const wrap = el('p');
  wrap.appendChild(el('input', { id, type: 'checkbox' }));
  wrap.appendChild(el('label', { for: id, text: ' ' + label }));
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
  'leipzig-wilson'(root) {
    note(root, 'A normal liver copper subtracts a point rather than scoring zero. Rhodanine granules are scored only when no quantitative liver copper is available.');

    sel(root, 'Kayser-Fleischer rings', 'lw-kf', [['0', 'Absent'], ['1', 'Present']]);
    sel(root, 'Neurologic symptoms or typical brain MRI changes', 'lw-neuro', [['0', 'Absent'], ['1', 'Mild'], ['2', 'Severe']]);
    sel(root, 'Serum ceruloplasmin', 'lw-cerulo', [['0', 'Normal, above 0.2 g/L'], ['1', '0.1 to 0.2 g/L'], ['2', 'Below 0.1 g/L']]);
    sel(root, 'Coombs-negative hemolytic anemia', 'lw-hemolysis', [['0', 'Absent'], ['1', 'Present']]);
    sel(root, 'Quantitative liver copper, dry weight', 'lw-livercu', [['na', 'Not available'], ['0', 'Normal, below 0.8 micromol per gram'], ['1', '0.8 to 4 micromol per gram'], ['2', 'Above 4 micromol per gram']]);
    root.appendChild(checkField('Rhodanine-positive granules on biopsy', 'lw-rhodanine'));
    sel(root, '24-hour urinary copper', 'lw-urinecu', [['0', 'Normal'], ['1', '1 to 2 times the upper limit'], ['2', 'Above twice the upper limit'], ['3', 'Normal, but above 5 times the upper limit after D-penicillamine']]);
    sel(root, 'ATP7B mutation analysis', 'lw-mutation', [['0', 'No disease-causing variant found'], ['1', 'Deleterious variant on one chromosome'], ['2', 'Deleterious variants on both chromosomes']]);

    const ids = ['lw-kf', 'lw-neuro', 'lw-cerulo', 'lw-hemolysis', 'lw-livercu', 'lw-rhodanine', 'lw-urinecu', 'lw-mutation'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.leipzigWilson({
        kfRings: val('lw-kf'),
        neurologic: val('lw-neuro'),
        ceruloplasmin: val('lw-cerulo'),
        hemolysis: val('lw-hemolysis'),
        liverCopper: val('lw-livercu'),
        rhodanineGranules: checked('lw-rhodanine'),
        urinaryCopper: val('lw-urinecu'),
        mutation: val('lw-mutation'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Score', value: String(r.score) },
      ]);
      if (r.contributions.length) note(o, 'Scoring: ' + r.contributions.join('; ') + '.');
      if (r.rhodanineNote) note(o, r.rhodanineNote);
      if (r.negativeNote) note(o, r.negativeNote);
      note(o, r.detail);
      note(o, r.note);
    }));

    root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. This scores evidence already gathered. It does not start chelation or zinc.' }));
  },
};

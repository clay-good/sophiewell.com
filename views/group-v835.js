// spec-v835 §2: renderer for acromegaly-biochem — the biochemical diagnosis of acromegaly
// (Clinical Scoring & Risk, Group G).
//
// IGF-1 is entered as a MULTIPLE of the age- and sex-matched upper limit rather than a raw
// concentration. Assays and reference ranges differ enormously and the criterion is itself
// expressed as a multiple, so asking for the raw number would require a conversion the tile
// cannot make.
//
// The random growth hormone field exists so the tile can say what it is worth, which is very
// little. Leaving it out would let a reader supply it somewhere else and believe it counted.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/acromegaly-biochem-v835.js';
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
  wrap.appendChild(el('input', Object.assign({ id, type: 'number', inputmode: 'decimal' }, attrs || {})));
  root.appendChild(wrap);
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
  'acromegaly-biochem'(root) {
    note(root, 'A random growth hormone is not a diagnostic test. The oral glucose tolerance test nadir threshold depends on which assay the laboratory uses.');

    root.appendChild(el('h2', { text: 'IGF-1' }));
    numField(root, 'IGF-1 as a multiple of the age- and sex-matched upper limit of normal', 'acro-igf1', { min: '0', max: '100', step: '0.01' });
    root.appendChild(checkField('The IGF-1 was interpreted against an age- and sex-matched reference range', 'acro-matched'));
    root.appendChild(checkField('Typical clinical features of acromegaly are present', 'acro-features'));

    root.appendChild(el('h2', { text: 'Oral glucose tolerance test' }));
    numField(root, 'Growth hormone nadir within 2 hours of 75 g glucose, micrograms per L', 'acro-nadir', { min: '0', max: '1000', step: '0.01' });
    selField(root, 'Growth hormone assay', 'acro-assay', [
      ['conventional', 'Conventional (nadir threshold 1.0)'],
      ['ultrasensitive', 'Ultrasensitive (nadir threshold 0.4)'],
    ]);

    root.appendChild(el('h2', { text: 'Random growth hormone, which is not a diagnostic test' }));
    numField(root, 'Random growth hormone, micrograms per L', 'acro-random', { min: '0', max: '1000', step: '0.01' });

    const ids = ['acro-igf1', 'acro-matched', 'acro-features', 'acro-nadir', 'acro-assay', 'acro-random'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.acromegalyBiochem({
        igf1TimesUln: val('acro-igf1'),
        ageAndSexMatched: checked('acro-matched'),
        typicalFeatures: checked('acro-features'),
        ogttGhNadir: val('acro-nadir'),
        assay: val('acro-assay'),
        randomGh: val('acro-random'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Nadir threshold', value: `${r.nadirThreshold} micrograms per L` },
      ]);
      if (r.assayNote) note(o, r.assayNote);
      if (r.discordanceNote) note(o, r.discordanceNote);
      if (r.randomNote) note(o, r.randomNote);
      if (r.referenceNote) note(o, r.referenceNote);
      note(o, r.detail);
      note(o, r.note);
    }));

    root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. This interprets results already obtained. It does not arrange imaging or treatment.' }));
  },
};

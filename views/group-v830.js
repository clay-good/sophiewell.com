// spec-v830 §2: renderer for aat-deficiency — alpha-1 antitrypsin level, genotype and
// testing indications (Clinical Scoring & Risk, Group G).
//
// The units select does NOT convert. The published pairs (57 with 11, 100 with 20) imply
// different factors and are conventional rather than exact, so each unit is compared against
// its own thresholds and neither is derived from the other.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/aat-deficiency-v830.js';
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
  'aat-deficiency'(root) {
    note(root, 'The classical protective threshold has been refuted as a predictor of COPD risk. Genotype, not the serum level, is what the evidence ties to disease.');

    root.appendChild(el('h2', { text: 'Serum level' }));
    numField(root, 'Serum alpha-1 antitrypsin', 'aat-level', { min: '0', max: '1000', step: '0.1' });
    selField(root, 'Units', 'aat-units', [
      ['mg-dl', 'mg per dL (thresholds 57 and 100)'],
      ['umol-l', 'micromol per L (thresholds 11 and 20)'],
    ]);

    root.appendChild(el('h2', { text: 'Genotype' }));
    selField(root, 'Alpha-1 antitrypsin genotype', 'aat-genotype', [
      ['not-tested', 'Not determined'],
      ['mm', 'PI*MM, normal'],
      ['ms', 'PI*MS'],
      ['ss', 'PI*SS'],
      ['mz', 'PI*MZ, carrier'],
      ['sz', 'PI*SZ'],
      ['zz', 'PI*ZZ, severe deficiency'],
      ['rare-severe', 'A rare ZZ-equivalent or null genotype'],
    ]);

    root.appendChild(el('h2', { text: 'Who the standards say to test' }));
    root.appendChild(checkField('Chronic obstructive pulmonary disease', 'aat-copd'));
    root.appendChild(checkField('Emphysema', 'aat-emphysema'));
    root.appendChild(checkField('Incompletely reversible asthma', 'aat-asthma'));
    root.appendChild(checkField('Unexplained liver disease', 'aat-liver'));
    root.appendChild(checkField('A sibling with alpha-1 antitrypsin deficiency', 'aat-sibling'));

    const ids = ['aat-level', 'aat-units', 'aat-genotype', 'aat-copd', 'aat-emphysema',
      'aat-asthma', 'aat-liver', 'aat-sibling'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.aatDeficiency({
        serumLevel: val('aat-level'),
        units: val('aat-units'),
        genotype: val('aat-genotype'),
        copd: checked('aat-copd'),
        emphysema: checked('aat-emphysema'),
        irreversibleAsthma: checked('aat-asthma'),
        unexplainedLiverDisease: checked('aat-liver'),
        sibling: checked('aat-sibling'),
      });
      if (!r.valid) { note(o, r.message); return; }
      const rows = [{ text: r.band, cls: r.abnormal ? 'warn' : null }];
      if (r.genotypeRisk) rows.push({ label: 'Genotype risk', value: r.genotypeRisk });
      resultRow(o, rows);
      if (r.thresholdNote) note(o, r.thresholdNote);
      if (r.genotypeNote) note(o, r.genotypeNote);
      if (r.testingNote) note(o, r.testingNote);
      if (r.methodNote) note(o, r.methodNote);
      note(o, r.detail);
      note(o, r.note);
    }));

    root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. This interprets results already obtained. It does not order testing or start augmentation therapy.' }));
  },
};

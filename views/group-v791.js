// spec-v791 §2: renderer for cardiac-sarcoidosis — the HRS 2014 diagnostic criteria
// (Clinical Scoring & Risk, Group G).
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. The two pathways
// are separated by headings, because the histological one stands alone and the clinical one
// needs all three of its parts.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/cardiac-sarcoidosis-v791.js';
import { resultRow } from '../lib/result-copy.js';

function checkField(label, id) {
  const wrap = el('p');
  const cb = el('input', { id, type: 'checkbox' });
  wrap.appendChild(cb);
  wrap.appendChild(el('label', { for: id, text: ' ' + label }));
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function checked(id) { const n = document.getElementById(id); return !!(n && n.checked); }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. Failing to meet these criteria does not exclude the disease, because endomyocardial biopsy misses patchy involvement often. This decides nothing about immunosuppression or a defibrillator.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'cardiac-sarcoidosis'(root) {
    note(root, 'Two independent pathways. The histological one stands alone. The clinical one needs all three of its parts: sarcoidosis proven outside the heart, at least one qualifying cardiac finding, and other causes reasonably excluded.');
    root.appendChild(el('h2', { text: 'Histological pathway (definite on its own)' }));
    root.appendChild(checkField('Endomyocardial biopsy shows non-caseating granuloma with no alternative cause', 'cs-biopsy'));
    root.appendChild(el('h2', { text: 'Clinical pathway, part a' }));
    root.appendChild(checkField('Histological diagnosis of sarcoidosis outside the heart', 'cs-extracardiac'));
    root.appendChild(el('h2', { text: 'Clinical pathway, part b: qualifying cardiac findings (one or more)' }));
    root.appendChild(checkField('Cardiomyopathy or heart block responding to steroid or immunosuppressant', 'cs-steroid'));
    root.appendChild(checkField('Unexplained left ventricular ejection fraction of 40 percent or less', 'cs-ef'));
    root.appendChild(checkField('Unexplained sustained ventricular tachycardia, spontaneous or induced', 'cs-vt'));
    root.appendChild(checkField('Mobitz type II second-degree or third-degree heart block', 'cs-block'));
    root.appendChild(checkField('Patchy uptake on dedicated cardiac FDG-PET consistent with sarcoidosis', 'cs-pet'));
    root.appendChild(checkField('Late gadolinium enhancement on cardiac MRI consistent with sarcoidosis', 'cs-cmr'));
    root.appendChild(checkField('Gallium uptake consistent with sarcoidosis', 'cs-gallium'));
    root.appendChild(el('h2', { text: 'Clinical pathway, part c' }));
    root.appendChild(checkField('Other causes for the cardiac findings reasonably excluded', 'cs-excluded'));
    const ids = ['cs-biopsy', 'cs-extracardiac', 'cs-steroid', 'cs-ef', 'cs-vt', 'cs-block', 'cs-pet', 'cs-cmr', 'cs-gallium', 'cs-excluded'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.cardiacSarcoidosis({
        myocardialGranuloma: checked('cs-biopsy'),
        extracardiacSarcoid: checked('cs-extracardiac'),
        steroidResponsive: checked('cs-steroid'),
        lowEf: checked('cs-ef'),
        sustainedVt: checked('cs-vt'),
        heartBlock: checked('cs-block'),
        petUptake: checked('cs-pet'),
        cmrLge: checked('cs-cmr'),
        galliumUptake: checked('cs-gallium'),
        otherCausesExcluded: checked('cs-excluded'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Pathway', value: r.pathway },
        { label: 'Cardiac findings', value: r.cardiacFindings.length ? `${r.cardiacFindings.length} selected` : 'none selected' },
      ]);
      if (r.cardiacFindings.length) note(o, `Findings: ${r.cardiacFindings.join(', ')}.`);
      note(o, r.detail);
      note(o, r.note);
    }));
    postureNote(root);
  },
};

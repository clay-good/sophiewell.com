// spec-v814 §2: renderer for cluster-headache-ichd3 — the ICHD-3 criteria for 3.1 Cluster
// headache (Clinical Scoring & Risk, Group G).
//
// The five autonomic signs get one checkbox each, and restlessness sits with them under a
// heading that says "either or both" out loud, because criterion C is satisfied by
// restlessness alone and readers routinely believe an autonomic sign is mandatory.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/cluster-headache-ichd3-v814.js';
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
  'cluster-headache-ichd3'(root) {
    note(root, 'All five criteria are required. The frequency requirement is a window with a floor: attacks less often than one every other day fail it just as more than eight a day do.');

    root.appendChild(el('h2', { text: 'Attacks' }));
    root.appendChild(numField('Number of attacks so far', 'chi-attacks', { min: '0', step: '1' }));
    root.appendChild(checkField('Severe or very severe one-sided orbital, supraorbital or temporal pain', 'chi-pain'));
    root.appendChild(numField('Attack duration untreated, minutes', 'chi-duration', { min: '0', step: '1' }));
    root.appendChild(numField('Attacks per day (use 0.5 for one every other day)', 'chi-frequency', { min: '0', step: '0.5' }));

    root.appendChild(el('h2', { text: 'Either or both: one autonomic sign on the same side, or restlessness' }));
    root.appendChild(checkField('Conjunctival injection and/or tearing', 'chi-conjunctival'));
    root.appendChild(checkField('Nasal congestion and/or runny nose', 'chi-nasal'));
    root.appendChild(checkField('Eyelid swelling', 'chi-eyelid'));
    root.appendChild(checkField('Forehead and facial sweating', 'chi-sweating'));
    root.appendChild(checkField('Small pupil and/or drooping eyelid', 'chi-miosis'));
    root.appendChild(checkField('A sense of restlessness or agitation (sufficient on its own)', 'chi-restless'));

    root.appendChild(el('h2', { text: 'Exclusion and pattern' }));
    root.appendChild(checkField('Not better accounted for by another ICHD-3 diagnosis', 'chi-noother'));

    const wrap = el('p');
    wrap.appendChild(el('label', { for: 'chi-pattern', text: 'Bout pattern, if known' }));
    wrap.appendChild(el('br'));
    const sel = el('select', { id: 'chi-pattern' });
    sel.appendChild(el('option', { value: '', text: 'Not stated' }));
    sel.appendChild(el('option', { value: 'episodic', text: 'Two or more bouts of 7 days to 1 year, separated by remissions of 3 months or more' }));
    sel.appendChild(el('option', { value: 'chronic', text: 'No remission, or remissions under 3 months, for at least 1 year' }));
    wrap.appendChild(sel);
    root.appendChild(wrap);

    const ids = ['chi-attacks', 'chi-pain', 'chi-duration', 'chi-frequency',
      'chi-conjunctival', 'chi-nasal', 'chi-eyelid', 'chi-sweating', 'chi-miosis', 'chi-restless',
      'chi-noother', 'chi-pattern'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.clusterHeadacheIchd3({
        attackCount: val('chi-attacks'),
        severeUnilateralPain: checked('chi-pain'),
        attackDuration: val('chi-duration'),
        attacksPerDay: val('chi-frequency'),
        conjunctivalInjection: checked('chi-conjunctival'),
        nasalCongestion: checked('chi-nasal'),
        eyelidEdema: checked('chi-eyelid'),
        sweating: checked('chi-sweating'),
        miosisPtosis: checked('chi-miosis'),
        restlessness: checked('chi-restless'),
        noBetterExplanation: checked('chi-noother'),
        remissionPattern: val('chi-pattern'),
      });
      if (!r.valid) { note(o, r.message); return; }
      const c = r.criteria;
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Criteria met', value: `${[c.a, c.b, c.c, c.d, c.e].filter(Boolean).length}/5` },
      ]);
      if (r.frequencyNote) note(o, r.frequencyNote);
      if (r.restlessOnlyNote) note(o, r.restlessOnlyNote);
      note(o, r.detail);
      note(o, r.note);
    }));

    root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. This applies published criteria to a history already taken. It does not prescribe oxygen, a triptan or a preventive.' }));
  },
};

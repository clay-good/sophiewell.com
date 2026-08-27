// spec-v820 §2: renderer for sunct-suna-ichd3 — ICHD-3 section 3.3 with the SUNCT and SUNA
// subtypes (Clinical Scoring & Risk, Group G).
//
// Conjunctival injection and tearing get their own heading, apart from the other five
// autonomic signs, because the subtype turns on those two alone: both is SUNCT, one or
// neither is SUNA. Restlessness is offered but is NOT an alternative to an autonomic sign
// here, and the tile says so when someone relies on it.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/sunct-suna-ichd3-v820.js';
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
  'sunct-suna-ichd3'(root) {
    note(root, 'Attacks here are measured in seconds, not minutes. A cranial autonomic sign is required: unlike cluster headache and paroxysmal hemicrania, restlessness is not an alternative.');

    root.appendChild(el('h2', { text: 'Attacks' }));
    numField(root, 'Number of attacks so far', 'ss-attacks', { min: '0', step: '1' });
    root.appendChild(checkField('Moderate or severe one-sided pain in an orbital, supraorbital, temporal or other trigeminal distribution', 'ss-pain'));
    numField(root, 'Attack duration, seconds', 'ss-seconds', { min: '0', step: '1' });
    root.appendChild(checkField('Comes as single stabs, series of stabs, or in a saw-tooth pattern', 'ss-pattern'));
    numField(root, 'Attacks per day', 'ss-perday', { min: '0', step: '1' });

    root.appendChild(el('h2', { text: 'The two signs that decide the subtype' }));
    root.appendChild(checkField('Conjunctival injection', 'ss-conjunctival'));
    root.appendChild(checkField('Tearing', 'ss-lacrimation'));

    root.appendChild(el('h2', { text: 'Other cranial autonomic signs on the same side' }));
    root.appendChild(checkField('Nasal congestion and/or runny nose', 'ss-nasal'));
    root.appendChild(checkField('Eyelid swelling', 'ss-eyelid'));
    root.appendChild(checkField('Forehead and facial sweating', 'ss-sweating'));
    root.appendChild(checkField('Forehead and facial flushing', 'ss-flushing'));
    root.appendChild(checkField('A sensation of fullness in the ear', 'ss-ear'));
    root.appendChild(checkField('Small pupil and/or drooping eyelid', 'ss-miosis'));
    root.appendChild(checkField('A sense of restlessness or agitation (not an alternative in this diagnosis)', 'ss-restless'));

    root.appendChild(el('h2', { text: 'Exclusion' }));
    root.appendChild(checkField('Not better accounted for by another ICHD-3 diagnosis', 'ss-noother'));

    const ids = ['ss-attacks', 'ss-pain', 'ss-seconds', 'ss-pattern', 'ss-perday',
      'ss-conjunctival', 'ss-lacrimation', 'ss-nasal', 'ss-eyelid', 'ss-sweating',
      'ss-flushing', 'ss-ear', 'ss-miosis', 'ss-restless', 'ss-noother'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.sunctSunaIchd3({
        attackCount: val('ss-attacks'),
        moderateOrSevereUnilateral: checked('ss-pain'),
        attackSeconds: val('ss-seconds'),
        stabbingPattern: checked('ss-pattern'),
        attacksPerDay: val('ss-perday'),
        conjunctivalInjection: checked('ss-conjunctival'),
        lacrimation: checked('ss-lacrimation'),
        nasalCongestion: checked('ss-nasal'),
        eyelidEdema: checked('ss-eyelid'),
        sweating: checked('ss-sweating'),
        flushing: checked('ss-flushing'),
        earFullness: checked('ss-ear'),
        miosisPtosis: checked('ss-miosis'),
        restlessness: checked('ss-restless'),
        noBetterExplanation: checked('ss-noother'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Autonomic signs', value: `${r.autonomicCount}/7` },
      ]);
      if (r.restlessNote) note(o, r.restlessNote);
      if (r.durationNote) note(o, r.durationNote);
      if (r.subtypeNote) note(o, r.subtypeNote);
      note(o, r.detail);
      note(o, r.note);
    }));

    root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. This applies published criteria to a history already taken. It does not start lamotrigine or arrange imaging.' }));
  },
};

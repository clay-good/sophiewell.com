// spec-v315: renderer for the 2015 revised Jones criteria (acute rheumatic fever).
// Group G. The clinician selects the population risk tier and the episode type,
// marks whether there is evidence of preceding group A strep, and checks the
// manifestations present; the tile reports whether the 2015 Jones criteria are met.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the classification result; it never asserts a
// diagnosis or an order (lib/jones-v315.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/jones-v315.js';
import { resultRow } from '../lib/result-copy.js';

function check(label, id) {
  const wrap = el('p');
  wrap.appendChild(el('input', { id, type: 'checkbox' }));
  wrap.appendChild(el('label', { for: id, text: ' ' + label }));
  return wrap;
}
function select(label, id, options) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const s = el('select', { id });
  for (const [value, text] of options) s.appendChild(el('option', { value, text }));
  wrap.appendChild(s);
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function chk(id) { const n = document.getElementById(id); return n ? n.checked : false; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The diagnosis, and the exclusion of mimics, stay with the clinician and the patient.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

const IDS = [
  'jones-risk', 'jones-episode', 'jones-gas',
  'jones-carditis', 'jones-chorea', 'jones-em', 'jones-nodules',
  'jones-polyarthritis', 'jones-monoarthritis', 'jones-polyarthralgia', 'jones-monoarthralgia',
  'jones-fever', 'jones-reactants', 'jones-pr',
];

export const renderers = {
  'jones-criteria'(root) {
    note(root, '2015 revised Jones criteria (AHA) for acute rheumatic fever. Choose the population risk tier and episode, mark evidence of preceding group A strep, and check the manifestations present. Diagnosis: 2 major, or 1 major + 2 minor (recurrent also allows 3 minor). Near-neighbors: duke-endocarditis.');
    root.appendChild(select('Population risk tier', 'jones-risk', [
      ['low', 'Low-risk population (ARF ≤2/100,000 school-age; RHD ≤1/1000)'],
      ['modhigh', 'Moderate/high-risk population'],
    ]));
    root.appendChild(select('Episode', 'jones-episode', [
      ['initial', 'Initial ARF'],
      ['recurrent', 'Recurrent ARF (in known ARF/RHD)'],
    ]));
    root.appendChild(check('Evidence of preceding group A strep (culture, RADT, or rising antibody titer)', 'jones-gas'));

    note(root, 'Major manifestations:');
    root.appendChild(check('Carditis (clinical and/or subclinical on echo)', 'jones-carditis'));
    root.appendChild(check('Sydenham chorea', 'jones-chorea'));
    root.appendChild(check('Erythema marginatum', 'jones-em'));
    root.appendChild(check('Subcutaneous nodules', 'jones-nodules'));
    root.appendChild(check('Polyarthritis', 'jones-polyarthritis'));
    root.appendChild(check('Monoarthritis (major in moderate/high-risk only)', 'jones-monoarthritis'));
    root.appendChild(check('Polyarthralgia (major in moderate/high-risk; minor in low-risk)', 'jones-polyarthralgia'));

    note(root, 'Minor manifestations:');
    root.appendChild(check('Monoarthralgia (minor in moderate/high-risk only)', 'jones-monoarthralgia'));
    root.appendChild(check('Fever (≥38.5 °C low-risk / ≥38 °C moderate-high-risk)', 'jones-fever'));
    root.appendChild(check('Elevated ESR (≥60 low / ≥30 moderate-high mm/h) and/or CRP ≥3 mg/dL', 'jones-reactants'));
    root.appendChild(check('Prolonged PR interval on ECG (counts only if carditis is absent)', 'jones-pr'));

    const o = out(); root.appendChild(o);
    wire(IDS, () => safe(o, () => {
      const r = M.jonesCriteria({
        riskPopulation: val('jones-risk'), episode: val('jones-episode'), gasEvidence: chk('jones-gas'),
        carditis: chk('jones-carditis'), chorea: chk('jones-chorea'), erythemaMarginatum: chk('jones-em'),
        subcutaneousNodules: chk('jones-nodules'), polyarthritis: chk('jones-polyarthritis'),
        monoarthritis: chk('jones-monoarthritis'), polyarthralgia: chk('jones-polyarthralgia'),
        monoarthralgia: chk('jones-monoarthralgia'), fever: chk('jones-fever'),
        elevatedAcuteReactants: chk('jones-reactants'), prolongedPr: chk('jones-pr'),
      });
      resultRow(o, [
        { text: r.band, cls: r.met ? 'warn' : null },
        { label: 'Major / minor', value: `${r.majors} / ${r.minors}` },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};

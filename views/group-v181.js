// spec-v181 §2: renderers for the two long-term-care infection-surveillance /
// antimicrobial-stewardship tiles (cluster §3.9 of the spec-v172 LTC-GA program)
// — mcgeer-criteria (Revised McGeer surveillance definitions) and
// loeb-minimum-criteria (Loeb minimum criteria for initiating antibiotics). Both
// are Clinical Scoring & Risk (Group G).
//
// Each tile is a site-branched criteria-logic evaluation: pick the suspected
// infection site, then check the findings present. The criteria checkboxes are
// rebuilt for the selected site so the clinician only sees that site's rule. The
// output is CATEGORICAL — MEETS / DOES NOT MEET (McGeer) or MET / NOT MET (Loeb)
// — with the satisfied criteria named and the blocking gap surfaced when not met;
// there is no numeric score. With no site selected, or a site selected but no
// finding checked, the tile surfaces a complete-the-fields fallback and never a
// false meets/met (spec-v59 output safety).
//
// Same input/render contract as the rest of the codebase: every checkbox has a
// real <label for> (a11y-check passes), no innerHTML, no network, no storage.
// Per the spec-v50 §3 posture note each tile defers the decision to the
// clinician: McGeer is a surveillance definition (tracking/reporting, not a
// diagnosis and not a treatment trigger); Loeb is stewardship decision support
// for initiation (it neither orders nor withholds antibiotics — the prescriber
// and local protocol decide; spec-v11 §5.3).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/ltcga-v181.js';
import { resultRow } from '../lib/result-copy.js';

function checkbox(label, id) {
  const wrap = el('p');
  const cb = el('input', { id, type: 'checkbox' });
  wrap.appendChild(cb);
  wrap.appendChild(document.createTextNode(' '));
  wrap.appendChild(el('label', { for: id, text: label }));
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }

function buildTile(root, { prefix, sites, compute, intro, posture }) {
  note(root, intro);

  const selWrap = el('p');
  selWrap.appendChild(el('label', { for: `${prefix}-site`, text: 'Suspected infection site' }));
  selWrap.appendChild(el('br'));
  const sel = el('select', { id: `${prefix}-site` });
  sel.appendChild(el('option', { value: '', text: '— choose a site —' }));
  for (const s of sites) sel.appendChild(el('option', { value: s.value, text: s.label }));
  selWrap.appendChild(sel);
  root.appendChild(selWrap);

  const criteriaBox = el('div');
  root.appendChild(criteriaBox);
  const o = out();
  root.appendChild(o);
  note(root, posture);

  const run = () => safe(o, () => {
    const site = sites.find((s) => s.value === sel.value);
    const payload = { site: sel.value };
    if (site) {
      for (const cr of site.criteria) {
        const n = document.getElementById(`${prefix}-${cr.key}`);
        payload[cr.key] = n && n.checked ? '1' : '';
      }
    }
    const r = compute(payload);
    if (!r.valid) { note(o, r.message); return; }
    resultRow(o, [{ text: r.determination }]);
    if (r.satisfied.length) note(o, `Criteria satisfied: ${r.satisfied.join('; ')}.`);
    if (r.blocker) note(o, `Not met because: ${r.blocker}.`);
    note(o, r.note);
  });

  const rebuild = () => {
    clear(criteriaBox);
    const site = sites.find((s) => s.value === sel.value);
    if (site) {
      note(criteriaBox, `${site.label}: check each finding that is present.`);
      for (const cr of site.criteria) {
        const cb = checkbox(cr.label, `${prefix}-${cr.key}`);
        cb.querySelector('input').addEventListener('change', run);
        criteriaBox.appendChild(cb);
      }
    }
    run();
  };
  sel.addEventListener('change', rebuild);
  rebuild();
}

export const renderers = {
  'mcgeer-criteria'(root) {
    buildTile(root, {
      prefix: 'mcg',
      sites: M.MCGEER_SITES,
      compute: M.mcgeerCriteria,
      intro: 'Revised McGeer criteria (Stone 2012): surveillance case definitions of infection in long-term care. Pick the suspected site, then check the constitutional and site-specific findings present → MEETS / DOES NOT MEET the surveillance definition. This is a counting definition for infection tracking and reporting — it is not a diagnosis and not a treatment trigger. Some sites require microbiologic or radiographic confirmation; surveillance is applied retrospectively when that information is available. Companion to loeb-minimum-criteria (the initiation-support counterpart).',
      posture: 'Surveillance, not diagnosis. The determination is the cited definition’s, derived from the findings you enter; it counts a facility-acquired infection for tracking and reporting. It does not diagnose and does not indicate treatment. The clinical decision stays with the clinician, the infection preventionist, and local protocol.',
    });
  },
  'loeb-minimum-criteria'(root) {
    buildTile(root, {
      prefix: 'loeb',
      sites: M.LOEB_SITES,
      compute: M.loebMinimumCriteria,
      intro: 'Loeb minimum criteria (2001): the consensus minimum criteria for initiating antibiotics in a long-term-care resident. Pick the suspected site, then check the findings present → minimum criteria MET / NOT MET for starting antimicrobials. Decision support for stewardship at the point a clinician is considering antibiotics. Companion to mcgeer-criteria (the surveillance counterpart).',
      posture: 'Stewardship decision support, not an order. The determination is the cited instrument’s, derived from the findings you enter; it indicates only whether the minimum threshold to START antibiotics is met. It does not order and does not withhold antibiotics, and it names no agent, dose, route, or duration — the prescriber and the facility’s local protocol decide.',
    });
  },
};

export const RV181 = renderers;

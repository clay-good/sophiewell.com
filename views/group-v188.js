// spec-v188 §2: renderers for the five leukemia / lymphoma staging / prognostic
// tiles — Binet & Rai CLL stages, Ann Arbor (Lugano) lymphoma stage, FLIPI-2,
// and the Hasford (Euro) CML score. Group G (classification / score).
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. The
// Hasford math is finite-guarded in lib/heme-staging-v188.js. Per the spec-v50 §3
// posture note each tile defers the therapy decision to the treating team
// (spec-v11 §5.3) — these stage and prognosticate, they do not order.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/heme-staging-v188.js';
import { resultRow } from '../lib/result-copy.js';

function field(label, id, attrs) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, ...attrs }));
  return wrap;
}
function selectField(label, id, options) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const sel = el('select', { id });
  for (const o of options) sel.appendChild(el('option', { value: o.value, text: o.text }));
  wrap.appendChild(sel);
  return wrap;
}
function pickField(label, id, options) {
  return selectField(label, id, [{ value: '', text: '— choose —' }, ...options]);
}
function num(label, id) {
  return field(label, id, { type: 'number', min: '0', step: 'any', inputmode: 'decimal' });
}
function checkField(label, id) {
  const wrap = el('p');
  wrap.appendChild(el('input', { id, type: 'checkbox' }));
  wrap.appendChild(el('label', { for: id, text: ' ' + label }));
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function chk(id) { const n = document.getElementById(id); return n ? n.checked : false; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function showInvalid(o, r) { note(o, r.message || 'Complete the remaining fields.'); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The stage or prognostic group is the cited source’s, computed from the inputs you enter. The therapy decision stays with the treating team and the patient.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

const ANN_OPTS = [
  { value: 'single-region', text: 'I — one nodal region / single extranodal site' },
  { value: 'multi-same-side', text: 'II — ≥ 2 regions, same side of diaphragm' },
  { value: 'both-sides', text: 'III — regions on both sides of diaphragm' },
  { value: 'disseminated', text: 'IV — disseminated / diffuse extranodal' },
];

export const renderers = {
  // ----- 2.1 binet-cll -------------------------------------------------------
  'binet-cll'(root) {
    note(root, 'Binet CLL stage (Binet 1981): A = < 3 involved areas with Hb ≥ 10 and platelets ≥ 100; B = ≥ 3 areas, counts preserved; C = Hb < 10 and/or platelets < 100. Five areas: cervical, axillary, inguinal nodes, spleen, liver. Near-neighbors: rai-cll.');
    root.appendChild(num('Involved lymphoid areas (0–5)', 'binet-areas'));
    root.appendChild(num('Hemoglobin (g/dL)', 'binet-hb'));
    root.appendChild(num('Platelet count (×10⁹/L)', 'binet-platelets'));
    const o = out(); root.appendChild(o);
    wire(['binet-areas', 'binet-hb', 'binet-platelets'], () => safe(o, () => {
      const r = M.binetCll({ areas: val('binet-areas'), hb: val('binet-hb'), platelets: val('binet-platelets') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Stage', value: r.stage },
      ]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.2 rai-cll ---------------------------------------------------------
  'rai-cll'(root) {
    note(root, 'Rai CLL stage (Rai 1975; modified risk grouping): 0 lymphocytosis only; I + lymphadenopathy; II + organomegaly; III + anemia (Hb < 11); IV + thrombocytopenia (platelets < 100). Low (0), intermediate (I–II), high (III–IV). Near-neighbors: binet-cll.');
    root.appendChild(checkField('Blood + marrow lymphocytosis (required)', 'rai-lymphocytosis'));
    root.appendChild(checkField('Lymphadenopathy', 'rai-lymphadenopathy'));
    root.appendChild(checkField('Spleen and/or liver enlargement', 'rai-organomegaly'));
    root.appendChild(num('Hemoglobin (g/dL)', 'rai-hb'));
    root.appendChild(num('Platelet count (×10⁹/L)', 'rai-platelets'));
    const o = out(); root.appendChild(o);
    wire(['rai-lymphocytosis', 'rai-lymphadenopathy', 'rai-organomegaly', 'rai-hb', 'rai-platelets'], () => safe(o, () => {
      const r = M.raiCll({ lymphocytosis: chk('rai-lymphocytosis'), lymphadenopathy: chk('rai-lymphadenopathy'), organomegaly: chk('rai-organomegaly'), hb: val('rai-hb'), platelets: val('rai-platelets') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Stage', value: r.stage },
        { label: 'Risk', value: r.risk },
      ]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.3 ann-arbor -------------------------------------------------------
  'ann-arbor'(root) {
    note(root, 'Ann Arbor stage, Lugano modification (Cheson 2014): I one region; II ≥ 2 regions same side; III both sides; IV disseminated. A/B suffix for B symptoms; E extranodal; S splenic. Limited (I–II) vs advanced (III–IV). Near-neighbors: flipi, nccn-ipi, hodgkin-ips.');
    root.appendChild(pickField('Anatomic distribution', 'ann-distribution', ANN_OPTS));
    root.appendChild(checkField('B symptoms (fever, night sweats, ≥ 10% weight loss)', 'ann-bSymptoms'));
    root.appendChild(checkField('Extranodal extension (E)', 'ann-extranodal'));
    root.appendChild(checkField('Splenic involvement (S)', 'ann-splenic'));
    const o = out(); root.appendChild(o);
    wire(['ann-distribution', 'ann-bSymptoms', 'ann-extranodal', 'ann-splenic'], () => safe(o, () => {
      const r = M.annArbor({ distribution: val('ann-distribution'), bSymptoms: chk('ann-bSymptoms'), extranodal: chk('ann-extranodal'), splenic: chk('ann-splenic') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Stage', value: r.stage },
      ]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.4 flipi-2 ---------------------------------------------------------
  'flipi-2'(root) {
    note(root, 'FLIPI-2 (Federico 2009): five factors, 1 point each — age > 60, elevated β₂-microglobulin, longest node > 6 cm, marrow involvement, Hb < 12. Low 0, intermediate 1–2, high 3–5. Uses β₂-microglobulin where the original FLIPI uses LDH and stage. Near-neighbors: flipi.');
    root.appendChild(checkField('Age > 60 years', 'flipi2-ageOver60'));
    root.appendChild(checkField('Elevated β₂-microglobulin (above ULN)', 'flipi2-b2m'));
    root.appendChild(checkField('Longest involved node > 6 cm', 'flipi2-nodeOver6cm'));
    root.appendChild(checkField('Bone-marrow involvement', 'flipi2-marrow'));
    root.appendChild(checkField('Hemoglobin < 12 g/dL', 'flipi2-hbUnder12'));
    const o = out(); root.appendChild(o);
    wire(['flipi2-ageOver60', 'flipi2-b2m', 'flipi2-nodeOver6cm', 'flipi2-marrow', 'flipi2-hbUnder12'], () => safe(o, () => {
      const r = M.flipi2({ ageOver60: chk('flipi2-ageOver60'), b2m: chk('flipi2-b2m'), nodeOver6cm: chk('flipi2-nodeOver6cm'), marrow: chk('flipi2-marrow'), hbUnder12: chk('flipi2-hbUnder12') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Factors', value: `${r.score}` },
        { label: 'Risk', value: r.risk },
      ]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.5 hasford-cml -----------------------------------------------------
  'hasford-cml'(root) {
    note(root, 'Hasford (Euro) CML score (Hasford 1998): weighted formula on age, spleen (cm below costal margin), platelets, and peripheral blast/eosinophil/basophil %. Low ≤ 780, intermediate 781–1480, high > 1480. An older comparator to sokal-cml. Near-neighbors: sokal-cml.');
    root.appendChild(num('Age (years)', 'hasford-age'));
    root.appendChild(num('Spleen (cm below costal margin)', 'hasford-spleen'));
    root.appendChild(num('Platelet count (×10⁹/L)', 'hasford-platelets'));
    root.appendChild(num('Peripheral blasts (%)', 'hasford-blasts'));
    root.appendChild(num('Peripheral eosinophils (%)', 'hasford-eosinophils'));
    root.appendChild(num('Peripheral basophils (%)', 'hasford-basophils'));
    const o = out(); root.appendChild(o);
    wire(['hasford-age', 'hasford-spleen', 'hasford-platelets', 'hasford-blasts', 'hasford-eosinophils', 'hasford-basophils'], () => safe(o, () => {
      const r = M.hasfordCml({ age: val('hasford-age'), spleen: val('hasford-spleen'), platelets: val('hasford-platelets'), blasts: val('hasford-blasts'), eosinophils: val('hasford-eosinophils'), basophils: val('hasford-basophils') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Score', value: `${r.score}` },
        { label: 'Risk', value: r.risk },
      ]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },
};

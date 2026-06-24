// spec-v148 §2: renderers for the seven closing tiles of the spec-v100 program —
// asdas, ffs-2011, gca-acr-eular-2022 (Clinical Scoring & Risk, Group G);
// palliative-prognostic-index, palliative-prognostic-score (Group G);
// opioid-conversion (Medication & Infusion, Group F); naranjo (Group G).
// The proposed eighth tile, valproate-correction, is DEFERRED (see
// docs/spec-v148.md §7.1 and lib/rheum-v148.js).
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per the
// spec-v100 §2 classification clarification each tile CONSUMES the clinician's
// bounded inputs and COMPUTES a value; none is a no-input reference table. Per
// the spec-v50 §3 clinical-posture note, each tile renders that it frames a
// computed value, not a treat/escalate/prescribe order in Sophie's voice
// (spec-v11 §5.3); the high-stakes opioid conversion surfaces the mandatory
// independent-second-check caveat. A blank required input renders a
// complete-the-fields fallback rather than scoring a partial total.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/rheum-v148.js';
import { resultRow } from '../lib/result-copy.js';

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
function checkField(label, id) {
  const wrap = el('p');
  const inp = el('input', { id, type: 'checkbox' });
  wrap.appendChild(inp);
  wrap.appendChild(el('label', { for: id, text: ' ' + label }));
  return wrap;
}
function numField(label, id, opts = {}) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const inp = el('input', { id, type: 'number', autocomplete: 'off' });
  inp.setAttribute('step', opts.step || '1');
  inp.setAttribute('inputmode', opts.step && opts.step !== '1' ? 'decimal' : 'numeric');
  if (opts.min != null) inp.setAttribute('min', String(opts.min));
  if (opts.max != null) inp.setAttribute('max', String(opts.max));
  if (opts.placeholder) inp.setAttribute('placeholder', opts.placeholder);
  wrap.appendChild(inp);
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function selVal(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function chk(id) { const n = document.getElementById(id); return n ? n.checked : false; }
function optNum(id) { const n = document.getElementById(id); return n && n.value !== '' ? Number(n.value) : null; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function showInvalid(o, r) { note(o, r.message || 'Enter the required values.'); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The score, classification, survival band, or converted dose is the cited system’s, computed from the bounded inputs you entered — the tile takes your read, it does not interpret a lab, scan, or chart on its own. The management decision — start or escalate therapy, set goals of care, or prescribe — stays with the clinician and local protocol; high-stakes opioid conversions require an independent second check.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

const YND = [
  { value: '', text: '— choose —' },
  { value: 'yes', text: 'Yes' },
  { value: 'no', text: 'No' },
  { value: 'unknown', text: 'Do not know' },
];

export const renderers = {
  // ----- 2.1 asdas ------------------------------------------------------
  asdas(root) {
    note(root, 'ASDAS (Lukas 2009, ASAS): four 0–10 patient items plus CRP (mg/L, preferred) or ESR (mm/h). ASDAS-CRP = 0.12·back pain + 0.06·morning stiffness + 0.11·patient global + 0.07·peripheral pain + 0.58·ln(CRP+1). Cutoffs: inactive < 1.3, low 1.3–<2.1, high 2.1–3.5, very high > 3.5. Near-neighbor: das28.');
    root.appendChild(numField('Total back pain (BASDAI Q2, 0–10)', 'asdas-bp', { step: '0.1', min: 0, max: 10, placeholder: 'e.g. 4' }));
    root.appendChild(numField('Duration of morning stiffness (BASDAI Q6, 0–10)', 'asdas-ms', { step: '0.1', min: 0, max: 10, placeholder: 'e.g. 3' }));
    root.appendChild(numField('Patient global assessment (0–10)', 'asdas-pg', { step: '0.1', min: 0, max: 10, placeholder: 'e.g. 5' }));
    root.appendChild(numField('Peripheral pain/swelling (BASDAI Q3, 0–10)', 'asdas-pp', { step: '0.1', min: 0, max: 10, placeholder: 'e.g. 2' }));
    root.appendChild(numField('CRP (mg/L) — preferred', 'asdas-crp', { step: '0.1', min: 0, max: 500, placeholder: 'e.g. 10' }));
    root.appendChild(numField('ESR (mm/h) — used if CRP is blank', 'asdas-esr', { step: '1', min: 0, max: 200, placeholder: 'e.g. 25' }));
    const ids = ['asdas-bp', 'asdas-ms', 'asdas-pg', 'asdas-pp', 'asdas-crp', 'asdas-esr'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.asdas({
        backPain: optNum('asdas-bp'), morningStiffness: optNum('asdas-ms'), patientGlobal: optNum('asdas-pg'),
        peripheralPain: optNum('asdas-pp'), crp: optNum('asdas-crp'), esr: optNum('asdas-esr'),
      });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: `ASDAS-${r.variant}`, value: r.score },
        { label: 'Activity', value: r.bandLabel },
      ]);
      note(o, r.detail);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.2 ffs-2011 ---------------------------------------------------
  'ffs-2011'(root) {
    note(root, 'FFS-2011 (Guillevin 2011): prognosis of systemic necrotizing vasculitis. Four poor-prognosis factors each +1 (age > 65, cardiac insufficiency, GI involvement, renal insufficiency) plus the favorable factor absence-of-ENT +1 (GPA/EGPA). 5-year mortality ≈ 9% / 21% / 40% at FFS 0 / 1 / ≥ 2.');
    root.appendChild(checkField('Age > 65 years (+1)', 'ffs-age'));
    root.appendChild(checkField('Cardiac insufficiency (+1)', 'ffs-cardiac'));
    root.appendChild(checkField('Gastrointestinal involvement (+1)', 'ffs-gi'));
    root.appendChild(checkField('Renal insufficiency — stabilized peak creatinine ≥ 150 µmol/L (≈ 1.7 mg/dL) (+1)', 'ffs-renal'));
    root.appendChild(checkField('Absence of ENT manifestations — favorable factor, GPA/EGPA (+1)', 'ffs-noent'));
    const ids = ['ffs-age', 'ffs-cardiac', 'ffs-gi', 'ffs-renal', 'ffs-noent'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.ffs2011({ age: chk('ffs-age'), cardiac: chk('ffs-cardiac'), gi: chk('ffs-gi'), renal: chk('ffs-renal'), noEnt: chk('ffs-noent') });
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Score', value: `${r.score}/5` },
      ]);
      note(o, r.detail);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.3 gca-acr-eular-2022 -----------------------------------------
  'gca-acr-eular-2022'(root) {
    note(root, '2022 ACR/EULAR GCA classification (Ponte 2022): apply only with age ≥ 50 at diagnosis after a medium/large-vessel-vasculitis diagnosis with mimics excluded. Weighted items sum to 0–25; ≥ 6 classifies as GCA. Near-neighbors: cdai-ra, das28.');
    root.appendChild(checkField('Entry requirement — age ≥ 50 years at diagnosis', 'gca-entry'));
    root.appendChild(checkField('Positive temporal-artery biopsy or halo sign on temporal-artery ultrasound (+5)', 'gca-biopsy'));
    root.appendChild(checkField('Maximum ESR ≥ 50 mm/h or CRP ≥ 10 mg/L (+3)', 'gca-apr'));
    root.appendChild(checkField('Sudden visual loss (+3)', 'gca-visual'));
    root.appendChild(checkField('Morning stiffness in shoulders or neck (+2)', 'gca-stiff'));
    root.appendChild(checkField('Jaw or tongue claudication (+2)', 'gca-jaw'));
    root.appendChild(checkField('New temporal headache (+2)', 'gca-headache'));
    root.appendChild(checkField('Scalp tenderness (+2)', 'gca-scalp'));
    root.appendChild(checkField('Abnormal examination of the temporal artery (+2)', 'gca-ta'));
    root.appendChild(checkField('Bilateral axillary involvement on imaging (+2)', 'gca-axillary'));
    root.appendChild(checkField('FDG-PET activity throughout the aorta (+2)', 'gca-pet'));
    const ids = ['gca-entry', 'gca-biopsy', 'gca-apr', 'gca-visual', 'gca-stiff', 'gca-jaw', 'gca-headache', 'gca-scalp', 'gca-ta', 'gca-axillary', 'gca-pet'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.gcaAcrEular2022({
        entry: chk('gca-entry'), biopsyHalo: chk('gca-biopsy'), aprHigh: chk('gca-apr'), visualLoss: chk('gca-visual'),
        morningStiffness: chk('gca-stiff'), jawClaudication: chk('gca-jaw'), temporalHeadache: chk('gca-headache'),
        scalpTenderness: chk('gca-scalp'), taAbnormal: chk('gca-ta'), bilateralAxillary: chk('gca-axillary'), petAorta: chk('gca-pet'),
      });
      if (r.applicable === false) { note(o, r.band); note(o, r.note); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Score', value: `${r.score}/25` },
        { label: 'Result', value: r.bandLabel },
      ]);
      note(o, r.detail);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.4 palliative-prognostic-index --------------------------------
  'palliative-prognostic-index'(root) {
    note(root, 'PPI (Morita 1999): survival band for terminally ill cancer patients from the Palliative Performance Scale, oral intake, edema, dyspnea at rest, and delirium, total 0–15. PPI > 6 → survival < 3 weeks; > 4 → < 6 weeks; ≤ 4 → > 6 weeks. Near-neighbors: ecog-karnofsky, palliative-prognostic-score.');
    root.appendChild(pickField('Palliative Performance Scale (PPS)', 'ppi-pps', [
      { value: 'high', text: 'PPS ≥ 60 (0)' },
      { value: 'mid', text: 'PPS 30–50 (2.5)' },
      { value: 'low', text: 'PPS 10–20 (4)' },
    ]));
    root.appendChild(pickField('Oral intake', 'ppi-intake', [
      { value: 'normal', text: 'Normal (0)' },
      { value: 'reduced', text: 'Moderately reduced — more than mouthfuls (1)' },
      { value: 'mouthfuls', text: 'Mouthfuls or less (2.5)' },
    ]));
    root.appendChild(checkField('Edema present (+1)', 'ppi-edema'));
    root.appendChild(checkField('Dyspnea at rest (+3.5)', 'ppi-dyspnea'));
    root.appendChild(checkField('Delirium present — excluding delirium caused by a single medication (+4)', 'ppi-delirium'));
    const ids = ['ppi-pps', 'ppi-intake', 'ppi-edema', 'ppi-dyspnea', 'ppi-delirium'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.palliativePrognosticIndex({ pps: selVal('ppi-pps'), intake: selVal('ppi-intake'), edema: chk('ppi-edema'), dyspnea: chk('ppi-dyspnea'), delirium: chk('ppi-delirium') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Score', value: `${r.score}/15` },
        { label: 'Survival', value: r.bandLabel },
      ]);
      note(o, r.detail);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.5 palliative-prognostic-score --------------------------------
  'palliative-prognostic-score'(root) {
    note(root, 'PaP (Pirovano/Maltoni 1999): 30-day-survival risk group from dyspnea, anorexia, Karnofsky status, the clinician’s prediction of survival in weeks, total WBC, and lymphocyte %, total 0–17.5. Group A (0–5.5) > 70%, B (5.6–11) 30–70%, C (11.1–17.5) < 30%. Near-neighbors: ecog-karnofsky, palliative-prognostic-index.');
    root.appendChild(checkField('Dyspnea (+1)', 'pap-dyspnea'));
    root.appendChild(checkField('Anorexia (+1.5)', 'pap-anorexia'));
    root.appendChild(pickField('Karnofsky Performance Status', 'pap-kps', [
      { value: 'ge30', text: '≥ 30 (0)' },
      { value: 'lo', text: '10–20 (2.5)' },
    ]));
    root.appendChild(pickField('Clinical prediction of survival (weeks)', 'pap-cps', [
      { value: 'w12', text: '> 12 weeks (0)' },
      { value: 'w11', text: '11–12 weeks (2)' },
      { value: 'w7', text: '7–10 weeks (2.5)' },
      { value: 'w5', text: '5–6 weeks (4.5)' },
      { value: 'w3', text: '3–4 weeks (6)' },
      { value: 'w1', text: '1–2 weeks (8.5)' },
    ]));
    root.appendChild(pickField('Total white blood cell count', 'pap-wbc', [
      { value: 'normal', text: 'Normal ≤ 8500/µL (0)' },
      { value: 'high', text: 'High 8501–11000/µL (0.5)' },
      { value: 'vhigh', text: 'Very high > 11000/µL (1.5)' },
    ]));
    root.appendChild(pickField('Lymphocyte percentage', 'pap-lymph', [
      { value: 'normal', text: 'Normal 20–40% (0)' },
      { value: 'low', text: 'Low 12–19.9% (1)' },
      { value: 'vlow', text: 'Very low 0–11.9% (2.5)' },
    ]));
    const ids = ['pap-dyspnea', 'pap-anorexia', 'pap-kps', 'pap-cps', 'pap-wbc', 'pap-lymph'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.palliativePrognosticScore({ dyspnea: chk('pap-dyspnea'), anorexia: chk('pap-anorexia'), kps: selVal('pap-kps'), cps: selVal('pap-cps'), wbc: selVal('pap-wbc'), lymph: selVal('pap-lymph') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Score', value: `${r.score}/17.5` },
        { label: 'Risk group', value: r.bandLabel },
      ]);
      note(o, r.detail);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.6 opioid-conversion ------------------------------------------
  'opioid-conversion'(root) {
    note(root, 'Opioid equianalgesic / rotation converter: the source daily dose is converted to oral morphine equivalents (OME) and back to the target opioid, then reduced 25–50% for incomplete cross-tolerance. Methadone and buprenorphine are deliberately excluded (non-linear/ceiling pharmacology). Distinct from opioid-mme (surveillance MME sum). This is a planning aid — confirm against your protocol and an independent second check.');
    const agentOpts = [
      { value: 'morphine-po', text: 'Morphine — oral (mg/day)' },
      { value: 'morphine-iv', text: 'Morphine — IV/SC (mg/day)' },
      { value: 'oxycodone-po', text: 'Oxycodone — oral (mg/day)' },
      { value: 'hydromorphone-po', text: 'Hydromorphone — oral (mg/day)' },
      { value: 'hydromorphone-iv', text: 'Hydromorphone — IV/SC (mg/day)' },
      { value: 'hydrocodone-po', text: 'Hydrocodone — oral (mg/day)' },
      { value: 'codeine-po', text: 'Codeine — oral (mg/day)' },
      { value: 'tramadol-po', text: 'Tramadol — oral (mg/day)' },
      { value: 'tapentadol-po', text: 'Tapentadol — oral (mg/day)' },
      { value: 'oxymorphone-po', text: 'Oxymorphone — oral (mg/day)' },
      { value: 'oxymorphone-iv', text: 'Oxymorphone — IV/SC (mg/day)' },
      { value: 'fentanyl-iv', text: 'Fentanyl — IV (mcg/day)' },
      { value: 'fentanyl-td', text: 'Fentanyl — transdermal patch (mcg/h)' },
    ];
    root.appendChild(pickField('Source opioid and route', 'opc-source', agentOpts));
    root.appendChild(numField('Total source daily dose', 'opc-dose', { step: '0.1', min: 0, placeholder: 'e.g. 60' }));
    root.appendChild(pickField('Target opioid and route', 'opc-target', agentOpts));
    root.appendChild(selectField('Cross-tolerance reduction', 'opc-reduction', [
      { value: 'r50', text: '50% (most conservative)' },
      { value: 'r33', text: '33%' },
      { value: 'r25', text: '25%' },
      { value: 'r0', text: 'None (0%) — show raw equianalgesic only' },
    ]));
    const ids = ['opc-source', 'opc-dose', 'opc-target', 'opc-reduction'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.opioidConversion({ source: selVal('opc-source'), target: selVal('opc-target'), dose: optNum('opc-dose'), reduction: selVal('opc-reduction') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [
        { text: r.band },
        { label: 'OME/day', value: `${r.ome} mg` },
        { label: 'Equianalgesic', value: `${r.equi} ${r.targetUnit}` },
        { label: `Start (−${r.reductionPct}%)`, value: `${r.starting} ${r.targetUnit}` },
      ]);
      note(o, r.detail);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.7 naranjo ----------------------------------------------------
  naranjo(root) {
    note(root, 'Naranjo ADR probability scale (Naranjo 1981): 10 weighted yes/no/don’t-know questions, total −4 to +13 → doubtful (≤ 0), possible (1–4), probable (5–8), definite (≥ 9). Note the negatives: a No on “appeared after the drug” or on rechallenge scores −1, and an alternative cause present scores −1.');
    const qs = [
      ['nar-q1', '1. Are there previous conclusive reports on this reaction? (Yes +1)'],
      ['nar-q2', '2. Did the event appear after the suspected drug was given? (Yes +2 / No −1)'],
      ['nar-q3', '3. Did the reaction improve when the drug was stopped or an antagonist given? (Yes +1)'],
      ['nar-q4', '4. Did the reaction reappear when the drug was re-administered? (Yes +2 / No −1)'],
      ['nar-q5', '5. Are there alternative causes that could have caused the reaction? (Yes −1 / No +2)'],
      ['nar-q6', '6. Did the reaction reappear when a placebo was given? (Yes −1 / No +1)'],
      ['nar-q7', '7. Was the drug detected in blood in toxic concentrations? (Yes +1)'],
      ['nar-q8', '8. Was the reaction more severe at higher dose, or less severe at lower dose? (Yes +1)'],
      ['nar-q9', '9. Did the patient have a similar reaction to the same/similar drug before? (Yes +1)'],
      ['nar-q10', '10. Was the adverse event confirmed by any objective evidence? (Yes +1)'],
    ];
    const ids = [];
    for (const [id, label] of qs) { root.appendChild(selectField(label, id, YND)); ids.push(id); }
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const arg = {};
      ids.forEach((id, i) => { arg['q' + (i + 1)] = selVal(id); });
      const r = M.naranjo(arg);
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Score', value: r.score },
        { label: 'Probability', value: r.bandLabel },
      ]);
      note(o, r.detail);
      note(o, r.note);
    }));
    postureNote(root);
  },
};

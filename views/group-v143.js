// spec-v143 §2: renderers for the five frailty / geriatric-oncology screening
// tiles (mfi-5, mfi-11, frail-scale, ves-13, carg-toxicity). All are Clinical
// Scoring & Risk (Group G); v143 continues Wave 8 of the spec-v100 program.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per the
// spec-v50 §3 clinical-posture note, each tile renders that it frames a score or
// risk band, not a treat/withhold-chemotherapy order in Sophie's voice
// (spec-v11 §5.3). VES-13 surfaces a complete-the-fields-friendly default; every
// item left blank simply scores zero for that domain (lib/frailty-v143.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/frailty-v143.js';
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
function checkField(label, id) {
  const wrap = el('p');
  const inp = el('input', { id, type: 'checkbox' });
  wrap.appendChild(inp);
  wrap.appendChild(el('label', { for: id, text: ' ' + label }));
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function selVal(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function chk(id) { const n = document.getElementById(id); return n ? n.checked : false; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The score or risk band is the cited instrument’s, computed from the values you entered. The clinical decision — how to optimize, screen further, or treat — stays with the care team and local protocol.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

// A select for VES-13 physical-function difficulty (5 published response options).
function difficultyField(label, id) {
  return selectField(label, id, [
    { value: 'none', text: 'No difficulty' },
    { value: 'little', text: 'A little difficulty' },
    { value: 'some', text: 'Some difficulty' },
    { value: 'alot', text: 'A lot of difficulty' },
    { value: 'unable', text: 'Unable to do' },
  ]);
}

// Build a checkbox list from [id, label] pairs; return the list of ids.
function checkList(root, items) {
  for (const [id, label] of items) root.appendChild(checkField(label, id));
  return items.map((i) => i[0]);
}

export const renderers = {
  // ----- 2.1 mfi-5 ------------------------------------------------------
  'mfi-5'(root) {
    note(root, 'Modified 5-Item Frailty Index (Subramaniam 2018): check each deficit present. The count (0–5) drives the frailty threshold — a count of 2 or more is the commonly-cited frailty cutoff.');
    const items = [
      ['mfi5-dm', 'Diabetes mellitus'],
      ['mfi5-htn', 'Hypertension requiring medication'],
      ['mfi5-copd', 'COPD or pneumonia history'],
      ['mfi5-chf', 'Congestive heart failure'],
      ['mfi5-dep', 'Partially or totally dependent functional status'],
    ];
    const ids = checkList(root, items);
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.mfi5({ diabetes: chk('mfi5-dm'), hypertension: chk('mfi5-htn'), copd: chk('mfi5-copd'), chf: chk('mfi5-chf'), dependent: chk('mfi5-dep') });
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'mFI-5 deficit count', value: `${r.score}/5` },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.2 mfi-11 -----------------------------------------------------
  'mfi-11'(root) {
    note(root, 'Modified 11-Item Frailty Index (Velanovich 2013): the original accumulated-deficit index, reported as a fraction of 11. The validated 5-item index (mFI-5) performs comparably.');
    const items = [
      ['mfi11-dm', 'Diabetes mellitus'],
      ['mfi11-dep', 'Dependent functional status'],
      ['mfi11-copd', 'COPD or pneumonia history'],
      ['mfi11-chf', 'Congestive heart failure'],
      ['mfi11-mi', 'Myocardial infarction history'],
      ['mfi11-card', 'Prior cardiac intervention, cardiac surgery, or angina'],
      ['mfi11-htn', 'Hypertension requiring medication'],
      ['mfi11-pvd', 'Peripheral vascular disease or rest pain'],
      ['mfi11-sens', 'Impaired sensorium'],
      ['mfi11-tia', 'Transient ischemic attack or stroke'],
      ['mfi11-cva', 'Stroke with neurological deficit'],
    ];
    const ids = checkList(root, items);
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.mfi11({
        diabetes: chk('mfi11-dm'), dependent: chk('mfi11-dep'), copd: chk('mfi11-copd'), chf: chk('mfi11-chf'),
        mi: chk('mfi11-mi'), cardiac: chk('mfi11-card'), hypertension: chk('mfi11-htn'), pvd: chk('mfi11-pvd'),
        sensorium: chk('mfi11-sens'), tia: chk('mfi11-tia'), cvaDeficit: chk('mfi11-cva'),
      });
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Deficits', value: `${r.score}/11` },
        { label: 'Frailty index', value: `${r.fractionPct}%` },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.3 frail-scale ------------------------------------------------
  'frail-scale'(root) {
    note(root, 'FRAIL Scale (Morley 2012): five bedside items, one point each. Total 0–5 maps to 0 robust, 1–2 pre-frail, ≥ 3 frail.');
    const items = [
      ['frail-fat', 'Fatigue (tired most or all of the time)'],
      ['frail-res', 'Resistance — difficulty climbing one flight of stairs'],
      ['frail-amb', 'Ambulation — difficulty walking one block'],
      ['frail-ill', 'Illnesses — five or more of eleven listed conditions'],
      ['frail-wt', 'Loss of weight — more than 5% in the past year'],
    ];
    const ids = checkList(root, items);
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.frailScale({ fatigue: chk('frail-fat'), resistance: chk('frail-res'), ambulation: chk('frail-amb'), illnesses: chk('frail-ill'), weightLoss: chk('frail-wt') });
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'FRAIL total', value: `${r.score}/5` },
        { label: 'Category', value: r.category },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.4 ves-13 -----------------------------------------------------
  'ves-13'(root) {
    note(root, 'Vulnerable Elders Survey-13 (Saliba 2001): age + self-rated health + physical-function difficulty (capped at 2) + a 4-point block for any ADL/IADL disability, total 0–10. A score ≥ 3 = vulnerable.');
    root.appendChild(selectField('Age band', 'ves-age', [
      { value: 'under75', text: 'Under 75 years' },
      { value: '75to84', text: '75–84 years (1 point)' },
      { value: '85plus', text: '85 years or older (3 points)' },
    ]));
    root.appendChild(selectField('Self-rated health (compared with others your age)', 'ves-health', [
      { value: 'excellent', text: 'Excellent' },
      { value: 'verygood', text: 'Very good' },
      { value: 'good', text: 'Good' },
      { value: 'fair', text: 'Fair (1 point)' },
      { value: 'poor', text: 'Poor (1 point)' },
    ]));
    note(root, 'Physical function — how much difficulty, on average, with each (1 point each for "a lot" or "unable", capped at 2):');
    root.appendChild(difficultyField('Stooping, crouching, or kneeling', 'ves-stooping'));
    root.appendChild(difficultyField('Lifting or carrying about 10 lb', 'ves-lifting'));
    root.appendChild(difficultyField('Reaching or extending arms above shoulder', 'ves-reaching'));
    root.appendChild(difficultyField('Writing, or handling and grasping small objects', 'ves-writing'));
    root.appendChild(difficultyField('Walking a quarter mile', 'ves-walking'));
    root.appendChild(difficultyField('Heavy housework (scrubbing floors, washing windows)', 'ves-housework'));
    note(root, 'Functional disability — because of health, do you need help with any of these? (any one scores the full 4 points):');
    const disIds = checkList(root, [
      ['ves-shop', 'Shopping for personal items'],
      ['ves-money', 'Managing money'],
      ['ves-room', 'Walking across the room'],
      ['ves-light', 'Doing light housework'],
      ['ves-bath', 'Bathing or showering'],
    ]);
    const ids = ['ves-age', 'ves-health', 'ves-stooping', 'ves-lifting', 'ves-reaching', 'ves-writing', 'ves-walking', 'ves-housework', ...disIds];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.ves13({
        age: selVal('ves-age'), health: selVal('ves-health'),
        stooping: selVal('ves-stooping'), lifting: selVal('ves-lifting'), reaching: selVal('ves-reaching'),
        writing: selVal('ves-writing'), walking: selVal('ves-walking'), housework: selVal('ves-housework'),
        shopping: chk('ves-shop'), money: chk('ves-money'), walkRoom: chk('ves-room'), lightHousework: chk('ves-light'), bathing: chk('ves-bath'),
      });
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'VES-13 total', value: `${r.score}/10` },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.5 carg-toxicity ----------------------------------------------
  'carg-toxicity'(root) {
    note(root, 'CARG Chemotherapy Toxicity Tool (Hurria 2011): eleven weighted predictors of grade 3–5 toxicity in older adults. Bands: low 0–5 (~30%), intermediate 6–9 (~52%), high ≥ 10 (~83%).');
    const items = [
      ['carg-age', 'Age 72 years or older (2)'],
      ['carg-cancer', 'Gastrointestinal or genitourinary cancer (2)'],
      ['carg-dose', 'Standard-dose chemotherapy (not dose-reduced) (2)'],
      ['carg-poly', 'Polychemotherapy — more than one agent (2)'],
      ['carg-hgb', 'Haemoglobin < 11 g/dL (male) or < 10 g/dL (female) (3)'],
      ['carg-crcl', 'Creatinine clearance < 34 mL/min (3)'],
      ['carg-hear', 'Hearing fair or worse (2)'],
      ['carg-falls', 'One or more falls in the last 6 months (3)'],
      ['carg-meds', 'Needs help taking medications (1)'],
      ['carg-walk', 'Limited in walking one block (2)'],
      ['carg-social', 'Decreased social activity because of health (1)'],
    ];
    const ids = checkList(root, items);
    note(root, 'Compute the creatinine clearance itself with the Cockcroft–Gault tile, then check the box if it is below 34 mL/min.');
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.cargToxicity({
        age72: chk('carg-age'), giGu: chk('carg-cancer'), standardDose: chk('carg-dose'), polychemo: chk('carg-poly'),
        anemia: chk('carg-hgb'), lowCrCl: chk('carg-crcl'), hearing: chk('carg-hear'), falls: chk('carg-falls'),
        medHelp: chk('carg-meds'), walkLimited: chk('carg-walk'), socialDecreased: chk('carg-social'),
      });
      resultRow(o, [
        { text: r.bandText, cls: r.abnormal ? 'warn' : null },
        { label: 'CARG score', value: r.score },
        { label: 'Risk band', value: r.band },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};

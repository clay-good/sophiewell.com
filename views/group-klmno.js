// Groups K-O (NEW): spec-v4 §5 utilities 181-197.
//   K Lab Reference (181-184)
//   L Forms & Numbers Literacy (185-187)
//   M Eligibility & Benefits (188-191)
//   N Literacy Helpers (192-194)
//   O Patient Safety (195-197)

import { el, clear } from '../lib/dom.js';
import { loadFile } from '../lib/data.js';
import { renderTable } from '../lib/table.js';
import { renderDecisionTree } from '../lib/tree.js';
import { renderPrintable } from '../lib/print.js';
import {
  labConvert, a1cPctToIfcc, mmHgToKpa, kpaToMmHg, fToC, cToF,
  inchesToCm, cmToInches, lbToKg, kgToLb, lbOzToKg, kgToLbOz, feetInToCm,
} from '../lib/unit-convert.js';

function field(label, id, opts = {}) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const inp = el('input', { id, type: opts.type || 'number', autocomplete: 'off' });
  if (inp.type === 'number') inp.setAttribute('step', 'any');
  if (opts.value != null) inp.value = String(opts.value);
  if (opts.placeholder) inp.setAttribute('placeholder', opts.placeholder);
  wrap.appendChild(inp);
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function nv(id) { return Number(document.getElementById(id).value); }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }

export const renderers = {
  // --- Group K: Lab Reference (181-184) ----------------------------------

  'lab-adult'(root) {
    const region = el('div', { id: 'q-results', role: 'region' });
    root.appendChild(region);
    loadFile('lab-ranges-adult', 'adult.json').then((rows) => {
      renderTable(region, {
        columns: [
          { key: 'test', label: 'Test' },
          { key: 'lowConv', label: 'Low' },
          { key: 'highConv', label: 'High' },
          { key: 'unitsConv', label: 'Conv units' },
          { key: 'lowSi', label: 'Low (SI)' },
          { key: 'highSi', label: 'High (SI)' },
          { key: 'unitsSi', label: 'SI units' },
        ],
        rows,
      });
    });
  },

  'lab-peds'(root) {
    const region = el('div', { id: 'q-results', role: 'region' });
    root.appendChild(region);
    loadFile('lab-ranges-peds', 'peds.json').then((rows) => {
      renderTable(region, {
        columns: [
          { key: 'test', label: 'Test' },
          { key: 'ageBand', label: 'Age band' },
          { key: 'lowConv', label: 'Low' },
          { key: 'highConv', label: 'High' },
          { key: 'unitsConv', label: 'Units' },
        ],
        rows,
      });
    });
  },

  'tdm-levels'(root) {
    const region = el('div', { id: 'q-results', role: 'region' });
    root.appendChild(region);
    loadFile('therapeutic-drug-levels', 'levels.json').then((rows) => {
      renderTable(region, {
        columns: [
          { key: 'drug', label: 'Drug' },
          { key: 'lowConv', label: 'Low' },
          { key: 'highConv', label: 'High' },
          { key: 'unitsConv', label: 'Units' },
        ],
        rows,
      });
    });
  },

  'tox-levels'(root) {
    const region = el('div', { id: 'q-results', role: 'region' });
    root.appendChild(region);
    loadFile('tox-levels', 'tox.json').then((rows) => {
      renderTable(region, {
        columns: [
          { key: 'agent', label: 'Agent' },
          { key: 'toxicAtConv', label: 'Level associated with toxicity' },
        ],
        rows,
      });
    });
  },

  // --- Group L: Forms & Numbers Literacy (185-187) -----------------------

  'cms1500'(root) {
    const region = el('div', { id: 'q-results', role: 'region' });
    root.appendChild(region);
    loadFile('cms-1500-fields', 'fields.json').then((rows) => {
      renderPrintable(region, {
        title: 'CMS-1500 Field-by-Field Decoder',
        warnings: ['Plain-English summaries by the project author. CMS publishes the authoritative form instructions.'],
        sections: rows.map((f) => ({
          heading: `Field ${f.field} - ${f.label}`,
          paragraphs: [f.plain],
        })),
      });
    });
  },

  'ub04'(root) {
    const region = el('div', { id: 'q-results', role: 'region' });
    root.appendChild(region);
    loadFile('ub04-fields', 'fields.json').then((rows) => {
      renderPrintable(region, {
        title: 'UB-04 Form-Locator Decoder',
        warnings: ['Plain-English summaries by the project author. NUBC publishes the authoritative form instructions.'],
        sections: rows.map((f) => ({
          heading: `FL ${f.fl} - ${f.label}`,
          paragraphs: [f.plain],
        })),
      });
    });
  },

  'eob-glossary'(root) {
    const region = el('div', { id: 'q-results', role: 'region' });
    root.appendChild(region);
    loadFile('eob-glossary', 'glossary.json').then((rows) => {
      renderTable(region, {
        columns: [
          { key: 'term', label: 'Term' },
          { key: 'plain', label: 'Plain-English explanation' },
        ],
        rows,
      });
    });
  },

  // --- Group M: Eligibility & Benefits (188-191) -------------------------

  'medicaid-state'(root) {
    const region = el('div', { id: 'q-results', role: 'region' });
    root.appendChild(region);
    loadFile('medicaid-state', 'states.json').then((rows) => {
      renderTable(region, {
        columns: [
          { key: 'state', label: 'State' },
          { key: 'expansion', label: 'Expansion?' },
          { key: 'adultFplPct', label: 'Adult FPL %' },
          { key: 'pregnantFplPct', label: 'Pregnant FPL %' },
          { key: 'chipFplPct', label: 'CHIP FPL %' },
          { key: 'applicationUrl', label: 'Apply' },
        ],
        rows,
      });
    });
  },

  'va-eligibility'(root) {
    const region = el('div', { id: 'q-results', role: 'region' });
    root.appendChild(region);
    loadFile('va-eligibility', 'va.json').then((rows) => {
      renderTable(region, {
        columns: [
          { key: 'priorityGroup', label: 'Priority' },
          { key: 'summary', label: 'Summary' },
          { key: 'copay', label: 'Copay' },
        ],
        rows,
      });
    });
  },

  'tricare-picker'(root) {
    const region = el('div', { id: 'q-results', role: 'region' });
    root.appendChild(region);
    loadFile('tricare-plans', 'tricare.json').then((plans) => {
      // Simple decision tree: duty status -> plan list filtered by qualifier match.
      const tree = {
        question: 'Duty status / population?',
        options: [
          { label: 'Active duty (or family in a Prime Service Area)',
            result: 'TRICARE Prime is mandatory for active duty; family members may select Prime in Prime Service Areas, otherwise TRICARE Select.',
            rationale: 'Active duty: Prime mandatory. Prime requires PCM and referrals.' },
          { label: 'Reserve / National Guard, not on active orders',
            result: 'TRICARE Reserve Select.', rationale: 'Premium-based plan for Selected Reserve not on active duty.' },
          { label: 'Adult dependent age 21-26',
            result: 'TRICARE Young Adult.', rationale: 'Premium-based; for adult dependents not eligible elsewhere.' },
          { label: 'Medicare-eligible (typically age 65+)',
            result: 'TRICARE For Life - wraparound to Medicare.', rationale: 'TFL is secondary to Medicare; no enrollment required if you have Medicare A and B.' },
          { label: 'Other beneficiary (most non-active-duty)',
            result: 'TRICARE Select.', rationale: 'No referral requirement; provider-of-choice within network.' },
        ],
      };
      renderDecisionTree(region, tree, { stateKey: 'tri' });
      // Always show the bundled plans table below.
      const tbl = el('div');
      region.appendChild(el('h3', { text: 'All TRICARE plans (reference)' }));
      region.appendChild(tbl);
      renderTable(tbl, {
        columns: [
          { key: 'plan', label: 'Plan' },
          { key: 'whoQualifies', label: 'Who qualifies' },
          { key: 'referralRequired', label: 'Referral required' },
          { key: 'note', label: 'Note' },
        ],
        rows: plans,
      });
    });
  },

  'ihs-eligibility'(root) {
    const o = out(); root.appendChild(o);
    loadFile('ihs-eligibility', 'ihs.json').then((d) => {
      o.appendChild(el('p', { class: 'notice', text:
        'Reference only. Tribal-specific rules at tribally operated facilities vary; this card describes generic IHS direct-care eligibility.' }));
      o.appendChild(el('h3', { text: 'General rules' }));
      o.appendChild(el('ul', {}, d.generalRules.map((r) => el('li', { text: r }))));
      o.appendChild(el('h3', { text: 'Accepted documentation' }));
      o.appendChild(el('ul', {}, d.acceptedDocumentation.map((r) => el('li', { text: r }))));
    });
  },

  // --- Group N: Literacy Helpers (192-194) -------------------------------

  'unit-converter-v4'(root) {
    root.appendChild(el('p', { class: 'muted', text:
      'Lab values, vitals, and basics. Choose a category and direction.' }));
    root.appendChild(el('p', {}, [
      el('label', { for: 'uc-cat', text: 'Category' }), el('br'),
      el('select', { id: 'uc-cat' }, [
        ['glucose', 'Glucose mg/dL <-> mmol/L'],
        ['cholesterol', 'Cholesterol mg/dL <-> mmol/L'],
        ['creatinine', 'Creatinine mg/dL <-> umol/L'],
        ['bun', 'BUN mg/dL <-> mmol/L urea'],
        ['calcium', 'Calcium mg/dL <-> mmol/L'],
        ['uricAcid', 'Uric acid mg/dL <-> umol/L'],
        ['a1c-pct', 'HbA1c % <-> IFCC mmol/mol'],
        ['mmhg-kpa', 'BP mmHg <-> kPa'],
        ['temp', 'Temperature F <-> C'],
        ['height', 'Height in <-> cm'],
        ['weight', 'Weight lb <-> kg'],
        ['ft-in', 'Feet+inches -> cm'],
      ].map(([v, l]) => el('option', { value: v, text: l })),
    )]));
    root.appendChild(field('Value 1', 'uc-v1'));
    root.appendChild(field('Value 2 (for ft+in: inches)', 'uc-v2'));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const cat = document.getElementById('uc-cat').value;
      const v1 = nv('uc-v1');
      const v2 = nv('uc-v2');
      const lines = [];
      if (LAB_KEYS.includes(cat)) {
        if (Number.isFinite(v1)) lines.push(`${v1} conv units = ${labConvert(cat, v1).toFixed(3)} SI`);
        if (Number.isFinite(v2)) lines.push(`${v2} SI = ${labConvert(cat, v2, 'fromSi').toFixed(3)} conv`);
      } else if (cat === 'a1c-pct') {
        if (Number.isFinite(v1)) lines.push(`${v1}% NGSP = ${a1cPctToIfcc(v1).toFixed(1)} mmol/mol IFCC`);
      } else if (cat === 'mmhg-kpa') {
        if (Number.isFinite(v1)) lines.push(`${v1} mmHg = ${mmHgToKpa(v1).toFixed(2)} kPa`);
        if (Number.isFinite(v2)) lines.push(`${v2} kPa = ${kpaToMmHg(v2).toFixed(1)} mmHg`);
      } else if (cat === 'temp') {
        if (Number.isFinite(v1)) lines.push(`${v1} F = ${fToC(v1).toFixed(2)} C`);
        if (Number.isFinite(v2)) lines.push(`${v2} C = ${cToF(v2).toFixed(2)} F`);
      } else if (cat === 'height') {
        if (Number.isFinite(v1)) lines.push(`${v1} in = ${inchesToCm(v1).toFixed(2)} cm`);
        if (Number.isFinite(v2)) lines.push(`${v2} cm = ${cmToInches(v2).toFixed(2)} in`);
      } else if (cat === 'weight') {
        if (Number.isFinite(v1)) lines.push(`${v1} lb = ${lbToKg(v1).toFixed(3)} kg`);
        if (Number.isFinite(v2)) lines.push(`${v2} kg = ${kgToLb(v2).toFixed(2)} lb`);
      } else if (cat === 'ft-in') {
        if (Number.isFinite(v1) && Number.isFinite(v2)) lines.push(`${v1} ft ${v2} in = ${feetInToCm(v1, v2).toFixed(1)} cm`);
      }
      o.appendChild(el('ul', {}, lines.map((l) => el('li', { text: l }))));
    });
    ['uc-cat', 'uc-v1', 'uc-v2'].forEach((id) => document.getElementById(id).addEventListener(id === 'uc-cat' ? 'change' : 'input', run));
    run();
  },

  'time-to-dose'(root) {
    root.appendChild(field('Took it at (HH:MM, 24h)', 'td-time', { type: 'text', placeholder: '14:00' }));
    root.appendChild(el('p', {}, [
      el('label', { for: 'td-freq', text: 'Frequency' }), el('br'),
      el('select', { id: 'td-freq' }, [
        ['q4h', 'Every 4 hours'], ['q6h', 'Every 6 hours'], ['q8h', 'Every 8 hours'],
        ['q12h', 'Every 12 hours'], ['qd', 'Once daily (qd)'], ['bid', 'Twice daily (bid)'],
        ['tid', 'Three times daily (tid)'], ['qid', 'Four times daily (qid)'],
      ].map(([v, l]) => el('option', { value: v, text: l })))]));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const t = document.getElementById('td-time').value.trim();
      const m = /^(\d{1,2}):(\d{2})$/.exec(t);
      if (!m) { o.appendChild(el('p', { class: 'muted', text: 'Enter time as HH:MM (24-hour).' })); return; }
      let h = Number(m[1]), mi = Number(m[2]);
      if (h > 23 || mi > 59) { o.appendChild(el('p', { class: 'muted', text: 'Invalid time.' })); return; }
      const FREQ_HRS = { q4h: 4, q6h: 6, q8h: 8, q12h: 12, qd: 24, bid: 12, tid: 8, qid: 6 };
      const step = FREQ_HRS[document.getElementById('td-freq').value];
      const next = [];
      for (let i = 1; i <= 4; i++) {
        const total = h * 60 + mi + step * 60 * i;
        const nh = String(Math.floor(total / 60) % 24).padStart(2, '0');
        const nm = String(total % 60).padStart(2, '0');
        next.push(`${nh}:${nm}`);
      }
      o.appendChild(el('h2', { text: `Next ${next.length} doses (every ${step}h)` }));
      o.appendChild(el('ol', {}, next.map((t) => el('li', { text: t }))));
    });
    ['td-time', 'td-freq'].forEach((id) => document.getElementById(id).addEventListener(id === 'td-freq' ? 'change' : 'input', run));
    run();
  },

  'peds-weight-conv'(root) {
    root.appendChild(field('Weight in lb', 'pw-lb', { value: 7 }));
    root.appendChild(field('Plus ounces', 'pw-oz', { value: 5 }));
    root.appendChild(field('OR weight in kg', 'pw-kg'));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const lb = nv('pw-lb');
      const oz = nv('pw-oz');
      const kgIn = nv('pw-kg');
      const lines = [];
      if (Number.isFinite(lb) && Number.isFinite(oz) && lb >= 0 && oz >= 0 && oz < 16) {
        lines.push(`${lb} lb ${oz} oz = ${lbOzToKg(lb, oz).toFixed(3)} kg`);
      }
      if (Number.isFinite(kgIn) && kgIn > 0) {
        const r = kgToLbOz(kgIn);
        lines.push(`${kgIn} kg = ${r.lb} lb ${r.oz.toFixed(1)} oz`);
      }
      o.appendChild(el('ul', {}, lines.map((l) => el('li', { text: l }))));
      o.appendChild(el('h3', { text: 'Common neonatal/infant weight reference' }));
      o.appendChild(el('ul', {}, [
        el('li', { text: 'Term newborn: ~3.5 kg (range 2.5-4.5 kg)' }),
        el('li', { text: 'LBW: <2.5 kg' }),
        el('li', { text: 'VLBW: <1.5 kg' }),
        el('li', { text: 'ELBW: <1.0 kg' }),
        el('li', { text: '6-month-old: ~7-8 kg' }),
        el('li', { text: '1-year-old: ~10 kg' }),
      ]));
    });
    ['pw-lb', 'pw-oz', 'pw-kg'].forEach((id) => document.getElementById(id).addEventListener('input', run));
    run();
  },

  // --- Group O: Patient Safety (195-197) ---------------------------------

  'high-alert-card'(root) {
    const region = el('div', { id: 'q-results', role: 'region' });
    root.appendChild(region);
    loadFile('clinical', 'ismp-high-alert.json').then((d) => {
      renderPrintable(region, {
        title: 'High-Alert Medications - Patient Wallet Card',
        warnings: [
          'Reference only - identities only. ISMP maintains the authoritative formatted list at https://www.ismp.org/.',
          'Patients: do not stop any medication on this list without speaking to your prescriber.',
        ],
        sections: [
          { heading: 'High-alert medications', items: d.meds.map((m) => `${m.name} - ${m.note}`) },
          { heading: 'My medications (write below)',
            items: ['', '', '', '', ''] },
        ],
      });
    });
  },

  'drug-recalls'(root) {
    const region = el('div', { id: 'q-results', role: 'region' });
    root.appendChild(region);
    root.appendChild(el('p', { class: 'notice', text:
      'Bundled snapshot is up to one week behind upstream. The canonical authority is the FDA Recalls page.' }));
    loadFile('drug-recalls', 'recalls.json').then((rows) => {
      renderTable(region, {
        columns: [
          { key: 'product', label: 'Product' },
          { key: 'ndc', label: 'NDC' },
          { key: 'recallClass', label: 'Class' },
          { key: 'reason', label: 'Reason' },
          { key: 'recallDate', label: 'Recall date' },
          { key: 'firm', label: 'Firm' },
        ],
        rows,
      });
    });
  },

  'vaccine-recalls'(root) {
    const region = el('div', { id: 'q-results', role: 'region' });
    root.appendChild(region);
    root.appendChild(el('p', { class: 'notice', text:
      'Bundled snapshot. The canonical authority is the FDA / CDC vaccine safety pages.' }));
    loadFile('vaccine-lot-recalls', 'recalls.json').then((rows) => {
      renderTable(region, {
        columns: [
          { key: 'vaccine', label: 'Vaccine' },
          { key: 'lot', label: 'Lot' },
          { key: 'reason', label: 'Reason' },
          { key: 'recallDate', label: 'Recall date' },
          { key: 'firm', label: 'Firm' },
        ],
        rows,
      });
    });
  },
};

const LAB_KEYS = ['glucose', 'cholesterol', 'creatinine', 'bun', 'calcium', 'uricAcid'];

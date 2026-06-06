// Group H: Preparation and Workflow (61, 63). Utility 62 (printable bill
// summary) is implemented as a print stylesheet plus a Print button on the
// Bill Decoder; it is not a separate route per spec section 11.

import { el, clear } from '../lib/dom.js';
import { fetchJson } from '../lib/data.js';
import { selectQuestions, selectChecklist } from '../lib/keywords.js';
import { renderPrintable } from '../lib/print.js';
import {
  buildHipaaAuthorization, buildROIRequest, buildDischargeInstructions,
  buildSpecialtyVisit, buildWalletCard,
} from '../lib/workflow-v4.js';
import {
  ewsEscalation, restraintTimer, sepsisBundleClock, codeBlueClock,
  mtpTracker, deviceDayCounter, bristolGirth, ventSbtPeep,
} from '../lib/scoring-v4.js';

function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }

function f29d(label, id, opts = {}) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const inp = el('input', { id, type: opts.type || 'number', autocomplete: 'off' });
  if (inp.type === 'number') inp.setAttribute('step', 'any');
  if (opts.placeholder) inp.setAttribute('placeholder', opts.placeholder);
  wrap.appendChild(inp);
  return wrap;
}
function s29d(label, id, options) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const sel = el('select', { id });
  for (const o of options) sel.appendChild(el('option', { value: o.value, text: o.text }));
  wrap.appendChild(sel);
  return wrap;
}
function safe29d(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function v29d(id) { return document.getElementById(id).value; }
function nv29d(id) { return Number(document.getElementById(id).value); }

export const renderers = {
  prep(root) {
    const o = out();
    fetchJson('data/workflow/questions.json').then((bank) => {
      const visitWrap = el('p');
      visitWrap.appendChild(el('label', { for: 'visit', text: 'Visit type' }));
      visitWrap.appendChild(el('br'));
      const visitSel = el('select', { id: 'visit' });
      visitSel.appendChild(el('option', { value: '', text: '(select)' }));
      for (const v of bank.visitTypes) visitSel.appendChild(el('option', { value: v, text: v }));
      visitWrap.appendChild(visitSel);
      root.appendChild(visitWrap);

      const ftWrap = el('p');
      ftWrap.appendChild(el('label', { for: 'topic', text: 'What is on your mind (free text)' }));
      ftWrap.appendChild(el('br'));
      const ta = el('textarea', { id: 'topic', rows: '4', cols: '60' });
      ftWrap.appendChild(ta);
      root.appendChild(ftWrap);

      const btnWrap = el('p', {}, [
        el('button', { id: 'gen-btn', type: 'button', text: 'Generate questions' }),
        document.createTextNode(' '),
        el('button', { id: 'print-btn', type: 'button', text: 'Print list' }),
      ]);
      root.appendChild(btnWrap);
      root.appendChild(o);

      const run = () => {
        const result = selectQuestions(bank, {
          visitType: visitSel.value,
          freeText: ta.value,
        });
        clear(o);
        if (result.sections.length === 0) {
          o.appendChild(el('p', { text: 'No matching questions. Pick a visit type or describe your concerns.' }));
          return;
        }
        for (const sec of result.sections) {
          o.appendChild(el('h2', { text: sec.section }));
          const ul = el('ul');
          for (const item of sec.items) ul.appendChild(el('li', { text: item }));
          o.appendChild(ul);
        }
        o.appendChild(el('p', { class: 'muted', text:
          'Questions are matched deterministically against a hand-curated bank. ' +
          'They are reference prompts, not medical advice.' }));
      };
      document.getElementById('gen-btn').addEventListener('click', run);
      document.getElementById('print-btn').addEventListener('click', () => window.print());
    }).catch((err) => {
      o.appendChild(el('p', { class: 'muted', text: `Failed to load question bank: ${err.message}` }));
      root.appendChild(o);
    });
  },

  'prior-auth'(root) {
    const o = out();
    fetchJson('data/workflow/prior-auth.json').then((bank) => {
      const wrap = el('p');
      wrap.appendChild(el('label', { for: 'proc', text: 'Procedure type' }));
      wrap.appendChild(el('br'));
      const sel = el('select', { id: 'proc' });
      sel.appendChild(el('option', { value: '', text: '(select)' }));
      for (const p of bank.procedures) sel.appendChild(el('option', { value: p.id, text: p.name }));
      wrap.appendChild(sel);
      root.appendChild(wrap);
      root.appendChild(el('p', {}, [
        el('button', { id: 'pa-btn', type: 'button', text: 'Generate checklist' }),
        document.createTextNode(' '),
        el('button', { id: 'pa-print', type: 'button', text: 'Print checklist' }),
      ]));
      root.appendChild(o);
      const run = () => {
        clear(o);
        const c = selectChecklist(bank, sel.value);
        if (!c) { o.appendChild(el('p', { text: 'Select a procedure type.' })); return; }
        o.appendChild(el('h2', { text: c.name }));
        const ul = el('ul');
        for (const item of c.items) ul.appendChild(el('li', { text: item }));
        o.appendChild(ul);
        o.appendChild(el('p', { class: 'notice', text: bank.notes }));
      };
      document.getElementById('pa-btn').addEventListener('click', run);
      document.getElementById('pa-print').addEventListener('click', () => window.print());
    }).catch((err) => {
      o.appendChild(el('p', { class: 'muted', text: `Failed to load procedure bank: ${err.message}` }));
      root.appendChild(o);
    });
  },

  // --- spec-v4 §5: Group H extensions (utilities 161-165) -------------

  'hipaa-auth'(root) {
    const fields = [
      ['Patient name', 'ha-pt'], ['Plan / covered entity', 'ha-plan'],
      ['Information to be released', 'ha-info'], ['Recipient', 'ha-rcpt'],
      ['Purpose of disclosure', 'ha-purpose'], ['Expiration', 'ha-exp'],
    ];
    for (const [l, id] of fields) {
      root.appendChild(el('p', {}, [
        el('label', { for: id, text: l }), el('br'),
        el('input', { id, type: 'text', autocomplete: 'off' }),
      ]));
    }
    const region = el('div', { id: 'q-results', role: 'region', 'aria-live': 'polite' });
    const btn = el('button', { type: 'button', class: 'render-btn', text: 'Build printable authorization' });
    root.appendChild(el('p', {}, [btn]));
    root.appendChild(region);
    btn.addEventListener('click', () => {
      const v = (id) => document.getElementById(id).value || '';
      renderPrintable(region, buildHipaaAuthorization({
        patient: v('ha-pt'), plan: v('ha-plan'), info: v('ha-info'),
        recipient: v('ha-rcpt'), purpose: v('ha-purpose'), expiration: v('ha-exp'),
      }));
    });
  },

  roi(root) {
    const fields = [
      ['Patient name', 'roi-pt'], ['DOB', 'roi-dob'],
      ['From provider', 'roi-from'], ['To recipient', 'roi-to'],
      ['Date range', 'roi-dr'], ['Records requested', 'roi-rec'],
      ['Delivery method', 'roi-del'],
    ];
    for (const [l, id] of fields) {
      root.appendChild(el('p', {}, [
        el('label', { for: id, text: l }), el('br'),
        el('input', { id, type: 'text', autocomplete: 'off' }),
      ]));
    }
    const region = el('div', { id: 'q-results', role: 'region', 'aria-live': 'polite' });
    const btn = el('button', { type: 'button', class: 'render-btn', text: 'Build printable ROI request' });
    root.appendChild(el('p', {}, [btn]));
    root.appendChild(region);
    btn.addEventListener('click', () => {
      const v = (id) => document.getElementById(id).value || '';
      renderPrintable(region, buildROIRequest({
        patient: v('roi-pt'), dob: v('roi-dob'),
        fromProvider: v('roi-from'), toRecipient: v('roi-to'),
        dateRange: v('roi-dr'), recordsRequested: v('roi-rec'),
        deliveryMethod: v('roi-del'),
      }));
    });
  },

  'discharge-instr'(root) {
    root.appendChild(el('p', {}, [el('label', { for: 'di-dx', text: 'Diagnosis' }), el('br'),
      el('input', { id: 'di-dx', type: 'text', autocomplete: 'off' })]));
    root.appendChild(el('p', {}, [el('label', { for: 'di-fu', text: 'Follow-up date / clinic' }), el('br'),
      el('input', { id: 'di-fu', type: 'text', autocomplete: 'off' })]));
    root.appendChild(el('p', {}, [el('label', { for: 'di-rp', text: 'Return precautions (one per line)' }), el('br'),
      el('textarea', { id: 'di-rp', rows: '4', cols: '40' })]));
    root.appendChild(el('p', {}, [el('label', { for: 'di-meds', text: 'Medications (one per line)' }), el('br'),
      el('textarea', { id: 'di-meds', rows: '4', cols: '40' })]));
    root.appendChild(el('p', {}, [el('label', { for: 'di-notes', text: 'Other notes' }), el('br'),
      el('textarea', { id: 'di-notes', rows: '3', cols: '40' })]));
    const region = el('div', { id: 'q-results', role: 'region', 'aria-live': 'polite' });
    const btn = el('button', { type: 'button', class: 'render-btn', text: 'Build printable discharge instructions' });
    root.appendChild(el('p', {}, [btn]));
    root.appendChild(region);
    btn.addEventListener('click', () => {
      const lines = (id) => String(document.getElementById(id).value || '').split('\n').map((s) => s.trim()).filter(Boolean);
      renderPrintable(region, buildDischargeInstructions({
        diagnosis: document.getElementById('di-dx').value,
        followUpDate: document.getElementById('di-fu').value,
        returnPrecautions: lines('di-rp'),
        medications: lines('di-meds'),
        notes: document.getElementById('di-notes').value,
      }));
    });
  },

  'specialty-visit'(root) {
    root.appendChild(el('p', {}, [el('label', { for: 'sv-spec', text: 'Specialty' }), el('br'),
      el('select', { id: 'sv-spec' }, [
        ['cardiology', 'Cardiology'], ['oncology', 'Oncology'], ['ortho', 'Orthopedics'],
        ['gi', 'Gastroenterology'], ['derm', 'Dermatology'], ['neuro', 'Neurology'],
        ['obgyn', 'OB/GYN'], ['peds', 'Pediatrics'],
      ].map(([v, l]) => el('option', { value: v, text: l })))]));
    root.appendChild(el('p', {}, [el('label', { for: 'sv-ctx', text: 'Visit context (optional)' }), el('br'),
      el('input', { id: 'sv-ctx', type: 'text', autocomplete: 'off' })]));
    const region = el('div', { id: 'q-results', role: 'region', 'aria-live': 'polite' });
    const btn = el('button', { type: 'button', class: 'render-btn', text: 'Build printable question list' });
    root.appendChild(el('p', {}, [btn]));
    root.appendChild(region);
    btn.addEventListener('click', () => {
      const cfg = buildSpecialtyVisit({
        specialty: document.getElementById('sv-spec').value,
        visitContext: document.getElementById('sv-ctx').value,
      });
      if (!cfg) { clear(region); region.appendChild(el('p', { text: 'Unknown specialty.' })); return; }
      renderPrintable(region, cfg);
    });
  },

  'wallet-card'(root) {
    const fields = [
      ['Patient name', 'wc-name'], ['Emergency contact', 'wc-ec'],
      ['Primary provider', 'wc-pp'], ['Pharmacy', 'wc-rx'],
    ];
    for (const [l, id] of fields) {
      root.appendChild(el('p', {}, [
        el('label', { for: id, text: l }), el('br'),
        el('input', { id, type: 'text', autocomplete: 'off' }),
      ]));
    }
    root.appendChild(el('p', {}, [el('label', { for: 'wc-allergies', text: 'Allergies (one per line; blank = NKDA)' }), el('br'),
      el('textarea', { id: 'wc-allergies', rows: '3', cols: '40' })]));
    root.appendChild(el('p', {}, [el('label', { for: 'wc-conditions', text: 'Conditions (one per line)' }), el('br'),
      el('textarea', { id: 'wc-conditions', rows: '3', cols: '40' })]));
    root.appendChild(el('p', {}, [el('label', { for: 'wc-meds', text: 'Medications (one per line)' }), el('br'),
      el('textarea', { id: 'wc-meds', rows: '5', cols: '40' })]));
    const region = el('div', { id: 'q-results', role: 'region', 'aria-live': 'polite' });
    const btn = el('button', { type: 'button', class: 'render-btn', text: 'Build printable wallet card' });
    root.appendChild(el('p', {}, [btn]));
    root.appendChild(region);
    btn.addEventListener('click', () => {
      const lines = (id) => String(document.getElementById(id).value || '').split('\n').map((s) => s.trim()).filter(Boolean);
      const v = (id) => document.getElementById(id).value || '';
      renderPrintable(region, buildWalletCard({
        patientName: v('wc-name'),
        allergies: lines('wc-allergies'),
        conditions: lines('wc-conditions'),
        medications: lines('wc-meds'),
        emergencyContact: v('wc-ec'),
        primaryProvider: v('wc-pp'),
        pharmacy: v('wc-rx'),
      }));
    });
  },

  // spec-v29 sec 4.5.1 wave 29-3d: NEWS2 / MEWS escalation timer.
  'ews-escalation'(root) {
    root.appendChild(f29d('Most recent NEWS2 total (0-20)', 'ews-total'));
    root.appendChild(f29d('Vitals taken at (ISO timestamp, e.g. 2026-05-19T14:00)', 'ews-ts', { type: 'datetime-local' }));
    root.appendChild(el('p', {}, [el('label', { for: 'ews-sp' }, [
      el('input', { id: 'ews-sp', type: 'checkbox' }),
      ' Any single parameter scoring 3 (red trigger)',
    ])]));
    const o = out(); root.appendChild(o);
    const run = () => safe29d(o, () => {
      const r = ewsEscalation({
        news2Total:      nv29d('ews-total'),
        vitalsTimestamp: v29d('ews-ts'),
        singleParam3:    document.getElementById('ews-sp').checked,
      });
      o.appendChild(el('h2', { text: `Next observations: ${r.nextHours === 0 ? 'continuous' : `${r.nextHours} h`}` }));
      if (r.nextDueIso) o.appendChild(el('p', { text: `Next due at ${r.nextDueIso}` }));
      o.appendChild(el('p', { class: 'clinical-notice', text: r.banner }));
    });
    ['ews-total', 'ews-ts'].forEach((id) => document.getElementById(id).addEventListener('input', run));
    document.getElementById('ews-sp').addEventListener('change', run);
  },

  // spec-v29 sec 4.13.1 wave 29-3d: restraint reassessment timer.
  'restraint-timer'(root) {
    root.appendChild(s29d('Restraint type', 'rt-type', [
      { value: 'violent',     text: 'Violent / self-destructive' },
      { value: 'non-violent', text: 'Non-violent medical-surgical' },
    ]));
    root.appendChild(f29d('Patient age (years)', 'rt-age'));
    root.appendChild(f29d('Restraint order at (timestamp)', 'rt-ts', { type: 'datetime-local' }));
    const o = out(); root.appendChild(o);
    const run = () => safe29d(o, () => {
      const r = restraintTimer({
        type:           v29d('rt-type'),
        ageYears:       nv29d('rt-age'),
        orderTimestamp: v29d('rt-ts'),
      });
      o.appendChild(el('h2', { text: `Next renewal: ${r.nextRenewalIso}` }));
      o.appendChild(el('p', { text: `Next nursing re-assessment: ${r.nextReassessIso}` }));
      if (r.nextFaceToFaceIso) o.appendChild(el('p', { text: `Next physician / LIP face-to-face: ${r.nextFaceToFaceIso}` }));
      for (const b of r.banners) o.appendChild(el('p', { class: 'clinical-notice', text: b }));
    });
    ['rt-age', 'rt-ts'].forEach((id) => document.getElementById(id).addEventListener('input', run));
    document.getElementById('rt-type').addEventListener('change', run);
  },

  // spec-v29 sec 4.14.1 wave 29-3d: Surviving Sepsis bundle clock.
  'sepsis-bundle-clock'(root) {
    root.appendChild(f29d('Sepsis recognition time T0', 'sb-t0', { type: 'datetime-local' }));
    root.appendChild(f29d('Initial lactate value (mmol/L)', 'sb-lac1'));
    root.appendChild(f29d('Initial lactate drawn at', 'sb-lact1', { type: 'datetime-local' }));
    root.appendChild(f29d('Blood cultures drawn at', 'sb-cult', { type: 'datetime-local' }));
    root.appendChild(f29d('Broad-spectrum antibiotic at', 'sb-abx', { type: 'datetime-local' }));
    root.appendChild(f29d('30 mL/kg crystalloid started at', 'sb-fluid', { type: 'datetime-local' }));
    root.appendChild(f29d('Vasopressor started at', 'sb-vaso', { type: 'datetime-local' }));
    root.appendChild(f29d('Repeat lactate value (mmol/L)', 'sb-lac2'));
    root.appendChild(f29d('Repeat lactate drawn at', 'sb-lact2', { type: 'datetime-local' }));
    const o = out(); root.appendChild(o);
    const run = () => safe29d(o, () => {
      const r = sepsisBundleClock({
        t0:                  v29d('sb-t0'),
        lactateValue:        nv29d('sb-lac1'),
        lactateTime:         v29d('sb-lact1'),
        cultureTime:         v29d('sb-cult'),
        antibioticTime:      v29d('sb-abx'),
        fluidStartTime:      v29d('sb-fluid'),
        vasoTime:            v29d('sb-vaso'),
        repeatLactateValue:  nv29d('sb-lac2'),
        repeatLactateTime:   v29d('sb-lact2'),
      });
      const ul = el('ul');
      for (const i of r.items) ul.appendChild(el('li', { text: `${i.label}: ${i.status}${i.minutesFromT0 !== undefined ? ` (${i.minutesFromT0} min from T0)` : ''}, due ${i.dueIso}` }));
      o.appendChild(ul);
      if (r.lactateClearancePct !== null) o.appendChild(el('p', { text: `Lactate clearance: ${r.lactateClearancePct}% per Nguyen 2004.` }));
      for (const b of r.banners) o.appendChild(el('p', { class: 'clinical-notice', text: b }));
    });
    ['sb-t0', 'sb-lac1', 'sb-lact1', 'sb-cult', 'sb-abx', 'sb-fluid', 'sb-vaso', 'sb-lac2', 'sb-lact2'].forEach((id) => document.getElementById(id).addEventListener('input', run));
  },

  // spec-v29 sec 4.15.1 wave 29-3d: code-blue documentation timer.
  'code-blue-clock'(root) {
    root.appendChild(f29d('Code start time', 'cb-start', { type: 'datetime-local' }));
    root.appendChild(f29d('Last rhythm check at', 'cb-rhy', { type: 'datetime-local' }));
    root.appendChild(f29d('Last epinephrine dose at', 'cb-epi', { type: 'datetime-local' }));
    root.appendChild(f29d('Last shock energy (J)', 'cb-shock'));
    root.appendChild(f29d('Cumulative cycle count', 'cb-cyc'));
    const o = out(); root.appendChild(o);
    const compute = () => codeBlueClock({
      codeStartTimestamp: v29d('cb-start'),
      lastRhythmCheck:    v29d('cb-rhy'),
      lastEpi:            v29d('cb-epi'),
      lastShockJ:         nv29d('cb-shock'),
      cycleCount:         nv29d('cb-cyc'),
    });
    const run = () => safe29d(o, () => {
      const r = compute();
      o.appendChild(el('h2', { text: `Code time: ${r.minutesFromStart} min, ${r.cycleCount} cycles` }));
      o.appendChild(el('p', { text: `Next rhythm check: ${r.nextRhythmCheckIso}` }));
      if (r.nextEpiIso) o.appendChild(el('p', { text: `Next epinephrine due: ${r.nextEpiIso}` }));
      if (r.lastShockJ !== null) o.appendChild(el('p', { text: `Last shock: ${r.lastShockJ} J` }));
      o.appendChild(el('p', { class: 'clinical-notice', text: r.banner }));
    });
    // spec-v61 §2 A6: a printable code-blue summary for the chart/record, with
    // the shared "No data was sent or stored" footer. Recomputes from the
    // current inputs; empty/bad inputs surface the message, not a stack trace.
    const printRegion = el('div', { class: 'print-region', role: 'region', 'aria-live': 'polite' });
    const printBtn = el('button', { type: 'button', class: 'render-btn', text: 'Build printable code summary' });
    printBtn.addEventListener('click', () => {
      try {
        const r = compute();
        renderPrintable(printRegion, {
          title: 'Code Blue Summary',
          sections: [{
            heading: 'Timeline',
            items: [
              `Elapsed code time: ${r.minutesFromStart} min`,
              `Cumulative cycles: ${r.cycleCount}`,
              `Next rhythm check due: ${r.nextRhythmCheckIso}`,
              r.nextEpiIso ? `Next epinephrine due: ${r.nextEpiIso}` : null,
              r.lastShockJ !== null ? `Last shock energy: ${r.lastShockJ} J` : null,
            ].filter(Boolean),
          }],
          warnings: r.banner ? [r.banner] : [],
        });
      } catch (err) {
        clear(printRegion);
        printRegion.appendChild(el('p', { class: 'muted', text: err.message }));
      }
    });
    root.appendChild(el('p', {}, [printBtn]));
    root.appendChild(printRegion);
    ['cb-start', 'cb-rhy', 'cb-epi', 'cb-shock', 'cb-cyc'].forEach((id) => document.getElementById(id).addEventListener('input', run));
  },

  // spec-v29 sec 4.19.1 wave 29-3d: MTP 1:1:1 ratio tracker.
  'mtp-tracker'(root) {
    root.appendChild(f29d('PRBC units transfused', 'mtp-prbc'));
    root.appendChild(f29d('FFP / plasma units transfused', 'mtp-ffp'));
    root.appendChild(f29d('Platelet apheresis units transfused', 'mtp-plt'));
    root.appendChild(f29d('Cryoprecipitate doses transfused', 'mtp-cryo'));
    const o = out(); root.appendChild(o);
    const run = () => safe29d(o, () => {
      const r = mtpTracker({
        prbcUnits:      nv29d('mtp-prbc'),
        ffpUnits:       nv29d('mtp-ffp'),
        plateletUnits:  nv29d('mtp-plt'),
        cryoUnits:      nv29d('mtp-cryo'),
      });
      o.appendChild(el('h2', { text: `PRBC : FFP : Platelets = ${r.ratio}` }));
      o.appendChild(el('p', { text: `Next product: ${r.nextProduct}; cumulative units ${r.cumulativeUnits}; cryo doses due ${r.cryoDoseDue}.` }));
      for (const b of r.banners) o.appendChild(el('p', { class: 'clinical-notice', text: b }));
    });
    ['mtp-prbc', 'mtp-ffp', 'mtp-plt', 'mtp-cryo'].forEach((id) => document.getElementById(id).addEventListener('input', run));
  },

  // spec-v29 sec 4.12.1 wave 29-3d: Foley / central-line day-counter.
  'device-day-counter'(root) {
    root.appendChild(s29d('Device', 'dd-dev', [
      { value: 'foley',        text: 'Foley urinary catheter' },
      { value: 'central-line', text: 'Central venous catheter' },
    ]));
    root.appendChild(f29d('Insertion timestamp', 'dd-ins', { type: 'datetime-local' }));
    const criteriaWrap = el('fieldset', {}, [el('legend', { text: 'CDC SHEA 2014 daily-removal criteria (check any that apply)' })]);
    const opts = [
      ['dd-c1', 'Acute urinary retention or bladder outlet obstruction'],
      ['dd-c2', 'Accurate I/O required for critically ill patient'],
      ['dd-c3', 'Peri-operative surgical indication'],
      ['dd-c4', 'End-of-life comfort'],
      ['dd-c5', 'Hourly urine output required'],
    ];
    for (const [id, lbl] of opts) {
      criteriaWrap.appendChild(el('p', {}, [el('label', { for: id }, [
        el('input', { id, type: 'checkbox' }),
        ' ' + lbl,
      ])]));
    }
    root.appendChild(criteriaWrap);
    const o = out(); root.appendChild(o);
    const run = () => safe29d(o, () => {
      const criteriaMet = opts.filter(([id]) => document.getElementById(id).checked).map(([, lbl]) => lbl);
      const r = deviceDayCounter({
        device:              v29d('dd-dev'),
        insertionTimestamp:  v29d('dd-ins'),
        criteriaMet,
      });
      o.appendChild(el('h2', { text: `Device-days: ${r.deviceDays} d ${r.deviceHours} h` }));
      o.appendChild(el('p', { text: `Insertion: ${r.insertionIso}` }));
      for (const b of r.banners) o.appendChild(el('p', { class: 'clinical-notice', text: b }));
    });
    ['dd-ins'].forEach((id) => document.getElementById(id).addEventListener('input', run));
    document.getElementById('dd-dev').addEventListener('change', run);
    for (const [id] of opts) document.getElementById(id).addEventListener('change', run);
  },

  // spec-v29 sec 4.11.1 wave 29-3d: Bristol stool + abdominal girth.
  'bristol-girth'(root) {
    root.appendChild(s29d('Bristol stool type', 'bg-b', [
      { value: '1', text: '1 - separate hard lumps' },
      { value: '2', text: '2 - lumpy sausage' },
      { value: '3', text: '3 - sausage with cracks' },
      { value: '4', text: '4 - smooth sausage (ideal)' },
      { value: '5', text: '5 - soft blobs' },
      { value: '6', text: '6 - mushy stool' },
      { value: '7', text: '7 - liquid' },
    ]));
    root.appendChild(f29d('Abdominal girth at T0 (cm, optional)', 'bg-g0'));
    root.appendChild(f29d('T0 timestamp (optional)', 'bg-t0', { type: 'datetime-local' }));
    root.appendChild(f29d('Abdominal girth at T1 (cm, optional)', 'bg-g1'));
    root.appendChild(f29d('T1 timestamp (optional)', 'bg-t1', { type: 'datetime-local' }));
    const o = out(); root.appendChild(o);
    const run = () => safe29d(o, () => {
      const r = bristolGirth({
        bristolType:  nv29d('bg-b'),
        girthT0Cm:    nv29d('bg-g0'),
        girthT1Cm:    nv29d('bg-g1'),
        t0Timestamp:  v29d('bg-t0'),
        t1Timestamp:  v29d('bg-t1'),
      });
      o.appendChild(el('h2', { text: `Bristol ${r.bristolType}: ${r.bristolLabel}` }));
      o.appendChild(el('p', { text: `Category: ${r.category}` }));
      if (r.deltaPerHourCm !== null) o.appendChild(el('p', { text: `Girth change: ${r.girthDeltaCm} cm over ${r.intervalHours} h (${r.deltaPerHourCm} cm/h).` }));
      for (const b of r.banners) o.appendChild(el('p', { class: 'clinical-notice', text: b }));
    });
    ['bg-g0', 'bg-t0', 'bg-g1', 'bg-t1'].forEach((id) => document.getElementById(id).addEventListener('input', run));
    document.getElementById('bg-b').addEventListener('change', run);
  },

  // spec-v29 sec 4.16.1 wave 29-3e: SBT readiness + ARDSnet PEEP/FiO2.
  'vent-sbt-peep'(root) {
    const sbtFieldset = el('fieldset', {}, [el('legend', { text: 'Boles 2007 SBT readiness criteria' })]);
    sbtFieldset.appendChild(f29d('PaO2 / FiO2 ratio', 'vs-pf'));
    sbtFieldset.appendChild(f29d('Current PEEP (cm H2O)', 'vs-peep'));
    sbtFieldset.appendChild(f29d('Current FiO2 (fraction, 0-1)', 'vs-fio2'));
    sbtFieldset.appendChild(el('p', {}, [el('label', { for: 'vs-vaso' }, [
      el('input', { id: 'vs-vaso', type: 'checkbox' }),
      ' Vasopressors at more than minimal dose',
    ])]));
    sbtFieldset.appendChild(el('p', {}, [el('label', { for: 'vs-awake' }, [
      el('input', { id: 'vs-awake', type: 'checkbox' }),
      ' Patient is awake / cooperative',
    ])]));
    root.appendChild(sbtFieldset);
    const peepFieldset = el('fieldset', {}, [el('legend', { text: 'ARDSnet PEEP / FiO2 look-up' })]);
    peepFieldset.appendChild(s29d('ARDSnet arm', 'vs-arm', [
      { value: 'low',  text: 'Low-PEEP arm (Brower 2000)' },
      { value: 'high', text: 'High-PEEP arm (ALVEOLI 2004)' },
    ]));
    peepFieldset.appendChild(f29d('Target FiO2 to look up (fraction)', 'vs-lf'));
    root.appendChild(peepFieldset);
    root.appendChild(el('p', { class: 'muted', text: 'Cross-link: pair with the RSBI tile for f/Vt assessment during the SBT.' }));
    const o = out(); root.appendChild(o);
    const run = () => safe29d(o, () => {
      const r = ventSbtPeep({
        pao2FiO2:         nv29d('vs-pf'),
        peep:             nv29d('vs-peep'),
        fio2:             nv29d('vs-fio2'),
        vasopressors:     document.getElementById('vs-vaso').checked,
        awakeCooperative: document.getElementById('vs-awake').checked,
        ardsArm:          v29d('vs-arm'),
        lookupFiO2:       v29d('vs-lf'),
      });
      o.appendChild(el('h2', { text: r.sbtReady ? 'SBT ready (Boles 2007)' : 'SBT not ready' }));
      const ul = el('ul');
      for (const [label, ok] of Object.entries(r.sbtChecks)) ul.appendChild(el('li', { text: `${label}: ${ok ? 'ok' : 'no'}` }));
      o.appendChild(ul);
      if (r.suggestedPeep !== null) o.appendChild(el('p', { text: `ARDSnet ${r.ardsArm}-PEEP arm at FiO2 ${r.lookupFiO2}: PEEP ${r.suggestedPeep} cm H2O.` }));
      for (const b of r.banners) o.appendChild(el('p', { class: 'clinical-notice', text: b }));
    });
    ['vs-pf', 'vs-peep', 'vs-fio2', 'vs-lf'].forEach((id) => document.getElementById(id).addEventListener('input', run));
    document.getElementById('vs-vaso').addEventListener('change', run);
    document.getElementById('vs-awake').addEventListener('change', run);
    document.getElementById('vs-arm').addEventListener('change', run);
  },
};

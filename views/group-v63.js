// spec-v63 §3 Part B: the five ops-deadline / code-set calculators. Same
// input/render contract as the rest of the catalog -- every input has a real
// <label for>, no innerHTML, no network, no storage; nullable outputs route
// through the safe() wrapper. Each deadline tile computes through the OA1
// engine (lib/deadline.js) and renders the date plus the live days-remaining /
// past-due signal, the governing citation, and the explicit "confirm against
// the current rule / your contract" note (this surfaces the regulatory date or
// code-set level only; it gives no legal advice and adjudicates nothing).

import { el, clear } from '../lib/dom.js';
import * as Ops from '../lib/ops-v63.js';
import { denialRoute } from '../lib/coding-v5.js';

// Friendly labels for the tiles the OA2 denial routing points at, so the
// "open next" link reads as a tool name rather than a bare id. Every id here is
// a real catalog tile (pinned by the OA2 routing unit test).
const TILE_LABELS = {
  'appeal-letter': 'Appeal letter builder',
  'pa-turnaround': 'PA decision-turnaround clock',
  'pa-lint': 'Prior-auth packet linter',
  'timely-filing': 'Timely-filing deadline',
  'ndc-convert': 'NDC 10/11 converter',
  roi: 'Release-of-information request',
};

function field(label, id, opts = {}) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const inp = el('input', { id, type: opts.type || 'text', autocomplete: 'off' });
  if (opts.type === 'number') inp.setAttribute('step', opts.step || 'any');
  if (opts.placeholder) inp.setAttribute('placeholder', opts.placeholder);
  wrap.appendChild(inp);
  return wrap;
}
function dateField(label, id, placeholder) {
  return field(label, id, { type: 'date', placeholder });
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
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function str(id) { return document.getElementById(id).value; }
function numv(id) { return Number(document.getElementById(id).value); }
function safe(o, fn) {
  clear(o);
  try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); }
}
function wire(ids, run) {
  ids.forEach((id) => {
    const node = document.getElementById(id);
    node.addEventListener('input', run);
    node.addEventListener('change', run);
  });
  run();
}
function li(text, cls) { return el('li', cls ? { class: cls, text } : { text }); }
// A live days-remaining / past-due line (clock-dependent; not part of any
// documented example's deterministic numbers).
function remainingLi(r) {
  if (r.pastDue) return li(`Past due by ${Math.abs(r.daysRemaining)} day(s) as of today.`, 'flag');
  return li(`${r.daysRemaining} day(s) remaining as of today.`);
}

export const renderers = {
  // ----- 3.1 appeal-deadline ------------------------------------------------
  'appeal-deadline'(root) {
    root.appendChild(el('p', { class: 'notice', text: 'Surfaces the Medicare appeal filing deadline and amount-in-controversy gate only. Confirm against the current rule; this is not legal advice and decides no appeal.' }));
    // spec-v63 OA2: optional denial-reason routing. Pick the denial category you
    // were given and the tile routes you: plain meaning -> appealable? -> the
    // next step + which tool to open, each cited. Not a CARC/RARC index -- no
    // code list is shipped; this is an input-driven decision only.
    root.appendChild(selectField('Denial reason (optional -- routes your next step)', 'apd-denial', [
      { value: '', text: '-- skip; I just need a level deadline --' },
      { value: 'medical-necessity', text: 'Medical necessity / not reasonable and necessary' },
      { value: 'non-covered', text: 'Non-covered / excluded service' },
      { value: 'no-prior-auth', text: 'Prior authorization not on file' },
      { value: 'coding-bundling', text: 'Coding / bundling edit (NCCI)' },
      { value: 'timely-filing', text: 'Untimely filing (past the limit)' },
      { value: 'duplicate', text: 'Duplicate claim/service' },
      { value: 'cob', text: 'Coordination of benefits / other payer primary' },
      { value: 'missing-info', text: 'Missing / invalid information' },
    ]));
    root.appendChild(selectField('Level just completed', 'apd-level', [
      { value: 'initial', text: 'Initial determination' },
      { value: 'redetermination', text: 'Redetermination (MAC) -- level 1' },
      { value: 'reconsideration', text: 'Reconsideration (QIC) -- level 2' },
      { value: 'alj', text: 'ALJ / OMHA hearing -- level 3' },
      { value: 'council', text: 'Medicare Appeals Council -- level 4' },
    ]));
    root.appendChild(dateField('Decision / notice date', 'apd-date', '2026-01-15'));
    const o = out(); root.appendChild(o);
    wire(['apd-denial', 'apd-level', 'apd-date'], () => safe(o, () => {
      // Denial routing block (renders only when a denial reason is chosen).
      const route = denialRoute({ category: str('apd-denial') });
      if (route) {
        const items = [
          li(`Meaning: ${route.meaning}`),
          li(route.appealable
            ? 'Appealable on the merits: yes.'
            : 'Appealable on the merits: no -- this is an administrative/resubmission path, not a coverage appeal.',
          route.appealable ? null : 'flag'),
          li(`Next step: ${route.nextStep}`),
        ];
        // When appealable and a notice date is present, surface the level-1
        // redetermination deadline through the OA1 engine.
        if (route.appealable && route.appealStart && str('apd-date')) {
          const rr = Ops.appealDeadline({ level: route.appealStart, decisionDate: str('apd-date') });
          if (rr) items.push(li(`File the ${rr.nextLevel} by ${rr.deadline} (${rr.windowDays}-day window, ${rr.cfr}).`, rr.pastDue ? 'flag' : null));
        }
        items.push(li(`Governing rule: ${route.cfr}`, 'muted'));
        const block = el('div', { class: 'denial-route' });
        block.appendChild(el('p', { class: 'denial-route-header', text: `Denial routing -- ${route.label}` }));
        block.appendChild(el('ul', {}, items.filter(Boolean)));
        const target = TILE_LABELS[route.tile];
        if (target) {
          block.appendChild(el('p', { class: 'muted' }, [
            document.createTextNode('Open next: '),
            el('a', { class: 'related-link', href: `#${route.tile}`, text: target }),
          ]));
        }
        o.appendChild(block);
      }
      // Level + date deadline block (always available).
      if (!str('apd-date')) { o.appendChild(el('p', { class: 'muted', text: 'Enter the decision/notice date for the level deadline.' })); return; }
      const r = Ops.appealDeadline({ level: str('apd-level'), decisionDate: str('apd-date') });
      if (!r) { o.appendChild(el('p', { class: 'muted', text: 'Select a level.' })); return; }
      o.appendChild(el('ul', {}, [
        li(`${r.completedLevel} -> ${r.nextLevel}`),
        li(`File by ${r.deadline} (${r.windowDays}-day window, ${r.cfr}).`, r.pastDue ? 'flag' : null),
        remainingLi(r),
        r.aicUsd ? li(`Amount in controversy to reach ${r.nextLevel}: at least $${r.aicUsd} (CY2026, annually indexed).`) : null,
      ].filter(Boolean)));
      o.appendChild(el('p', { class: 'muted', text: 'Deadlines per 42 CFR Part 405, Subpart I; AIC thresholds are indexed annually -- confirm the current-year amount.' }));
    }));
  },

  // ----- 3.2 timely-filing --------------------------------------------------
  'timely-filing'(root) {
    root.appendChild(el('p', { class: 'notice', text: 'Surfaces the claim filing deadline only. Medicaid and commercial limits vary -- confirm against your plan contract.' }));
    root.appendChild(dateField('Date of service', 'tf-date', '2026-03-01'));
    root.appendChild(selectField('Payer', 'tf-payer', [
      { value: 'medicare', text: 'Medicare (1 calendar year, 42 CFR 424.44)' },
      { value: 'other', text: 'Other (enter the plan limit)' },
    ]));
    root.appendChild(field('Plan limit in days (non-Medicare)', 'tf-limit', { type: 'number', placeholder: '90' }));
    const o = out(); root.appendChild(o);
    wire(['tf-date', 'tf-payer', 'tf-limit'], () => safe(o, () => {
      if (!str('tf-date')) { o.appendChild(el('p', { class: 'muted', text: 'Enter the date of service.' })); return; }
      const payer = str('tf-payer');
      if (payer !== 'medicare' && !(numv('tf-limit') > 0)) {
        o.appendChild(el('p', { class: 'muted', text: 'Enter the plan filing limit in days.' })); return;
      }
      const r = Ops.timelyFiling({
        serviceDate: str('tf-date'), payer,
        customLimitDays: payer === 'medicare' ? undefined : Math.round(numv('tf-limit')),
      });
      o.appendChild(el('ul', {}, [
        li(`${r.medicare ? 'Medicare: one calendar year' : `Plan limit: ${r.windowDays} days`} from date of service.`),
        li(`File by ${r.deadline} (${r.windowDays}-day window).`, r.pastDue ? 'flag' : null),
        remainingLi(r),
      ]));
      o.appendChild(el('p', { class: 'muted', text: r.medicare ? 'Medicare basis: 42 CFR 424.44 (one year after the date of service; ACA 6404).' : 'Non-Medicare limit is user-supplied; confirm against your payer contract.' }));
    }));
  },

  // ----- 3.3 em-mdm ---------------------------------------------------------
  'em-mdm'(root) {
    root.appendChild(el('p', { class: 'muted', text: 'Grade each of the three 2021 E/M MDM elements; the level is set by the two-of-three that meet or exceed it. Covers the MDM path -- em-time covers the time path. Code descriptors are AMA-owned and not bundled.' }));
    const grade = (label, id, lowLabel) => selectField(label, id, [
      { value: '2', text: `Straightforward / minimal (level 2)` },
      { value: '3', text: `${lowLabel} (level 3)` },
      { value: '4', text: 'Moderate (level 4)' },
      { value: '5', text: `${id === 'mdm-data' ? 'Extensive' : 'High'} (level 5)` },
    ]);
    root.appendChild(grade('Number / complexity of problems addressed', 'mdm-prob', 'Low'));
    root.appendChild(grade('Amount / complexity of data reviewed', 'mdm-data', 'Limited'));
    root.appendChild(grade('Risk of complications / morbidity', 'mdm-risk', 'Low'));
    const o = out(); root.appendChild(o);
    wire(['mdm-prob', 'mdm-data', 'mdm-risk'], () => safe(o, () => {
      const r = Ops.emMdm({ problems: numv('mdm-prob'), data: numv('mdm-data'), risk: numv('mdm-risk') });
      if (!r) { o.appendChild(el('p', { class: 'muted', text: 'Grade all three elements.' })); return; }
      o.appendChild(el('ul', {}, [
        li(`MDM ${r.mdm.toLowerCase()} -> E/M level ${r.level}.`),
        li(`Code: ${r.newCode} (new patient) / ${r.estCode} (established).`),
        li(r.limitingElements.length
          ? `Limiting element(s) below level ${r.level}: ${r.limitingElements.join(', ')}.`
          : `All three elements meet level ${r.level}.`),
      ]));
      o.appendChild(el('p', { class: 'muted', text: 'AMA CPT 2021 office/outpatient E/M MDM grid (2-of-3 rule). Pairs with em-time (time path).' }));
    }));
  },

  // ----- 3.4 pa-turnaround --------------------------------------------------
  'pa-turnaround'(root) {
    root.appendChild(el('p', { class: 'notice', text: 'Surfaces the prior-authorization decision deadline only. CMS-0057-F windows apply to impacted payers; commercial/ERISA windows vary -- confirm against the plan.' }));
    root.appendChild(dateField('Request submission date', 'pat-date', '2026-06-01'));
    root.appendChild(selectField('Request type', 'pat-type', [
      { value: 'standard', text: 'Standard (CMS-0057-F: 7 calendar days)' },
      { value: 'expedited', text: 'Expedited (CMS-0057-F: 72 hours)' },
      { value: 'custom', text: 'Plan-specified window (enter days)' },
    ]));
    root.appendChild(field('Plan-specified window in days', 'pat-days', { type: 'number', placeholder: '14' }));
    const o = out(); root.appendChild(o);
    wire(['pat-date', 'pat-type', 'pat-days'], () => safe(o, () => {
      if (!str('pat-date')) { o.appendChild(el('p', { class: 'muted', text: 'Enter the submission date.' })); return; }
      const type = str('pat-type');
      if (type === 'custom' && !(numv('pat-days') > 0)) {
        o.appendChild(el('p', { class: 'muted', text: 'Enter the plan-specified window in days.' })); return;
      }
      const r = Ops.paTurnaround({
        requestDate: str('pat-date'), type,
        customDays: type === 'custom' ? Math.round(numv('pat-days')) : undefined,
      });
      if (!r) { o.appendChild(el('p', { class: 'muted', text: 'Select a request type.' })); return; }
      o.appendChild(el('ul', {}, [
        li(`Window: ${r.windowLabel}.`),
        li(`Decision due by ${r.deadline}.`, r.pastDue ? 'flag' : null),
        remainingLi(r),
      ]));
      o.appendChild(el('p', { class: 'muted', text: 'CMS Interoperability and Prior Authorization Final Rule (CMS-0057-F, 2024), effective 2026 for impacted payers.' }));
    }));
  },

  // ----- 3.5 overpayment-60day ----------------------------------------------
  'overpayment-60day'(root) {
    root.appendChild(el('p', { class: 'notice', text: 'Surfaces the 60-day report-and-return deadline only. It makes no judgment that an overpayment occurred (the breach-clock posture).' }));
    root.appendChild(dateField('Identification date', 'ov-date', '2026-05-01'));
    const o = out(); root.appendChild(o);
    wire(['ov-date'], () => safe(o, () => {
      if (!str('ov-date')) { o.appendChild(el('p', { class: 'muted', text: 'Enter the identification date.' })); return; }
      const r = Ops.overpayment60Day({ identificationDate: str('ov-date') });
      o.appendChild(el('ul', {}, [
        li(`Identified ${r.identificationDate}: report and return by ${r.deadline} (60-day clock).`, r.pastDue ? 'flag' : null),
        remainingLi(r),
      ]));
      o.appendChild(el('p', { class: 'muted', text: 'ACA 6402(a) (42 U.S.C. 1320a-7k(d)); 42 CFR 401.305. The rule allows reasonable diligence before the 60-day clock starts.' }));
    }));
  },
};

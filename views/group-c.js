// Group C: Patient Bill and Insurance Tools.
//
// spec-v29 wave 29-2: most Group C tiles removed (decoder, insurance,
// eob-decoder, no-surprises, insurance-card, abn-explainer, msn-decoder,
// idr-eligibility, birthday-rule, cobra-timeline, medicare-enrollment,
// aca-sep). The router sends their permalink hashes to the home view
// with a one-line removed-note (app.js REMOVED_V29_IDS, spec-v29 sec
// 2.7). The surviving workflow generators (appeal-letter, hipaa-roa)
// remain per spec-v29 sec 10 open question 1.

import { el } from '../lib/dom.js';
import { renderPrintable } from '../lib/print.js';

function field(label, id, type = 'text', placeholder = '') {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const inp = el('input', { id, type, autocomplete: 'off' });
  if (placeholder) inp.setAttribute('placeholder', placeholder);
  wrap.appendChild(inp);
  return wrap;
}

export const renderers = {
  'appeal-letter'(root) {
    root.appendChild(el('p', { class: 'notice', text:
      'Reference template only. Not legal advice. Adapt to your plan\'s specific appeal procedure and address.' }));
    const inputs = [
      ['Patient name', 'al-pt'],
      ['Patient member ID', 'al-id'],
      ['Date of service', 'al-dos'],
      ['Provider name', 'al-prov'],
      ['Service / procedure description', 'al-svc'],
      ['Diagnosis (ICD-10)', 'al-dx'],
      ['Plan name', 'al-plan'],
      ['Denial date', 'al-denial'],
      ['Denial reason from EOB', 'al-reason'],
    ];
    for (const [lbl, id] of inputs) root.appendChild(field(lbl, id, 'text'));
    const printRegion = el('div', { id: 'q-results', role: 'region', 'aria-live': 'polite' });
    const btn = el('button', { type: 'button', class: 'render-btn', text: 'Build printable letter' });
    root.appendChild(el('p', {}, [btn]));
    root.appendChild(printRegion);
    btn.addEventListener('click', () => {
      const v = (id) => document.getElementById(id).value || '[blank]';
      renderPrintable(printRegion, {
        title: 'Appeal of Adverse Determination',
        warnings: ['Educational template. Verify your plan\'s specific appeal address, deadline, and required attachments.'],
        sections: [
          { heading: 'Heading', paragraphs: [
            `Date: ${new Date().toISOString().slice(0, 10)}`,
            `${v('al-plan')} - Appeals Department`,
            `Re: ${v('al-pt')}, Member ID ${v('al-id')}`,
            `Date of service: ${v('al-dos')}; Provider: ${v('al-prov')}`,
          ] },
          { heading: 'Letter body', paragraphs: [
            `To Whom It May Concern,`,
            `I am writing to formally appeal the denial dated ${v('al-denial')} regarding the ${v('al-svc')} provided on ${v('al-dos')} by ${v('al-prov')} for diagnosis ${v('al-dx')}.`,
            `The denial cites: "${v('al-reason')}". I respectfully disagree and request reconsideration based on the medical necessity established in the attached records.`,
            `Please reverse this denial and process the claim. I have attached the following: provider records, an itemized bill, the EOB, and any prior-authorization documentation.`,
            `If you require additional information, please contact me at the address on file.`,
            `Sincerely,`,
            `${v('al-pt')}`,
          ] },
          { heading: 'Attachments', items: [
            'Itemized bill', 'Explanation of Benefits showing denial', 'Provider records', 'Prior-authorization documentation (if applicable)',
          ] },
        ],
      });
    });
  },

  'hipaa-roa'(root) {
    root.appendChild(el('p', { class: 'notice', text:
      '45 CFR 164.524 grants you the right to access your own records. Covered entities must respond within 30 days (one 30-day extension possible).' }));
    const inputs = [
      ['Patient name', 'roa-pt'],
      ['Date of birth', 'roa-dob'],
      ['Provider / facility name', 'roa-fac'],
      ['Date range requested (e.g., 2024-01-01 to 2025-01-01)', 'roa-range'],
      ['Specific records requested', 'roa-recs'],
      ['Format requested (paper, electronic, secure email)', 'roa-fmt'],
      ['Delivery address (mail / email / portal)', 'roa-deliver'],
    ];
    for (const [lbl, id] of inputs) root.appendChild(field(lbl, id, 'text'));
    const printRegion = el('div', { id: 'q-results', role: 'region', 'aria-live': 'polite' });
    const btn = el('button', { type: 'button', class: 'render-btn', text: 'Build printable request' });
    root.appendChild(el('p', {}, [btn]));
    root.appendChild(printRegion);
    btn.addEventListener('click', () => {
      const v = (id) => document.getElementById(id).value || '[blank]';
      renderPrintable(printRegion, {
        title: 'HIPAA Right of Access Request - 45 CFR 164.524',
        warnings: ['Fee cap reminder: covered entities may only charge a reasonable, cost-based fee (labor, supplies, postage). Per-page or flat "search" fees are generally not allowed.'],
        sections: [
          { heading: 'Header', paragraphs: [
            `Date: ${new Date().toISOString().slice(0, 10)}`,
            `${v('roa-fac')} - Health Information Management / Privacy Officer`,
          ] },
          { heading: 'Request', paragraphs: [
            `Patient: ${v('roa-pt')}, DOB ${v('roa-dob')}.`,
            `Pursuant to 45 CFR 164.524 I request access to my designated record set for the dates ${v('roa-range')}.`,
            `Specifically: ${v('roa-recs')}.`,
            `Format requested: ${v('roa-fmt')}. Delivery: ${v('roa-deliver')}.`,
            `Please respond within 30 days. If you must extend, you may take one additional 30 days with written notice. The fee is limited to actual labor, supplies, and postage as required by 45 CFR 164.524(c)(4).`,
          ] },
          { heading: 'Signature', paragraphs: [
            `Signed: __________________________  Date: __________`,
            `Printed name: ${v('roa-pt')}`,
          ] },
        ],
      });
    });
  },
};

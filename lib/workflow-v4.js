// spec-v4 §5: Group H workflow extensions (utilities 161-165).
// Pure builders that produce the printable-template config. Renderers in
// views/group-h.js feed these into lib/print.js.

export function buildHipaaAuthorization({ patient, plan, info, recipient, purpose, expiration }) {
  return {
    title: 'HIPAA Authorization for Use or Disclosure of PHI',
    warnings: ['Reference template per 45 CFR 164.508. Not legal advice. Adapt to your covered entity\'s required elements.'],
    sections: [
      { heading: 'Patient', items: [
        `Name: ${patient || '[blank]'}`,
        `DOB: (write on the printed form)`,
      ] },
      { heading: 'Information to be released', paragraphs: [info || '[describe the specific PHI]'] },
      { heading: 'Recipient (who may receive the PHI)', paragraphs: [recipient || '[name and address]'] },
      { heading: 'Purpose of the disclosure', paragraphs: [purpose || '[purpose, or "at the request of the patient"]'] },
      { heading: 'Expiration', paragraphs: [expiration || 'This authorization expires 12 months from signature unless otherwise specified.'] },
      { heading: 'Right to revoke', paragraphs: [
        'I understand I may revoke this authorization in writing at any time, except to the extent action has already been taken in reliance on it.',
      ] },
      { heading: 'Signature', paragraphs: ['Signed: __________________________  Date: __________'] },
      { heading: 'Plan / source covered entity', paragraphs: [plan || '[name and address]'] },
    ],
  };
}

export function buildROIRequest({ patient, dob, fromProvider, toRecipient, dateRange, recordsRequested, deliveryMethod }) {
  return {
    title: 'Authorization to Release Health Information (Release of Information)',
    warnings: ['Reference template. Many providers require their own ROI form; this can be attached or used as the basis for that form.'],
    sections: [
      { heading: 'Header', paragraphs: [
        `Date: ${new Date().toISOString().slice(0, 10)}`,
        `From: ${fromProvider || '[provider / facility releasing records]'}`,
        `To: ${toRecipient || '[third party receiving records]'}`,
      ] },
      { heading: 'Patient', items: [
        `Name: ${patient || '[blank]'}`,
        `DOB: ${dob || '[blank]'}`,
      ] },
      { heading: 'Records requested', items: [
        `Date range: ${dateRange || '[from / to]'}`,
        `Records: ${recordsRequested || '[clinic notes / labs / imaging / discharge summary]'}`,
        `Delivery: ${deliveryMethod || '[mail / secure email / portal / fax]'}`,
      ] },
      { heading: 'Authorization', paragraphs: [
        'I authorize the above-named provider to release the records described above to the recipient indicated.',
      ] },
      { heading: 'Signature', paragraphs: ['Signed: __________________________  Date: __________'] },
    ],
  };
}

export function buildDischargeInstructions({ diagnosis, followUpDate, returnPrecautions = [], medications = [], notes }) {
  return {
    title: 'Discharge Instructions',
    warnings: ['Reference template only. Institutional discharge protocols govern what must be included for a particular condition.'],
    sections: [
      { heading: 'Diagnosis', paragraphs: [diagnosis || '[diagnosis]'] },
      { heading: 'Follow-up appointment', paragraphs: [followUpDate || '[date / clinic]'] },
      { heading: 'Return precautions (call your doctor or go to the ED if any of these occur)',
        items: returnPrecautions.length ? returnPrecautions : ['[blank]'] },
      { heading: 'Medications', items: medications.length ? medications : ['[blank]'] },
      { heading: 'Other notes', paragraphs: [notes || ''] },
    ],
  };
}

const SPECIALTY_BANKS = {
  cardiology: [
    'What is the most likely cause of my symptoms?',
    'Do I need any tests (echo, stress test, monitor)?',
    'Should I be on a blood thinner or aspirin? Why or why not?',
    'What target blood pressure / LDL should I aim for?',
    'What activity level is safe for me?',
  ],
  oncology: [
    'What is the stage and what does that mean for my prognosis?',
    'What treatment options exist and what are their goals?',
    'What side effects should I expect and how are they managed?',
    'How will we know if treatment is working?',
    'Do I qualify for any clinical trials?',
  ],
  ortho: [
    'What is my diagnosis and what caused it?',
    'What non-surgical options are available first?',
    'If surgery is needed, what is the expected recovery timeline?',
    'What activities should I avoid? For how long?',
    'Will I need physical therapy?',
  ],
  gi: [
    'What is the most likely cause of my symptoms?',
    'Do I need an endoscopy or colonoscopy? When and why?',
    'Are there dietary changes that might help?',
    'Could any of my medications be making this worse?',
    'When should I follow up?',
  ],
  derm: [
    'Is this lesion benign? If unsure, what next?',
    'Should we biopsy?',
    'How can I prevent recurrence?',
    'What sun-protection plan do you recommend?',
    'When should I be re-evaluated?',
  ],
  neuro: [
    'What is the working diagnosis?',
    'What imaging or tests do you recommend?',
    'What red-flag symptoms should send me back urgently?',
    'Are there medications that could trigger or worsen this?',
    'What is the typical course of this condition?',
  ],
  obgyn: [
    'What is the most likely cause of my symptoms?',
    'What screening do you recommend at my age?',
    'How does this affect my plans for pregnancy / contraception?',
    'Are there lifestyle changes that would help?',
    'When should I follow up?',
  ],
  peds: [
    'Is my child\'s growth and development on track?',
    'What vaccinations are due now?',
    'What should I watch for that would mean we should call back?',
    'Are there any nutritional concerns at this age?',
    'When is the next well-child visit?',
  ],
};

export function specialtyQuestions(specialty) {
  return SPECIALTY_BANKS[String(specialty || '').toLowerCase()] || null;
}

export function buildSpecialtyVisit({ specialty, visitContext }) {
  const qs = specialtyQuestions(specialty);
  if (!qs) return null;
  return {
    title: `${specialty.charAt(0).toUpperCase() + specialty.slice(1)} Visit Questions`,
    warnings: ['Generic question bank. Add your own questions; remove any that are not relevant.'],
    sections: [
      { heading: 'Visit context', paragraphs: [visitContext || ''] },
      { heading: 'Questions to consider asking', items: qs },
    ],
  };
}

export function buildWalletCard({ patientName, allergies = [], conditions = [], medications = [],
  emergencyContact, primaryProvider, pharmacy }) {
  return {
    title: 'Medication / Health Wallet Card',
    warnings: ['Not a substitute for a pharmacist-reviewed medication list. Update whenever a medication changes.'],
    sections: [
      { heading: 'Patient', items: [`Name: ${patientName || '[blank]'}`, `Emergency contact: ${emergencyContact || '[blank]'}`] },
      { heading: 'Allergies', items: allergies.length ? allergies : ['NKDA'] },
      { heading: 'Conditions', items: conditions.length ? conditions : ['[blank]'] },
      { heading: 'Medications (drug, dose, frequency, indication, prescriber)',
        items: medications.length ? medications : ['[blank]'] },
      { heading: 'Care team', items: [
        `Primary care: ${primaryProvider || '[blank]'}`,
        `Pharmacy: ${pharmacy || '[blank]'}`,
      ] },
    ],
  };
}

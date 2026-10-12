// spec-v1635 MCP adapter: nrc-medical-event-screen in lib/nrc-medical-event-screen-v1635.js. The dom
// keys mirror views/group-v1635.js and META['nrc-medical-event-screen'].example. Operational domain.

import * as ME from '../../lib/nrc-medical-event-screen-v1635.js';

export default [
  {
    id: 'nrc-medical-event-screen',
    summary: 'Screen an administration against the NRC medical event criteria in 10 CFR 35.3045. It tests the reader\'s dose estimates against paragraph (a)(1)(i), (ii) and (iii) and the patient-intervention paragraph (b), says which test is met or could not be assessed, and gives the telephone, written report and notification deadlines. Permanent implant brachytherapy is not screened, and Agreement State rules may differ.',
    compute: ME.nrcMedicalEventScreen,
    fields: [
      { dom: 'mes-intervention', arg: 'patientIntervention', kind: 'enum', required: true, values: ['yes', 'no'], label: 'Resulted from patient intervention' },
      { dom: 'mes-damage', arg: 'permanentDamage', kind: 'enum', values: ['yes', 'no'], label: 'Unintended permanent functional damage, per a physician (with patient intervention)' },
      { dom: 'mes-wrong', arg: 'wrongAdministration', kind: 'enum', values: ME.WRONG.map((w) => w.value), label: 'Wrong drug, route, individual or mode, or a leaking source' },
      { dom: 'mes-kind', arg: 'doseKind', kind: 'enum', values: ME.DOSE_KINDS.map((k) => k.value), label: 'Kind of dose estimated' },
      { dom: 'mes-dose', arg: 'doseRem', kind: 'number', label: 'Dose difference from prescribed, or the dose from a wrong administration', unit: 'rem' },
      { dom: 'mes-prescribed', arg: 'prescribed', kind: 'number', label: 'Prescribed total dose or dosage' },
      { dom: 'mes-delivered', arg: 'delivered', kind: 'number', label: 'Delivered total dose or dosage (same unit)' },
      { dom: 'mes-range', arg: 'outsideRange', kind: 'enum', values: ['yes', 'no'], label: 'Dosage outside the prescribed range' },
      { dom: 'mes-fraction-prescribed', arg: 'prescribedFraction', kind: 'number', label: 'Prescribed dose for one fraction' },
      { dom: 'mes-fraction-delivered', arg: 'deliveredFraction', kind: 'number', label: 'Delivered dose for that fraction' },
      { dom: 'mes-site-dose', arg: 'otherSiteDoseRem', kind: 'number', label: 'Dose to a site other than the treatment site', unit: 'rem' },
      { dom: 'mes-site-expected', arg: 'otherSiteExpectedRem', kind: 'number', label: 'Dose expected at that site', unit: 'rem' },
      { dom: 'mes-discovered', arg: 'discovered', kind: 'string', label: 'Date of discovery (YYYY-MM-DD, optional)' },
    ],
  },
];

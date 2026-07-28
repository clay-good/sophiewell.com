// spec-v534 MCP wave: adapter for the Ridley-Jopling leprosy classification in lib/ridley-jopling-v534.js.
// The dom key mirrors the browser renderer (views/group-v534.js) and META['ridley-jopling'].example:
// rj-group maps to the lib arg `group`.
//
// THE ENUM INCLUDES 'I' FOR INDETERMINATE ALONGSIDE THE FIVE GROUPS, because indeterminate leprosy sits
// OUTSIDE the five-group spectrum. An enum of exactly five would force an agent to file an indeterminate case
// as TT, which misstates both the immunology and the prognosis. The result exposes an `onSpectrum` boolean so
// a caller can tell the two situations apart.
//
// **THE TOOL RETURNS NO PER-GROUP BACTERIAL INDEX, AND THE SUMMARY SAYS WHY.** Four independent
// reproductions give four different per-group BI values, partly because some quote the bacterial index of
// granuloma rather than the slit-skin smear index. Returning any one of them would manufacture a precision
// the literature does not have, and an agent would repeat it as fact. What IS returned is the Ridley
// logarithmic SCALE, which is unambiguous, plus the direction across the spectrum.
//
// THE SUMMARY CARRIES THE CURRENT WHO OPERATIONAL RULE, not just the crosswalk, because the rule changed
// several times and stale references are common: a case is multibacillary if there are more than five skin
// lesions, OR any nerve involvement, OR bacilli on a smear. Those are alternatives, and NERVE INVOLVEMENT
// ALONE makes a case multibacillary even with few lesions - the point most often gotten wrong, and the one
// that changes treatment duration.
//
// The summary also states that this classification CANNOT be assigned from a clinical description alone,
// because the lepromin response and the histology are part of the definition. An agent handed a photograph
// or a symptom list cannot pick a group, and should say so rather than guessing between BT and BB.

import * as R from '../../lib/ridley-jopling-v534.js';

export default [
  {
    id: 'ridley-jopling',
    summary: `The Ridley-Jopling classification of leprosy (Ridley and Jopling 1966): a five-group SPECTRUM ordered by cell-mediated immune response, not a ladder of severity. TT tuberculoid has high resistance, few asymmetric lesions, a positive lepromin response, and epithelioid granulomas reaching the epidermis; BT borderline tuberculoid has asymmetric lesions with satellites and several thickened nerves; BB mid-borderline is the least stable position on the spectrum, with a weak or absent lepromin response; BL borderline lepromatous has many increasingly symmetric lesions and macrophage granulomas; and LL lepromatous has little or no resistance, numerous symmetric lesions, an absent lepromin response, and diffuse sheets of foamy macrophages. INDETERMINATE leprosy is offered as a sixth answer because it sits OUTSIDE the five groups: a pre-spectrum stage in a patient who has not yet mounted a classifiable immune response. Pure neuritic leprosy is likewise outside these five. THIS TOOL RETURNS NO PER-GROUP BACTERIAL INDEX VALUE. Independent sources give different per-group figures, partly by quoting the bacterial index of granuloma rather than the slit-skin smear index, so only the direction is reported - negative at the tuberculoid pole, rising across the borderline groups, highest at the lepromatous pole - together with the Ridley logarithmic scale itself, which is unambiguous. The WHO paucibacillary and multibacillary classification is a SEPARATE, operational system used to choose treatment duration: TT and BT map to paucibacillary and BB, BL and LL to multibacillary, but under the CURRENT WHO definition a case is multibacillary if there are more than five skin lesions, OR any nerve involvement, OR bacilli on a slit-skin smear - these are alternatives, and nerve involvement alone makes a case multibacillary even with few lesions, which stale references most often get wrong. This classifies a case that has already been diagnosed. It does NOT diagnose leprosy, which rests on the cardinal signs with slit-skin smear and histopathology, and it CANNOT be assigned from a clinical description alone, because the lepromin response and the histology are part of the definition. It is not a treatment regimen: multidrug therapy is chosen from the WHO operational class rather than the Ridley-Jopling group, and this tool emits no drugs, doses, or durations. It says nothing about leprosy reactions, type 1 reversal and type 2 erythema nodosum leprosum, which cause most nerve damage and are managed separately and urgently. Leprosy is curable and treatment is free through national programs, so a classification is never a reason to delay referral.`,
    compute: R.ridleyJopling,
    fields: [
      {
        dom: 'rj-group',
        arg: 'group',
        kind: 'enum',
        values: [...R.RJ_GROUPS.map((g) => g.value), R.RJ_INDETERMINATE.value],
        required: true,
        label: `The Ridley-Jopling group. Requires the lepromin response and histology, not just the clinical picture [${R.RJ_GROUPS.map((g) => `${g.value} = ${g.label}, ${g.immunity}`).join(' ')} I = Indeterminate, outside the five-group spectrum]`,
      },
    ],
  },
];

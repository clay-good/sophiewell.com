// spec-v510 MCP wave: adapter for the Banff acute T cell-mediated rejection grade in lib/banff-tcmr-v510.js.
// The dom keys mirror the browser renderer (views/group-v510.js) and META['banff-tcmr'].example: bf-i, bf-t,
// and bf-v map to the lib args i, t, and v. Each is an enum '0'-'3' and all three are in the example, so all
// three are required for every caller - correct here, because the category is a joint rule over the three
// lesion scores and any missing one changes the answer (a caller who omits v cannot be told IIA). The example
// is i2 t2 v0, grade IA; the category and the lesion scores are carried by the result band, so it flows
// through the default makeToArgs with no custom toArgs.

import * as C from '../../lib/banff-tcmr-v510.js';

export default [
  {
    id: 'banff-tcmr',
    summary: 'The Banff grade of acute T cell-mediated rejection in a kidney allograft biopsy, read from three lesion scores a pathologist has already assigned: interstitial inflammation (i), tubulitis (t), and intimal arteritis (v), each 0 to 3. Any arteritis grades the biopsy on its own: v1 is IIA, v2 is IIB, v3 is III. Without arteritis, tubulitis with only minor inflammation, or i2/i3 with t1 only, is borderline; i2 or i3 with t2 is IA and with t3 is IB; inflammation without tubulitis is not graded. This does not read a biopsy and is not an indication for steroids, thymoglobulin, or any change in immunosuppression. It covers T cell-mediated rejection only: antibody-mediated rejection is a separate diagnosis, chronic active rejection is scored on different lesions, and intimal arteritis is not specific to rejection.',
    compute: C.banffTcmr,
    fields: C.LESIONS.map((lesion) => ({
      dom: `bf-${lesion.key}`,
      arg: lesion.key,
      kind: 'enum',
      values: lesion.options.map((o) => o.value),
      label: lesion.label,
    })),
  },
];

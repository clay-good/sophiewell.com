// spec-v468 MCP wave: adapter for the Brouet cryoglobulinemia classification in
// lib/brouet-cryoglobulinemia-v468.js. The dom key mirrors the browser renderer (views/group-v468.js) and
// META['brouet-cryoglobulinemia'].example. `type` is an enum (I/II/III). The compute reports the type and its
// clonality/association description. The example sets type II; its expected text carries no numeric facts (the
// description is word-only), so it flows through the default makeToArgs with no custom toArgs.

import * as C from '../../lib/brouet-cryoglobulinemia-v468.js';

export default [
  {
    id: 'brouet-cryoglobulinemia',
    summary: 'The Brouet classification of cryoglobulinemia, by the clonality of the cryoprecipitating immunoglobulins, types I/II/III. I: a single monoclonal immunoglobulin (lymphoproliferative disorders). II: mixed, a monoclonal immunoglobulin plus polyclonal IgG (strongly linked to hepatitis C). III: mixed, polyclonal immunoglobulins only. Types II and III are mixed cryoglobulinemia. Reports the immunochemical type, not a diagnosis, a treatment decision, or a prognosis.',
    compute: C.brouetCryoglobulinemia,
    fields: [
      { dom: 'brouet-type', arg: 'type', kind: 'enum', values: ['I', 'II', 'III'], label: 'Brouet type' },
    ],
  },
];

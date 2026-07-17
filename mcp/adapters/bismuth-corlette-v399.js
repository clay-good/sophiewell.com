// spec-v399 MCP wave: adapter for the Bismuth-Corlette classification of perihilar cholangiocarcinoma in
// lib/bismuth-corlette-v399.js. The dom key mirrors the browser renderer (views/group-v399.js) and
// META['bismuth-corlette'].example. `type` is an enum (I/II/IIIa/IIIb/IV). The compute reports the type and
// its ductal-extent description. The example sets type II; its expected text is the type description (a
// roman numeral, no free numeric facts to round-trip), so it flows through the default makeToArgs with no
// custom toArgs.

import * as C from '../../lib/bismuth-corlette-v399.js';

export default [
  {
    id: 'bismuth-corlette',
    summary: 'Bismuth-Corlette classification of a perihilar cholangiocarcinoma (Klatskin tumor), types I/II/IIIa/IIIb/IV, by the extent of biliary-ductal involvement along the hepatic-duct confluence - the companion to the Strasberg bile-duct-injury classification. I: tumor confined to the common hepatic duct, below (sparing) the confluence. II: reaching the confluence, without involving the secondary (segmental) ducts. IIIa: extending to the right secondary (sectoral) ducts. IIIb: extending to the left secondary (sectoral) ducts. IV: extending to the secondary ducts on both sides, or multifocal. Reports the type, not a diagnosis, a resectability determination, a treatment decision, or a prognosis.',
    compute: C.bismuthCorlette,
    fields: [
      { dom: 'bc-type', arg: 'type', kind: 'enum', values: ['I', 'II', 'IIIa', 'IIIb', 'IV'], label: 'Bismuth-Corlette type' },
    ],
  },
];

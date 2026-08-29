// spec-v883 MCP adapter: the Fukuoka IPMN tiers in lib/ipmn-fukuoka-v883.js. The dom keys mirror
// the browser renderer (views/group-v883.js) and META['ipmn-fukuoka'].example.
//
// The two tiers carry DIFFERENT recommendations. Clinical domain.

import { ipmnFukuoka } from '../../lib/ipmn-fukuoka-v883.js';

export default [
  {
    id: 'ipmn-fukuoka',
    summary: 'Sorts a branch-duct intraductal papillary mucinous neoplasm into the two tiers of the international consensus Fukuoka guidelines. High-risk stigmata are obstructive jaundice attributable to a cystic lesion of the pancreatic head, an enhancing mural nodule 5 mm or larger, and a main pancreatic duct 10 mm or wider; any one is a reason to consider resection. Worrisome features are pancreatitis, a cyst 3 cm or larger, an enhancing mural nodule under 5 mm, thickened or enhancing cyst walls, a main duct of 5 to 9 mm, an abrupt caliber change with distal atrophy, lymphadenopathy, a raised CA 19-9, and growth of 5 mm or more over two years; any one calls for endoscopic ultrasound. A WORRISOME FEATURE MEANS ENDOSCOPIC ULTRASOUND, NOT RESECTION. A CYST OF 3 cm OR MORE IS A WORRISOME FEATURE, NOT A HIGH-RISK STIGMA. The same measurement lands in either tier depending on the number, and a mural nodule must be enhancing in both. The jaundice must be attributable to the cyst.',
    compute: ipmnFukuoka,
    fields: [
      { dom: 'ip-obstructivejaundice', arg: 'obstructiveJaundice', kind: 'boolean', required: false, label: 'Obstructive jaundice attributable to a cystic lesion of the pancreatic head (high-risk stigma)' },
      { dom: 'ip-nodulefivemmormore', arg: 'noduleFiveMmOrMore', kind: 'boolean', required: false, label: 'Enhancing mural nodule 5 mm or larger (high-risk stigma)' },
      { dom: 'ip-mainducttenmmormore', arg: 'mainDuctTenMmOrMore', kind: 'boolean', required: false, label: 'Main pancreatic duct 10 mm or wider (high-risk stigma)' },
      { dom: 'ip-pancreatitis', arg: 'pancreatitis', kind: 'boolean', required: false, label: 'Pancreatitis (worrisome feature)' },
      { dom: 'ip-cystthreecmormore', arg: 'cystThreeCmOrMore', kind: 'boolean', required: false, label: 'Cyst 3 cm or larger (worrisome feature)' },
      { dom: 'ip-noduleunderfivemm', arg: 'noduleUnderFiveMm', kind: 'boolean', required: false, label: 'Enhancing mural nodule under 5 mm (worrisome feature)' },
      { dom: 'ip-thickenedwalls', arg: 'thickenedWalls', kind: 'boolean', required: false, label: 'Thickened or enhancing cyst walls (worrisome feature)' },
      { dom: 'ip-mainductfivetonine', arg: 'mainDuctFiveToNine', kind: 'boolean', required: false, label: 'Main pancreatic duct 5 to 9 mm (worrisome feature)' },
      { dom: 'ip-abruptcaliberchange', arg: 'abruptCaliberChange', kind: 'boolean', required: false, label: 'Abrupt change in duct caliber with distal pancreatic atrophy (worrisome feature)' },
      { dom: 'ip-lymphadenopathy', arg: 'lymphadenopathy', kind: 'boolean', required: false, label: 'Lymphadenopathy (worrisome feature)' },
      { dom: 'ip-raisedca199', arg: 'raisedCa199', kind: 'boolean', required: false, label: 'Raised serum CA 19-9 (worrisome feature)' },
      { dom: 'ip-growthfivemmtwoyears', arg: 'growthFiveMmTwoYears', kind: 'boolean', required: false, label: 'Cyst growth of 5 mm or more over two years (worrisome feature)' },
    ],
  },
];

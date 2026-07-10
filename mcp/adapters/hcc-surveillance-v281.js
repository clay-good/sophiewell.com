// spec-v281 MCP wave (ninety-eighth): adapters for the two hepatocellular-
// carcinoma surveillance / detection tiles in lib/hcc-surveillance-v281.js — the
// GALAD serum-biomarker score and the Toronto HCC Risk Index (THRI). dom keys
// mirror the browser renderer (views/group-v281.js) and each tile's
// META.example.fields. Every input is required (each compute needs the full set).

import * as F from '../../lib/hcc-surveillance-v281.js';

export default [
  {
    id: 'galad-hcc',
    summary: 'GALAD score (Johnson 2014) — a serum-biomarker model for the probability that a lesion is hepatocellular carcinoma, from Gender, Age, AFP-L3, AFP, and DCP (des-gamma-carboxy-prothrombin / PIVKA-II). Z = -10.08 + 0.09*age + 1.67*(male=1) + 2.34*log10(AFP) + 0.04*AFP-L3 + 1.33*log10(DCP); probability = e^Z/(1+e^Z), commonly applied at the Z = -0.63 cutoff (~85% sensitivity / 90% specificity). Assay units: AFP ng/mL, DCP mAU/mL, AFP-L3 %. Reports a probability, not a diagnosis or a biopsy/imaging order.',
    compute: F.galadHcc,
    fields: [
      { dom: 'galad-sex', arg: 'sex', kind: 'enum', values: ['male', 'female'], required: true, label: 'Sex' },
      { dom: 'galad-age', arg: 'age', kind: 'number', required: true, label: 'Age', unit: 'years' },
      { dom: 'galad-afpl3', arg: 'afpL3', kind: 'number', required: true, label: 'AFP-L3', unit: '%' },
      { dom: 'galad-afp', arg: 'afp', kind: 'number', required: true, label: 'AFP', unit: 'ng/mL' },
      { dom: 'galad-dcp', arg: 'dcp', kind: 'number', required: true, label: 'DCP / PIVKA-II', unit: 'mAU/mL' },
    ],
  },
  {
    id: 'toronto-hcc-risk',
    summary: 'Toronto HCC Risk Index (THRI; Sharma 2017) — a validated score for 10-year HCC risk in cirrhosis from age, sex, cirrhosis etiology, and platelet count (total 0-366). Age <45/45-60/>60 = 0/50/100; etiology autoimmune or HCV-SVR = 0, other = 36, steatohepatitis = 54, HCV or HBV = 97; male = 80; platelets >200/140-200/80-139/<80 = 0/20/70/89 (x10^9/L). Bands: low < 120 (~3% 10-year HCC), medium 120-240 (~10%), high > 240 (~32%). A surveillance-risk category, not a surveillance-interval order.',
    compute: F.torontoHccRisk,
    fields: [
      { dom: 'thri-age', arg: 'age', kind: 'number', required: true, label: 'Age', unit: 'years' },
      { dom: 'thri-sex', arg: 'sex', kind: 'enum', values: ['male', 'female'], required: true, label: 'Sex' },
      { dom: 'thri-etiology', arg: 'etiology', kind: 'enum', values: ['hbv', 'hcv', 'steatohepatitis', 'other', 'hcv-svr', 'autoimmune'], required: true, label: 'Cirrhosis etiology' },
      { dom: 'thri-plt', arg: 'platelets', kind: 'number', required: true, label: 'Platelet count', unit: '10^9/L' },
    ],
  },
];

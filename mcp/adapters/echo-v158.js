// spec-v183 MCP wave 7: adapters for the five lib/echo-v158.js echocardiography
// measures (LV mass index + geometry, LA volume index, Teichholz LVEF, RVSP /
// PASP from the TR jet, and E/e'). dom keys mirror views/group-v158.js; the
// linear / area / velocity inputs are numbers, and sex / RAP / e'-site are enums.

import * as F from '../../lib/echo-v158.js';

export default [
  {
    id: 'lv-mass-index',
    summary: 'LV mass (Devereux 1986) indexed to BSA, with relative wall thickness and the four-pattern ASE/EACVI geometry classification (Lang 2015).',
    compute: F.lvMassIndex,
    fields: [
      { dom: 'lvmi-lvidd', arg: 'lvidd', kind: 'number', required: true, label: 'LV internal diameter, end-diastole (LVIDd)', unit: 'cm' },
      { dom: 'lvmi-pwtd', arg: 'pwtd', kind: 'number', required: true, label: 'Posterior-wall thickness, diastole (PWTd)', unit: 'cm' },
      { dom: 'lvmi-ivsd', arg: 'ivsd', kind: 'number', required: true, label: 'Septal-wall thickness, diastole (IVSd)', unit: 'cm' },
      { dom: 'lvmi-bsa', arg: 'bsa', kind: 'number', required: true, label: 'Body surface area', unit: 'm^2' },
      { dom: 'lvmi-sex', arg: 'sex', kind: 'enum', values: ['male', 'female'], required: true, label: 'Sex' },
    ],
  },
  {
    id: 'la-volume-index',
    summary: 'Left-atrial volume index by the biplane area-length method with the ASE severity bands (Lang 2015).',
    compute: F.laVolumeIndex,
    fields: [
      { dom: 'lavi-a1', arg: 'a1', kind: 'number', required: true, label: 'Apical 4-chamber LA area', unit: 'cm^2' },
      { dom: 'lavi-a2', arg: 'a2', kind: 'number', required: true, label: 'Apical 2-chamber LA area', unit: 'cm^2' },
      { dom: 'lavi-l', arg: 'l', kind: 'number', required: true, label: 'LA length (shorter of the two)', unit: 'cm' },
      { dom: 'lavi-bsa', arg: 'bsa', kind: 'number', required: true, label: 'Body surface area', unit: 'm^2' },
    ],
  },
  {
    id: 'teichholz-lvef',
    summary: 'Teichholz LVEF and fractional shortening from linear LV dimensions, with the sex-specific ASE normal cutoffs (Teichholz 1976; ASE 2015).',
    compute: F.teichholzLvef,
    fields: [
      { dom: 'teich-lvidd', arg: 'lvidd', kind: 'number', required: true, label: 'LV internal diameter, end-diastole (LVIDd)', unit: 'cm' },
      { dom: 'teich-lvids', arg: 'lvids', kind: 'number', required: true, label: 'LV internal diameter, end-systole (LVIDs)', unit: 'cm' },
      { dom: 'teich-sex', arg: 'sex', kind: 'enum', values: ['male', 'female'], required: true, label: 'Sex' },
    ],
  },
  {
    id: 'rvsp-pasp',
    summary: 'RV systolic pressure / PASP from the tricuspid-regurgitation jet velocity (4v^2 + RAP, simplified Bernoulli) (Yock 1984).',
    compute: F.rvspPasp,
    fields: [
      { dom: 'rvsp-vmax', arg: 'trVmax', kind: 'number', required: true, label: 'Peak TR jet velocity', unit: 'm/s' },
      { dom: 'rvsp-rap', arg: 'rap', kind: 'enum', values: ['3', '8', '15'], required: true, label: 'Estimated right-atrial pressure (from IVC)', unit: 'mmHg' },
    ],
  },
  {
    id: 'mitral-e-e-prime',
    summary: 'E/e′ as an LV diastolic filling-pressure estimate, by the averaged or single-site cutoff (Nagueh 2016).',
    compute: F.mitralEePrime,
    fields: [
      { dom: 'ee-e', arg: 'e', kind: 'number', required: true, label: 'Mitral-inflow early-diastolic velocity (E)', unit: 'cm/s' },
      { dom: 'ee-eprime', arg: 'ePrime', kind: 'number', required: true, label: 'Tissue-Doppler e′ velocity', unit: 'cm/s' },
      { dom: 'ee-site', arg: 'site', kind: 'enum', values: ['septal', 'lateral', 'average'], required: true, label: 'e′ site' },
    ],
  },
];

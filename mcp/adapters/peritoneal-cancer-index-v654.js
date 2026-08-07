// spec-v654 MCP adapter: Peritoneal Cancer Index in lib/peritoneal-cancer-index-v654.js.
// The dom keys mirror the browser renderer (views/group-v654.js) and
// META['peritoneal-cancer-index'].example. Thirteen regions each a 0-3 lesion-size
// enum (optional; empty defaults to LS-0); sum 0-39. Selection thresholds are tumor-
// specific and advisory, not a verdict. Clinical domain.

import { peritonealCancerIndex } from '../../lib/peritoneal-cancer-index-v654.js';

const REGION_META = [
  ['pci-r0', 'r0', 'Central'], ['pci-r1', 'r1', 'Right upper'], ['pci-r2', 'r2', 'Epigastrium'],
  ['pci-r3', 'r3', 'Left upper'], ['pci-r4', 'r4', 'Left flank'], ['pci-r5', 'r5', 'Left lower'],
  ['pci-r6', 'r6', 'Pelvis'], ['pci-r7', 'r7', 'Right lower'], ['pci-r8', 'r8', 'Right flank'],
  ['pci-r9', 'r9', 'Upper jejunum'], ['pci-r10', 'r10', 'Lower jejunum'],
  ['pci-r11', 'r11', 'Upper ileum'], ['pci-r12', 'r12', 'Lower ileum'],
];

export default [
  {
    id: 'peritoneal-cancer-index',
    summary: 'Peritoneal Cancer Index (Jacquet-Sugarbaker): 13 abdominopelvic regions each scored 0-3 by lesion size (0 none, 1 <=0.5 cm, 2 <=5 cm, 3 >5 cm or confluence), summed 0-39. Higher = greater tumor burden. Selection cutoffs are tumor-specific and advisory.',
    compute: peritonealCancerIndex,
    fields: REGION_META.map(([dom, arg, label]) => ({
      dom, arg, kind: 'enum', values: ['0', '1', '2', '3'], required: false,
      label: `${label} region lesion size (0 none, 1 <=0.5 cm, 2 <=5 cm, 3 >5 cm/confluence)`,
    })),
  },
];

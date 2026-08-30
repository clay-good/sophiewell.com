// spec-v602 MCP wave: adapter for the Virginia Radiosurgery AVM Scale in lib/vras-v602.js. The dom keys
// mirror the browser renderer (views/group-v602.js) and META['vras'].example.
//
// **THE SCALE HAS FIVE VALUES BUT ONLY THREE PUBLISHED OUTCOME BANDS.** Favorable outcome is reported for
// 0-to-1, for 2, and for 3-to-4, so A SCORE OF 0 AND A SCORE OF 1 SHARE THE SAME FIGURE, as do 3 and 4. The
// scale is FINER THAN THE EVIDENCE BEHIND IT - never invent a per-score rate.
//
// **VOLUME IS THE ONLY GRADED ITEM AND CARRIES HALF THE SCALE** (0/1/2 against 1 each for eloquence and
// prior hemorrhage). A LARGE AVM WITH NEITHER OTHER FEATURE SCORES 2, EXACTLY LIKE A TINY ELOQUENT AVM THAT
// HAS BLED - the two are indistinguishable here.
//
// **THE VOLUME ITEM SATURATES AT 4 CUBIC CENTIMETERS.** Above it every malformation scores the same 2
// points, so a 5 cm^3 and a 40 cm^3 AVM are IDENTICAL on this scale. In `pollock-flickinger` volume is
// LINEAR AND UNBOUNDED at 0.1 per cm^3, so those same two differ by 3.5 points there.
// `companionVolumeContribution` returns that comparison value and `volumeSaturated` flags the case.
//
// **THE TWO SCALES SHARE ONLY VOLUME**: this uses eloquence and PRIOR HEMORRHAGE, the companion uses AGE and
// a location TIER. They can rank two patients in OPPOSITE orders, and NEITHER SCORE CONVERTS INTO THE OTHER.
//
// **"FAVORABLE OUTCOME" IS A COMPOSITE OF THREE CONDITIONS THAT MUST ALL HOLD**: obliteration, AND no
// post-treatment hemorrhage, AND no permanent symptomatic radiation-induced complication. A rate against it
// is NOT the obliteration rate.

import * as V from '../../lib/vras-v602.js';

export default [
  {
    id: 'vras',
    summary: `The VIRGINIA RADIOSURGERY AVM SCALE (Starke and colleagues 2013) predicts the outcome of stereotactic radiosurgery for a brain arteriovenous malformation, scoring 0 to ${V.VRAS_MAX}: ${V.VOLUME_BANDS.map((b) => `volume ${b.text} = ${b.points}`).join('; ')}; eloquent location = ${V.ELOQUENCE_POINTS}; prior hemorrhage = ${V.HEMORRHAGE_POINTS}. REPORTED FAVORABLE OUTCOME: ${V.OUTCOME_BANDS.map((b) => `score ${b.label} = ${b.favorablePercent} percent`).join('; ')}. **THE SCALE HAS ${V.VRAS_MAX + 1} VALUES BUT ONLY ${V.OUTCOME_BANDS.length} PUBLISHED OUTCOME BANDS** - a 0 and a 1 share a figure, as do a 3 and a 4 - so the scale is FINER THAN THE EVIDENCE BEHIND IT and a per-score rate must NEVER be invented. **VOLUME IS THE ONLY GRADED ITEM AND CARRIES HALF THE SCALE**: a large AVM with neither other feature scores 2, EXACTLY like a tiny eloquent AVM that has bled, and the two are indistinguishable here. **THE VOLUME ITEM SATURATES AT ${V.VOLUME_LARGE_MIN} CUBIC CENTIMETERS** - above it every malformation scores the same 2 points, so a 5 cm^3 and a 40 cm^3 AVM are IDENTICAL on this scale, while in \`pollock-flickinger\` volume is LINEAR AND UNBOUNDED at ${V.COMPANION_VOLUME_COEFFICIENT} per cm^3 and those same two differ by 3.5 points. \`companionVolumeContribution\` returns that comparison value and \`volumeSaturated\` flags the case. **THE TWO SCALES SHARE ONLY VOLUME**: this uses eloquence and PRIOR HEMORRHAGE while the companion uses AGE and a location TIER, so they can rank two patients in OPPOSITE orders and **NEITHER SCORE CONVERTS INTO THE OTHER**. **"FAVORABLE OUTCOME" IS A COMPOSITE OF THREE CONDITIONS THAT MUST ALL HOLD**: ${V.FAVORABLE_DEFINITION} A reported rate against it is NOT the obliteration rate. This predicts the outcome of RADIOSURGERY at a GROUP level for a patient in whom radiosurgery is ALREADY being considered. It does NOT choose between radiosurgery, microsurgery, embolization and observation - and **observation is a real option, since the ARUBA trial found medical management superior to intervention for UNRUPTURED malformations** over its follow-up. It does NOT plan a dose or a target volume, does NOT estimate rupture risk without treatment, and a favorable score is NOT by itself an indication to treat.`,
    compute: V.vras,
    fields: [
      { dom: 'vras-volume', arg: 'volume', kind: 'number', unit: 'cm^3', required: true, label: `AVM volume. Banded, not continuous: ${V.VOLUME_BANDS.map((b) => `${b.text} = ${b.points}`).join('; ')}. IT SATURATES above ${V.VOLUME_LARGE_MIN} cm^3.` },
      { dom: 'vras-eloquent', arg: 'eloquentLocation', kind: 'enum', values: ['no', 'yes'], required: true, label: `Eloquent location. ${V.ELOQUENCE_POINTS} point - half the weight volume can carry.` },
      { dom: 'vras-hemorrhage', arg: 'priorHemorrhage', kind: 'enum', values: ['no', 'yes'], required: true, label: `Prior hemorrhage. ${V.HEMORRHAGE_POINTS} point. The companion score does not use this variable at all.` },
    ],
  },
];

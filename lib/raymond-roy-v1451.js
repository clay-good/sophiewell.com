// spec-v1451: Raymond-Roy occlusion classification of coiled intracranial aneurysms, with the
// modified (MRRC) subclasses of a residual aneurysm.
//
// Sources, read 2026-09-24:
//   Roy D, Milot G, Raymond J. Endovascular treatment of unruptured aneurysms. Stroke
//     2001;32(9):1998-2004 (PubMed 11546888) -- the original three classes.
//   Mascitelli JR, Moyle H, Oermann EK, et al. An update to the Raymond-Roy Occlusion Classification
//     of intracranial aneurysms treated with coil embolization. J Neurointerv Surg 2015;7(7):496-502
//     (PubMed 24898735) -- the IIIa/IIIb update. Neither is open access.
//   Beaman C, Patel SD, Nael K, Colby GP, Liebeskind DS. Imaging of intracranial saccular aneurysms.
//     Stroke Vasc Interv Neurol 2023;3(5):e000757 (PMC12778686), which tabulates both in its text:
//       "class I, complete aneurysm occlusion; class II, residual aneurysm neck; and class III,
//        residual aneurysm."
//       The 2015 update was "developed on the basis of retrospective data from 370 patients with
//       390 aneurysms" and added "class IIIa, residual aneurysm with contrast within coil
//       interstices; and class IIIb, residual aneurysm with contrast along aneurysm wall."
//       "compared with class IIIa aneurysms, class IIIb aneurysms were less likely to improve over
//        time (14.89% versus 83.34%; P <0.001), were more likely to remain incompletely occluded
//        (85.11% versus 16.67%; P <0.001), and had a trend toward higher subsequent rupture rate
//        (3.23% versus 0.00%; P =0.068), results that have been validated in an external cohort."
//       "the modified Raymond-Roy classification is inherently inadequate for the evaluation of
//        flow-diverted aneurysms" (the O'Kelly-Marotta scale was built for those).
//
// The class is DERIVED from what the angiogram shows: where contrast fills (nothing, the neck, the
// sac), then, for a residual sac, where the contrast sits. Pure: no DOM, no clock, no network.

export const RR_FILLING = [
  { value: 'none', text: 'No contrast filling of the aneurysm' },
  { value: 'neck', text: 'Contrast fills the neck only' },
  { value: 'sac', text: 'Contrast fills part of the aneurysm sac (residual aneurysm)' },
];
export const RR_LOCATION = [
  { value: 'interstices', text: 'Within the coil interstices' },
  { value: 'wall', text: 'Along the aneurysm wall' },
];

const WORDS = {
  I: 'complete aneurysm occlusion',
  II: 'residual aneurysm neck',
  III: 'residual aneurysm',
  IIIa: 'residual aneurysm with contrast within the coil interstices',
  IIIb: 'residual aneurysm with contrast along the aneurysm wall',
};

const pick = (list, v) => (list.some((x) => x.value === v) ? v : null);

export function raymondRoy(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const filling = pick(RR_FILLING, o.filling);
  const location = pick(RR_LOCATION, o.location);

  if (!filling) return { valid: false, message: 'Choose where contrast fills the coiled aneurysm on the angiogram.' };

  const notes = [];
  let cls;
  if (filling === 'none') cls = 'I';
  else if (filling === 'neck') cls = 'II';
  else if (!location) cls = 'III';
  else cls = location === 'wall' ? 'IIIb' : 'IIIa';

  if (filling !== 'sac' && location) {
    notes.push(`Where the contrast sits applies only to a residual aneurysm (class III); it was not used for class ${cls}.`);
  }
  if (cls === 'III') {
    notes.push('Choose where the residual contrast sits (within the coil interstices or along the aneurysm wall) to give the modified subclass, IIIa or IIIb.');
  }
  if (cls === 'IIIa' || cls === 'IIIb') {
    notes.push('In the 2015 study, compared with IIIa, IIIb aneurysms were less likely to improve over time (14.89% vs 83.34%), more likely to remain incompletely occluded (85.11% vs 16.67%), and had a trend toward a higher later rupture rate (3.23% vs 0.00%, P = 0.068); these results were validated in an external cohort.');
  }
  notes.push('The scale was built for coiled aneurysms and is inadequate for flow-diverted aneurysms. The class describes the angiogram; it does not decide follow-up or retreatment.');

  return {
    valid: true,
    abnormal: cls !== 'I',
    class: cls,
    band: `Raymond-Roy class ${cls}: ${WORDS[cls]}.`,
    bandLabel: `Class ${cls}`,
    notes,
    note: 'Roy D et al, Stroke 2001 (classes I to III); Mascitelli JR et al, J Neurointerv Surg 2015 (IIIa and IIIb, from 390 aneurysms); as described by Beaman C et al, Stroke Vasc Interv Neurol 2023.',
  };
}

// spec-v1242: the endoleak classification after endovascular aneurysm repair -- derived from the
// finding rather than asked for.
//
// Sources:
//   White GH, May J, Waugh RC, Chaufour X, Yu W. Type III and type IV endoleak: toward a complete
//   definition of blood flow in the sac after endoluminal AAA repair. J Endovasc Surg. 1998;
//   5(4):305-309. PMID 9867318 -- the paper that completes the type I to IV definition.
//   Lombardi JV, Hughes GC, Appoo JJ, et al. SVS/STS reporting standards. J Vasc Surg. 2020;
//   71(3):723-747. PMID 32001058 -- the reporting vocabulary the subtypes are written in.
//
// The five types, by MECHANISM, which is what the classification is actually about:
//
//   Ia   flow past the PROXIMAL attachment site
//   Ib   flow past the DISTAL attachment site
//   Ic   flow past an iliac occluder plug in an aorto-uni-iliac repair
//   IIa  retrograde flow from ONE branch vessel (lumbar, inferior mesenteric, hypogastric)
//   IIb  retrograde flow from TWO OR MORE branch vessels
//   IIIa separation of modular components
//   IIIb a tear or fracture in the graft fabric
//   IV   graft porosity, early after implantation
//   V    sac growth with no demonstrable leak (endotension)
//
// THE DIVISION THAT MATTERS IS NOT I TO V, IT IS PRESSURE. Types I and III put systemic pressure
// straight into the sac and are the ones treated promptly; type II is usually low pressure and is
// often watched; type IV is self-limiting and belongs to the first weeks. Numbering them 1 to 5
// suggests a ladder of severity, and a type II sitting between two urgent types is exactly where
// that reading goes wrong. This tile prints the pressure class beside the numeral.
//
// A TYPE V IS A DIAGNOSIS OF EXCLUSION AND THE EXCLUSION IS THE HARD PART. Sac growth with no leak
// seen is, often enough, a leak that has not been seen yet. The tile says that where it is read.
//
// Pure: no DOM, no clock, no network.

export const ENDOLEAK_NOTE = 'An endoleak is continued perfusion of the aneurysm sac after endovascular repair, and the classification describes the mechanism rather than the severity. Types I and III deliver systemic pressure to the sac directly and are the ones acted on; type II is retrograde branch flow and is usually lower pressure; type IV is graft porosity in the first weeks; type V is sac growth with no leak demonstrated. The numbering is not a ladder, which is why the pressure class is reported beside it. It describes the finding entered; it is not a decision to reintervene.';

// The findings a reader has, in the order a report states them.
export const ENDOLEAK_FINDINGS = [
  { value: 'proximal-attachment', text: 'Flow past the proximal attachment site', type: 'Ia' },
  { value: 'distal-attachment', text: 'Flow past the distal attachment site', type: 'Ib' },
  { value: 'iliac-occluder', text: 'Flow past an iliac occluder plug (aorto-uni-iliac repair)', type: 'Ic' },
  { value: 'one-branch', text: 'Retrograde flow from one branch vessel', type: 'IIa' },
  { value: 'several-branches', text: 'Retrograde flow from two or more branch vessels', type: 'IIb' },
  { value: 'component-separation', text: 'Separation of modular graft components', type: 'IIIa' },
  { value: 'fabric-tear', text: 'A tear or fracture in the graft fabric', type: 'IIIb' },
  { value: 'graft-porosity', text: 'Diffuse blush through the graft early after implantation', type: 'IV' },
  { value: 'sac-growth-no-leak', text: 'Sac growth with no leak demonstrated on imaging', type: 'V' },
];

const BY_FINDING = new Map(ENDOLEAK_FINDINGS.map((f) => [f.value, f]));

const TYPE_DETAIL = {
  Ia: { family: 'I', pressure: 'high', mechanism: 'the graft is not sealing against the aortic wall at the proximal landing zone' },
  Ib: { family: 'I', pressure: 'high', mechanism: 'the graft is not sealing at the distal landing zone' },
  Ic: { family: 'I', pressure: 'high', mechanism: 'the iliac occluder is not sealing' },
  IIa: { family: 'II', pressure: 'low', mechanism: 'a single branch vessel is filling the sac backwards' },
  IIb: { family: 'II', pressure: 'low', mechanism: 'two or more branch vessels are filling the sac backwards' },
  IIIa: { family: 'III', pressure: 'high', mechanism: 'the modular components have separated and the sac is exposed to graft flow' },
  IIIb: { family: 'III', pressure: 'high', mechanism: 'the fabric itself has torn and the sac is exposed to graft flow' },
  IV: { family: 'IV', pressure: 'low', mechanism: 'blood is crossing the fabric through its own porosity' },
  V: { family: 'V', pressure: 'unknown', mechanism: 'the sac is enlarging and no leak has been demonstrated' },
};

const PRESSURE_TEXT = {
  high: 'This is a high-pressure endoleak: systemic pressure reaches the sac directly, which is the group treated promptly rather than watched.',
  low: 'This is a low-pressure endoleak. Low pressure is not no pressure, and it is a reason these are commonly followed rather than a reason they are ignored.',
  unknown: 'The pressure in the sac is the whole question here and it is not answered by imaging that shows no leak.',
};

export function endoleakType(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = o.finding == null ? '' : String(o.finding).trim();
  if (raw === '') {
    return { valid: false, message: 'Say what the imaging shows. The type follows from the mechanism, and there is no default: a sac that is growing with no leak seen is a different finding from a sac with no leak and no growth.' };
  }
  const finding = BY_FINDING.get(raw);
  if (!finding) {
    return { valid: false, message: `The finding must be one of: ${ENDOLEAK_FINDINGS.map((f) => f.value).join(', ')}.` };
  }

  const type = finding.type;
  const detail = TYPE_DETAIL[type];

  return {
    valid: true,
    type,
    family: detail.family,
    pressure: detail.pressure,
    abnormal: detail.pressure === 'high',
    bandLabel: `Type ${type} endoleak`,
    band: `Type ${type} endoleak: ${detail.mechanism}. ${PRESSURE_TEXT[detail.pressure]}`,
    ladderNote: 'The numbering is a list of mechanisms, not a ladder of severity. Type II sits between the two high-pressure types and is the one most often watched, so reading the numeral as a rank gets the order of urgency wrong.',
    exclusionNote: type === 'V'
      ? 'A type V is a diagnosis of exclusion, and the exclusion is the hard part: a growing sac with no leak seen is often a leak that has not been seen yet. The finding is that nothing was demonstrated, not that nothing is there.'
      : null,
    earlyNote: type === 'IV'
      ? 'Type IV belongs to the first weeks after implantation and to older, more porous fabrics. A blush seen months later is more likely to be one of the other types looked at once.'
      : null,
    postureNote: 'Decision support, not a verdict. The type names the mechanism; whether and when to reintervene stays with the vascular team and the sac behavior over time.',
    note: ENDOLEAK_NOTE,
  };
}

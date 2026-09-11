// spec-v1242: the Stanford classification of aortic dissection, the DeBakey type it corresponds to,
// and, for a type B, whether it is complicated.
//
// Sources:
//   Daily PO, Trueblood HW, Stinson EB, Wuerflein RD, Shumway NE. Management of acute aortic
//   dissections. Ann Thorac Surg. 1970;10(3):237-247. PMID 5458238 -- the Stanford classification.
//   Lombardi JV, Hughes GC, Appoo JJ, et al. Society for Vascular Surgery and Society of Thoracic
//   Surgeons reporting standards for type B aortic dissection. J Vasc Surg. 2020;71(3):723-747.
//   PMID 32001058 -- the complicated / high-risk / uncomplicated split.
//
// STANFORD ASKS ONE QUESTION: is the ascending aorta involved? If it is, the dissection is a type A
// and it is a surgical emergency wherever the entry tear sits. If it is not, it is a type B.
//
// THE BRANCH THIS IS READ WRONGLY ON: "TYPE B" DOES NOT MEAN "DESCENDING ONLY". A dissection that
// involves the arch but spares the ascending aorta is a Stanford B, and a reader who has learned
// type B as "the descending one" will picture an aorta that is not the one in front of them. This
// tile prints the arch involvement separately from the letter.
//
// DEBAKEY IS ALREADY IN THIS CATALOG and asks a different question -- where the dissection STARTS and
// how far it runs -- so the two do not carry the same information. DeBakey I and II are both Stanford
// A; DeBakey III is Stanford B. The reverse mapping is not one-to-one, which is why this tile reports
// a DeBakey type only when the extent entered determines one.
//
// Pure: no DOM, no clock, no network.

export const STANFORD_NOTE = 'The Stanford classification (Daily 1970) asks one question: does the dissection involve the ascending aorta? If it does it is a type A, whatever the entry tear is doing; if it does not it is a type B. Type B is not a synonym for "descending only" -- a dissection involving the arch but sparing the ascending aorta is a type B. For a type B, the SVS/STS reporting standards (Lombardi 2020) separate complicated from high-risk and uncomplicated, because that split, not the letter, is what the management turns on. It describes the anatomy entered; it is not a diagnosis and not an operative plan.';

// The segments, proximal to distal. `ascending` is the one the letter turns on.
export const AORTIC_SEGMENTS = [
  { key: 'ascending', label: 'Ascending aorta (root to the innominate artery)' },
  { key: 'arch', label: 'Aortic arch (innominate to the left subclavian artery)' },
  { key: 'descending', label: 'Descending thoracic aorta (above the diaphragm)' },
  { key: 'abdominal', label: 'Abdominal aorta (below the diaphragm)' },
];

// Lombardi 2020: the findings that make a type B complicated, and the ones that make it high-risk.
export const TYPE_B_COMPLICATED = [
  { key: 'rupture', label: 'Rupture, or periaortic hematoma' },
  { key: 'malperfusion', label: 'Malperfusion (visceral, renal, limb, or spinal cord)' },
];
export const TYPE_B_HIGH_RISK = [
  { key: 'refractory', label: 'Refractory pain or refractory hypertension' },
  { key: 'earlyExpansion', label: 'Early aortic expansion, or an aortic diameter over 40 mm' },
  { key: 'bloodyEffusion', label: 'Bloody pleural effusion' },
];

function on(v) {
  return v === true || v === 'true' || v === 'yes' || v === 1 || v === '1';
}

export function stanfordDissection(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const seg = Object.fromEntries(AORTIC_SEGMENTS.map((s) => [s.key, on(o[s.key])]));
  const involved = AORTIC_SEGMENTS.filter((s) => seg[s.key]);

  // No segment ticked is not "no dissection". Stanford has no letter for an aorta nobody has looked
  // at, and answering "type B" from an empty form would be the most reassuring reading of nothing.
  if (involved.length === 0) {
    return {
      valid: false,
      message: 'Tick the aortic segments the dissection involves. Nothing ticked is not a type B: it is a study that has not said where the dissection is.',
    };
  }

  const type = seg.ascending ? 'A' : 'B';

  // DeBakey, where the extent entered determines one.
  let debakey = null;
  if (seg.ascending && (seg.arch || seg.descending || seg.abdominal)) debakey = 'I';
  else if (seg.ascending) debakey = 'II';
  else if (seg.descending || seg.abdominal) debakey = seg.abdominal ? 'IIIb' : 'IIIa';

  const complicated = TYPE_B_COMPLICATED.filter((c) => on(o[c.key]));
  const highRisk = TYPE_B_HIGH_RISK.filter((c) => on(o[c.key]));

  const typeBStatus = type === 'B'
    ? (complicated.length ? 'complicated' : (highRisk.length ? 'high-risk uncomplicated' : 'uncomplicated'))
    : null;

  const band = type === 'A'
    ? `Stanford type A: the dissection involves the ascending aorta. That is the type treated as a surgical emergency, and the letter does not depend on where the entry tear is or on how far distally the dissection runs.`
    : `Stanford type B, ${typeBStatus}: the ascending aorta is not involved. ${
        typeBStatus === 'complicated'
          ? `Complicated by ${complicated.map((c) => c.label.toLowerCase()).join(' and ')}.`
          : typeBStatus === 'high-risk uncomplicated'
            ? `No rupture and no malperfusion, but ${highRisk.map((c) => c.label.toLowerCase()).join(' and ')}.`
            : 'No rupture, no malperfusion, and none of the high-risk features recorded.'
      }`;

  // The sentence the letter hides.
  const archNote = type === 'B' && seg.arch
    ? 'The arch is involved and the ascending aorta is not, so this is a type B. "Type B" is often read as "descending only", and this dissection is not that -- the arch involvement is part of the anatomy the operator needs and the letter does not carry it.'
    : null;

  const debakeyNote = debakey
    ? `DeBakey ${debakey}. DeBakey asks where the dissection starts and how far it runs; Stanford asks only whether the ascending aorta is involved. DeBakey I and II are both Stanford A, and DeBakey III is Stanford B, so the two are not interchangeable descriptions.`
    : 'The segments entered do not determine a DeBakey type on their own, so none is reported. DeBakey turns on where the dissection starts, which is a separate observation from which segments it reaches.';

  const uncomplicatedNote = typeBStatus === 'uncomplicated'
    ? 'Uncomplicated here means none of the listed findings was recorded. It is not a statement that they were looked for, and the split between uncomplicated and high-risk is the one the management turns on rather than the letter.'
    : null;

  return {
    valid: true,
    type,
    debakey,
    segments: involved.map((s) => s.key),
    typeBStatus,
    complicated: complicated.map((c) => c.key),
    highRisk: highRisk.map((c) => c.key),
    abnormal: type === 'A' || typeBStatus === 'complicated',
    bandLabel: `Stanford type ${type}`,
    band,
    archNote,
    debakeyNote,
    uncomplicatedNote,
    postureNote: 'Decision support, not a verdict. The letter describes the anatomy entered; the operation, its timing and its route stay with the aortic team.',
    note: STANFORD_NOTE,
  };
}

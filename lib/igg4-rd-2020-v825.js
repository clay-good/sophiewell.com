// spec-v825: 2020 revised comprehensive diagnostic (RCD) criteria for IgG4-related disease.
//
// Sources:
//   Umehara H, Okazaki K, Kawa S, et al. The 2020 revised comprehensive diagnostic (RCD)
//     criteria for IgG4-RD. Mod Rheumatol. 2021;31(3):529-533. (PMID 33274670.)
//   Umehara H, Okazaki K, Masaki Y, et al. Comprehensive diagnostic criteria for IgG4-related
//     disease (IgG4-RD), 2011. Mod Rheumatol. 2012;22(1):21-30. (The version this replaces.)
//
// THE THREE ITEMS:
//   1  clinical and radiological: one or more organs showing diffuse or localized swelling,
//      a mass or a nodule characteristic of IgG4-RD. In SINGLE-organ involvement, lymph node
//      swelling is omitted - lymphadenopathy alone does not satisfy this item.
//   2  serological: elevated serum IgG4.
//   3  pathological: TWO of three sub-items -
//        (a) dense lymphocyte and plasma cell infiltration with fibrosis
//        (b) an IgG4+/IgG+ cell ratio above 40% AND more than 10 IgG4+ cells per high-power
//            field
//        (c) typical tissue fibrosis, particularly storiform fibrosis, or obliterative
//            phlebitis
//
//   Definite = 1 + 2 + 3.  Probable = 1 + 3.  Possible = 1 + 2.
//
// THIS IS THE 2020 VERSION AND THE PATHOLOGY ITEM IS WHERE IT DIFFERS. The 2011 criteria
// leaned on the IgG4 immunostain; the 2020 revision requires two of three sub-items and adds
// storiform fibrosis or obliterative phlebitis as a third route, precisely so that a biopsy
// with poor immunostaining can still carry the pathological item. A tool implementing the
// pathology item as "the IgG4 count" alone reproduces the problem the revision was written to
// fix.
//
// AND "POSSIBLE" IS THE WEAK ONE, not a mild version of definite. It is items 1 + 2 - organ
// swelling plus a raised serum IgG4, with no tissue at all. Serum IgG4 rises in malignancy,
// infection and other autoimmune disease, so this category is the one where a mimic is most
// likely to be sitting.
//
// Pure: no DOM, no clock, no network.

export const IGG4_NOTE = 'The 2020 revised comprehensive diagnostic criteria for IgG4-related disease (Umehara H, Okazaki K, Kawa S, et al, Mod Rheumatol 2021;31(3):529-533) rest on three items: one or more organs showing diffuse or localized swelling, a mass or a nodule characteristic of the disease, with lymph node swelling not counting where only one organ is involved; an elevated serum IgG4 concentration around 135 milligrams per deciliter; and a pathological item needing two of three sub-items, namely dense lymphocyte and plasma cell infiltration with fibrosis, an IgG4-positive to IgG-positive cell ratio above 40 percent together with more than ten IgG4-positive cells per high-power field, and typical tissue fibrosis of storiform type or obliterative phlebitis. All three items together are definite, the first and third are probable, and the first and second are possible. Two points matter. The pathological item is the part the 2020 revision changed: requiring two of three and admitting storiform fibrosis or obliterative phlebitis lets a biopsy with poor immunostaining still carry it, so treating that item as the IgG4 cell count alone reproduces the problem the revision fixed. And possible is the weak category rather than a mild form of the disease, since it rests on swelling plus a raised serum level with no tissue at all, and serum IgG4 rises in malignancy, infection and other autoimmune disease. It applies published criteria to findings already gathered and it does not start corticosteroids or rituximab, nor does it exclude the malignancy these criteria assume has been considered.';

export const IGG4_THRESHOLD = 135; // mg/dL
export const MAX_IGG4 = 100000;

function truthy(v) { return v === true || v === 'true' || v === 1 || v === '1' || v === 'on' || v === 'yes'; }
function num(v) {
  if (v === '' || v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export function igg4Rd2020(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const igg4 = num(o.serumIgg4);
  if (igg4 !== null && (igg4 < 0 || igg4 > MAX_IGG4)) {
    return { valid: false, message: `Serum IgG4 must be between 0 and ${MAX_IGG4} mg/dL.` };
  }

  // Item 1. Lymph node swelling alone does not satisfy single-organ involvement.
  const organSwelling = truthy(o.organSwelling);
  const lymphNodesOnly = truthy(o.lymphNodesOnly);
  const item1 = organSwelling && !lymphNodesOnly;

  const lymphNote = organSwelling && lymphNodesOnly
    ? 'Where only one organ is involved, the criteria omit lymph node swelling, so lymphadenopathy on its own does not satisfy item 1.'
    : null;

  // Item 2.
  const item2 = igg4 !== null && igg4 >= IGG4_THRESHOLD;
  // Published forms of this threshold differ at exactly 135: some write "at or above 135",
  // others "above 135". Say so rather than pick silently.
  const thresholdNote = igg4 === IGG4_THRESHOLD
    ? `A serum IgG4 of exactly ${IGG4_THRESHOLD} mg/dL sits on the boundary, and published statements of this threshold differ there: some read "at or above ${IGG4_THRESHOLD}" and some "above ${IGG4_THRESHOLD}". It is counted as elevated here; treat the serological item as unsettled at this value.`
    : null;

  // Item 3: two of three sub-items.
  const sub = [
    { arg: 'denseInfiltrate', text: 'dense lymphocyte and plasma cell infiltration with fibrosis' },
    { arg: 'igg4Ratio', text: 'an IgG4+/IgG+ ratio above 40 percent with more than 10 IgG4+ cells per high-power field' },
    { arg: 'storiformFibrosis', text: 'storiform fibrosis or obliterative phlebitis' },
  ];
  const subPresent = sub.filter((s) => truthy(o[s.arg]));
  const item3 = subPresent.length >= 2;

  // The 2020 change, said out loud when it is doing work.
  const pathologyNote = subPresent.length === 1 && truthy(o.igg4Ratio)
    ? 'The pathological item needs TWO of its three sub-items, not the IgG4 cell count alone. The 2020 revision added storiform fibrosis or obliterative phlebitis as a third route precisely so a biopsy with poor immunostaining can still carry this item.'
    : (item3 && !truthy(o.igg4Ratio)
      ? 'The pathological item is carried here without the IgG4 immunostain, which is what the 2020 revision made possible by admitting storiform fibrosis or obliterative phlebitis as a sub-item.'
      : null);

  let category = null;
  if (item1 && item2 && item3) category = 'Definite IgG4-related disease';
  else if (item1 && item3) category = 'Probable IgG4-related disease';
  else if (item1 && item2) category = 'Possible IgG4-related disease';

  const possibleWarning = category === 'Possible IgG4-related disease'
    ? 'Possible is the weakest category, not a mild form. It rests on organ swelling plus a raised serum IgG4 with no tissue at all, and serum IgG4 also rises in malignancy, infection and other autoimmune disease - which is exactly where a mimic would sit.'
    : null;

  const missing = [];
  if (!item1) missing.push('item 1, characteristic organ swelling, a mass or a nodule');
  if (!item2) missing.push(`item 2, a serum IgG4 of ${IGG4_THRESHOLD} mg/dL or more`);
  if (!item3) missing.push('item 3, two of the three pathological sub-items');

  return {
    valid: true,
    category,
    criteriaMet: !!category,
    items: { one: item1, two: item2, three: item3 },
    pathologySubItems: subPresent.map((s) => s.text),
    lymphNote,
    thresholdNote,
    pathologyNote,
    possibleWarning,
    missing,
    abnormal: !!category,
    bandLabel: category || 'No RCD category met',
    band: category
      ? `${category} — items ${[item1 ? '1' : null, item2 ? '2' : null, item3 ? '3' : null].filter(Boolean).join(' + ')}.`
      : `No category under the 2020 revised criteria — outstanding: ${missing.join('; ')}.`,
    detail: `Definite is items 1 + 2 + 3; probable is 1 + 3; possible is 1 + 2. The pathological item needs TWO of its three sub-items. These are the 2020 revised criteria, not the 2011 originals, and the pathology item is where they differ.`,
    note: IGG4_NOTE,
  };
}

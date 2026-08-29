// spec-v883: the international consensus (Fukuoka) guidelines for branch-duct IPMN.
//
// Source:
//   Tanaka M, Fernandez-del Castillo C, Kamisawa T, et al. Revisions of international consensus
//   Fukuoka guidelines for the management of IPMN of the pancreas.
//   Pancreatology. 2017;17(5):738-753.
//
//   High-risk stigmata -> consider resection:
//     obstructive jaundice attributable to a cystic lesion of the pancreatic head;
//     an enhancing mural nodule 5 mm or larger;
//     a main pancreatic duct 10 mm or wider.
//
//   Worrisome features -> endoscopic ultrasound:
//     pancreatitis; a cyst 3 cm or larger; an enhancing mural nodule under 5 mm; thickened or
//     enhancing cyst walls; a main duct of 5 to 9 mm; an abrupt change in duct caliber with
//     distal atrophy; lymphadenopathy; a raised CA 19-9; growth of 5 mm or more over two years.
//
// A WORRISOME FEATURE MEANS ENDOSCOPIC ULTRASOUND, NOT RESECTION, AND THAT IS WHY THIS TILE
// EXISTS. The two tiers are routinely conflated, and the whole design of the guideline is that
// the middle tier buys more information rather than an operation.
//
// A CYST OF 3 cm OR MORE IS A WORRISOME FEATURE, NOT A HIGH-RISK STIGMA. The 2012 version treated
// size more aggressively; the 2017 revision moved it down.
//
// ONE MEASUREMENT, TWO TIERS, TWICE OVER. A main duct of 10 mm or more is a high-risk stigma while
// 5 to 9 mm is worrisome; an enhancing mural nodule of 5 mm or more is high-risk while under
// 5 mm is worrisome. The number decides which tier, and a nodule must be ENHANCING either way.
//
// THE JAUNDICE MUST BE ATTRIBUTABLE TO THE CYST. Jaundice from another cause is not a stigma.
//
// Pure: no DOM, no clock, no network.

export const IPMN_NOTE = 'The international consensus Fukuoka guidelines of 2017 sort a branch-duct intraductal papillary mucinous neoplasm by two tiers of finding. High-risk stigmata are obstructive jaundice attributable to a cystic lesion of the pancreatic head, an enhancing mural nodule 5 mm or larger, and a main pancreatic duct 10 mm or wider; any one of them is a reason to consider resection. Worrisome features are pancreatitis, a cyst 3 cm or larger, an enhancing mural nodule under 5 mm, thickened or enhancing cyst walls, a main duct of 5 to 9 mm, an abrupt change in duct caliber with distal atrophy, lymphadenopathy, a raised CA 19-9, and growth of 5 mm or more over two years; any one of them calls for endoscopic ultrasound. Four things about the guideline are worth stating plainly. A worrisome feature means endoscopic ultrasound and not resection, and the two tiers are routinely conflated even though the whole design is that the middle tier buys more information rather than an operation. A cyst of 3 cm or more is a worrisome feature and not a high-risk stigma, since the 2017 revision moved size down from where the 2012 version had it. A main duct of 10 mm or more is high-risk while 5 to 9 mm is worrisome, and an enhancing mural nodule of 5 mm or more is high-risk while under 5 mm is worrisome, so the same measurement lands in either tier depending on the number, and a nodule must be enhancing in both. And the jaundice must be attributable to the cyst; jaundice from another cause is not a stigma. It sorts findings already recorded into published tiers. It does not decide whether to operate.';

export const HIGH_RISK_STIGMATA = [
  { key: 'obstructiveJaundice', text: 'Obstructive jaundice attributable to a cystic lesion of the pancreatic head' },
  { key: 'noduleFiveMmOrMore', text: 'Enhancing mural nodule 5 mm or larger' },
  { key: 'mainDuctTenMmOrMore', text: 'Main pancreatic duct 10 mm or wider' },
];

export const WORRISOME_FEATURES = [
  { key: 'pancreatitis', text: 'Pancreatitis' },
  { key: 'cystThreeCmOrMore', text: 'Cyst 3 cm or larger' },
  { key: 'noduleUnderFiveMm', text: 'Enhancing mural nodule under 5 mm' },
  { key: 'thickenedWalls', text: 'Thickened or enhancing cyst walls' },
  { key: 'mainDuctFiveToNine', text: 'Main pancreatic duct 5 to 9 mm' },
  { key: 'abruptCaliberChange', text: 'Abrupt change in duct caliber with distal pancreatic atrophy' },
  { key: 'lymphadenopathy', text: 'Lymphadenopathy' },
  { key: 'raisedCa199', text: 'Raised serum CA 19-9' },
  { key: 'growthFiveMmTwoYears', text: 'Cyst growth of 5 mm or more over two years' },
];

function on(v) {
  return v === true || v === 'true' || v === 'yes' || v === 1 || v === '1';
}

const pick = (list, o) => list.filter((i) => on(o[i.key]));

export function ipmnFukuoka(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const stigmata = pick(HIGH_RISK_STIGMATA, o);
  const worrisome = pick(WORRISOME_FEATURES, o);

  const tier = stigmata.length ? 'high-risk' : worrisome.length ? 'worrisome' : 'neither';

  const action = {
    'high-risk': `High-risk stigmata present: ${stigmata.map((s) => s.text.toLowerCase()).join('; ')}. The guideline says to consider resection in a patient who is fit for it.`,
    worrisome: `Worrisome feature${worrisome.length === 1 ? '' : 's'} present: ${worrisome.map((s) => s.text.toLowerCase()).join('; ')}. The guideline says to perform endoscopic ultrasound. It does not say to resect.`,
    neither: 'Neither a high-risk stigma nor a worrisome feature is recorded. The guideline then places the cyst on a surveillance interval set by its size.',
  }[tier];

  // The reason the tile exists, on every result.
  const tierNote = 'A worrisome feature means endoscopic ultrasound, not resection. The two tiers are routinely conflated, and the design of the guideline is that the middle tier buys more information rather than an operation.';

  const sizeNote = on(o.cystThreeCmOrMore) && !stigmata.length
    ? 'A cyst of 3 cm or more is a worrisome feature, not a high-risk stigma. The 2017 revision moved size down from where the 2012 version had it, so size alone does not carry a case to resection.'
    : null;

  const measurementNote = 'The same measurement lands in either tier depending on the number: a main duct of 10 mm or more is high-risk and 5 to 9 mm is worrisome, and an enhancing mural nodule of 5 mm or more is high-risk and under 5 mm is worrisome. A nodule must be enhancing in both.';

  const jaundiceNote = on(o.obstructiveJaundice)
    ? 'The jaundice counts only when it is attributable to the cyst. Jaundice from another cause is not a stigma, and the attribution is the clinical judgment this tile cannot make.'
    : null;

  const bothTiersNote = stigmata.length && worrisome.length
    ? `${worrisome.length} worrisome feature${worrisome.length === 1 ? ' is' : 's are'} also recorded. They do not add to the high-risk tier, which is reached by any one stigma on its own.`
    : null;

  const recordedNote = `Recorded: ${stigmata.length} high-risk stigma${stigmata.length === 1 ? '' : 'ta'}, ${worrisome.length} worrisome feature${worrisome.length === 1 ? '' : 's'}.`;

  const scopeNote = 'This sorts findings already recorded into published tiers. It does not decide whether to operate.';

  return {
    valid: true,
    tier,
    stigmata: stigmata.map((s) => s.text),
    worrisome: worrisome.map((s) => s.text),
    action,
    recordedNote,
    tierNote,
    sizeNote,
    measurementNote,
    jaundiceNote,
    bothTiersNote,
    scopeNote,
    abnormal: tier !== 'neither',
    bandLabel: {
      'high-risk': 'High-risk stigmata',
      worrisome: 'Worrisome features',
      neither: 'Neither tier',
    }[tier],
    band: action,
    detail: 'High-risk stigmata are obstructive jaundice from a head lesion, an enhancing mural nodule 5 mm or larger, and a main duct 10 mm or wider; any one is a reason to consider resection. Worrisome features are pancreatitis, a cyst 3 cm or larger, an enhancing nodule under 5 mm, thickened or enhancing walls, a main duct of 5 to 9 mm, an abrupt caliber change with distal atrophy, lymphadenopathy, a raised CA 19-9, and growth of 5 mm over two years; any one calls for endoscopic ultrasound.',
    note: IPMN_NOTE,
  };
}

// spec-v1634 tool 11: anticholinergic burden from two openly licensed drug lists.
//
// Sources, both CC BY and both re-read in full text on October 11, 2026:
//   German ACB score: Kiesel EK, Hopf YM, Drey M. An anticholinergic burden score for German
//   prescribers: score development. BMC Geriatr 2018;18:239 (PMC6180424), Table 4. The paper scored
//   504 drugs: 356 as having no anticholinergic effect, 104 weak (1), 18 moderate (2), 29 strong (3).
//   Only the 151 scored 1 to 3 are in Table 4 and here; the 356 scored as none are not listed in a
//   form that could be read, so a drug missing from the list is "not on this list", never zero.
//   Rule printed in the paper: "If one drug scored 3 or the patient had a summated score of 3 or
//   higher, it was recommended to switch to alternative drugs".
//   CRIDECO Anticholinergic Load Scale: Ramos H, Moreno L, Perez-Tur J, Chafer-Pericas C,
//   Garcia-Lluch G, Pardo J. J Pers Med 2022;12(2):207 (PMC8876932), Table 4: 217 drugs (127 low,
//   28 medium, 62 high; the text counts 125 low before tapentadol and hydromorphone were added).
//   "A score >= 3 is considered as a clinically relevant anticholinergic burden." The alternative
//   names are the ones in the table's footnote.
// The lists below are generated from the articles' tables; the test asserts the counts.
// One list was built for drugs sold in Germany and one for Spain; several entries are not sold in
// the United States.
//
// Pure: no DOM, no clock, no network.

export const SCALES = [
  { value: 'german-acb', text: 'German ACB score (Kiesel 2018)', country: 'Germany', cite: 'Kiesel EK, et al. BMC Geriatr 2018;18:239 (CC BY).' },
  { value: 'crideco', text: 'CRIDECO Anticholinergic Load Scale (Ramos 2022)', country: 'Spain', cite: 'Ramos H, et al. J Pers Med 2022;12(2):207 (CC BY).' },
];
export const LISTS = {
  'german-acb': {
    1: [
      'Aclidinium inh', 'Alprazolam', 'Ampicillin', 'Aripiprazole', 'Asenapine', 'Atenolol',
      'Azathioprine', 'Baclofen', 'Benazepril', 'Betaxolol', 'Bisacodyl', 'Bromocriptine', 'Bupropion',
      'Captopril', 'Celecoxib', 'Cetirizine', 'Chlordiazepoxide', 'Chlorthalidone', 'Ciclosporin',
      'Citalopram', 'Clindamycin', 'Clonazepam', 'Clorazepate', 'Codeine', 'Desloratadine',
      'Dexamethasone', 'Dextromethorphan', 'Diazepam', 'Digitoxin', 'Digoxin', 'Diltiazem',
      'Dimetindene', 'Dipyridamole', 'Domperidone', 'Doxylamine', 'Entacapone', 'Escitalopram',
      'Etoricoxib', 'Famotidine', 'Fentanyl', 'Fexofenadine', 'Flunitrazepam', 'Fluoxetine',
      'Fluphenazine', 'Flurazepam', 'Fluvoxamine', 'Furosemide', 'Gentamicin', 'Glycopyrronium inh',
      'Guaifenesin', 'Hydralazine', 'Hydrocortisone', 'Ipratropium inh', 'Isosorbide dinitrate',
      'Isosorbide mononitrate', 'Ketorolac', 'Lansoprazole', 'Levocetirizine', 'Levodopa', 'Lithium',
      'Loratadine', 'Lorazepam', 'Metformin', 'Methocarbamol', 'Methotrexate', 'Methylprednisolone',
      'Metoclopramide', 'Metoprolol', 'Midazolam', 'Mirtazapine', 'Morphine', 'Naratriptan',
      'Nifedipine', 'Oxazepam', 'Oxycodone', 'Paliperidone', 'Pancuronium', 'Perphenazine',
      'Phenobarbital', 'Piperacillin', 'Pramipexole', 'Prednisolone', 'Prednisone', 'Promethazine',
      'Pseudoephedrine', 'Quinidine', 'Risperidone', 'Rotigotine patch', 'Selegiline', 'Sertraline',
      'Sumatriptan', 'Temazepam', 'Tiotropium inh', 'Trandolapril', 'Trazodone', 'Triamcinolone',
      'Triamterene', 'Triazolam', 'Valproic acid', 'Vancomycin', 'Venlafaxine', 'Warfarin',
      'Ziprasidone', 'Zolmitriptan',
    ],
    2: [
      'Amantadine', 'Carbamazepine', 'Cimetidine', 'Haloperidol', 'Loperamide', 'Loxapine',
      'Maprotiline', 'Methadone', 'Olanzapine', 'Opipramol', 'Oxcarbazepine', 'Paroxetine', 'Pethidine',
      'Pimozide', 'Quetiapine', 'Ranitidine', 'Theophylline', 'Tramadol',
    ],
    3: [
      'Amitriptyline', 'Atropine', 'Chlorpheniramine', 'Clemastine', 'Clomipramine', 'Clozapine',
      'Cyproheptadine', 'Darifenacin', 'Dimenhydrinate', 'Diphenhydramine', 'Doxepin', 'Fesoterodine',
      'Flavoxate', 'Hydroxyzine', 'Imipramine', 'Levomepromazine', 'Nortriptyline', 'Orphenadrine',
      'Oxybutynin', 'Procyclidine', 'Propiverine', 'Scopolamine', 'Solifenacin', 'Thioridazine',
      'Tizanidine', 'Tolterodine', 'Trihexyphenidyl', 'Trimipramine', 'Trospium',
    ],
  },
  crideco: {
    1: [
      'Aclidinium inh', 'Cyclosporine', 'Iloperidone', 'Phenobarbital', 'Alimemazine', 'Desloratadine',
      'Ipratropium inh', 'Piperacillin', 'Alprazolam', 'Desvelanfaxine', 'Isosorbide mononitrate',
      'Pramipexole', 'Alverine', 'Dexamethasone', 'Isosorbide dinitrate', 'Prednisolone', 'Amisulpride',
      'Dextromethorphan', 'Ketorolac', 'Prednisone', 'Ampicillin', 'Diazepam', 'Ketotifen', 'Pridinol',
      'Aripiprazole', 'Digitoxin', 'Levocetirizine', 'Pseudoephedrine', 'Asenapine', 'Digoxin',
      'Levodopa-carbidopa', 'Quinidine', 'Atenolol', 'Diltiazem', 'Lithium', 'Risperidone',
      'Azathioprine', 'Dipyridamole', 'Loperamide', 'Rotigotine patch', 'Benazepril', 'Disopyramide',
      'Loratadine', 'Selegiline', 'Betaxolol', 'Domperidone', 'Lorazepam', 'Sertraline', 'Bisacodyl',
      'Entacapone', 'Lumiracoxib', 'Sumatriptan', 'Bromocriptine', 'Escitalopram', 'Mebeverine',
      'Tapentadol', 'Bromperidol', 'Estazolam', 'Metformin', 'Temazepam', 'Bupropion', 'Famotidine',
      'Methocarbamol', 'Theophylline', 'Captopril', 'Fentanyl', 'Methotrexate', 'Tiotixene',
      'Cefamandole', 'Fexofenadine', 'Methylprednisolone', 'Tiotropium inh', 'Cefoxitin',
      'Flunitrazepam', 'Metoclopramide', 'Trandolapril', 'Celecoxib', 'Flupentixol', 'Metoprolol',
      'Trazodone', 'Cephalothin', 'Fluoxetine', 'Midazolam', 'Triamcinolone', 'Cetirizine', 'Flurazepam',
      'Mirtazapine', 'Triamterene', 'Cinnarizine', 'Fluvoxamine', 'Morphine', 'Trimebutine',
      'Chlordiazepoxide', 'Furosemide', 'Naratriptan', 'Triazolam', 'Chlortalidone', 'Gentamicin',
      'Nefazodone', 'Umeclidinium inh', 'Citalopram', 'Glycopyrronium inh', 'Nifedipine',
      'Valproic acid', 'Clindamycin', 'Guaifenesin', 'Nizatidine', 'Vancomycin', 'Clonazepam',
      'Haloperidol', 'Oxazepam', 'Venlafaxine', 'Clorazepate', 'Hydralazine', 'Oxycodone', 'Warfarin',
      'Codeine', 'Hydrocodone', 'Paliperidone', 'Ziprasidone', 'Cortisone', 'Hydrocortisone',
      'Pancuronium', 'Zolmitriptan', 'Cycloserine', 'Hydromorphone', 'Phenelzine',
    ],
    2: [
      'Amantadine', 'Baclofen', 'Carbamazepine', 'Cloperastine', 'Cimetidine', 'Cyclobenzaprine',
      'Dosulepin', 'Fluphenazine', 'Loxapine', 'Maprotiline', 'Meperidine', 'Methadone', 'Molindone',
      'Nefopam', 'Olanzapine', 'Oxcarbazepine', 'Paroxetine', 'Perphenazine', 'Pimozide',
      'Prochlorperazine', 'Promazine', 'Propoxyphene', 'Quetiapine', 'Ranitidine', 'Tramadol',
      'Triprolidine', 'Zotepine', 'Zuclopenthixol',
    ],
    3: [
      'Acepromazine', 'Hyoscyamine', 'Amitriptyline', 'Imipramine', 'Amoxapine', 'Levomepromazine',
      'Atropine', 'Meclozine', 'Belladonna', 'Mequitazine', 'Benzatropine', 'Nortriptyline', 'Biperiden',
      'Opipramol', 'Brompheniramine', 'Orphenadrine', 'Carbinoxamine', 'Otilonium bromide',
      'Carisoprodol', 'Oxybutynin', 'Chlorphenamine', 'Pheniramine', 'Chlorpromazine', 'Procyclidine',
      'Chlorprothixene', 'Promethazine', 'Cimetropium bromide', 'Propantheline', 'Clemastine',
      'Propiverine', 'Clomipramine', 'Protriptyline', 'Clozapine', 'Pyrilamine', 'Cyproheptadine',
      'Scopolamine', 'Darifenacin', 'Solifenacin', 'Desipramine', 'Thioridazine', 'Dexbrompheniramine',
      'Tiemonium iodide', 'Dexchlorpheniramine', 'Timepidium bromide', 'Dicyclomine', 'Tizanidine',
      'Difemerine', 'Tolterodine', 'Diphenhydramine', 'Trifluoperazine', 'Doxepin', 'Trihexyphenidyl',
      'Doxylamine', 'Trimipramine', 'Emepronium', 'Tropatepine', 'Fesoterodine', 'Trospium', 'Flavoxate',
      'Valethamate', 'Homatropine', 'Hydroxyzine',
    ],
  },
};
// Other names for an entry: the CRIDECO footnote's pairs, plus spelling variants of the same name.
const ALIASES = {
  crideco: { trimeprazine: 'alimemazine', benztropine: 'benzatropine', dicycloverine: 'dicyclomine', dimenhydrinate: 'diphenhydramine', chlorpheniramine: 'chlorphenamine', methotrimeprazine: 'levomepromazine', meclizine: 'meclozine', pethidine: 'meperidine', mepyramine: 'pyrilamine', hyoscine: 'scopolamine', desvenlafaxine: 'desvelanfaxine', chlorthalidone: 'chlortalidone', thiothixene: 'tiotixene', 'carbidopa levodopa': 'levodopa carbidopa', levodopa: 'levodopa carbidopa', ciclosporin: 'cyclosporine' },
  'german-acb': { cyclosporine: 'ciclosporin', chlortalidone: 'chlorthalidone', chlorphenamine: 'chlorpheniramine', meperidine: 'pethidine', hyoscine: 'scopolamine' },
};
const NOTE = 'A sum of list scores, not a measure of anticholinergic effect in this patient: it ignores dose, route and duration, and the two lists score some drugs differently. A drug that is not on the list chosen is reported as not listed, which is not the same as no anticholinergic effect. Neither list was built for drugs sold in the United States.';

// "Aclidinium inh" is listed for the inhaled product; "Rotigotine patch" for the patch.
const key = (s) => String(s).toLowerCase().replace(/\s+(inh|patch)$/, '').replace(/[-/]+/g, ' ').replace(/\s+/g, ' ').trim();
const INDEX = Object.fromEntries(Object.entries(LISTS).map(([scale, byScore]) => [scale, new Map(Object.entries(byScore).flatMap(([score, names]) => names.map((n) => [key(n), { name: n.replace(/ inh$/, ' (inhaled)').replace(/ patch$/, ' (patch)'), score: Number(score) }])))]));

export function anticholinergicListScore(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const scale = SCALES.find((s) => s.value === String(o.scale ?? '').trim());
  if (!scale) return { valid: false, message: 'Choose the scale: the German ACB score or the CRIDECO scale. They list different drugs and score some differently.' };
  const entered = String(o.drugs ?? '').split(/[\n,;]+/).map((x) => x.trim()).filter(Boolean);
  if (!entered.length) return { valid: false, message: 'Enter the drugs, one per line or separated by commas, by generic name.' };
  if (entered.length > 60) return { valid: false, message: 'Enter at most 60 drugs.' };
  const index = INDEX[scale.value]; const aliases = ALIASES[scale.value];
  const found = []; const missing = []; const seen = new Set();
  for (const raw of entered) {
    const k = key(raw); const hit = index.get(k) || index.get(aliases[k] || '');
    if (!hit) { missing.push(raw); continue; }
    if (seen.has(hit.name)) continue;
    seen.add(hit.name);
    found.push({ drug: hit.name, score: hit.score, ...(index.get(k) ? {} : { enteredAs: raw }) });
  }
  const total = found.reduce((a, f) => a + f.score, 0);
  const anyThree = found.some((f) => f.score === 3);
  const reached = total >= 3 || (scale.value === 'german-acb' && anyThree);
  const notes = [];
  if (found.length) notes.push(`On the list: ${found.map((f) => `${f.drug}${f.enteredAs ? ` (entered as ${f.enteredAs})` : ''} ${f.score}`).join('; ')}.`);
  if (missing.length) notes.push(`Not on this list: ${missing.join('; ')}. That is not a score of zero: the drug may be absent because it was rated as having no effect, because it is not sold in ${scale.country}, or because it is spelled differently there.`);
  notes.push(scale.value === 'german-acb'
    ? 'The paper\'s rule: if one drug scored 3 or the summed score was 3 or higher, switching to drugs with a lower score was recommended.'
    : 'The paper treats a summed score of 3 or more as a clinically relevant anticholinergic burden.');
  notes.push(`List built for drugs sold in ${scale.country}. ${scale.cite}`);
  if (!found.length) {
    return { valid: true, flag: 'none-listed', abnormal: false, scale: scale.value, total: null, scored: [], notListed: missing, band: `${scale.text}: none of the ${missing.length} drug${missing.length === 1 ? '' : 's'} entered is on this list, so no total is given.`, bandLabel: 'None on the list', notes, note: NOTE };
  }
  // A total below 3 with drugs missing from the list is incomplete, and is not reported as below the threshold.
  const incomplete = !reached && missing.length > 0;
  const verdict = reached ? 'This reaches the paper\'s threshold.' : incomplete ? 'The listed drugs sum to less than 3, but the total is incomplete: not every drug entered is on the list.' : 'This is below the paper\'s threshold of 3.';
  return {
    valid: true, flag: reached ? 'threshold-reached' : incomplete ? 'incomplete' : 'below-threshold', abnormal: reached || incomplete, scale: scale.value, total, scored: found, notListed: missing,
    band: `${scale.text}: total ${total} from ${found.length} listed drug${found.length === 1 ? '' : 's'}${missing.length ? `; ${missing.length} not on the list` : ''}. ${verdict}`,
    bandLabel: `Total ${total}${missing.length ? `, ${missing.length} not listed` : ''}`,
    notes, note: NOTE,
  };
}

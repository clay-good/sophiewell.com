// spec-v332: Haggitt classification of invasion in a malignant colorectal polyp (levels 0-4).
// Classifies how deeply an invasive adenocarcinoma arising in an adenomatous polyp has invaded,
// relative to the polyp's head / neck / stalk anatomy. Levels 1-3 (pedunculated, favorable
// histology) carry a low risk of adverse outcome and are often managed by polypectomy alone;
// level 4 (invasion into the bowel-wall submucosa below the stalk, and ALL sessile invasive
// polyps by definition) carries a materially higher risk of lymph-node metastasis. The catalog
// carries the neighboring GI classifications (Paris, Montreal, Vienna is absent, Siewert, Forrest,
// Rockall) but had no Haggitt level. "haggitt" / "malignant polyp invasion level" routed to nothing.
//
// HIGH-STAKES: this reports the invasion LEVEL the pathologist has determined, NOT a diagnosis, a
// resection recommendation, or a metastasis prediction for an individual patient (spec-v11 §5.3).
// The endoscopic-vs-surgical management decision stays with the clinician and the patient.
//
// CRITERIA RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Haggitt RC, Glotzbach RE, Soffer EE, Wruble LD. Prognostic factors in colorectal carcinomas
//     arising in adenomas: implications for lesions removed by endoscopic polypectomy.
//     Gastroenterology. 1985;89(2):328-336 (the original five-level scale).
//   - Gastroenterology Research (Kuo 2020) and Pathology Outlines reproductions of the same
//     level-0-4 definitions, including "any invasion in a sessile polyp = level 4" and the
//     level-4 / sessile higher-risk (up to ~27% node-positive) distinction.
//
// Levels (by depth of invasion relative to polyp anatomy):
//   0: carcinoma limited to the mucosa / above the muscularis mucosae (carcinoma in situ or
//      intramucosal carcinoma) — not truly invasive, no metastatic potential.
//   1: invasion through the muscularis mucosae into the submucosa, limited to the polyp HEAD.
//   2: invasion into the NECK of the polyp (the junction of the head and the stalk).
//   3: invasion into the STALK of the polyp.
//   4: invasion below the stalk into the submucosa of the bowel wall, but not into the muscularis
//      propria. By definition ALL sessile polyps with invasive carcinoma are level 4.

const LEVELS = {
  0: { level: '0', text: 'Haggitt level 0 — carcinoma limited to the mucosa (does not penetrate the muscularis mucosae); carcinoma in situ or intramucosal carcinoma. Not truly invasive and carries no metastatic potential.', highRisk: false },
  1: { level: '1', text: 'Haggitt level 1 — invasion through the muscularis mucosae into the submucosa, limited to the head of the polyp. Low risk of adverse outcome; favorable pedunculated lesions are often managed by polypectomy alone.', highRisk: false },
  2: { level: '2', text: 'Haggitt level 2 — invasion into the neck of the polyp (the junction of the head and the stalk). Low risk of adverse outcome.', highRisk: false },
  3: { level: '3', text: 'Haggitt level 3 — invasion into the stalk of the polyp. Low risk of adverse outcome.', highRisk: false },
  4: { level: '4', text: 'Haggitt level 4 — invasion below the stalk into the submucosa of the bowel wall (but not the muscularis propria). Higher risk of lymph-node metastasis; surgical resection is generally considered. ALL sessile polyps with invasive carcinoma are level 4 by definition.', highRisk: true },
};

const NOTE = 'Haggitt classification (Haggitt 1985) grades how deeply an invasive carcinoma arising in a colorectal polyp has invaded, relative to the polyp anatomy. 0: limited to the mucosa (carcinoma in situ / intramucosal, not truly invasive). 1: submucosa of the polyp head. 2: neck (head-stalk junction). 3: stalk. 4: bowel-wall submucosa below the stalk. Levels 1-3 in a pedunculated polyp with favorable histology carry a low risk of adverse outcome and are often managed by polypectomy alone; level 4 (and ALL invasive sessile polyps, which are level 4 by definition) carries a materially higher risk of lymph-node metastasis and generally prompts consideration of surgical resection. This reports the invasion level the pathologist has determined, not a diagnosis, a resection recommendation, or an individual metastasis prediction.';

// input:
//   level: '0' .. '4' (also accepts numbers)
export function haggitt(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.level == null ? '' : o.level).trim();
  const key = /^[0-4]$/.test(raw) ? Number(raw) : null;
  const t = key == null ? null : LEVELS[key];
  if (!t) {
    return { valid: false, message: 'Select the Haggitt level (0, 1, 2, 3, or 4).' };
  }
  return {
    valid: true,
    level: t.level,
    highRisk: t.highRisk,
    abnormal: t.highRisk,
    bandLabel: `Haggitt level ${t.level}`,
    band: t.text,
    note: NOTE,
  };
}

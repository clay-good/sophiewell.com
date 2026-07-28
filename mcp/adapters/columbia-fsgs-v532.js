// spec-v532 MCP wave: adapter for the Columbia FSGS classification in lib/columbia-fsgs-v532.js. The dom
// keys mirror the browser renderer (views/group-v532.js) and META['columbia-fsgs'].example: fsgs-<key> maps
// to the lib arg <key> for each of the six findings.
//
// THE TOOL TAKES FINDINGS AND RETURNS A VARIANT - IT DOES NOT ACCEPT A VARIANT. That is the design point. An
// agent that already believes it knows the variant has nothing to gain here; the value is entirely in the
// precedence order, which is what gets applied wrong by hand. Publishing a "which variant is it?" enum would
// have inverted the tool into a lookup table and thrown away the only thing it does.
//
// THE `anyPerihilarSclerosis` FIELD IS THE ONE THAT MATTERS MOST, and its label says so. It is not a
// finding that selects a variant - it is a VETO on the tip variant, and it fires even though tip sits ABOVE
// perihilar in the precedence order. An agent reasoning "tip outranks perihilar, so a tip lesion wins" gets
// the wrong variant on exactly the biopsies where the distinction is real. The result exposes a `tipVetoed`
// flag so a caller can see the veto fired rather than silently receiving a different variant than expected.
//
// All six are required, and a "no" is meaningful: the classification is a sequence of exclusions, so an
// omitted finding is not the same as an absent one. A biopsy with none of the six defining lesions returns
// no variant rather than defaulting to NOS, because the classification sorts a biopsy that already shows
// FSGS.
//
// The summary states, in the strongest terms the copy allows, that this does NOT distinguish primary from
// secondary FSGS. That distinction is what decides whether immunosuppression is considered, it is made from
// clinical context and electron microscopy rather than from these five variants, and it is the single most
// likely wrong inference an agent would draw from a variant name.

import * as F from '../../lib/columbia-fsgs-v532.js';

export default [
  {
    id: 'columbia-fsgs',
    summary: 'The Columbia classification of focal segmental glomerulosclerosis (D\'Agati and colleagues 2004). This tool takes the BIOPSY FINDINGS and applies the classification\'s precedence order to return one of five mutually exclusive variants; it does not accept a variant as input, because the order of application is the part that is easy to get wrong. The order, highest precedence first: COLLAPSING, at least one glomerulus with segmental or global collapse AND overlying podocyte hypertrophy and hyperplasia, which has no exclusions and takes precedence over everything else present; TIP, at least one segmental lesion in the tip domain, the outer 25 percent of the tuft next to the origin of the proximal tubule, with the tubular pole identified and with an adhesion or confluence of podocytes with parietal or tubular cells; CELLULAR, at least one glomerulus with segmental endocapillary hypercellularity occluding lumina; PERIHILAR, perihilar hyalinosis with or without sclerosis plus more than 50 percent of the glomeruli bearing segmental lesions showing perihilar sclerosis or hyalinosis; and NOT OTHERWISE SPECIFIED, a segmental increase in matrix obliterating capillary lumina, which is a diagnosis of exclusion and is distinguished from collapsing by segmental collapse WITHOUT overlying podocyte hyperplasia. CRITICAL: the tip step is a VETO, not a rank comparison. Any perihilar sclerosis anywhere in the biopsy excludes the tip variant even though tip sits above perihilar in the order, so a biopsy with a qualifying tip lesion and perihilar sclerosis is not tip and falls through to the next variant it meets; the result exposes a tipVetoed flag when this happens. Several references add a threshold of at least 25 percent of the tuft to the cellular definition, but that qualifier is narrative rather than part of the criteria table and is therefore not enforced. A biopsy with none of the defining lesions returns no variant rather than defaulting to NOS. This names a morphologic variant. It does not diagnose FSGS, and it does NOT distinguish primary FSGS from a secondary or adaptive form arising from obesity, reflux, reduced nephron mass, a virus, or a drug: that distinction is made from clinical context, the degree of proteinuria, and electron microscopy showing diffuse foot-process effacement, and it is what decides whether immunosuppression is even considered, not the variant. The variants carry reported prognostic associations at the group level, which are not a prediction for an individual, so no outcome figure is attached to any variant. The variants are scored on the tissue sampled, and a tip lesion in particular can be missed on a biopsy with few glomeruli.',
    compute: F.columbiaFsgs,
    fields: F.FSGS_FINDINGS.map((f) => ({
      dom: `fsgs-${f.key}`,
      arg: f.key,
      kind: 'enum',
      values: ['no', 'yes'],
      required: true,
      label: `${f.text}? ${f.detail}`,
    })),
  },
];

// spec-v869 MCP adapter: the EORTC/MSGERC consensus definitions of invasive fungal disease in
// lib/eortc-msg-ifd-v869.js. The dom keys mirror the browser renderer (views/group-v869.js) and
// META['eortc-msg-ifd'].example.
//
// It classifies a case for research. It is not a treatment decision. Clinical domain.

import { eortcMsgIfd } from '../../lib/eortc-msg-ifd-v869.js';

export default [
  {
    id: 'eortc-msg-ifd',
    summary: 'Classifies invasive fungal disease as proven, probable, or possible under the EORTC and MSGERC consensus definitions. Proven is fungal invasion demonstrated from a normally sterile site, or a sterile-site culture, and needs NO host factor. Probable needs ALL THREE of a host factor, a clinical feature, and mycological evidence. Possible is a host factor and a clinical feature with no mycological evidence. THESE ARE RESEARCH DEFINITIONS, written to make trials comparable and not to decide whether an individual patient is treated, and POSSIBLE IS AN EPIDEMIOLOGIC CATEGORY RATHER THAN A TREATMENT ONE. Two of the three components is possible at best, and mycological evidence on its own classifies nothing. The definitions assume an immunocompromised host, so a patient with no host factor cannot reach probable or possible under them.',
    compute: eortcMsgIfd,
    fields: [
      { dom: 'ifd-provenevidence', arg: 'provenEvidence', kind: 'boolean', required: false, label: 'Fungal invasion from a normally sterile site by histopathology, cytopathology, direct microscopy or culture' },
      { dom: 'ifd-neutropenia', arg: 'neutropenia', kind: 'boolean', required: false, label: 'Recent neutropenia below 0.5 x 10^9/L for more than 10 days (host factor)' },
      { dom: 'ifd-hematologicmalignancy', arg: 'hematologicMalignancy', kind: 'boolean', required: false, label: 'Hematologic malignancy (host factor)' },
      { dom: 'ifd-allohct', arg: 'alloHct', kind: 'boolean', required: false, label: 'Allogeneic stem cell transplant (host factor)' },
      { dom: 'ifd-solidorgan', arg: 'solidOrgan', kind: 'boolean', required: false, label: 'Solid organ transplant (host factor)' },
      { dom: 'ifd-corticosteroids', arg: 'corticosteroids', kind: 'boolean', required: false, label: 'Corticosteroids at 0.3 mg/kg prednisone equivalent or more for 3 weeks or more in the past 60 days (host factor)' },
      { dom: 'ifd-tcellsuppressants', arg: 'tCellSuppressants', kind: 'boolean', required: false, label: 'Treatment with recognized T-cell or B-cell immunosuppressants in the past 90 days (host factor)' },
      { dom: 'ifd-inheritedimmunodeficiency', arg: 'inheritedImmunodeficiency', kind: 'boolean', required: false, label: 'Inherited severe immunodeficiency (host factor)' },
      { dom: 'ifd-gvhd', arg: 'gvhd', kind: 'boolean', required: false, label: 'Acute graft-versus-host disease, grade III or IV (host factor)' },
      { dom: 'ifd-denselesion', arg: 'denseLesion', kind: 'boolean', required: false, label: 'Dense, well-circumscribed pulmonary lesion, with or without a halo sign (clinical feature)' },
      { dom: 'ifd-aircrescent', arg: 'airCrescent', kind: 'boolean', required: false, label: 'Air-crescent sign (clinical feature)' },
      { dom: 'ifd-cavity', arg: 'cavity', kind: 'boolean', required: false, label: 'Pulmonary cavity (clinical feature)' },
      { dom: 'ifd-wedgeconsolidation', arg: 'wedgeConsolidation', kind: 'boolean', required: false, label: 'Wedge-shaped, segmental or lobar consolidation (clinical feature)' },
      { dom: 'ifd-tracheobronchitis', arg: 'tracheobronchitis', kind: 'boolean', required: false, label: 'Tracheobronchial ulceration, plaque, eschar or pseudomembrane on bronchoscopy (clinical feature)' },
      { dom: 'ifd-sinonasal', arg: 'sinonasal', kind: 'boolean', required: false, label: 'Sinonasal disease with bone erosion or extension beyond the sinus (clinical feature)' },
      { dom: 'ifd-cns', arg: 'cns', kind: 'boolean', required: false, label: 'Focal brain lesion on imaging, or meningeal enhancement (clinical feature)' },
      { dom: 'ifd-disseminated', arg: 'disseminated', kind: 'boolean', required: false, label: 'Disseminated disease: chorioretinitis, or small peripheral target abscesses in liver or spleen (clinical feature)' },
      { dom: 'ifd-directtest', arg: 'directTest', kind: 'boolean', required: false, label: 'Mold in sputum, lavage, bronchial brush or sinus aspirate by cytology, microscopy or culture (mycological evidence)' },
      { dom: 'ifd-serumgalactomannan', arg: 'serumGalactomannan', kind: 'boolean', required: false, label: 'Serum or plasma galactomannan at 1.0 or above (mycological evidence)' },
      { dom: 'ifd-balgalactomannan', arg: 'balGalactomannan', kind: 'boolean', required: false, label: 'Bronchoalveolar lavage galactomannan at 1.0 or above (mycological evidence)' },
      { dom: 'ifd-pairedgalactomannan', arg: 'pairedGalactomannan', kind: 'boolean', required: false, label: 'Serum galactomannan at 0.7 or above with a lavage value at 0.8 or above (mycological evidence)' },
      { dom: 'ifd-aspergilluspcr', arg: 'aspergillusPcr', kind: 'boolean', required: false, label: 'Aspergillus PCR positive on the pattern the definitions accept (mycological evidence)' },
    ],
  },
];

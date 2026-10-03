// English source messages for the footer's offline line (lib/offline-status.js). See lib/i18n.js.
import { addMessages } from '../../i18n.js';

export const MESSAGES = {
  update: 'An update is ready. It will be used the next time you open the site.',
  savedOn: 'Saved for offline use, version of {date}.',
  saved: 'Saved for offline use.',
  mayClear: 'The phone may clear the saved copy when storage runs low.',
  saving: 'Saving for offline use... {pct}%.',
};

addMessages('en', 'offline-status', MESSAGES);

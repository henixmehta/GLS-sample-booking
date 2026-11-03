/**
 * FG Group CRM tracking for this site: cookie banner, visitor tracker, and the link that makes an inquiry and the
 * visitor's browsing one lead. Site key 'gls-sample-booking' is registered in fg-api src/config/website-sources.js, which
 * sends this site's leads to the GN section of the CRM. How it works: ./fg-crm-tracking.js
 */
import { API_BASE } from '../lib/api';
import { initCrmTracking } from './fg-crm-tracking';

initCrmTracking({
  apiBase: API_BASE,
  siteKey: 'gls-sample-booking',
  brand: 'Gomzi Lifesciences',
  accent: '#86c33a',
  accentText: '#0f172a',
  profileKeys: [],
});

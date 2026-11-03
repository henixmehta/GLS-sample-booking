// Types for fg-crm-tracking.js (FG Group CRM tracking drop-in).
export interface CrmTrackingOptions {
  siteKey: string;
  apiBase: string;
  brand?: string;
  accent?: string;
  accentText?: string;
  profileKeys?: string[];
  policyUrl?: string;
}

export function initCrmTracking(options: CrmTrackingOptions): void;
export function withVisitorTracking<T extends object>(payload: T): Promise<T & { details?: Record<string, unknown> }>;
export function isContactInquiryRequest(method?: string, url?: string): boolean;
export function attachToAxios(instance: unknown): void;

export type LicenseTier = 'free' | 'professional' | 'enterprise';

export type LicenseCapability =
  | 'call_tracking'
  | 'ai_transcription'
  | 'lead_scoring'
  | 'call_recording'
  | 'google_analytics'
  | 'search_console';

export interface LicenseData {
  isValid: boolean;
  isFallback?: boolean;
  reason?: 'missing_key' | 'api_error' | 'invalid_signature' | 'expired' | 'not_validated';
  tier?: LicenseTier;
  capabilities: LicenseCapability[];
  sessionToken?: string;
  expiresAt?: number;
}

/** Injected by PHP via wp_localize_script as window.roiInsights */
export interface RoiInsightsGlobal {
  nonce: string;
  apiBase: string;
  tier: LicenseTier;
  capabilities: LicenseCapability[];
  isValid: boolean;
}

declare global {
  interface Window {
    roiInsights: RoiInsightsGlobal;
  }
}

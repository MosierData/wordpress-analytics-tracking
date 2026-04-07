export type LicenseTier = 'free' | 'professional' | 'enterprise';

export type LicenseCapability =
  | 'call_tracking'
  | 'ai_transcription'
  | 'lead_scoring'
  | 'call_recording'
  | 'google_analytics'
  | 'search_console';

export type DashboardStatus = 'email_pending' | 'backfilling' | 'ready' | 'error';

export interface DashboardStatusDetail {
  started_at?: string;
  estimated_ready_at?: string;
  progress_pct?: number;
}

export interface LicenseData {
  isValid: boolean;
  isFallback?: boolean;
  reason?: 'missing_key' | 'api_error' | 'invalid_signature' | 'expired' | 'not_validated';
  tier?: LicenseTier;
  capabilities: LicenseCapability[];
  sessionToken?: string;
  expiresAt?: number;
  dashboardStatus?: DashboardStatus;
  dashboardStatusDetail?: DashboardStatusDetail;
}

export interface OnboardingData {
  business_type: string;
  company_size: string;
  primary_objectives: string[];
  lead_sources: string[];
  marketing_budget: string;
  budget_scope: string;
}

/** Injected by PHP via wp_localize_script as window.roiInsights */
export interface RoiInsightsGlobal {
  nonce: string;
  ajaxUrl: string;
  tier: LicenseTier;
  capabilities: LicenseCapability[];
  isValid: boolean;
  hasKey: boolean;
}

declare global {
  interface Window {
    roiInsights: RoiInsightsGlobal;
  }
}

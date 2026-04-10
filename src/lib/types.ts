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
  reason?: 'missing_key' | 'api_error' | 'invalid_signature' | 'expired' | 'not_validated' | 'sodium_unavailable';
  tier?: LicenseTier;
  capabilities: LicenseCapability[];
  sessionToken?: string;
  expiresAt?: number;
  dashboardStatus?: DashboardStatus;
  dashboardStatusDetail?: DashboardStatusDetail;
}

export type ScanStatus = 'idle' | 'pending' | 'scanning' | 'succeeded' | 'partial' | 'failed';

export interface WebsiteScanResult {
  scan_id?: string;
  status: ScanStatus;
  tech_stack?: Record<string, string[]>;
  tracking_ids?: Record<string, string>;
  analysis?: { flags?: string[] };
  scanned_at?: string;
}

export interface OnboardingData {
  business_type: string;
  company_size: string;
  primary_objectives: string[];
  lead_sources: string[];
  marketing_budget: string;
  budget_scope: string;
}

export type IntegrationStatus = 'connected' | 'syncing' | 'warning' | 'error' | 'disconnected' | 'not_configured';

export interface IntegrationService {
  status: IntegrationStatus;
  account_name?: string;
  property_name?: string;
  site_url?: string;
  last_synced_at: string | null;
  error_message: string | null;
}

export interface IntegrationsData {
  google?: { email?: string; connected_at?: string };
  ga4?: IntegrationService;
  gsc?: IntegrationService;
  gbp?: IntegrationService;
  ads?: IntegrationService;
}

export interface SiteHints {
  tagline: string;
  pluginSignals: string[];
  domain: string;
}

/** Injected by PHP via wp_localize_script as window.roiInsights */
export interface RoiInsightsGlobal {
  nonce: string;
  ajaxUrl: string;
  tier: LicenseTier;
  capabilities: LicenseCapability[];
  isValid: boolean;
  hasKey: boolean;
  siteHints?: SiteHints;
}

declare global {
  interface Window {
    roiInsights: RoiInsightsGlobal;
  }
}

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../lib/api';
import type { LicenseData, OnboardingData } from '../lib/types';
import { OnboardingWizard } from './OnboardingWizard';

// ─── Design tokens ─────────────────────────────────────────────────────────────

const colors = {
  primary: '#16a34a',
  primaryHover: '#15803d',
  success: '#16a34a',
  successBg: '#f0fdf4',
  successBorder: '#bbf7d0',
  warning: '#d97706',
  warningBg: '#fffbeb',
  warningBorder: '#fde68a',
  error: '#dc2626',
  errorBg: '#fef2f2',
  errorBorder: '#fca5a5',
  info: '#0369a1',
  infoBg: '#f0f9ff',
  infoBorder: '#bae6fd',
  cardBg: '#ffffff',
  pageBg: '#f1f5f9',
  border: '#e2e8f0',
  textPrimary: '#0f172a',
  textSecondary: '#475569',
  textMuted: '#94a3b8',
};

const font = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif';

// ─── Shared sub-components ─────────────────────────────────────────────────────

function Card( { children, style }: { children: React.ReactNode; style?: React.CSSProperties } ) {
  return (
    <div style={ {
      background: colors.cardBg,
      border: `1px solid ${ colors.border }`,
      boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      borderRadius: 8,
      padding: 24,
      ...style,
    } }>
      { children }
    </div>
  );
}

function StatusBadge( { label, variant }: { label: string; variant: 'active' | 'connected' | 'disabled' | 'error' | 'warning' | 'optional' } ) {
  const styles: Record<string, React.CSSProperties> = {
    active: { background: colors.successBg, color: colors.success, border: `1px solid ${ colors.successBorder }` },
    connected: { background: colors.successBg, color: colors.success, border: `1px solid ${ colors.successBorder }` },
    disabled: { background: '#f1f5f9', color: '#64748b', border: '1px solid #cbd5e1' },
    error: { background: colors.errorBg, color: colors.error, border: `1px solid ${ colors.errorBorder }` },
    warning: { background: colors.warningBg, color: colors.warning, border: `1px solid ${ colors.warningBorder }` },
    optional: { background: '#f1f5f9', color: '#64748b', border: '1px solid #cbd5e1' },
  };
  return (
    <span style={ {
      display: 'inline-flex',
      alignItems: 'center',
      padding: '2px 10px',
      borderRadius: 9999,
      fontSize: 12,
      fontWeight: 500,
      fontFamily: font,
      ...styles[ variant ],
    } }>
      { label }
    </span>
  );
}

function PrimaryButton( { children, onClick, disabled, style }: { children: React.ReactNode; onClick?: () => void; disabled?: boolean; style?: React.CSSProperties } ) {
  return (
    <button
      onClick={ onClick }
      disabled={ disabled }
      style={ {
        background: disabled ? '#bbf7d0' : colors.primary,
        color: '#fff',
        border: 'none',
        borderRadius: 6,
        padding: '10px 20px',
        fontSize: 14,
        fontWeight: 500,
        fontFamily: font,
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'background 0.15s',
        ...style,
      } }
    >
      { children }
    </button>
  );
}

function SecondaryButton( { children, onClick, disabled, style }: { children: React.ReactNode; onClick?: () => void; disabled?: boolean; style?: React.CSSProperties } ) {
  return (
    <button
      onClick={ onClick }
      disabled={ disabled }
      style={ {
        background: '#fff',
        color: '#374151',
        border: `1px solid ${ colors.border }`,
        borderRadius: 6,
        padding: '10px 20px',
        fontSize: 14,
        fontWeight: 500,
        fontFamily: font,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        ...style,
      } }
    >
      { children }
    </button>
  );
}

function HelperText( { children }: { children: React.ReactNode } ) {
  return (
    <p style={ { margin: '6px 0 0', fontSize: 12, color: colors.textMuted, lineHeight: 1.5, fontFamily: font } }>
      { children }
    </p>
  );
}

const GoogleGIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" style={ { flexShrink: 0 } }>
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.4-1.04 2.58-2.21 3.33v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.11z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

// ─── Google Sign-In Troubleshooting Panel ──────────────────────────────────────

function GoogleSignInTroubleshooting() {
  return (
    <div style={ {
      marginTop: 16,
      border: `1px solid ${ colors.warningBorder }`,
      borderRadius: 8,
      background: colors.warningBg,
      overflow: 'hidden',
    } }>
      <div style={ { padding: '14px 16px', borderBottom: `1px solid ${ colors.warningBorder }` } }>
        <p style={ { margin: 0, fontSize: 14, fontWeight: 600, color: '#92400e', fontFamily: font } }>
          Google sign-in didn't complete. Here's how to fix it:
        </p>
      </div>
      <div style={ { padding: 16, fontSize: 13, color: '#78350f', lineHeight: 1.7, fontFamily: font } }>

        <p style={ { margin: '0 0 4px', fontWeight: 600 } }>1. Your browser blocked the popup</p>
        <p style={ { margin: '0 0 8px' } }>
          Google sign-in opens in a small popup window. Most browsers block popups by default unless you've allowed them for a specific site.
        </p>
        <p style={ { margin: '0 0 4px', fontWeight: 500 } }>What to look for:</p>
        <p style={ { margin: '0 0 8px' } }>
          A small icon or notification near your browser's address bar — it usually says something like "Popup blocked" or shows a window icon with a red X.
        </p>
        <p style={ { margin: '0 0 4px', fontWeight: 500 } }>How to fix it:</p>
        <ol style={ { margin: '0 0 16px', paddingLeft: 20 } }>
          <li>Click that notification.</li>
          <li>Choose "Always allow popups from this site" (or similar wording — it varies by browser).</li>
          <li>Click Sign in with Google again.</li>
        </ol>

        <p style={ { margin: '0 0 4px', fontWeight: 600 } }>2. A browser extension is interfering</p>
        <p style={ { margin: '0 0 8px' } }>
          Ad blockers, privacy extensions, and VPNs can sometimes block the Google sign-in window from opening or preventing it from completing.
        </p>
        <p style={ { margin: '0 0 4px', fontWeight: 500 } }>How to fix it:</p>
        <ol style={ { margin: '0 0 16px', paddingLeft: 20 } }>
          <li>Try opening this page in an incognito / private browsing window (this disables most extensions automatically).</li>
          <li>Click Sign in with Google again.</li>
          <li>If it works in incognito, one of your extensions is the issue. You can either allow this site in your ad blocker settings, or keep using incognito for this one step — you only need to do it once.</li>
        </ol>

        <p style={ { margin: '0 0 4px', fontWeight: 600 } }>3. You're signed into the wrong Google account</p>
        <p style={ { margin: '0 0 8px' } }>
          If you have multiple Google accounts (personal, business, agency), the popup may default to one that doesn't have access to your business tools.
        </p>
        <p style={ { margin: '0 0 4px', fontWeight: 500 } }>How to fix it:</p>
        <ol style={ { margin: '0 0 16px', paddingLeft: 20 } }>
          <li>In the Google sign-in popup, look for a "Use another account" option or click your profile picture to switch accounts.</li>
          <li>Sign in with the Google account you use for your business — the one connected to your Google Ads, Analytics, or Search Console.</li>
        </ol>

        <p style={ { margin: '0 0 4px', fontWeight: 600 } }>4. Nothing above worked</p>
        <p style={ { margin: '0 0 8px' } }>
          Contact us at <a href="mailto:jim@mosierdata.com" style={ { color: '#92400e', fontWeight: 500 } }>jim@mosierdata.com</a> and let us know what happened. Include the name of any security plugin you're running if you know it.
        </p>
        <p style={ { margin: 0, padding: '10px 12px', background: 'rgba(255,255,255,0.5)', borderRadius: 6, fontSize: 12, color: '#92400e' } }>
          <strong>Technical note for developers:</strong> The Google sign-in flow uses OAuth 2.0. The activation popup initiates a server-side OAuth handshake via the plugin's API. The most common blockers are WAF or firewall rules that intercept the outbound request to api.roiknowledge.com, or network restrictions preventing the server from reaching external URLs.
        </p>
      </div>
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

interface SettingsPageProps {
  onNavigateToDashboard?: () => void;
  isActive?: boolean;
}

export function SettingsPage( { onNavigateToDashboard, isActive }: SettingsPageProps ) {
  const [ license, setLicense ] = useState<LicenseData | null>( null );
  const [ activating, setActivating ] = useState( false );
  const [ message, setMessage ] = useState( '' );
  const [ licenseKeyInput, setLicenseKeyInput ] = useState( '' );
  const [ savingKey, setSavingKey ] = useState( false );
  const [ registering, setRegistering ] = useState( false );
  const [ registerMessage, setRegisterMessage ] = useState( '' );
  const [ showOnboarding, setShowOnboarding ] = useState( false );
  const oauthPollRef = useRef<ReturnType<typeof setInterval> | null>( null );

  // UI-only state
  const [ showKeyInput, setShowKeyInput ] = useState( false );

  useEffect( () => {
    return () => {
      if ( oauthPollRef.current ) clearInterval( oauthPollRef.current );
    };
  }, [] );

  useEffect( () => {
    const params = new URLSearchParams( window.location.search );
    const pluginToken = params.get( 'plugin_license_token' );

    if ( pluginToken ) {
      // Remove the token from the URL so it isn't re-processed on refresh.
      params.delete( 'plugin_license_token' );
      const cleaned = params.toString();
      const newUrl = window.location.pathname + ( cleaned ? `?${ cleaned }` : '' ) + window.location.hash;
      window.history.replaceState( {}, '', newUrl );

      void api.post<{ license_key?: string; license?: LicenseData; error?: string }>( 'license/register', { token: pluginToken } )
        .then( result => {
          if ( result.license_key ) {
            // Use the real license state returned from registration.
            // showOnboarding renders the wizard before any license-dependent UI,
            // so we don't need to fake isValid: true here. The wizard's completion
            // navigates to the Dashboard which force-validates to get a fresh sessionToken.
            if ( result.license ) {
              setLicense( result.license );
            }
            setShowOnboarding( true );
          } else {
            setRegisterMessage( `Activation failed: ${ result.error ?? 'The link may have expired or already been used.' }` );
            void api.get<LicenseData>( 'license/status' ).then( setLicense ).catch( () => {} );
          }
        } )
        .catch( () => {
          // Registration request failed — still load current license state so the page
          // reflects the actual account status instead of showing a blank activation form.
          void api.get<LicenseData>( 'license/status' ).then( setLicense ).catch( () => {} );
        } );
    } else {
      // If a key already exists, force-validate to get fresh status.
      // This handles the case where the key is stored but cached validation expired.
      const endpoint = roiInsights.hasKey ? 'license/validate' : 'license/status';
      void api.get<LicenseData>( endpoint ).then( setLicense ).catch( () => {} );
    }
  }, [] );

  // Clear stale success messages when the tab becomes active again.
  useEffect( () => {
    if ( isActive && registerMessage.startsWith( 'Account activated' ) ) {
      setRegisterMessage( '' );
    }
  }, [ isActive ] ); // eslint-disable-line react-hooks/exhaustive-deps

  const handleActivateLicense = useCallback( async () => {
    setActivating( true );
    setMessage( '' );
    try {
      const fresh = await api.get<LicenseData>( 'license/validate' );
      setLicense( fresh );
      setMessage( fresh.isValid ? 'License activated.' : `License invalid: ${ fresh.reason ?? 'unknown' }` );
    } catch {
      setMessage( 'Error validating license.' );
    } finally {
      setActivating( false );
    }
  }, [] );

  const handleSaveLicenseKey = useCallback( async () => {
    if ( ! licenseKeyInput.trim() ) return;
    setSavingKey( true );
    setMessage( '' );
    try {
      await api.post( 'settings/save', { licenseKey: licenseKeyInput.trim() } );
      roiInsights.hasKey = true;
      setMessage( 'License key saved. Click Activate to validate.' );
      setLicenseKeyInput( '' );
    } catch {
      setMessage( 'Error saving license key.' );
    } finally {
      setSavingKey( false );
    }
  }, [ licenseKeyInput ] );

  const handleSignInWithGoogle = useCallback( async () => {
    setRegistering( true );
    setRegisterMessage( '' );
    try {
      const { authUrl } = await api.get<{ authUrl: string }>( 'license/sso?src=default' );
      const popup = window.open( authUrl, 'roi_oauth', 'width=600,height=700,scrollbars=yes' );
      if ( ! popup ) {
        setRegisterMessage( 'Popup blocked — please allow popups for this page and try again.' );
        setRegistering( false );
        return;
      }

      const cleanup = () => {
        window.removeEventListener( 'message', messageHandler );
        if ( oauthPollRef.current ) { clearInterval( oauthPollRef.current ); oauthPollRef.current = null; }
        setRegistering( false );
      };

      const messageHandler = async ( event: MessageEvent ) => {
        if ( event.origin !== 'https://api.roiknowledge.com' ) return;
        const msg = event.data as { type?: string; payload?: { success: boolean; token?: string; error?: string } };
        if ( msg?.type !== 'roi-insights-oauth' ) return;

        cleanup();
        try { popup.close(); } catch { /* COOP may block */ }

        if ( ! msg.payload?.success ) {
          setRegisterMessage( `Sign-in failed: ${ msg.payload?.error ?? 'unknown error' }` );
          return;
        }

        try {
          const result = await api.post<{ license_key?: string; license?: LicenseData; error?: string }>(
            'license/register',
            { token: msg.payload.token }
          );
          if ( result.license_key ) {
            // Use the real license state; showOnboarding bypasses license-dependent UI.
            // Dashboard's force-validate on navigation provides the fresh sessionToken.
            if ( result.license ) {
              setLicense( result.license );
            }
            setShowOnboarding( true );
          } else {
            setRegisterMessage( `Activation failed: ${ result.error ?? 'unknown error' }` );
          }
        } catch {
          setRegisterMessage( 'Error activating license. Please try again.' );
        }
      };

      window.addEventListener( 'message', messageHandler );
      oauthPollRef.current = setInterval( () => { try { if ( popup.closed ) cleanup(); } catch { /* COOP may block — keep listening for postMessage */ } }, 500 );
    } catch {
      setRegisterMessage( 'Error starting sign-in. Please try again.' );
      setRegistering( false );
    }
  }, [] );

  const isSignInError = registerMessage.startsWith( 'Error starting sign-in' ) || registerMessage.startsWith( 'Popup blocked' );
  const isSuccessMessage = registerMessage.startsWith( 'Account activated' );

  // Key exists on the server but validation didn't return isValid — show a retry state, not the full sign-up form.
  const hasKeyButNotValid = roiInsights.hasKey && license !== null && ! license.isValid;

  const reasonMessage = ( reason?: string | null ): string => {
    switch ( reason ) {
      case 'api_error': return 'We couldn\'t reach the license server to validate your account. Your tracking pixels are still active.';
      case 'invalid_signature': return 'Your license could not be verified. Please try signing in again.';
      case 'expired': return 'Your license has expired. Sign in again to renew.';
      default: return 'Your license could not be validated.';
    }
  };

  const handleOnboardingComplete = useCallback( ( _data: OnboardingData ) => {
    setShowOnboarding( false );
    setRegisterMessage( 'Account activated!' );
    if ( onNavigateToDashboard ) {
      onNavigateToDashboard();
    }
  }, [ onNavigateToDashboard ] );

  if ( showOnboarding ) {
    return <OnboardingWizard onComplete={ handleOnboardingComplete } />;
  }

  return (
    <div style={ {
      maxWidth: 800,
      padding: '32px 24px',
      margin: '0 auto',
      fontFamily: font,
      color: colors.textPrimary,
    } }>

      {/* ── Activate Your Account ── */}
      <Card style={ { marginBottom: 16, borderLeft: '4px solid #16a34a' } }>
        <h2 style={ { margin: '0 0 20px', fontSize: 18, fontWeight: 600, color: colors.textPrimary } }>
          { license?.isValid ? 'Your Account' : 'Activate Your Account' }
        </h2>

        { license?.isValid ? (
          /* ── Activated state ── */
          <div>
            <div style={ { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 } }>
              <StatusBadge label={ `Active — ${ license.tier ?? 'free' } tier` } variant="active" />
            </div>

            <p style={ { margin: '0 0 6px', fontSize: 13, color: colors.textSecondary, lineHeight: 1.6 } }>
              Your account is connected. Google Ads, GA4, and Search Console data will appear in your Marketing ROI dashboard automatically.
            </p>

            { registerMessage && (
              <p style={ { margin: '8px 0 0', fontSize: 13, color: colors.success } }>
                { registerMessage }
              </p>
            ) }
          </div>
        ) : hasKeyButNotValid ? (
          /* ── Key exists but validation failed — retry state ── */
          <div>
            <div style={ {
              padding: '14px 16px',
              background: license.reason === 'api_error' ? colors.warningBg : colors.errorBg,
              border: `1px solid ${ license.reason === 'api_error' ? colors.warningBorder : colors.errorBorder }`,
              borderRadius: 6,
              marginBottom: 16,
              fontSize: 14,
              color: license.reason === 'api_error' ? '#92400e' : '#991b1b',
              lineHeight: 1.6,
            } }>
              { reasonMessage( license.reason ) }
            </div>

            <div style={ { display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' } }>
              <SecondaryButton onClick={ () => void handleActivateLicense() } disabled={ activating }>
                { activating ? 'Checking…' : 'Retry Validation' }
              </SecondaryButton>

              { license.reason !== 'api_error' && (
                <button
                  onClick={ () => void handleSignInWithGoogle() }
                  disabled={ registering }
                  style={ {
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    padding: '10px 20px', background: '#fff', border: `1px solid ${ colors.border }`,
                    borderRadius: 6, fontSize: 14, fontWeight: 500, fontFamily: font,
                    color: colors.textPrimary, cursor: registering ? 'not-allowed' : 'pointer',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                  } }
                >
                  <GoogleGIcon />
                  { registering ? 'Signing in…' : 'Sign in again' }
                </button>
              ) }
            </div>

            { message && (
              <p style={ { margin: '12px 0 0', fontSize: 13, color: message.startsWith( 'Error' ) || message.startsWith( 'License invalid' ) ? colors.error : colors.success } }>
                { message }
              </p>
            ) }
          </div>
        ) : (
          /* ── Fresh — not-yet-activated state ── */
          <div>
            <p style={ { margin: '0 0 6px', fontSize: 13, color: colors.textSecondary, lineHeight: 1.6 } }>
              Sign in with your Google account to activate the plugin and connect your marketing tools in one step.
            </p>

            <ul style={ { margin: '0 0 20px', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 } }>
              { [
                'Marketing ROI dashboard — see Google Ads spend, conversions, and cost-per-lead in one place',
                'Connects GA4, Google Ads, and Search Console automatically',
                '90 days of reporting history — enough to see seasonal trends and compare month-over-month',
              ].map( ( benefit, i ) => (
                <li key={ i } style={ { display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, color: colors.textSecondary, lineHeight: 1.5 } }>
                  <span style={ { flexShrink: 0, width: 18, height: 18, borderRadius: '50%', background: colors.successBg, border: `1px solid ${ colors.successBorder }`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 1 } }>
                    <svg viewBox="0 0 12 12" width="10" height="10" fill="none">
                      <path d="M2 6l3 3 5-5" stroke={ colors.success } strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  { benefit }
                </li>
              ) ) }
            </ul>
            <p style={ { margin: '0 0 24px', fontSize: 12, color: colors.textMuted } }>
              Free forever for single-site use. No credit card, no trial timer.
            </p>

            {/* Google sign-in button */}
            <button
              onClick={ () => void handleSignInWithGoogle() }
              disabled={ registering }
              style={ {
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                padding: '11px 20px',
                background: registering ? '#f1f5f9' : '#fff',
                border: `1px solid ${ colors.border }`,
                borderRadius: 6,
                fontSize: 15,
                fontWeight: 500,
                fontFamily: font,
                color: colors.textPrimary,
                cursor: registering ? 'not-allowed' : 'pointer',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
              } }
            >
              <GoogleGIcon />
              { registering ? 'Signing in…' : 'Sign in with Google' }
            </button>
            <p style={ { margin: '8px 0 0', fontSize: 12, color: colors.textMuted, textAlign: 'center' } }>
              Signs in and connects GA4, Google Ads, and Search Console in one step.
            </p>

            { isSignInError && <GoogleSignInTroubleshooting /> }

            { registerMessage && ! isSignInError && (
              <p style={ {
                margin: '12px 0 0',
                fontSize: 13,
                textAlign: 'center',
                color: isSuccessMessage ? colors.success : registerMessage.startsWith( 'Activation failed' ) || registerMessage.startsWith( 'Sign-in failed' ) ? colors.error : colors.textSecondary,
              } }>
                { registerMessage }
              </p>
            ) }

            {/* Manual key */}
            <div style={ { marginTop: 20, paddingTop: 20, borderTop: `1px solid ${ colors.border }` } }>
              <button
                onClick={ () => setShowKeyInput( v => ! v ) }
                style={ {
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  fontSize: 13,
                  color: colors.primary,
                  cursor: 'pointer',
                  fontFamily: font,
                  fontWeight: 500,
                } }
              >
                Already have an activation key? { showKeyInput ? '▲' : '▼' }
              </button>

              { showKeyInput && (
                <div style={ { marginTop: 12 } }>
                  <div style={ { display: 'flex', gap: 8 } }>
                    <input
                      type="password"
                      value={ licenseKeyInput }
                      onChange={ e => setLicenseKeyInput( e.target.value ) }
                      placeholder="qdsh_…"
                      style={ {
                        flex: 1,
                        padding: '9px 12px',
                        border: `1px solid ${ colors.border }`,
                        borderRadius: 6,
                        fontSize: 14,
                        fontFamily: font,
                        color: colors.textPrimary,
                        outline: 'none',
                      } }
                    />
                    <PrimaryButton onClick={ () => void handleSaveLicenseKey() } disabled={ savingKey || ! licenseKeyInput.trim() }>
                      { savingKey ? 'Saving…' : 'Save Key' }
                    </PrimaryButton>
                  </div>
                  <HelperText>Paste the key from your ROI Insights portal. It starts with <code>qdsh_</code>.</HelperText>
                </div>
              ) }
            </div>

            {/* Status area */}
            { ! license && (
              <div style={ { marginTop: 20, paddingTop: 20, borderTop: `1px solid ${ colors.border }` } }>
                <StatusBadge label="Not activated" variant="disabled" />
              </div>
            ) }
          </div>
        ) }
      </Card>

      {/* ── Upgrade prompt ── */}
      { license?.isValid && license.tier === 'free' && (
        <div style={ {
          padding: '20px 24px',
          background: '#f0fdf4',
          border: '1px solid #bbf7d0',
          borderRadius: 8,
          marginBottom: 16,
        } }>
          <div style={ { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' } }>
            <div style={ { flex: 1, minWidth: 240 } }>
              <h4 style={ { margin: '0 0 4px', fontSize: 15, fontWeight: 600, color: '#166534', fontFamily: font } }>
                Unlock your full history
              </h4>
              <p style={ { margin: '0 0 14px', fontSize: 13, color: '#166534', lineHeight: 1.6, fontFamily: font } }>
                Your free plan keeps 90 days of data. If you run ads year-round, that means you're missing half the picture every time you open the ROI dashboard.
              </p>
              <ul style={ { margin: '0 0 14px', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 5 } }>
                { [
                  'Full reporting history — compare any date range, year-over-year',
                  'Extended data retention so your best-performing months are never lost',
                  'Priority support when something breaks and you can\'t wait',
                ].map( ( item, i ) => (
                  <li key={ i } style={ { display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12, color: '#166534', fontFamily: font, lineHeight: 1.5 } }>
                    <span style={ { flexShrink: 0, marginTop: 1 } }>→</span>
                    { item }
                  </li>
                ) ) }
              </ul>
              <a
                href="https://roiknowledge.com/pricing"
                target="_blank"
                rel="noreferrer"
                style={ { display: 'inline-block', fontSize: 13, fontWeight: 600, color: '#166534', fontFamily: font, textDecoration: 'none', borderBottom: '1px solid #bbf7d0' } }
              >
                See upgrade options →
              </a>
            </div>
          </div>
        </div>
      ) }
    </div>
  );
}
